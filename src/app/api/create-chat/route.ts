import { auth } from '@clerk/nextjs/server'
import { createChat } from '@/src/db'

/**
 * POST /api/create-chat
 *
 * 创建新的聊天会话
 *
 * @param req.body.title - 聊天标题
 * @param req.body.model - AI 模型名称 (deepseek-v3 或 deepseek-r1)
 *
 * @returns 新创建的聊天对象，包含 id 字段
 *
 * 注意：
 * - 支持匿名用户创建聊天（userId 为 'anonymous'）
 * - 已认证用户的聊天将关联到其用户 ID
 */
export async function POST(req: Request) {
  try {
    const { title, model } = await req.json()

    // 验证必需参数
    if (!title || !model) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title and model' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 尝试获取用户 ID（可选，支持匿名模式）
    let userId: string | null = null
    try {
      const authResult = await auth()
      userId = authResult.userId
    } catch (error) {
      console.log('No authenticated user, using anonymous mode')
    }

    // 如果没有用户 ID，使用匿名用户标识
    if (!userId) {
      userId = 'anonymous'
    }

    // 创建新的聊天记录
    const newChat = await createChat(title, userId, model)

    if (!newChat) {
      console.error('Failed to create chat in database')
      return new Response(JSON.stringify({ error: 'Failed to create chat' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 返回新聊天的 ID
    return new Response(JSON.stringify({ id: newChat.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error creating chat:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
