import OpenAI from 'openai';
import { EventEmitter } from 'events';
import {
  ChatCompletionCreateParamsStreaming,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/index';
import MCPService from './MCPService';
import { parse } from '@vkit/utils';

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

class ChatService extends EventEmitter {
  private openai: OpenAI;

  constructor() {
    super();
    this.openai = new OpenAI({
      apiKey: 'sk-pmjxzdbiadynpeerhkvxfbhtjrfzoirjilivddwzlzdvvnbe',
      baseURL: 'https://api.siliconflow.cn/v1',
    });
    MCPService.initialize();
  }

  async getModels() {
    const models = await this.openai.models.list();
    return models.data.map(model => model.id);
  }

  /**
   * 获取所有可用的 MCP 工具并转换为 OpenAI tools 格式
   */
  private async getAllMCPTools(): Promise<{
    tools: ChatCompletionTool[];
    toolsMap: Map<string, { serverId: string; toolName: string }>;
  }> {
    const tools: ChatCompletionTool[] = [];
    const toolsMap = new Map<string, { serverId: string; toolName: string }>();

    const connectedServers = MCPService.getConnectedServers();

    for (const serverId of connectedServers) {
      try {
        const mcpTools = await MCPService.getTools(serverId);

        for (const mcpTool of mcpTools) {
          // 创建唯一的工具名称
          const uniqueToolName = `${serverId}_${mcpTool.name}`;

          // 转换为 OpenAI tools 格式
          const openAITool: ChatCompletionTool = {
            type: 'function',
            function: {
              name: uniqueToolName,
              description: mcpTool.description ?? `Tool ${mcpTool.name} from ${serverId}`,
              parameters: mcpTool.inputSchema,
            },
          };

          tools.push(openAITool);
          toolsMap.set(uniqueToolName, { serverId, toolName: mcpTool.name });
        }
      } catch (error) {
        console.warn(`Failed to get tools from server ${serverId}:`, error);
      }
    }

    return { tools, toolsMap };
  }

  /**
   * 处理工具调用
   */
  private async handleToolCalls(
    toolCalls: ToolCall[],
    toolsMap: Map<string, { serverId: string; toolName: string }>
  ): Promise<ChatCompletionMessageParam[]> {
    const toolMessages: ChatCompletionMessageParam[] = [];

    for (const toolCall of toolCalls) {
      const { id, function: func } = toolCall;
      const { name, arguments: args } = func;

      try {
        const toolInfo = toolsMap.get(name);
        if (!toolInfo) {
          throw new Error(`Unknown tool: ${name}`);
        }

        const { serverId, toolName } = toolInfo;

        // 解析参数
        const parsedArgs =
          typeof args === 'string' ? parse<Record<string, unknown>>(args, {}) : args;

        // 调用 MCP 工具
        const result = await MCPService.callTool(serverId, toolName, parsedArgs);

        // 添加工具响应消息
        toolMessages.push({
          role: 'tool',
          tool_call_id: id,
          content: JSON.stringify(result),
        });

        this.emit('tool-called', { serverId, toolName, arguments: parsedArgs, result });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Tool call failed';

        // 添加错误响应
        toolMessages.push({
          role: 'tool',
          tool_call_id: id,
          content: JSON.stringify({ error: errorMessage }),
        });

        this.emit('tool-error', { toolName: name, error: errorMessage });
      }
    }

    return toolMessages;
  }

  async chat({
    messages,
    model,
    useTools = true,
  }: {
    messages: ChatCompletionMessageParam[];
    model: string;
    useTools?: boolean;
  }) {
    const chatMessages = [...messages];
    let tools: ChatCompletionTool[] = [];
    let toolsMap = new Map<string, { serverId: string; toolName: string }>();

    // 如果启用工具支持，获取可用的 MCP 工具
    if (useTools) {
      const mcpToolsData = await this.getAllMCPTools();
      tools = mcpToolsData.tools;
      toolsMap = mcpToolsData.toolsMap;
    }

    while (true) {
      const stream = await this.openai.chat.completions.create({
        stream: true,
        enable_thinking: false,
        messages: chatMessages,
        model,
        ...(tools.length > 0 && { tools }),
        ...(tools.length > 0 && { tool_choice: 'auto' }),
      } as ChatCompletionCreateParamsStreaming);

      let assistantMessage = '';
      const toolCalls: ToolCall[] = [];

      // 处理流式响应
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          assistantMessage += delta.content;
          this.emit('openai-stream-data', delta.content);
        }

        // 处理工具调用
        if (delta?.tool_calls) {
          for (const toolCallDelta of delta.tool_calls) {
            const index = toolCallDelta.index;

            toolCalls[index] ??= {
              id: '',
              type: 'function',
              function: { name: '', arguments: '' },
            };

            if (toolCallDelta.id) {
              toolCalls[index].id = toolCallDelta.id;
            }

            if (toolCallDelta.function?.name) {
              toolCalls[index].function.name = toolCallDelta.function.name;
            }

            if (toolCallDelta.function?.arguments) {
              toolCalls[index].function.arguments += toolCallDelta.function.arguments;
            }
          }
        }
      }

      // 添加助手回复到消息历史
      const assistantMsg: ChatCompletionMessageParam = {
        role: 'assistant',
        content: assistantMessage || null,
        ...(toolCalls.length > 0 && { tool_calls: toolCalls }),
      };
      chatMessages.push(assistantMsg);

      // 如果没有工具调用，结束循环
      if (toolCalls.length === 0) {
        break;
      }

      this.emit('tool-calls-detected', toolCalls);

      const toolMessages = await this.handleToolCalls(toolCalls, toolsMap);
      chatMessages.push(...toolMessages);
    }
  }
}

export const chatService = new ChatService();
