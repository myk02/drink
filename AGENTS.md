# AGENTS.md — drink

This file is generated and refreshed automatically by repo-guardian.
It tells any AI coding agent (or you) how changes in this folder get
committed and deployed. It intentionally contains NO real secret values —
only variable names. Real values live in a local, gitignored
`credentials.json` on this machine, outside any git repo.

## Deploy targets for this project

- **GitHub repo:** `myk02/drink`
- **Vercel account(s) available:** Full, Full2

## Environment variables this project references

- `NEXT_PUBLIC_CONVEX_URL`

Real values for the above are stored in `credentials.json` on the developer's
machine (not in this repo). Do not hardcode secret values into source files
or commit a `.env` file with real values — commit only `.env.example` with
variable names and placeholder values.

## Commit & deploy procedure

1. Make your changes normally in this folder.
2. repo-guardian detects the change automatically (or run it manually) and:
   - Stages and commits on a `repo-guardian/<date>` branch (AI-drafted commit message via OpenCode) and opens a Pull Request — review and merge it yourself.
3. Pushing to GitHub triggers Vercel's own auto-deploy (if this project is linked to Vercel via Git integration) — no manual action needed on vercel.com.

## Manual commands (if you want to do a step yourself)

```bash
git add -A
git commit -m "your message"
git push
```
