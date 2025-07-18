import { ipcMain } from 'electron';
import { chatService } from '../service/chatService';
import {
  IpcChannels,
  type IChatOperationResult,
  type IChatRequest,
  type IChatStreamEvent,
  type IToolCallsDetectedEvent,
  type IToolCalledEvent,
  type IChatCompletedEvent,
  type IChatErrorEvent,
  type IChatSession,
  type IToolCall,
  type IToolCallEvent,
} from '@vkit/api';

// 用于存储会话信息
const activeSessions = new Map<string, IChatSession>();

/**
 * 获取模型列表的IPC处理器
 */
const handleGetModels = async (): Promise<IChatOperationResult<string[]>> => {
  try {
    const models = await chatService.getModels();
    return {
      success: true,
      data: models,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取模型列表失败',
    };
  }
};

/**
 * 开始聊天的IPC处理器
 */
const handleChatStart = (
  event: Electron.IpcMainInvokeEvent,
  request: IChatRequest
): IChatOperationResult<{ sessionId: string }> => {
  try {
    const sessionId = crypto.randomUUID();
    const webContentsId = event.sender.id;
    const startTime = Date.now();

    // 存储会话信息
    const session: IChatSession = {
      sessionId,
      webContentsId,
      startTime,
    };
    activeSessions.set(sessionId, session);

    // 设置事件监听器
    const onStreamData = (content: string) => {
      const streamEvent: IChatStreamEvent = {
        sessionId,
        content,
      };
      event.sender.send(IpcChannels.CHAT_STREAM_DATA, streamEvent);
    };

    const onToolCallsDetected = (toolCalls: IToolCall[]) => {
      const toolCallsEvent: IToolCallsDetectedEvent = {
        sessionId,
        toolCalls,
      };
      event.sender.send(IpcChannels.CHAT_TOOL_CALLS_DETECTED, toolCallsEvent);
    };

    const onToolCalled = (toolCall: IToolCallEvent) => {
      const toolCalledEvent: IToolCalledEvent = {
        sessionId,
        toolCall,
      };
      event.sender.send(IpcChannels.CHAT_TOOL_CALLED, toolCalledEvent);
    };

    const onToolError = (errorData: { toolName: string; error: string }) => {
      const errorEvent: IChatErrorEvent = {
        sessionId,
        error: `工具调用失败 [${errorData.toolName}]: ${errorData.error}`,
      };
      event.sender.send(IpcChannels.CHAT_TOOL_ERROR, errorEvent);
    };

    // 添加事件监听器
    chatService.on('openai-stream-data', onStreamData);
    chatService.on('tool-calls-detected', onToolCallsDetected);
    chatService.on('tool-called', onToolCalled);
    chatService.on('tool-error', onToolError);

    // 启动聊天并处理完成事件 - 使用类型断言确保兼容性
    chatService
      .chat(request as Parameters<typeof chatService.chat>[0])
      .then(() => {
        const completedEvent: IChatCompletedEvent = {
          sessionId,
          messages: request.messages,
        };
        event.sender.send(IpcChannels.CHAT_COMPLETED, completedEvent);
      })
      .catch((error: unknown) => {
        const errorEvent: IChatErrorEvent = {
          sessionId,
          error: error instanceof Error ? error.message : '聊天过程中发生错误',
        };
        event.sender.send(IpcChannels.CHAT_ERROR, errorEvent);
      })
      .finally(() => {
        // 清理事件监听器和会话信息
        chatService.off('openai-stream-data', onStreamData);
        chatService.off('tool-calls-detected', onToolCallsDetected);
        chatService.off('tool-called', onToolCalled);
        chatService.off('tool-error', onToolError);
        activeSessions.delete(sessionId);
      });

    return {
      success: true,
      data: { sessionId },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '启动聊天失败',
    };
  }
};

/**
 * 设置Chat服务相关的IPC处理器
 */
export const setupChatIpc = () => {
  // 注册IPC处理器
  ipcMain.handle(IpcChannels.CHAT_GET_MODELS, handleGetModels);
  ipcMain.handle(IpcChannels.CHAT_START, handleChatStart);
};

/**
 * 清理Chat服务
 */
export const destroyChatService = () => {
  // 清理所有活跃会话
  activeSessions.clear();

  // 移除所有事件监听器
  chatService.removeAllListeners();
};
