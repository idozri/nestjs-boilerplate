import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    const serverApiKey = this.configService.get<string>('SERVER_API_KEY');

    if (!apiKey) {
      this.logger.warn('Missing API Key header');
      throw new UnauthorizedException('API Key is missing');
    }

    if (apiKey !== serverApiKey) {
      this.logger.warn('Invalid API Key provided');
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
