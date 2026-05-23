import { createRequestId } from "@cryptopilot/shared";
import type { ApiSuccess } from "@cryptopilot/types";

export function ok<T>(data: T): ApiSuccess<T> {
  return {
    data,
    request_id: createRequestId()
  };
}
