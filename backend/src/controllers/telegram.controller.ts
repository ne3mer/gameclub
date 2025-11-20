import type { Request, Response } from 'express';
import { testTelegramBot, sendTelegramMessage } from '../services/telegram.service';
import { authenticateUser } from '../middleware/authenticateUser';
import { adminAuth } from '../middleware/adminAuth';

export const testBotController = async (_req: Request, res: Response) => {
  try {
    const result = await testTelegramBot();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to test Telegram bot'
    });
  }
};

export const sendTestMessageController = async (req: Request, res: Response) => {
  try {
    const { chatId, message } = req.body;
    
    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'chatId is required'
      });
    }

    const result = await sendTelegramMessage({
      chatId: String(chatId),
      text: message || '🧪 Test message from GameClub bot',
      parseMode: 'HTML'
    });

    if (result) {
      res.json({
        success: true,
        message: `Message sent successfully to chat ID: ${chatId}`
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send message. Check server logs for details.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send test message'
    });
  }
};

