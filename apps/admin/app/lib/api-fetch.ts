import { redirect } from "next/navigation";

export const API_UNAVAILABLE =
  "无法连接 API，请先启动后端：pnpm --filter @cryptopilot/api dev（默认端口 3002）";

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw new Error(API_UNAVAILABLE);
  }

  if (response.status === 401 || response.status === 403) {
    if (typeof window !== "undefined") {
      window.location.assign("/admin/login");
      return response;
    }
    redirect("/admin/login");
  }

  return response;
}
