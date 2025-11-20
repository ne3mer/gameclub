import TelegramBot from 'node-telegram-bot-api';
import { env } from '../config/env';

let bot: TelegramBot | null = null;

const initializeTelegramBot = () => {
  if (!env.TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️  Telegram bot not configured. TELEGRAM_BOT_TOKEN missing.');
    console.warn('   Add TELEGRAM_BOT_TOKEN to your .env file');
    return null;
  }

  // Validate token format (should be like: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz)
  if (!/^\d+:[A-Za-z0-9_-]+$/.test(env.TELEGRAM_BOT_TOKEN)) {
    console.error('❌ Invalid Telegram bot token format');
    console.error('   Token should be in format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
    return null;
  }

  try {
    bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: false });
    console.log('✅ Telegram bot initialized successfully');
    console.log('   Bot token:', env.TELEGRAM_BOT_TOKEN.substring(0, 10) + '...');
    return bot;
  } catch (error) {
    console.error('❌ Failed to initialize Telegram bot:', error);
    if (error instanceof Error) {
      console.error('   Error message:', error.message);
    }
    return null;
  }
};

// Initialize on module load
if (!bot) {
  bot = initializeTelegramBot();
}

export interface TelegramMessageOptions {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown';
  replyMarkup?: any;
}

export const sendTelegramMessage = async (options: TelegramMessageOptions): Promise<boolean> => {
  if (!bot) {
    console.warn('⚠️  Telegram bot not available. Skipping message send.');
    console.warn('   Check if TELEGRAM_BOT_TOKEN is set correctly in .env');
    return false;
  }

  if (!options.chatId) {
    console.error('❌ Telegram chatId is missing');
    return false;
  }

  let chatId = options.chatId;

  // If it's a username, try to resolve it to chat ID first
  if (chatId.startsWith('@')) {
    console.log(`🔍 Attempting to resolve username ${chatId} to chat ID...`);
    const resolvedChatId = await resolveUsernameToChatId(chatId);
    if (resolvedChatId) {
      chatId = resolvedChatId;
      console.log(`✅ Using resolved chat ID: ${chatId}`);
    } else {
      console.warn(`⚠️  Could not resolve username, will try sending directly to ${chatId}`);
      console.warn('   User must have started a conversation with the bot for this to work');
    }
  }

  try {
    await bot.sendMessage(chatId, options.text, {
      parse_mode: options.parseMode || 'HTML',
      reply_markup: options.replyMarkup
    });
    console.log('✅ Telegram message sent successfully to chatId:', chatId);
    return true;
  } catch (error: any) {
    // More detailed error logging
    if (error.response) {
      const errorCode = error.response.body?.error_code;
      const errorDescription = error.response.body?.description;
      
      if (errorCode === 400) {
        console.error('❌ Telegram API Error 400 (Bad Request):', errorDescription);
        console.error('   This usually means:');
        console.error('   - Invalid chatId format');
        console.error('   - User has not started a conversation with the bot');
        console.error('   - Bot was blocked by the user');
      } else if (errorCode === 403) {
        console.error('❌ Telegram API Error 403 (Forbidden):', errorDescription);
        console.error('   This usually means the bot was blocked by the user');
      } else if (errorCode === 401) {
        console.error('❌ Telegram API Error 401 (Unauthorized):', errorDescription);
        console.error('   This means the bot token is invalid');
      } else {
        console.error(`❌ Telegram API Error ${errorCode}:`, errorDescription);
      }
    } else {
      console.error('❌ Failed to send Telegram message:', error);
      if (error.message) {
        console.error('   Error message:', error.message);
      }
    }
    console.error('   Attempted to send to chatId:', options.chatId);
    return false;
  }
};

// Telegram message templates
export const telegramTemplates = {
  orderConfirmation: (orderNumber: string, totalAmount: number, items: Array<{ title: string; quantity: number }>) => {
    const itemsText = items.map(item => `  • ${item.title} (${item.quantity}x)`).join('\n');
    return `✅ <b>سفارش شما ثبت شد!</b>

📦 شماره سفارش: <code>${orderNumber}</code>
💰 مبلغ کل: ${totalAmount.toLocaleString('fa-IR')} تومان

🛒 محصولات:
${itemsText}

⚠️ پس از پرداخت موفق، اطلاعات اکانت برای شما ارسال خواهد شد.`;
  },

  orderPaid: (orderNumber: string, credentials: string, message?: string) => {
    return `🎉 <b>سفارش شما آماده است!</b>

📦 شماره سفارش: <code>${orderNumber}</code>

${message ? `📝 پیام:\n${message}\n\n` : ''}🔑 <b>اطلاعات اکانت:</b>
<code>${credentials}</code>

🔒 این اطلاعات را در جای امن نگهداری کنید.`;
  },

  priceAlert: (gameTitle: string, currentPrice: number, targetPrice: number, gameUrl: string) => {
    return `🎉 <b>قیمت کاهش یافت!</b>

🎮 ${gameTitle}

💰 قیمت قبلی: <s>${targetPrice.toLocaleString('fa-IR')}</s> تومان
✅ قیمت فعلی: <b>${currentPrice.toLocaleString('fa-IR')}</b> تومان

🛒 <a href="${gameUrl}">خرید کنید</a>`;
  }
};

// Helper to get chat ID from username or use default
export const getChatId = (destination: string): string | null => {
  if (!destination || destination.trim() === '') {
    console.warn('⚠️  Empty telegram destination provided');
    return null;
  }

  const trimmed = destination.trim();
  
  // If it's a numeric chat ID, return it
  if (/^-?\d+$/.test(trimmed)) {
    return trimmed;
  }
  
  // If it's a username (starts with @), try to use it directly
  // Telegram API supports usernames IF the user has started a conversation with the bot
  if (trimmed.startsWith('@')) {
    console.warn('⚠️  Username provided instead of chat ID:', trimmed);
    console.warn('   Attempting to send to username (user must have started conversation with bot)');
    // Return username - Telegram API will try to resolve it
    // If user hasn't started conversation, it will fail with proper error
    return trimmed;
  }
  
  // Return as is (assuming it's a chat ID)
  return trimmed;
};

// Try to resolve username to chat ID by checking recent updates
export const resolveUsernameToChatId = async (username: string): Promise<string | null> => {
  if (!bot) {
    return null;
  }

  if (!username.startsWith('@')) {
    // Already a chat ID or invalid format
    return username;
  }

  try {
    // Get recent updates to find the user's chat ID
    const updates = await bot.getUpdates({ limit: 100 });
    
    for (const update of updates) {
      const chat = update.message?.chat || update.callback_query?.message?.chat;
      if (chat && chat.username && `@${chat.username}` === username) {
        console.log(`✅ Resolved username ${username} to chat ID: ${chat.id}`);
        return String(chat.id);
      }
    }
    
    console.warn(`⚠️  Could not resolve username ${username} to chat ID from recent updates`);
    return null;
  } catch (error) {
    console.error('❌ Failed to resolve username:', error);
    return null;
  }
};

// Test if bot can send messages (verify bot is working)
export const testTelegramBot = async (): Promise<{ success: boolean; message: string }> => {
  if (!bot) {
    return {
      success: false,
      message: 'Bot not initialized. Check TELEGRAM_BOT_TOKEN in .env'
    };
  }

  if (!env.TELEGRAM_CHAT_ID) {
    return {
      success: false,
      message: 'TELEGRAM_CHAT_ID not set in .env. Cannot test without a chat ID.'
    };
  }

  try {
    await bot.sendMessage(env.TELEGRAM_CHAT_ID, '🧪 Test message from GameClub bot\n\nIf you receive this, the bot is working correctly!');
    return {
      success: true,
      message: `Test message sent successfully to chat ID: ${env.TELEGRAM_CHAT_ID}`
    };
  } catch (error: any) {
    const errorMsg = error.response?.body?.description || error.message || 'Unknown error';
    return {
      success: false,
      message: `Failed to send test message: ${errorMsg}`
    };
  }
};

