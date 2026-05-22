# Contributing

## Prerequisites

- **Node.js** >= 24 (see `engines` in root `package.json`)
The pre-commit hook runs automatically via `nano-staged`. It:

- Lints and formats staged JS/TS files (`oxlint --fix` + `oxfmt`)
- Typechecks all workspaces when any `.ts` files are staged (`tsc --noEmit` across web, api, anchor)
- Checks `.rs` files with `cargo fmt --check` + `cargo clippy`

To skip the hook temporarily:

```bash
git commit --no-verify
```

To keep conflicts low and history clean, follow this flow for every change:

```
main (local) ──► branch ──► commits ──► pull main ──► push ──► PR ──► merge ──► pull main
```

## Step by step

### 1. Pull latest main

Start by making sure your local `main` is up to date with the remote.

```bash
git checkout main
git pull --rebase origin main
```

### 2. Create a branch off main

Branch name should describe the work — `feat/`, `fix/`, `docs/` prefixes preferred.

```bash
git checkout -b feat/my-change
```

### 3. Commit on your branch

Make your changes and commit with a clear message.

```bash
git add <files>
git commit -m "feat: add my change"
```

### 4. Pull main again (assurance)

Before pushing, pull the latest `main` into your branch to catch any conflicts early. This keeps the merge trivial.

```bash
git pull --rebase origin main
```

Resolve any conflicts if they appear, then commit the merge.

### 5. Push branch

```bash
git push origin feat/my-change
```

### 6. Open a Pull Request

Open a PR against `main`. Draft PRs are fine for early feedback.

### 7. Merge

After review and CI passes, merge into `main` (squash or rebase as preferred).

### 8. Pull main locally

Update your local `main` after the merge.

```bash
git checkout main
git pull --rebase origin main
```

Then repeat from step 1 for the next change.
