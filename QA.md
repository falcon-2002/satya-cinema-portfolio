# Verification — 7 November 2026

## Automated checks

`npm run check` validates JavaScript syntax, unique HTML/project IDs, local HTML/CSS/configuration asset paths, configured public link schemes, README/documentation links, and the static Netlify output settings. No production compilation is required: `dist/` is the source and deployable output.

## Browser checks

Chromium checks at 320, 390, 768, 1366, and 1920 px viewport widths cover:

- Hero/portrait layout, no document overflow, long card titles, all content rows and dialogs.
- Search, combined category filters, empty results, and saved projects across reloads.
- Keyboard rail navigation, visible focus, modal focus containment/restoration, nested resume dialogs, and mobile navigation.
- Optional profiles, immediate opening skip, replay, contact route, session persistence, and reduced-motion bypass.
- Email/social links, public repository links, and non-clickable localhost information.
- Resume downloads compared byte-for-byte with the supplied PDF at each viewport. Desktop native PDF viewing and mobile new-tab opening were also verified during the portrait integration.

Fresh desktop, project-row, and mobile screenshots are in [docs/screenshots](docs/screenshots). The browser checks use the current configured role and preserve local content edits.

## Repository and assets

- Original portrait PNG and resume PDF hashes still match the supplied files.
- Required MIT copyright and attribution notices are retained. Reference-owner names occur only in the legitimate attribution document; no reference person's photo, resume, biography, contact details, projects, or achievements were copied into site content.
- Local artifacts, logs, archives, credentials, environment files, and dependency folders are excluded from Git.
- Netlify uses an empty build command and publishes `dist`; no framework, functions, or environment variables are required.
- GitHub Pages deployment is manual. The push workflow only runs checks.

## Limits

Viewport emulation is not physical-device testing. Firefox, Safari, actual touch gestures, and screen readers were not tested. The browser's PDF viewer and download behavior can vary by device, so direct open/download links are provided. Mailto links were checked without sending email. External certificate and social destinations were not authenticated or independently validated. The public portfolio URL is https://satya-prakash-mohapatra.netlify.app/.

See [Content notes](docs/CONTENT_NOTES.md) for missing details and supplied factual discrepancies.
