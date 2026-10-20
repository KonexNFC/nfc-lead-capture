---
name: PayPal hosted-field constraints
description: SDK styling and safe checkout verification
---
PayPal CardFields accepts only an allowlist of input styles; background-color was ignored by the SDK during browser verification.

**Why:** Host-page CSS cannot style cross-origin input internals. Treat the host container and SDK input as separate layout layers instead of compensating with extra outer padding.

**How to apply:** Check browser SDK warnings when changing field styles. Keep the secure hosted fields; never replace them with locally collected card data. Layout checks do not prove payment capture works, and end-to-end verification must use sandbox payments.
