---
name: Dependency remediation boundaries
description: Compatibility and scope constraints for security dependency updates.
---

Keep dependency remediation separate from a major Tailwind styling migration.

**Why:** The braces stack-exhaustion advisory had no patched release during the
security review; forcing Tailwind to a new major to remove its dependency chain
would broaden a dependency update into a site-wide styling change.

**How to apply:** Recheck upstream patches first. If a styling migration remains
necessary, scope it separately with visual regression verification rather than
hiding audit findings. Retain CommonJS compatibility when replacing UUID versions
used by storage libraries.
