# Dependency security review — 2026-10-13

Updated direct dependencies and constrained vulnerable transitive packages in
package.json and the lockfile. No database migration or data recovery operation
was performed.

## Remaining finding

GHSA-vfj7-8cjw-p6xm affects braces through its latest published release, 3.0.3.
The audit reports seven high-severity package entries for this single root
advisory: braces, chokidar, micromatch, fast-glob, tailwindcss,
@tailwindcss/typography and tailwindcss-animate.

There is no published braces fix available at the time of this review. Do not
treat this task as a zero-vulnerability result. A Tailwind major-version migration
would require separate review and visual regression testing; a forced upgrade
or advisory suppression is not a safe substitute for fixing the dependency.
Avoid processing untrusted glob patterns through this toolchain.

## Verification

- npm audit: 0 critical, 7 high, 0 moderate, 0 low (previously 32 package entries).
  Audit package counts differ from the original 85 advisory/version findings.
- npm run build: passes.
- Development server and homepage browser smoke check: pass.
- Storage client construction, UUID generation/validation and CSS selector
  parsing smoke checks: pass without network writes.
- npm run check: fails on app type errors including shared InsertUser import,
  qrcode types, auth callback types, nullable route values and storage return
  types. These were not changed as part of dependency remediation.

## Override compatibility

The UUID override stays on 11.1.1 to retain CommonJS support for existing storage
dependencies. Selector parser 7 is used for patched parsing; the production CSS
build and a selector smoke test pass. Keep these compatibility checks when
changing the overrides.
