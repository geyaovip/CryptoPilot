"use client";

import { create } from "zustand";
import type { BookmarkListItem } from "@cryptopilot/types";
import { getBookmarks } from "./api";

type BookmarkState = {
  items: BookmarkListItem[];
  ids: Set<string>;
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  isSaved: (id: string) => boolean;
  markSaved: (id: string) => void;
  markRemoved: (id: string) => void;
};

export const useBookmarkStore = create<BookmarkState>()((set, get) => ({
  items: [],
  ids: new Set(),
  loaded: false,
  loading: false,
  async load() {
    if (get().loading || get().loaded) return;
    set({ loading: true });
    try {
      const data = await getBookmarks();
      const ids = new Set(data.items.map(({ item }) => item.id));
      set({ items: data.items, ids, loaded: true, loading: false });
    } catch {
      set({ loaded: true, loading: false });
    }
  },
  isSaved(id) {
    return get().ids.has(id);
  },
  markSaved(id) {
    const ids = new Set(get().ids);
    ids.add(id);
    set({ ids });
  },
  markRemoved(id) {
    const ids = new Set(get().ids);
    ids.delete(id);
    set({
      ids,
      items: get().items.filter(({ item }) => item.id !== id)
    });
  }
}));
