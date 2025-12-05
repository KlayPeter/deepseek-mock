import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { and, eq, desc } from 'drizzle-orm'
import { chatsTable, messagesTable } from './schema'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle({ client })

// chats
export const createChat = async (
  title: string,
  userId: string,
  model: string
) => {
  try {
    const [newChat] = await db
      .insert(chatsTable)
      .values({
        title,
        userId,
        model,
      })
      .returning()
    return newChat
  } catch (error) {
    console.error('createChat error', error)
    throw error
  }
}

export const getChat = async (chatId: number, userId: string) => {
  try {
    const caht = await db
      .select()
      .from(chatsTable)
      .where(and(eq(chatsTable.id, chatId), eq(chatsTable.userId, userId)))

    if (caht.length === 0) {
      return null
    }
    return caht[0]
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getChats = async (userId: string) => {
  try {
    const chats = await db
      .select()
      .from(chatsTable)
      .where(eq(chatsTable.userId, userId))
      .orderBy(desc(chatsTable.id))

    return chats
  } catch (error) {
    console.error(error)
    return null
  }
}

/**
 * 删除聊天记录
 * 会自动级联删除该聊天的所有消息（通过数据库外键约束）
 */
export const deleteChat = async (chatId: number, userId: string) => {
  try {
    // 先验证聊天是否属于该用户
    const chat = await getChat(chatId, userId)
    if (!chat) {
      return { success: false, error: 'Chat not found or unauthorized' }
    }

    // 先删除该聊天的所有消息
    await db.delete(messagesTable).where(eq(messagesTable.chatId, chatId))

    // 再删除聊天记录
    await db
      .delete(chatsTable)
      .where(and(eq(chatsTable.id, chatId), eq(chatsTable.userId, userId)))

    return { success: true }
  } catch (error) {
    console.error('deleteChat error:', error)
    return { success: false, error: 'Failed to delete chat' }
  }
}

// messages
export const createMessage = async (
  chat_id: number,
  role: string,
  content: string
) => {
  try {
    const [newMessage] = await db
      .insert(messagesTable)
      .values({
        chatId: chat_id,
        role,
        content,
      })
      .returning()
    return newMessage
  } catch (error) {
    console.error(error)
    return null
  }
}

export const getMessagesByChatId = async (chatId: number) => {
  try {
    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, chatId))

    return messages
  } catch (error) {
    console.error(error)
    return null
  }
}
