import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { id?: string }>();

    const requestIdHeader = request.headers['x-request-id'];

    const requestId =
      typeof requestIdHeader === 'string'
        ? requestIdHeader
        : Array.isArray(requestIdHeader)
          ? requestIdHeader[0]
          : undefined;

    request.id = requestId || uuidv4();

    request.headers['x-request-id'] = request.id;

    return next.handle();
  }
}
