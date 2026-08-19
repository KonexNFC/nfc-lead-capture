---
name: Post-merge safety
description: Why automatic task-merge setup must not mutate production data or enforce unrelated code checks.
---

Keep automatic post-merge setup limited to synchronizing dependencies from the committed lockfile. Do not run database schema pushes or migrations automatically.

**Why:** This project contains business-critical production data and has experienced a serious data-loss incident. Database changes require explicit review. Existing unrelated type errors can also prevent safe dependency reconciliation if type-checking is made part of the merge hook.

**How to apply:** Run database migrations and code-quality validation as separate, deliberate steps. The automatic merge hook should remain fast, non-interactive, idempotent, and narrowly focused on dependency setup.