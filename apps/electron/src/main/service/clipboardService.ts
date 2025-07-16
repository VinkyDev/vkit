import { clipboard } from 'electron';
import { EventEmitter } from 'events';
import crypto from 'crypto';
import { IpcChannels, type IClipboardEntry, type IClipboardOperationResult } from '@vkit/api';
import { storeService } from './storeService';

/**
 * 剪切板服务 - 提供剪切板监听和历史记录管理
 */
export class ClipboardService extends EventEmitter {
  private static instance: ClipboardService | null = null;

  private history: IClipboardEntry[] = [];
  private readonly STORAGE_KEY = 'clipboard-history';
  private readonly CHECK_INTERVAL = 1000;
  private isListening: boolean = false;
  private maxHistorySize: number = 500;
  private watchTimer: NodeJS.Timeout | null = null;
  private lastText: string = '';
  private lastImage: string = '';

  constructor() {
    super();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ClipboardService {
    ClipboardService.instance ??= new ClipboardService();
    return ClipboardService.instance;
  }

  /**
   * 初始化剪切板服务
   */
  public initialize(): void {
    try {
      this.loadHistoryFromStore();
      this.startListening();
    } catch (error) {
      console.error('Failed to initialize clipboard service:', error);
    }
  }

  /**
   * 销毁剪切板服务
   */
  public destroy(): void {
    this.stopListening();
    this.removeAllListeners();
  }

  /**
   * 获取剪切板历史记录
   */
  public getHistory(): IClipboardOperationResult<IClipboardEntry[]> {
    try {
      // 按时间倒序返回
      const sortedHistory = [...this.history].sort((a, b) => b.createdAt - a.createdAt);
      return {
        success: true,
        data: sortedHistory,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 根据id删除剪切板历史记录
   */
  public deleteHistory(id: string): IClipboardOperationResult<void> {
    this.history = this.history.filter(entry => entry.id !== id);
    this.saveHistoryToStore();
    return { success: true };
  }

  /**
   * 删除所有剪切板历史记录
   */
  public deleteAllHistory(): IClipboardOperationResult<void> {
    this.history = [];
    this.saveHistoryToStore();
    return { success: true };
  }

  /**
   * 根据id更新剪切板历史记录
   */
  public updateHistory(id: string, content: string): IClipboardOperationResult<void> {
    this.history = this.history.map(entry => (entry.id === id ? { ...entry, content } : entry));
    this.saveHistoryToStore();
    return { success: true };
  }

  /**
   * 切换收藏状态
   */
  public toggleFavorite(id: string): IClipboardOperationResult<void> {
    this.history = this.history.map(entry =>
      entry.id === id ? { ...entry, favorite: !entry.favorite } : entry
    );
    this.saveHistoryToStore();
    return { success: true };
  }

  /**
   * 开始监听剪切板变化
   */
  private startListening(): void {
    if (this.isListening) {
      return;
    }

    // 初始化当前状态
    this.lastText = clipboard.readText();
    this.lastImage = this.getImageDataURL();

    // 检查一次剪切板变化
    this.watchTimer = setInterval(() => {
      this.checkClipboardChanges();
    }, this.CHECK_INTERVAL);

    this.isListening = true;
  }

  /**
   * 停止监听剪切板变化
   */
  private stopListening(): void {
    if (!this.isListening) {
      return;
    }

    if (this.watchTimer) {
      clearInterval(this.watchTimer);
      this.watchTimer = null;
    }

    this.isListening = false;
  }

  /**
   * 检查剪切板变化
   */
  private checkClipboardChanges(): void {
    try {
      const currentText = clipboard.readText();
      const currentImage = this.getImageDataURL();

      // 检查文本变化
      if (currentText && currentText !== this.lastText && currentText.trim()) {
        this.handleTextChange(currentText);
        this.lastText = currentText;
      }

      // 检查图片变化
      if (currentImage && currentImage !== this.lastImage) {
        this.handleImageChange(currentImage);
        this.lastImage = currentImage;
      }
    } catch (error) {
      console.error('Error checking clipboard changes:', error);
    }
  }

  /**
   * 处理文本变化
   */
  private async handleTextChange(text: string): Promise<void> {
    // 检查是否已存在相同文本
    const existing = this.history.find(h => h.type === 'text' && h.content === text);
    if (existing) {
      return;
    }

    const entry = this.createEntry('text', text);
    this.addToHistory(entry);
    await this.saveHistoryToStore();
  }

  /**
   * 处理图片变化
   */
  private async handleImageChange(imageDataURL: string): Promise<void> {
    // 检查是否已存在相同图片
    const existing = this.history.find(h => h.type === 'image' && h.content === imageDataURL);
    if (existing) {
      return;
    }

    const entry = this.createEntry('image', imageDataURL);
    this.addToHistory(entry);
    await this.saveHistoryToStore();
  }

  /**
   * 获取图片数据URL
   */
  private getImageDataURL(): string {
    try {
      const image = clipboard.readImage();
      if (image.isEmpty()) {
        return '';
      }
      return image.toDataURL();
    } catch {
      return '';
    }
  }

  /**
   * 创建剪切板条目
   */
  private createEntry(type: 'text' | 'image', content: string): IClipboardEntry {
    return {
      id: crypto.randomUUID(),
      type,
      content,
      createdAt: Date.now(),
    };
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(entry: IClipboardEntry): void {
    this.history.unshift(entry);

    // 限制历史记录数量
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
  }

  /**
   * 从存储加载历史记录
   */
  private loadHistoryFromStore(): void {
    try {
      const result = storeService.get<IClipboardEntry[]>({
        key: this.STORAGE_KEY,
        defaultValue: [],
      });

      if (result.success && Array.isArray(result.data)) {
        this.history = result.data.filter(entry => this.isValidEntry(entry));
      } else {
        this.history = [];
      }
    } catch (error) {
      console.warn('Failed to load clipboard history from store:', error);
      this.history = [];
    }
  }

  /**
   * 保存历史记录到存储
   */
  private async saveHistoryToStore(): Promise<void> {
    try {
      const result = await storeService.set({
        key: this.STORAGE_KEY,
        value: this.history,
      });

      this.emit(IpcChannels.CLIPBOARD_CHANGED);

      if (!result.success) {
        console.error('Failed to save clipboard history to store:', result.error);
      }
    } catch (error) {
      console.error('Failed to save clipboard history to store:', error);
    }
  }

  /**
   * 验证历史记录条目
   */
  private isValidEntry(entry: unknown): entry is IClipboardEntry {
    return (
      typeof entry === 'object' &&
      entry !== null &&
      'id' in entry &&
      'type' in entry &&
      'content' in entry &&
      'createdAt' in entry &&
      typeof (entry as IClipboardEntry).id === 'string' &&
      ['text', 'image'].includes((entry as IClipboardEntry).type) &&
      typeof (entry as IClipboardEntry).content === 'string' &&
      typeof (entry as IClipboardEntry).createdAt === 'number'
    );
  }
}

export const clipboardService = ClipboardService.getInstance();
