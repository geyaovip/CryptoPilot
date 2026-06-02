const localApiUrl = "http://localhost:3002";
const productionApiUrl = "https://api.cryptopilot.chat";

export function getApiUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL;
  if (configured) return configured;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return localApiUrl;
    return productionApiUrl;
  }

  return productionApiUrl;
}
