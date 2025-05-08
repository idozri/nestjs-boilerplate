import { RbacGuard } from '../rbac/rbac.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RbacGuard', () => {
  let guard: RbacGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RbacGuard(reflector);
  });

  it('should allow access if no roles are defined', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    const context = createMockExecutionContext();
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has the required role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const context = createMockExecutionContext({ role: 'admin' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny access if user does not have the required role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const context = createMockExecutionContext({ role: 'user' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  function createMockExecutionContext(user: any = {}) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;
  }
});
