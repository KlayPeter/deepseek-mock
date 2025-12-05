import { auth } from '@clerk/nextjs/server'
import { deleteChat } from '@/src/db'

/**
 * POST /api/delete-chat
 *
 * 删除指定的聊天记录及其所有消息
 *
 * @param req.body.chat_id - 要删除的聊天 ID（字符串格式）
 *
 * @returns 删除结果
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

    // 验证并转换 chat_id 为数字类型
    const chatIdNumber = parseInt(chat_id, 10)
    if (isNaN(chatIdNumber)) {
      return new Response(
        JSON.stringify({ error: 'Invalid chat_id: Must be a number' }),
        { status: 400 }
      )
    }

    // 删除聊天记录
    const result = await deleteChat(chatIdNumber, userId)

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: result.error?.includes('unauthorized') ? 403 : 500,
      })
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Chat deleted successfully' }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete chat API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500 }
    )
  }
}
