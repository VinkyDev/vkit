import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import * as os from 'os';
import type {
  IApplication,
  IApplicationSearchConfig,
  IApplicationSearchResult,
  IApplicationScanParams,
  IApplicationSearchParams,
  IApplicationConfigUpdateParams,
  IApplicationLaunchParams,
  IApplicationOperationResult,
} from '@vkit/api';

/**
 * 应用程序搜索服务
 * 提供跨平台的本地应用程序扫描和搜索功能
 */
export class ApplicationService {
  private static instance: ApplicationService | null = null;

  private applications: Map<string, IApplication> = new Map();
  private config: IApplicationSearchConfig;
  private lastScanTime: number = 0;
  private isScanning: boolean = false;
  private configPath: string;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'application-config.json');
    this.config = this.getDefaultConfig();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): ApplicationService {
    ApplicationService.instance ??= new ApplicationService();
    return ApplicationService.instance;
  }

  /**
   * 初始化服务
   */
  public async initialize(): Promise<IApplicationOperationResult<IApplicationSearchResult>> {
    await this.loadConfig();
    // 首次启动时进行后台扫描
    return await this.scanApplications();
  }

  /**
   * 销毁服务
   */
  public async destroy(): Promise<void> {
    await this.saveConfig();
  }

  /**
   * 扫描应用程序
   */
  public async scanApplications(
    params?: IApplicationScanParams
  ): Promise<IApplicationOperationResult<IApplicationSearchResult>> {
    if (this.isScanning && !params?.forceRescan) {
      return {
        success: false,
        error: '扫描正在进行中，请稍后再试',
      };
    }

    try {
      this.isScanning = true;

      if (params?.forceRescan) {
        this.applications.clear();
      }

      const platform = process.platform as 'win32' | 'darwin' | 'linux';
      let scannedApps: IApplication[] = [];

      switch (platform) {
        case 'win32':
          scannedApps = await this.scanWindowsApplications();
          break;
        case 'darwin':
          scannedApps = await this.scanMacOSApplications();
          break;
        case 'linux':
          scannedApps = await this.scanLinuxApplications();
          break;
        default:
          throw new Error(`不支持的平台: ${process.platform}`);
      }

      // 更新应用程序索引
      for (const app of scannedApps) {
        this.applications.set(app.id, app);
      }

      this.lastScanTime = Date.now();

      const result: IApplicationSearchResult = {
        applications: Array.from(this.applications.values()),
        totalCount: this.applications.size,
        lastScanTime: this.lastScanTime,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '扫描失败',
      };
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * 搜索应用程序
   */
  public searchApplications(
    params: IApplicationSearchParams
  ): IApplicationOperationResult<IApplication[]> {
    try {
      const { query, limit = 50, fuzzy = true } = params;
      const apps = Array.from(this.applications.values());

      if (!query.trim()) {
        return {
          success: true,
          data: apps.slice(0, limit),
        };
      }

      const searchQuery = query.toLowerCase();
      const filteredApps = apps.filter(app => {
        const name = app.name.toLowerCase();
        const description = app.description?.toLowerCase() ?? '';
        const fileName = path.basename(app.path).toLowerCase();

        if (fuzzy) {
          // 模糊搜索：包含查询字符串
          return (
            name.includes(searchQuery) ||
            description.includes(searchQuery) ||
            fileName.includes(searchQuery)
          );
        } else {
          // 精确搜索：以查询字符串开头
          return name.startsWith(searchQuery) || fileName.startsWith(searchQuery);
        }
      });

      // 按相关性排序
      filteredApps.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();

        // 优先显示名称完全匹配的结果
        if (aName === searchQuery && bName !== searchQuery) return -1;
        if (bName === searchQuery && aName !== searchQuery) return 1;

        // 其次显示名称以查询开头的结果
        const aStartsWith = aName.startsWith(searchQuery);
        const bStartsWith = bName.startsWith(searchQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (bStartsWith && !aStartsWith) return 1;

        // 最后按字母顺序排序
        return aName.localeCompare(bName);
      });

      return {
        success: true,
        data: filteredApps.slice(0, limit),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '搜索失败',
      };
    }
  }

  /**
   * 获取所有应用程序
   */
  public getAllApplications(): IApplicationOperationResult<IApplicationSearchResult> {
    try {
      const result: IApplicationSearchResult = {
        applications: Array.from(this.applications.values()),
        totalCount: this.applications.size,
        lastScanTime: this.lastScanTime,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取应用程序列表失败',
      };
    }
  }

  /**
   * 启动应用程序
   */
  public launchApplication(params: IApplicationLaunchParams): IApplicationOperationResult {
    try {
      const application = this.applications.get(params.applicationId);
      if (!application) {
        return {
          success: false,
          error: '应用程序不存在',
        };
      }

      const platform = process.platform;
      const { args = [], cwd } = params;

             if (platform === 'darwin') {
         // macOS: 使用 open 命令启动 .app
         if (application.path.endsWith('.app')) {
           spawn('open', [application.path, ...args], { cwd, detached: true, stdio: 'ignore' });
         } else {
           spawn(application.path, args, { cwd, detached: true, stdio: 'ignore' });
         }
       } else if (platform === 'win32') {
        // Windows: 直接启动可执行文件
        spawn(application.path, args, { cwd, detached: true, shell: true });
      } else {
        // Linux: 使用 exec 字段启动
        if (application.type === 'application' && application.description) {
          // 从 .desktop 文件的 Exec 字段启动
          const execCommand = application.description.replace(/%[uUfF]/g, '');
          spawn('sh', ['-c', execCommand], { cwd, detached: true });
        } else {
          spawn(application.path, args, { cwd, detached: true });
        }
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '启动应用程序失败',
      };
    }
  }

  /**
   * 获取配置
   */
  public getConfig(): IApplicationOperationResult<IApplicationSearchConfig> {
    return {
      success: true,
      data: { ...this.config },
    };
  }

  /**
   * 更新配置
   */
  public async updateConfig(
    params: IApplicationConfigUpdateParams
  ): Promise<IApplicationOperationResult> {
    try {
      this.config = { ...this.config, ...params.config };
      await this.saveConfig();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新配置失败',
      };
    }
  }

  /**
   * 扫描 Windows 应用程序
   */
  private async scanWindowsApplications(): Promise<IApplication[]> {
    const applications: IApplication[] = [];

    for (const directory of this.config.scanDirectories) {
      await this.scanDirectory(directory, applications, 'win32');
    }

    // 扫描快捷方式
    await this.scanWindowsShortcuts(applications);

    return applications;
  }

  /**
   * 扫描 macOS 应用程序
   */
  private async scanMacOSApplications(): Promise<IApplication[]> {
    const applications: IApplication[] = [];

    for (const directory of this.config.scanDirectories) {
      await this.scanDirectory(directory, applications, 'darwin');
    }

    return applications;
  }

  /**
   * 扫描 Linux 应用程序
   */
  private async scanLinuxApplications(): Promise<IApplication[]> {
    const applications: IApplication[] = [];

    for (const directory of this.config.scanDirectories) {
      await this.scanLinuxDesktopFiles(directory, applications);
    }

    return applications;
  }

    /**
   * 扫描目录
   */
  private async scanDirectory(
    directory: string, 
    applications: IApplication[], 
    platform: 'win32' | 'darwin' | 'linux',
    depth: number = 0
  ): Promise<void> {
    if (depth > (this.config.maxDepth ?? 3)) return;

    try {
      const items = await fs.readdir(directory);
      
      for (const item of items) {
        const fullPath = path.join(directory, item);
        
        try {
          const stat = await fs.stat(fullPath);
          
          if (stat.isDirectory()) {
            // 对于 macOS，检查是否是 .app 包
            if (platform === 'darwin' && item.endsWith('.app')) {
              const application = await this.createMacOSApplication(fullPath);
              if (application) {
                applications.push(application);
              }
              // 不要继续扫描 .app 包的内部
              continue;
            }
            
            // 继续递归扫描其他目录
            await this.scanDirectory(fullPath, applications, platform, depth + 1);
          } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase();
            if (this.config.fileExtensions.includes(ext)) {
              const application = await this.createApplicationFromFile(fullPath, platform);
              if (application) {
                applications.push(application);
              }
            }
          }
        } catch {
          // 忽略无法访问的文件/目录
          continue;
        }
      }
    } catch {
      // 忽略无法访问的目录
    }
  }

  /**
   * 创建 macOS 应用程序对象
   */
  private async createMacOSApplication(appPath: string): Promise<IApplication | null> {
    try {
      const stat = await fs.stat(appPath);
      const appName = path.basename(appPath, '.app');
      
      // 尝试从 Info.plist 获取应用程序信息
      const infoPlistPath = path.join(appPath, 'Contents', 'Info.plist');
      let displayName = appName;
      let description = '';
      let iconPath = '';
      
      try {
        const plistContent = await fs.readFile(infoPlistPath, 'utf-8');
        // 简单的 plist 解析 - 实际项目中可能需要使用专门的 plist 解析库
        const bundleNameMatch = plistContent.match(/<key>CFBundleDisplayName<\/key>\s*<string>([^<]+)<\/string>/);
        const bundleNameMatch2 = plistContent.match(/<key>CFBundleName<\/key>\s*<string>([^<]+)<\/string>/);
        const iconFileMatch = plistContent.match(/<key>CFBundleIconFile<\/key>\s*<string>([^<]+)<\/string>/);
        const versionMatch = plistContent.match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/);
        
        if (bundleNameMatch?.[1]) {
          displayName = bundleNameMatch[1];
        } else if (bundleNameMatch2?.[1]) {
          displayName = bundleNameMatch2[1];
        }
        
        if (versionMatch?.[1]) {
          description = `版本 ${versionMatch[1]}`;
        }
        
        if (iconFileMatch?.[1]) {
          let iconFile = iconFileMatch[1];
          if (!iconFile.includes('.')) {
            iconFile += '.icns';
          }
          iconPath = path.join(appPath, 'Contents', 'Resources', iconFile);
          
          // 检查图标文件是否存在
          try {
            await fs.access(iconPath);
          } catch {
            iconPath = '';
          }
        }
      } catch {
        // 如果无法读取 Info.plist，使用默认值
      }

      // 尝试从本地化的 InfoPlist.strings 文件获取显示名称
      const localizedName = await this.getLocalizedAppName(appPath);
      if (localizedName) {
        displayName = localizedName;
      }
      
      return {
        id: Buffer.from(appPath).toString('base64'),
        name: displayName,
        description,
        path: appPath,
        iconPath: iconPath || undefined,
        type: 'application',
        platform: 'darwin',
        lastModified: stat.mtime.getTime(),
      };
    } catch {
      return null;
    }
  }

  /**
   * 获取本地化的应用程序名称
   */
  private async getLocalizedAppName(appPath: string): Promise<string | null> {
    // 获取系统语言偏好
    const systemLocale = app.getLocale();
    
    // 定义要检查的本地化目录优先级
    const localesToCheck = [
      systemLocale, 
      systemLocale.split('-')[0], 
      'zh_CN', // 简体中文
      'zh', // 中文
      'zh_TW', // 繁体中文
      'en',
    ];

    const resourcesPath = path.join(appPath, 'Contents', 'Resources');

    for (const locale of localesToCheck) {
      const possiblePaths = [
        path.join(resourcesPath, `${locale}.lproj`, 'InfoPlist.strings'),
        path.join(resourcesPath, `${locale}.lproj`, 'Localizable.strings'),
      ];

      for (const stringsPath of possiblePaths) {
        try {
          const content = await fs.readFile(stringsPath, 'utf-8');
          
          // 解析 strings 文件中的 CFBundleDisplayName
          const displayNameMatch = content.match(/(?:^|\n)\s*"?CFBundleDisplayName"?\s*=\s*"([^"]+)"/);
          if (displayNameMatch?.[1]) {
            return displayNameMatch[1];
          }

          // 如果没有 CFBundleDisplayName，尝试 CFBundleName
          const bundleNameMatch = content.match(/(?:^|\n)\s*"?CFBundleName"?\s*=\s*"([^"]+)"/);
          if (bundleNameMatch?.[1]) {
            return bundleNameMatch[1];
          }
        } catch {
          // 继续尝试下一个文件
          continue;
        }
      }
    }

    return null;
  }

  /**
   * 从文件创建应用程序对象
   */
  private async createApplicationFromFile(
    filePath: string,
    platform: 'win32' | 'darwin' | 'linux'
  ): Promise<IApplication | null> {
    try {
      const stat = await fs.stat(filePath);
      const fileName = path.basename(filePath);
      const name = path.parse(fileName).name;

      return {
        id: Buffer.from(filePath).toString('base64'),
        name,
        path: filePath,
        type: 'application',
        platform,
        lastModified: stat.mtime.getTime(),
      };
    } catch {
      return null;
    }
  }

  /**
   * 扫描 Windows 快捷方式
   */
  private async scanWindowsShortcuts(_applications: IApplication[]): Promise<void> {
    // Windows 快捷方式解析需要额外的库支持
    // 这里先实现基本的 .lnk 文件识别，后续可以添加 PowerShell 脚本解析
    // TODO: 实现 .lnk 文件解析
  }

  /**
   * 扫描 Linux .desktop 文件
   */
  private async scanLinuxDesktopFiles(
    directory: string,
    applications: IApplication[]
  ): Promise<void> {
    try {
      const items = await fs.readdir(directory);

      for (const item of items) {
        if (item.endsWith('.desktop')) {
          const fullPath = path.join(directory, item);
          const application = await this.parseDesktopFile(fullPath);
          if (application) {
            applications.push(application);
          }
        }
      }
    } catch {
      // 忽略无法访问的目录
    }
  }

  /**
   * 解析 .desktop 文件
   */
  private async parseDesktopFile(filePath: string): Promise<IApplication | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      let name = '';
      let exec = '';
      let icon = '';
      // let comment = '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('Name=')) {
          name = trimmed.substring(5);
        } else if (trimmed.startsWith('Exec=')) {
          exec = trimmed.substring(5);
        } else if (trimmed.startsWith('Icon=')) {
          icon = trimmed.substring(5);
        } else if (trimmed.startsWith('Comment=')) {
          //  comment = trimmed.substring(8);
        }
      }

      if (name && exec) {
        const stat = await fs.stat(filePath);

        return {
          id: Buffer.from(filePath).toString('base64'),
          name,
          description: exec, // 存储执行命令
          path: filePath,
          iconPath: icon,
          type: 'application',
          platform: 'linux',
          lastModified: stat.mtime.getTime(),
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): IApplicationSearchConfig {
    const platform = process.platform;

    switch (platform) {
      case 'win32':
        return {
          scanDirectories: [
            'C:\\Program Files',
            'C:\\Program Files (x86)',
            path.join(os.homedir(), 'AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs'),
            'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs',
          ],
          fileExtensions: ['.exe', '.lnk'],
          includeWindowsStoreApps: false,
          maxDepth: 3,
          enableWatcher: false,
        };

      case 'darwin':
        return {
          scanDirectories: [
            '/Applications',
            path.join(os.homedir(), 'Applications'),
            '/System/Applications',
          ],
          fileExtensions: ['.app'],
          maxDepth: 1,
          enableWatcher: false,
        };

      case 'linux':
        return {
          scanDirectories: [
            '/usr/share/applications',
            '/usr/local/share/applications',
            path.join(os.homedir(), '.local/share/applications'),
          ],
          fileExtensions: ['.desktop'],
          maxDepth: 1,
          enableWatcher: false,
        };

      default:
        return {
          scanDirectories: [],
          fileExtensions: [],
          enableWatcher: false,
        };
    }
  }

  /**
   * 加载配置
   */
  private async loadConfig(): Promise<void> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      const savedConfig = JSON.parse(content) as IApplicationSearchConfig;
      this.config = { ...this.getDefaultConfig(), ...savedConfig };
    } catch {
      // 配置文件不存在或格式错误，使用默认配置
      this.config = this.getDefaultConfig();
    }
  }

  /**
   * 保存配置
   */
  private async saveConfig(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.configPath), { recursive: true });
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
    } catch (error) {
      console.error('保存应用程序配置失败:', error);
    }
  }
}

// 导出单例实例
export const applicationService = ApplicationService.getInstance();
