# AI Agent Guide

Serverless API on Vercel that aggregates health workforce news via RSS feeds.
Used by 新聞鼠 (news agent) for daily briefings.

## Stack

- **Runtime:** Vercel serverless functions (Node.js/TypeScript)
- **Data:** RSS feeds parsed at request time (no database)
- **Deploy:** Auto-deploy on push to `main`

## Key Files

| Path | Purpose |
|------|---------|
| `api/health-workforce/v1/digest.ts` | Main API endpoint |
| `api/health-workforce/v1/feeds.json` | RSS feed definitions with tiers and categories |
| `package.json` | Dependencies |
| `vercel.json` | Vercel routing config |

## API

```
GET /api/health-workforce/v1/digest?tiers=1,2&category=nursing
```

Categories: `nursing`, `chw`, `rural`, `medicaid`, `workforce-policy`, `education`, `international`, `general`

## How to Update

1. **Add/remove feeds:** Edit `api/health-workforce/v1/feeds.json`
2. **Change logic:** Edit `api/health-workforce/v1/digest.ts`
3. Push to `main` → auto-deploys to Vercel
4. Test: `curl https://health-workforce-monitor.vercel.app/api/health-workforce/v1/digest`
