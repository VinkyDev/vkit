import type { 
  ChatCompletionMessageParam, 
  ChatCompletionMessageToolCall
} from 'openai/resources/chat/completions';

// ============================================================================
// Chat 聊天服务类型定义
// ============================================================================

/**
 * 聊天消息参数
 */
export type IChatMessage = ChatCompletionMessageParam;

/**
 * 工具调用信息
 */
export type IToolCall = ChatCompletionMessageToolCall;

/**
 * 聊天操作结果
 */
export interface IChatOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 聊天请求参数
 */
export interface IChatRequest {
  messages: IChatMessage[];
  model: string;
  useTools?: boolean;
}

/**
 * 工具调用结果
 */
export interface IToolCallResult {
  content?: unknown;
  isError?: boolean;
}

/**
 * 工具调用事件数据
 */
export interface IToolCallEvent {
  serverId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  result: IToolCallResult;
}

/**
 * 工具错误事件数据
 */
export interface IToolErrorEvent {
  toolName: string;
  error: string;
}

/**
 * MCP 工具定义
 */
export interface IMCPTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

/**
 * 聊天会话信息
 */
export interface IChatSession {
  sessionId: string;
  webContentsId: number;
  startTime: number;
}

/**
 * 聊天流式数据事件
 */
export interface IChatStreamEvent {
  sessionId: string;
  content: string;
}

/**
 * 工具调用检测事件
 */
export interface IToolCallsDetectedEvent {
  sessionId: string;
  toolCalls: IToolCall[];
}

/**
 * 工具调用完成事件
 */
export interface IToolCalledEvent {
  sessionId: string;
  toolCall: IToolCallEvent;
}

/**
 * 聊天完成事件
 */
export interface IChatCompletedEvent {
  sessionId: string;
  messages: IChatMessage[];
}

/**
 * 聊天错误事件
 */
export interface IChatErrorEvent {
  sessionId: string;
  error: string;
} 