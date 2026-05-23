# Admin App Agent Rules

Applies to `apps/admin`.

## Cursor Rules

- `.cursor/rules/frontend.mdc`
- `.cursor/rules/ui.mdc`
- `.cursor/rules/admin-app.mdc`
- `.cursor/rules/security.mdc`

## MUST

- Build internal Admin CMS only.
- Require admin role for all pages.
- Use table-first dashboard layouts.
- Include Loading, Empty, Error, and Retry states.
- Confirm destructive actions.
- Show success/failure feedback.

## MVP Routes

- `/admin`
- `/admin/login`
- `/admin/dashboard`
- `/admin/feed`
- `/admin/narratives`
- `/admin/prompts`
- `/admin/push`
- `/admin/sources`
- `/admin/users`
- `/admin/ai-monitor`
- `/admin/config`
- `/admin/logs`

## FORBIDDEN

- No public user-facing product screens here.
- No dark theme.
- No admin write action without audit requirement.
- No direct imports from `apps/web`.

