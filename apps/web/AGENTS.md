# Web App Agent Rules

Applies to `apps/web`.

## Cursor Rules

- `.cursor/rules/frontend.mdc`
- `.cursor/rules/ui.mdc`
- `.cursor/rules/web-app.mdc`
- `.cursor/rules/security.mdc` when touching auth or user settings.

## MUST

- Build user-facing PWA only.
- Use Next.js App Router.
- Use light theme only.
- Use Mobile-first layout.
- Use Bottom Navigation on mobile with only Home, Search, Watchlist, Me.
- Use TanStack Query for server data.
- Use Zustand only for transient UI state.
- Use types from `/packages/types`.

## MVP Routes

- `/`
- `/home`
- `/feed/[id]`
- `/search`
- `/narratives`
- `/narratives/[slug]`
- `/watchlist`
- `/me`
- `/login`
- `/settings/notifications`

## FORBIDDEN

- No admin-only UI in web app.
- No dark theme.
- No Narrative bottom tab.
- No direct imports from `apps/admin`.
- No duplicate API DTOs.

