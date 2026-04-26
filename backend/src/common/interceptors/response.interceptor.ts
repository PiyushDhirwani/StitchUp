import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  meta: {
    timestamp: string;
    request_id: string;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: data?.message,
        data: data?.data !== undefined ? data.data : data,
        meta: {
          timestamp: new Date().toISOString(),
          request_id: uuidv4(),
        },
      })),
    );
  }
}
