import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable
} from "@nestjs/common";
import { createRequestId } from "@cryptopilot/shared";
import type { ApiErrorCode } from "@cryptopilot/types";
import type { Request, Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { AppHttpException } from "./app-http.exception";

type ErrorBody = {
  code: ApiErrorCode;
  message: string;
  request_id: string;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly prisma: PrismaService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ErrorBody = {
      code: exception instanceof AppHttpException ? exception.errorCode : this.codeFor(exception, status),
      message: this.messageFor(exception),
      request_id: createRequestId()
    };

    if (status >= 400) {
      void this.prisma.apiErrorLog
        .create({
          data: {
            method: request.method,
            path: request.url.slice(0, 512),
            statusCode: status,
            errorCode: body.code,
            message: body.message.slice(0, 2000),
            requestId: body.request_id
          }
        })
        .catch(() => undefined);
    }

    if (status >= 500) {
      console.error("API error", {
        request_id: body.request_id,
        method: request.method,
        path: request.url,
        status_code: status,
        error_code: body.code
      });
    }

    response.status(status).json(body);
  }

  private codeFor(exception: unknown, status: number): ApiErrorCode {
    if (exception instanceof AppHttpException && exception.errorCode === "RATE_LIMITED") {
      return "RATE_LIMITED";
    }
    if (status === HttpStatus.UNAUTHORIZED) return "AUTH_REQUIRED";
    if (status === HttpStatus.FORBIDDEN) return "ADMIN_REQUIRED";
    if (status === HttpStatus.BAD_REQUEST) return "VALIDATION_ERROR";
    if (status === HttpStatus.NOT_FOUND) return "NOT_FOUND";
    if (status === HttpStatus.CONFLICT) return "CONFLICT";
    if (status === HttpStatus.TOO_MANY_REQUESTS) return "RATE_LIMITED";
    return "INTERNAL_ERROR";
  }

  private messageFor(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.message;
    }
    return "服务器内部错误";
  }
}
