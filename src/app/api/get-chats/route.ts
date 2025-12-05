import { auth } from '@clerk/nextjs/server'
import { getChats } from '@/src/db'

/**
 * POST /api/get-chats
 *
 * 获取当前用户的所有聊天列表
 *
 * @returns 聊天数组，每个聊天包含 id, userId, title, model 等字段
 *
 * 安全验证:
 * - 验证用户已登录
 * - 仅返回属于当前用户的聊天记录
 */
export async function POST(request: Request) {
  try {
    // 获取当前登录用户 ID
    const { userId } = await auth()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: User not authenticated' }),
        { status: 401 }
      )
    }

    // 从数据库获取该用户的所有聊天记录
    const chats = await getChats(userId)

    return new Response(JSON.stringify(chats || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Get chats error:', error)
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
