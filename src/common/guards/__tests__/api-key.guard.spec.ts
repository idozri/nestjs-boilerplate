import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from '../api-key.guard';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let configService: ConfigService;

  // Mock data
  const serverApiKey = 'test-api-key-123';

  // Mock execution context
  const mockExecutionContext = (apiKey?: string) => {
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: apiKey ? { 'x-api-key': apiKey } : {},
        }),
      }),
    } as unknown as ExecutionContext;
    return mockContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyGuard,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(serverApiKey),
          },
        },
      ],
    }).compile();

    guard = module.get<ApiKeyGuard>(ApiKeyGuard);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  // SUCCESS CASE
  it('should return true when valid API key is provided', () => {
    const context = mockExecutionContext(serverApiKey);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
    expect(configService.get).toHaveBeenCalledWith('SERVER_API_KEY');
  });

  // FAILURE CASE 1: Missing API key
  it('should throw UnauthorizedException when API key is missing', () => {
    const context = mockExecutionContext();

    expect(() => {
      guard.canActivate(context);
    }).toThrow(UnauthorizedException);
    expect(() => {
      guard.canActivate(context);
    }).toThrow('API Key is missing');
  });

  // FAILURE CASE 2: Invalid API key
  it('should throw UnauthorizedException when invalid API key is provided', () => {
    const context = mockExecutionContext('invalid-api-key');

    expect(() => {
      guard.canActivate(context);
    }).toThrow(UnauthorizedException);
    expect(() => {
      guard.canActivate(context);
    }).toThrow('Invalid API Key');
  });

  // EDGE CASE: Empty API key
  it('should throw UnauthorizedException when API key is empty string', () => {
    const context = mockExecutionContext('');

    expect(() => {
      guard.canActivate(context);
    }).toThrow(UnauthorizedException);
    expect(() => {
      guard.canActivate(context);
    }).toThrow('API Key is missing');
  });
});
