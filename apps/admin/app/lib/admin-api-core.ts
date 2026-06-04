import { apiFetch } from "./api-fetch";
import { adminHeaders } from "./admin-headers";
import { getApiUrl } from "./api-url";

export const apiUrl = getApiUrl();

export type AdminPaginationFilters = {
  page?: string;
  limit?: string;
};

export type AdminListData<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
};

export function toQuery(filters: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function adminApiFetch(path: string, init: RequestInit = {}) {
  return apiFetch(`${apiUrl}${path}`, {
    ...init,
    headers: { ...(await adminHeaders()), ...(init.headers ?? {}) }
  });
}
