import * as crypto from 'crypto';

export function generateHmacSignature(secret: string, payload: string, timestamp: string): string {
  const data = `${timestamp}.${payload}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}