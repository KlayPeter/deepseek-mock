import { createDeepSeek } from '@ai-sdk/deepseek'
import { convertToModelMessages, streamText } from 'ai'
import { auth } from '@clerk/nextjs/server'
import { createMessage } from '@/src/db/index'

/**
 * API 路由配置
 * 允许流式响应最多持续 30 秒
 */
export const maxDuration = 30

/**
 * 初始化 DeepSeek AI 客户端
 * 使用环境变量配置 API 密钥和基础 URL
 */
const deepSeek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.BASE_URL,
})

/**
 * POST /api/chat
 *
 * 处理与 AI 的聊天交互，支持流式响应
 *
 * @param req.body.messages - AI SDK 格式的消息历史记录
 * @param req.body.model - 使用的模型名称 (deepseek-v3 或 deepseek-r1)
 * @param req.body.chat_id - 聊天 ID（字符串格式）
 * @param req.body.chat_user_id - 聊天所属用户 ID
 *
 * @returns 流式 AI 响应
 *
 * 工作流程:
 * 1. 验证用户身份
 * 2. 保存用户消息到数据库
 * 3. 调用 AI 模型生成回复
 * 4. 流式返回 AI 响应
 * 5. 完成后保存 AI 回复到数据库
 */
export async function POST(req: Request) {
  try {
    const { messages, model, chat_id, chat_user_id } = await req.json()

    // 1. 身份验证：确保请求用户与聊天所有者匹配
    const { userId } = await auth()
    if (!userId || userId !== chat_user_id) {
      console.error('Authentication failed:', {
        requestUserId: userId,
        chatOwnerId: chat_user_id,
      })
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      })
    }

    // 2. 验证并转换 chat_id 为数字类型
    const chatIdNumber = parseInt(chat_id, 10)
    if (isNaN(chatIdNumber)) {
      return new Response(JSON.stringify({ error: 'Invalid chat_id format' }), {
        status: 400,
      })
    }

    // 3. 提取并保存用户消息
    const lastMessage = messages[messages.length - 1]

    // 处理 AI SDK 的 UIMessage 格式：从 parts 数组中提取文本内容
    const messageContent = lastMessage.parts
      ? lastMessage.parts.find((p: any) => p.type === 'text')?.text
      : lastMessage.content

    // 保存用户消息到数据库
    await createMessage(chatIdNumber, lastMessage.role, messageContent)

    // 4. 调用 AI 模型生成响应
    const selectedModel = model || 'deepseek-v3'
    const result = streamText({
      model: deepSeek(selectedModel),
      system: 'You are a helpful assistant.',
      messages: convertToModelMessages(messages),

      // 5. AI 生成完成后的回调：保存 AI 回复到数据库
      onFinish: async (result) => {
        await createMessage(chatIdNumber, 'assistant', result.text)
      },
    })

    // 返回流式 UI 消息响应，包含思考过程
    return result.toUIMessageStreamResponse({
      sendReasoning: true,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
      }
    )
  }
}
