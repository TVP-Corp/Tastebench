---
name: external-web-quality
description: "WHEN you work on page load speed, bundle size, Core Web Vitals, SEO metadata or an HTML quality audit of the Tastebench site."
---

# Web quality for Tastebench

Tastebench is a static Vite build on GitHub Pages. The entry is `index.html`; the bundle goes to `dist/assets/`. Firebase is the largest chunk, and the build warns about chunk size.

Use the `external-web-quality` bucket for the detail, and read only the child that fits the task:

- `best-practices`: general web-quality rules.
- `core-web-vitals`: LCP, INP and CLS. The rating screen must not shift layout when the score picker updates.
- `performance`: bundle size and loading. A code split of `firebase/firestore` is the main lever.
- `seo`: title and meta tags in `index.html`. The app is a private event tool, so SEO is low priority.
- `web-quality-audit`: an automated HTML audit. Run it against `pnpm build` then `pnpm preview`.

Check a change on a phone-sized viewport (390x844) and with the network throttled. Players use phones on venue Wi-Fi.

## Hard rules

- **WEBQ-CDN-INTEGRITY**: Do not load a third-party CDN script or stylesheet without Subresource Integrity, and never load polyfills from a third-party CDN you do not control. Instead, self-host the file through the Vite build, or pin it with an `integrity` hash.
  decision: keep
  Known debt: none found at onboarding.

> Before you write code that breaks a hard rule, stop. Tell the user the rule
> id, the rule, and the good alternative, and wait for an answer. Do not stop
> when a suppression row loaded at session start covers the rule for this
> path, or when the user told you in this session to keep the pattern.
>
> A hard rule wins over any deferral to repo precedent in this skill, its
> references, or the vendored material, such as "only if the project already uses it". A
> suppression row applies only when its Scope glob matches the path that you
> write. Otherwise, the warning fires.
>
> Add a row to `.claude/AGENT_SUPPRESS_WARNINGS.md` only when the
> user explicitly suppresses a warning. Use this format, and create the file
> with its header when it does not exist:
> `| Rule | Skill | Scope | Reason | Date | By |`
> A new row applies only after its PR merges to the default branch. Until
> then, the exception for a user who told you to keep the pattern covers it.

_Source: external-web-quality (repo-onboarder 6.0.0)._
