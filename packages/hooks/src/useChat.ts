import { useState, useEffect, useCallback } from 'react';
import {
  startChat,
  onChatStreamData,
  onToolCallsDetected,
  onToolCalled,
  onChatCompleted,
  onChatError,
  type IChatMessage,
  type IChatStreamEvent,
  type IToolCallsDetectedEvent,
  type IToolCalledEvent,
  type IChatCompletedEvent,
  type IChatErrorEvent,
} from '@vkit/api';

export interface ChatState {
  /** 是否loading */
  loading: boolean;
  /** 错误信息 */
  error?: string;
  /** 当前会话 ID */
  currentSessionId: string | null;
  /** 流式消息 */
  streamingContent: string;
}

export interface UseChatOptions {
  /** 是否使用工具 */
  useTools?: boolean;
  /** 错误回调 */
  onError?: (error: string) => void;
  /** 流式消息回调 */
  onStreamData?: (content: string) => void;
  /** 完成回调 */
  onComplete?: (finalContent: string) => void;
}

export interface UseChatReturn extends ChatState {
  /** 发送消息 */
  sendMessage: (messages: IChatMessage[], model: string) => Promise<void>;
  /** 重置 */
  reset: () => void;
}

export const useChat = (options: UseChatOptions = {}): UseChatReturn => {
  const { useTools = true, onError, onStreamData, onComplete } = options;

  const [state, setState] = useState<ChatState>({
    loading: false,
    error: undefined,
    currentSessionId: null,
    streamingContent: '',
  });

  const handleStreamData = useCallback(
    (event: IChatStreamEvent) => {
      if (state.currentSessionId === event.sessionId) {
        setState(prev => ({
          ...prev,
          streamingContent: prev.streamingContent + event.content,
        }));
        onStreamData?.(event.content);
      }
    },
    [state.currentSessionId, onStreamData]
  );

  const handleToolCallsDetected = useCallback(
    (event: IToolCallsDetectedEvent) => {
      if (state.currentSessionId === event.sessionId && event.toolCalls.length > 0) {
        setState(prev => {
          let newStreamingContent = prev.streamingContent;
          event.toolCalls.forEach(toolCall => {
            const { name, arguments: args } = toolCall.function;
            newStreamingContent += `<toolCall loading="true" name="${name}" arguments="${btoa(args)}" />`;
          });
          return {
            ...prev,
            streamingContent: newStreamingContent,
          };
        });
      }
    },
    [state.currentSessionId]
  );

  const handleToolCalled = useCallback(
    (event: IToolCalledEvent) => {
      if (state.currentSessionId === event.sessionId) {
        setState(prev => {
          const regex = /<toolCall loading="true" name="([^"]*)" arguments="([^"]*)" \/>/g;
          let match;
          let lastIndex = -1;
          let lastMatch;
          while ((match = regex.exec(prev.streamingContent)) !== null) {
            lastIndex = match.index;
            lastMatch = match;
          }
          if (lastIndex !== -1 && lastMatch) {
            const before = prev.streamingContent.slice(0, lastIndex);
            const after = prev.streamingContent.slice(lastIndex + lastMatch[0].length);
            const newTag = `<toolCall loading="false" name="${lastMatch[1]}" arguments="${lastMatch[2]}" result="${JSON.stringify(event.toolCall.result)}" />`;
            return {
              ...prev,
              streamingContent: before + newTag + after,
            };
          }
          return {
            ...prev,
          };
        });
      }
    },
    [state.currentSessionId]
  );

  const handleChatCompleted = useCallback(
    (event: IChatCompletedEvent) => {
      if (state.currentSessionId === event.sessionId) {
        const finalContent = state.streamingContent;
        setState(prev => ({
          ...prev,
          currentSessionId: null,
          streamingContent: '',
        }));
        onComplete?.(finalContent);
        setState(prev => ({
          ...prev,
          loading: false,
        }));
      }
    },
    [state.currentSessionId, state.streamingContent, onComplete]
  );

  const handleChatError = useCallback(
    (event: IChatErrorEvent) => {
      if (state.currentSessionId === event.sessionId) {
        setState(prev => ({
          ...prev,
          currentSessionId: null,
          streamingContent: '',
        }));
        onError?.(event.error);
      }
    },
    [state.currentSessionId, onError]
  );

  useEffect(() => {
    const listeners = [
      onChatStreamData(handleStreamData),
      onToolCallsDetected(handleToolCallsDetected),
      onToolCalled(handleToolCalled),
      onChatCompleted(handleChatCompleted),
      onChatError(handleChatError),
    ];
    const eventListeners = listeners.filter(Boolean) as Array<() => void>;
    return () => {
      eventListeners.forEach(cleanup => cleanup());
    };
  }, [
    handleStreamData,
    handleToolCallsDetected,
    handleToolCalled,
    handleChatCompleted,
    handleChatError,
  ]);

  const sendMessage = useCallback(
    async (messages: IChatMessage[], model: string): Promise<void> => {
      setState(prev => ({
        ...prev,
        loading: true,
        streamingContent: '',
      }));
      try {
        const result = await startChat({
          messages,
          model,
          useTools,
        });
        if (result.success && result.data) {
          setState(prev => ({
            ...prev,
            currentSessionId: result.data?.sessionId ?? null,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: result.error ?? '启动聊天失败',
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : '发送消息失败',
        }));
      }
    },
    [useTools]
  );

  const reset = useCallback((): void => {
    setState(prev => ({
      ...prev,
      error: undefined,
      currentSessionId: null,
      streamingContent: '',
    }));
  }, []);

  return {
    ...state,
    sendMessage,
    reset,
  };
};
