import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  StdioClientTransport,
  StdioServerParameters,
} from '@modelcontextprotocol/sdk/client/stdio.js';
import { EventEmitter } from 'events';
import { app } from 'electron';
import { ChildProcess } from 'child_process';
import { MCPConfig } from './constants';

interface MCPTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

interface MCPResource {
  uri: string;
  name?: string;
  description?: string;
  mimeType?: string;
}

interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

class MCPService extends EventEmitter {
  private clients: Map<string, Client> = new Map();
  private transports: Map<string, StdioClientTransport> = new Map();
  private processes: Map<string, ChildProcess> = new Map();
  private isInitialized = false;

  constructor() {
    super();
    this.setupErrorHandling();
  }

  /**
   * 初始化 MCP 服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    for (const [serverId, config] of Object.entries(MCPConfig)) {
      await this.connectToServer(serverId, config);
    }

    // 可以在这里预加载一些默认的 MCP 服务器
    this.isInitialized = true;
    this.emit('initialized');
  }

  /**
   * 连接到 MCP 服务器
   */
  async connectToServer(serverId: string, config: StdioServerParameters): Promise<void> {
    // 如果已经连接，先断开
    if (this.clients.has(serverId)) {
      await this.disconnectFromServer(serverId);
    }

    // 创建 stdio transport
    const transportConfig: StdioServerParameters = {
      command: config.command,
      args: config.args ?? [],
      ...(config.env && { env: config.env }),
      ...(config.cwd && { cwd: config.cwd }),
    };
    const transport = new StdioClientTransport(transportConfig);

    // 创建客户端
    const clientInfo = {
      name: app.getName(),
      version: app.getVersion(),
    };
    const clientCapabilities = {
      capabilities: {
        tools: {},
        resources: { subscribe: true },
        prompts: {},
      },
    };
    const client = new Client(clientInfo, clientCapabilities);

    await client.connect(transport);

    // 存储引用
    this.clients.set(serverId, client);
    this.transports.set(serverId, transport);

    // 设置事件监听
    this.setupClientEventListeners(serverId, client);

    this.emit('serverConnected', serverId, config.command);
  }

  /**
   * 断开与 MCP 服务器的连接
   */
  async disconnectFromServer(serverId: string): Promise<void> {
    try {
      const client = this.clients.get(serverId);
      const transport = this.transports.get(serverId);
      const process = this.processes.get(serverId);

      if (client) {
        try {
          await client.close();
        } catch {
          console.warn(`Error closing client`);
        }
        this.clients.delete(serverId);
      }

      if (transport) {
        try {
          await transport.close();
        } catch {
          console.warn(`Error closing transport`);
        }
        this.transports.delete(serverId);
      }

      if (process) {
        process.kill();
        this.processes.delete(serverId);
      }

      this.emit('serverDisconnected', serverId);
    } catch (error: unknown) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 获取服务器的可用工具列表
   */
  async getTools(serverId: string): Promise<MCPTool[]> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`Server ${serverId} not connected`);
    }

    try {
      const response = await client.listTools();
      return response.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));
    } catch (error: unknown) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 调用工具
   */
  async callTool(
    serverId: string,
    name: string,
    arguments_: Record<string, unknown>
  ): Promise<unknown> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`Server ${serverId} not connected`);
    }

    try {
      const response = await client.callTool({
        name,
        arguments: arguments_,
      });

      this.emit('toolCalled', serverId, name, arguments_, response);
      return response;
    } catch (error: unknown) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 获取服务器的可用资源列表
   */
  async getResources(serverId: string): Promise<MCPResource[]> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`Server ${serverId} not connected`);
    }

    try {
      const response = await client.listResources();
      return response.resources.map(resource => ({
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType,
      }));
    } catch (error: unknown) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 读取资源内容
   */
  async readResource(serverId: string, uri: string): Promise<unknown> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`Server ${serverId} not connected`);
    }

    try {
      const response = await client.readResource({ uri });
      this.emit('resourceRead', serverId, uri, response);
      return response;
    } catch (error: unknown) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 获取服务器的可用提示列表
   */
  async getPrompts(serverId: string): Promise<MCPPrompt[]> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`Server ${serverId} not connected`);
    }

    try {
      const response = await client.listPrompts();
      return response.prompts.map(prompt => ({
        name: prompt.name,
        description: prompt.description,
        arguments: prompt.arguments,
      }));
    } catch (error: unknown) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 获取提示内容
   */
  async getPrompt(
    serverId: string,
    name: string,
    arguments_?: Record<string, string>
  ): Promise<unknown> {
    const client = this.clients.get(serverId);
    if (!client) {
      throw new Error(`Server ${serverId} not connected`);
    }

    try {
      const response = await client.getPrompt({
        name,
        arguments: arguments_,
      });

      this.emit('promptRetrieved', serverId, name, arguments_, response);
      return response;
    } catch (error: unknown) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * 获取已连接的服务器列表
   */
  getConnectedServers(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * 检查服务器是否已连接
   */
  isServerConnected(serverId: string): boolean {
    return this.clients.has(serverId);
  }

  /**
   * 断开所有连接
   */
  async disconnectAll(): Promise<void> {
    const serverIds = Array.from(this.clients.keys());
    await Promise.all(serverIds.map(serverId => this.disconnectFromServer(serverId)));
  }

  /**
   * 设置客户端事件监听器
   */
  private setupClientEventListeners(serverId: string, client: Client): void {
    client.onclose = () => {
      this.emit('serverDisconnected', serverId);
      this.clients.delete(serverId);
      this.transports.delete(serverId);
    };

    client.onerror = (error: unknown) => {
      this.emit('serverError', serverId, error);
    };
  }

  /**
   * 设置错误处理
   */
  private setupErrorHandling(): void {
    process.on('exit', () => {
      this.disconnectAll().catch(console.error);
    });

    process.on('SIGINT', () => {
      this.disconnectAll().catch(console.error);
    });

    process.on('SIGTERM', () => {
      this.disconnectAll().catch(console.error);
    });
  }

  /**
   * 销毁服务
   */
  async destroy(): Promise<void> {
    await this.disconnectAll();
    this.removeAllListeners();
    this.isInitialized = false;
  }
}

export default new MCPService();
