import { auth } from '@clerk/nextjs/server'
import { getChat } from '@/src/db'

/**
 * POST /api/get-chat
 *
 * 获取单个聊天的详细信息
 *
 * @param req.body.chat_id - 聊天 ID（字符串格式）
 *
 * @returns 聊天对象，包含 id, userId, title, model 等字段
 *
 * 安全验证:
 * - 验证用户已登录
 * - 验证聊天属于当前用户
 */
export async function POST(req: Request) {
  try {
    const { chat_id } = await req.json()

    // 验证用户身份
    const { userId } = await auth()
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User not authenticated' }),
        { status: 401 }
      )
    }

    // 验证并转换 chat_id 为数字类型（数据库使用整数 ID）
    const chatIdNumber = parseInt(chat_id, 10)
    if (isNaN(chatIdNumber)) {
      return new Response(
        JSON.stringify({ error: 'Invalid chat_id: Must be a number' }),
        { status: 400 }
      )
    }

    // 从数据库获取聊天记录（同时验证所有权）
    const chat = await getChat(chatIdNumber, userId)
    if (!chat) {
      return new Response(
        JSON.stringify({ error: 'Chat not found or access denied' }),
        { status: 404 }
      )
    }

    return new Response(JSON.stringify(chat), { status: 200 })
  } catch (error) {
    console.error('Get chat error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    )
  }
}
