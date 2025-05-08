import axios from 'axios';
import { LoggerService } from '../services/logger.service';

export async function sendTelegramAlert(
  message: string,
  logger?: LoggerService
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    if (logger) {
      logger.warn(`Missing Telegram configuration for alert`, {
        context: 'TelegramAlertService',
      });
    }
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    if (logger) {
      logger.error('Failed to send Telegram alert', {
        context: 'TelegramAlertService',
        cause: error,
        metadata: {
          chatId,
          endpoint: url,
        },
        data: {
          text: message,
        },
      });
    }
  }
}
