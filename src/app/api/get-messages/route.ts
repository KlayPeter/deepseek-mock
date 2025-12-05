import { auth } from '@clerk/nextjs/server'
import { getMessagesByChatId } from '@/src/db'

/**
 * POST /api/get-messages
 *
 * 获取指定聊天的所有历史消息
 *
 * @param req.body.chat_id - 聊天 ID（字符串格式）
 * @param req.body.chat_user_id - 聊天所属用户 ID，用于权限验证
 *
 * @returns 消息数组，每条消息包含 id, chatId, role, content 等字段
 *
 * 安全验证:
 * - 验证用户已登录
 * - 验证请求用户与聊天所有者匹配
 */
export async function POST(req: Request) {
  try {
    const { chat_id, chat_user_id } = await req.json()

    // 验证用户身份并确保与聊天所有者匹配
    const { userId } = await auth()
    if (!userId || userId !== chat_user_id) {
      console.error('Authentication failed in get-messages:', {
        requestUserId: userId,
        chatOwnerId: chat_user_id,
      })
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Access denied' }),
        { status: 401 }
      )
    }

    // 验证并转换 chat_id 为数字类型
    const chatIdNumber = parseInt(chat_id, 10)
    if (isNaN(chatIdNumber)) {
      return new Response(
        JSON.stringify({ error: 'Invalid chat_id: Must be a number' }),
        { status: 400 }
      )
    }

    // 从数据库获取该聊天的所有消息
    const messages = await getMessagesByChatId(chatIdNumber)

    // 返回消息数组（可能为空数组）
    return new Response(JSON.stringify(messages || []), { status: 200 })
  } catch (error) {
    console.error('Get messages error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    )
  }
}
