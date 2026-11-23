---
name: designing-accessible-uis
description: "WHEN you change user-facing controls, labels, dialogs, focus, keyboard behavior or feedback messages in Tastebench."
---

# Designing accessible UIs in Tastebench

The app runs on phones in a room full of people, often one-handed. Accessible semantics also drive every test query.

## Rules

1. Use native semantics or react-aria-components before raw ARIA (see `react-aria-components`).
2. Keep labels, headings and button names aligned with what the user does ("Close room and show results", not "Submit").
3. Keep ARIA in sync with state: `aria-current="step"` on the current progress segment; `isSelected` on the Skip toggle.
4. Every interactive control must work with a keyboard. react-aria handles this; a `div` with `onClick` does not.

## Interaction

- Dialogs and sheets move focus in and back out (react-aria `Modal` does this). Destructive flows (leave, remove, discard, lock) confirm in `ConfirmDialog` with a clear consequence in the body.
- Show visible states for loading ("Loading..."), disabled (`data-[disabled]:opacity-40`), error ("Could not load this room" with "Try again") and success ("Copied").
- Show validation next to the field with `FieldError` (`Landing.tsx` room code).
- Touch targets stay at least 44 px (`min-h-11`).
- Mark decorative emoji with `aria-hidden` and give the button an `aria-label` (`👥` → "Participants").
- For WCAG detail, use the `external-accessibility` bucket that this skill absorbs.

## Hard rules

- **A11Y-KEYBOARD**: Do not ship an interactive control that a keyboard cannot reach or operate. Instead, use a native control or a react-aria-components control (`Button`, `ToggleButton`, `TextField`), or add focusability and key handlers that match its role.
  decision: keep
  Known debt: none found at onboarding.

- **A11Y-ACCESSIBLE-NAME**: Do not ship a form field, button, or icon control without an accessible name. Instead, give it a visible label (`Label` inside `TextField`), or `aria-label` when no visible text exists, as the icon buttons in `Results.tsx` and `Rate.tsx` do.
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

_Source: designing-accessible-uis (repo-onboarder 6.0.0)._
