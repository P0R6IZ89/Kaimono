---
description: Sorts and validates locale JSON files under locales/
model: opencode/big-pickle
mode: subagent
permission:
  edit: allow
  bash: allow
tools:
  read: true
  glob: true
  edit: true
  bash: true
---

## Responsibilities

- Find all `locales/*.json` files
- Deep-alphabetically sort every nested namespace and key
- Preserve all translation values (including ICU placeholders)
- Validate JSON syntax and formatting via Prettier/ESLint

## Workflow

1. **Discover files**  
   Use `glob` to list `locales/*.json`.
2. **Sort & write**  
   For each file:
   - Use `read` to parse the JSON.
   - Recursively sort keys at every level.
   - Serialize with 2-space indent and trailing newline.
   - Use `edit` to overwrite the file with sorted JSON.
3. **Lint validation**  
   Use `bash` to run `npm run lint -- --fix --no-error-on-unmatched-pattern locales/*.json` to check and fix formatting.
4. **Report results**  
   Summarize which files were changed and any parse or lint errors.

## Guidelines

- Do not alter any translation text.
- Maintain Prettier defaults (2-space indent, LF endings).
- Fail fast on JSON parse errors, reporting file and error.
