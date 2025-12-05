import { auth } from '@clerk/nextjs/server'
import { createMessage } from '@/src/db'

/**
 * POST /api/save-message
 *
 * 保存新消息到数据库
 *
 * @param req.body.chatId - 聊天 ID
 * @param req.body.role - 消息角色 (user 或 model)
 * @param req.body.content - 消息内容
 *
 * @returns 新创建的消息对象
 */
export async function POST(req: Request) {
  try {
    const { chatId, role, content } = await req.json()

    // 验证必需参数
    if (!chatId || !role || !content) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields: chatId, role, content',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 保存消息到数据库
    const newMessage = await createMessage(chatId, role, content)

    if (!newMessage) {
      return new Response(JSON.stringify({ error: 'Failed to save message' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(newMessage), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Save message error:', error)
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
