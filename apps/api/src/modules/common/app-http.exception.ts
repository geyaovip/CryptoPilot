import { HttpException, HttpStatus } from "@nestjs/common";
import type { ApiErrorCode } from "@cryptopilot/types";

export class AppHttpException extends HttpException {
  constructor(
    public readonly errorCode: ApiErrorCode,
    message: string,
    status: number = HttpStatus.BAD_REQUEST
  ) {
    super(message, status);
  }
}
