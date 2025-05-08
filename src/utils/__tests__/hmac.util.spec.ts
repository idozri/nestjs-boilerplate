import { generateHmacSignature } from '../hmac.util';
import * as crypto from 'crypto';

describe('HMAC Utils', () => {
  // Use spyOn instead of direct assignment
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the crypto.createHmac function
    const mockDigest = jest.fn().mockReturnValue('mocked-hmac-signature');
    const mockUpdate = jest.fn().mockReturnValue({ digest: mockDigest });
    jest.spyOn(crypto, 'createHmac').mockImplementation(() => {
      return { update: mockUpdate } as any;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate HMAC signature correctly', () => {
    // Arrange
    const secret = 'test-secret';
    const payload = '{"data":"test"}';
    const timestamp = '1620000000';

    // Act
    const result = generateHmacSignature(secret, payload, timestamp);

    // Assert
    expect(result).toBe('mocked-hmac-signature');
    expect(crypto.createHmac).toHaveBeenCalledWith('sha256', secret);
  });

  // Test with real crypto
  it('should generate consistent signature with real crypto', () => {
    // Restore original implementation for this test
    jest.restoreAllMocks();

    // Arrange
    const secret = 'test-secret';
    const payload = '{"data":"test"}';
    const timestamp = '1620000000';

    // Act
    const result = generateHmacSignature(secret, payload, timestamp);

    // Assert
    expect(result).toMatch(/^[0-9a-f]{64}$/); // sha256 hex output is 64 chars

    // Generate again and verify consistency
    const result2 = generateHmacSignature(secret, payload, timestamp);
    expect(result).toEqual(result2);
  });
});
