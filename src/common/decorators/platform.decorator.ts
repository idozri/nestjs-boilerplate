import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Platform = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.headers['x-platform-key'];
});