import axios from 'axios';
import { ErrorSeverity } from '../enums/error-severity.enum';
import { logAppEvent } from './log-app-event.util';

export async function sendTelegramAlert(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  } catch (error) {
    logAppEvent(
      'Failed to send Telegram alert',
      'TelegramAlertUtil',
      ErrorSeverity.MEDIUM,
      { error, message },
      { sendAlert: true, saveToDb: true }
    );
  }
}
