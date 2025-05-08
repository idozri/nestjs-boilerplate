import { sendTelegramAlert } from '../telegram-alert.util';
import axios from 'axios';
import { LoggerService } from '../../services/logger.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('sendTelegramAlert', () => {
  // Save original env vars
  const originalEnv = { ...process.env };
  let mockLogger: LoggerService;

  beforeEach(() => {
    jest.resetAllMocks();

    // Setup default environment for tests
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_CHAT_ID = 'test-chat-id';

    // Create a mock logger
    mockLogger = {
      error: jest.fn(),
      fatal: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      setLoggerName: jest.fn(),
    } as unknown as LoggerService;
  });

  afterEach(() => {
    // Restore original env vars
    process.env = originalEnv;
  });

  // SUCCESS CASE: Message sent successfully
  it('should send a message to Telegram API', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { ok: true } });

    const message = 'Test alert message';
    await sendTelegramAlert(message, mockLogger);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }
    );
  });

  // EDGE CASE: Missing environment variables
  it('should return early if TELEGRAM_BOT_TOKEN is missing', async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;

    await sendTelegramAlert('Test message', mockLogger);

    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it('should return early if TELEGRAM_CHAT_ID is missing', async () => {
    delete process.env.TELEGRAM_CHAT_ID;

    await sendTelegramAlert('Test message', mockLogger);

    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  // FAILURE CASE: API error
  it('should log error if Telegram API call fails', async () => {
    const errorMessage = 'Network error';
    mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

    const alertMessage = 'Test alert message';
    await sendTelegramAlert(alertMessage, mockLogger);

    // Should not throw and should call logger.error
    expect(mockLogger.error).toHaveBeenCalled();
  });

  // Test when no logger is provided
  it('should handle missing logger gracefully', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { ok: true } });

    const message = 'Test alert message';
    await sendTelegramAlert(message);

    expect(mockedAxios.post).toHaveBeenCalled();
  });
});
