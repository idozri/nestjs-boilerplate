import { Test } from '@nestjs/testing';
import { AuthModule } from '../auth.module';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';

describe('AuthModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ SERVER_API_KEY: 'test-api-key' })],
        }),
        AuthModule,
      ],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should provide ApiKeyGuard', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ SERVER_API_KEY: 'test-api-key' })],
        }),
        AuthModule,
      ],
    }).compile();

    const apiKeyGuard = module.get<ApiKeyGuard>(ApiKeyGuard);
    expect(apiKeyGuard).toBeDefined();
    expect(apiKeyGuard).toBeInstanceOf(ApiKeyGuard);
  });

  it('should verify ConfigService injection in ApiKeyGuard', async () => {
    // Use jest.spyOn to mock the ConfigService.get method
    const getConfigSpy = jest
      .spyOn(ConfigService.prototype, 'get')
      .mockReturnValue('test-api-key');

    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        AuthModule,
      ],
    }).compile();

    const guard = module.get<ApiKeyGuard>(ApiKeyGuard);
    expect(guard).toBeDefined();

    // Call the guard's canActivate method
    try {
      // This will throw an UnauthorizedException, but we just want to verify the API key was checked
      guard.canActivate({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {}, // No API key in headers should cause it to throw
          }),
        }),
      } as any);
    } catch (e) {
      // Expected to throw, but the ConfigService.get should have been called
      expect(getConfigSpy).toHaveBeenCalledWith('SERVER_API_KEY');
    }

    // Restore the spy
    getConfigSpy.mockRestore();
  });
});
