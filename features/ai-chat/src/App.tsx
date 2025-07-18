import { useChat } from '@vkit/hooks';
import { useState } from 'react';
import { type IChatMessage } from '@vkit/api';

function ChatComponent() {
  // 你自己管理消息历史
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [currentModel, setCurrentModel] = useState('Qwen/Qwen3-32B');

  const {
    streamingContent,
    loading,
    error,
    sendMessage,
    reset,
  } = useChat();

  const handleSendMessage = async (content: string) => {
    const userMessage: IChatMessage = { role: 'user', content };

    // 立即添加用户消息到历史
    setMessages(prev => [...prev, userMessage]);

    // 发送包含新消息的完整历史
    await sendMessage([...messages, userMessage], currentModel);
  };

  return (
    <div>
      {/* 模型选择 */}
      <select value={currentModel} onChange={e => setCurrentModel(e.target.value)}>
        <option value='moonshotai/Kimi-K2-Instruct'>moonshotai/Kimi-K2-Instruct</option>
      </select>

      {/* 消息列表 */}
      <div className='messages'>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <strong>{message.role}:</strong>{' '}
            {typeof message.content === 'string'
              ? message.content
              : JSON.stringify(message.content)}
          </div>
        ))}

        {/* 显示正在流式接收的内容 */}
        {loading && streamingContent && (
          <div className='message assistant streaming'>
            <strong>assistant:</strong> {streamingContent}
          </div>
        )}
      </div>

      {/* 错误显示 */}
      {error && <div className='error'>错误: {error}</div>}

      {/* 操作按钮 */}
      <div className='actions'>
        <button
          onClick={() => handleSendMessage('你好，请介绍一下React的最新特性')}
          disabled={loading}
        >
          {loading ? '发送中...' : '发送消息'}
        </button>

        <button onClick={() => setMessages([])}>清空聊天</button>

        <button onClick={reset}>重置状态</button>
      </div>
    </div>
  );
}

export default ChatComponent;
