export interface IClipboardEntry {
  id: string;
  type: 'text' | 'image';
  favorite?: boolean; // 是否收藏
  content: string;
  createdAt: number;
}

export interface IClipboardOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}