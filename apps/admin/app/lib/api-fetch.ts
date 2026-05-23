export const API_UNAVAILABLE =
  "无法连接 API，请先启动后端：pnpm --filter @cryptopilot/api dev（默认端口 3002）";

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new Error(API_UNAVAILABLE);
  }
}
