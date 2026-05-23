# UI Package Agent Rules

Applies to `packages/ui`.

## Cursor Rules

- `.cursor/rules/frontend.mdc`
- `.cursor/rules/ui.mdc`
- `.cursor/rules/ui-package.mdc`

## MUST

- Store shared UI primitives and reusable components only.
- Use shadcn/ui-compatible patterns.
- Keep components light-theme only.
- Type all props.
- Keep components framework-compatible with Next.js apps.

## FORBIDDEN

- No app-specific business logic.
- No API calls.
- No server data fetching.
- No dark theme variants.
- No duplicated component styles across apps.

