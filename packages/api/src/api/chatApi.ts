import { IpcChannels } from '../ipcChannels';
import type {
  IChatOperationResult,
  IChatRequest,
  IChatStreamEvent,
  IToolCallsDetectedEvent,
  IToolCalledEvent,
  IChatCompletedEvent,
  IChatErrorEvent,
} from '../types';

// ============================================================================
// Chat 聊天服务 API
// ============================================================================

/**
 * 获取可用的模型列表
 * @returns 操作结果，包含模型列表
 *
 * @example
 * ```typescript
 * const result = await getChatModels();
 * if (result.success) {
 *   console.log('可用模型:', result.data);
 *   result.data?.forEach(model => {
 *     console.log(`模型: ${model}`);
 *   });
 * }
 * ```
 */
export const getChatModels = async (): Promise<IChatOperationResult<string[]>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.CHAT_GET_MODELS
  )) as IChatOperationResult<string[]>;
};

/**
 * 开始聊天会话
 * @param request 聊天请求参数
 * @returns 操作结果，包含会话ID
 *
 * @example
 * ```typescript
 * const result = await startChat({
 *   messages: [{ role: 'user', content: '你好' }],
 *   model: 'Qwen/Qwen3-32B',
 *   useTools: true
 * });
 *
 * if (result.success) {
 *   console.log('聊天会话开始，会话ID:', result.data?.sessionId);
 * }
 * ```
 */
export const startChat = async (
  request: IChatRequest
): Promise<IChatOperationResult<{ sessionId: string }>> => {
  return (await window?.electron?.ipcRenderer?.invoke(
    IpcChannels.CHAT_START,
    request
  )) as IChatOperationResult<{ sessionId: string }>;
};

// ============================================================================
// Chat 事件监听 API
// ============================================================================

/**
 * 监听聊天流式数据事件
 * @param callback 事件回调函数
 * @returns IPC监听器或undefined
 *
 * @example
 * ```typescript
 * onChatStreamData((event) => {
 *   console.log(`会话 ${event.sessionId} 收到内容:`, event.content);
 * });
 * ```
 */
export const onChatStreamData = (callback: (event: IChatStreamEvent) => void): unknown => {
  const handler = (_event: unknown, data: IChatStreamEvent) => callback(data);
  return window?.electron?.ipcRenderer?.on(IpcChannels.CHAT_STREAM_DATA, handler);
};

/**
 * 监听工具调用检测事件
 * @param callback 事件回调函数
 * @returns IPC监听器或undefined
 *
 * @example
 * ```typescript
 * onToolCallsDetected((event) => {
 *   console.log(`会话 ${event.sessionId} 检测到工具调用:`, event.toolCalls);
 * });
 * ```
 */
export const onToolCallsDetected = (callback: (event: IToolCallsDetectedEvent) => void): unknown => {
  const handler = (_event: unknown, data: IToolCallsDetectedEvent) => callback(data);
  return window?.electron?.ipcRenderer?.on(IpcChannels.CHAT_TOOL_CALLS_DETECTED, handler);
};

/**
 * 监听工具调用完成事件
 * @param callback 事件回调函数
 * @returns IPC监听器或undefined
 *
 * @example
 * ```typescript
 * onToolCalled((event) => {
 *   console.log(`会话 ${event.sessionId} 工具调用完成:`, event.toolCall);
 * });
 * ```
 */
export const onToolCalled = (callback: (event: IToolCalledEvent) => void): unknown => {
  const handler = (_event: unknown, data: IToolCalledEvent) => callback(data);
  return window?.electron?.ipcRenderer?.on(IpcChannels.CHAT_TOOL_CALLED, handler);
};

/**
 * 监听工具调用错误事件
 * @param callback 事件回调函数
 * @returns IPC监听器或undefined
 *
 * @example
 * ```typescript
 * onToolError((event) => {
 *   console.error(`会话 ${event.sessionId} 工具调用错误:`, event.error);
 * });
 * ```
 */
export const onToolError = (callback: (event: IChatErrorEvent) => void): unknown => {
  const handler = (_event: unknown, data: IChatErrorEvent) => callback(data);
  return window?.electron?.ipcRenderer?.on(IpcChannels.CHAT_TOOL_ERROR, handler);
};

/**
 * 监听聊天完成事件
 * @param callback 事件回调函数
 * @returns IPC监听器或undefined
 *
 * @example
 * ```typescript
 * onChatCompleted((event) => {
 *   console.log(`会话 ${event.sessionId} 已完成，消息数:`, event.messages.length);
 * });
 * ```
 */
export const onChatCompleted = (callback: (event: IChatCompletedEvent) => void): unknown => {
  const handler = (_event: unknown, data: IChatCompletedEvent) => callback(data);
  return window?.electron?.ipcRenderer?.on(IpcChannels.CHAT_COMPLETED, handler);
};

/**
 * 监听聊天错误事件
 * @param callback 事件回调函数
 * @returns IPC监听器或undefined
 *
 * @example
 * ```typescript
 * onChatError((event) => {
 *   console.error(`会话 ${event.sessionId} 发生错误:`, event.error);
 * });
 * ```
 */
export const onChatError = (callback: (event: IChatErrorEvent) => void): unknown => {
  const handler = (_event: unknown, data: IChatErrorEvent) => callback(data);
  return window?.electron?.ipcRenderer?.on(IpcChannels.CHAT_ERROR, handler);
};
