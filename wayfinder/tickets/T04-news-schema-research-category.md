# T04 — Confirm the news engine supports a Research category

Type: wayfinder:research (AFK)
Status: open
Assignee:
Blocked-by:

## Question

The spec (§4) reuses the news/posts engine for Research posts and says "confirm the news schema has a category/tag or add one small field". Inspect `lib/events.ts`, the news table migration, admin `NewsForm.tsx`, and the news list/detail pages: does a category/tag field exist? If not, specify the minimal addition (column, admin form field, list-page filter) as a short markdown asset linked here.
