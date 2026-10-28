<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the public device catalog on `/tienda`, separate from the homepage, with provider links and CDN asset pointers; this isolates shopping from clinical workflows without implying a live commerce integration.
- Derive store provider filters from the product catalog so new manufacturers remain discoverable without maintaining a second list.
- Keep the ESP32 access-point monitor on `/dispositivos` as a local-device link, not a cloud proxy or simulated live feed; its HTTP-only firmware cannot provide secure remote telemetry to the published HTTPS app.
- Store medical observations as append-only exam-linked rows with active-sharing RLS and authenticated server functions; this permits feedback without granting doctors clinical edit rights.
- Derive patient dietary guidance locally from real catalog results and their current laboratory references; this avoids recurring AI costs and unsupported treatment claims.

- Keep the editable food catalog in foods, variable_food_rules and places with admin-only writes; support consumes existing result states and cross-result restrictions, never new clinical classification.
- Adapt legacy dashboard readings locally for dietary support when catalog references are missing; only join matching values and units, preserving catalog identity and never copying legacy clinical targets into laboratory references.
