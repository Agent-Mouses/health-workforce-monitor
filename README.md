# Health Workforce Monitor

> **AI Agent?** Read **[AI-GUIDE.md](AI-GUIDE.md)** for project orientation and operations.

Health workforce news intelligence API — RSS aggregation with keyword classification.

Tracks nursing workforce, community health workers, rural health, Medicaid policy, workforce pipeline, and international recruitment news.

## API

```
GET /api/health-workforce/v1/digest
  ?tiers=1,2        # Feed tiers (1=core, 2=important, 3=supplementary)
  &category=nursing  # Filter by category
```

**Categories:** `nursing`, `chw`, `rural`, `medicaid`, `workforce-policy`, `education`, `international`, `general`

**Threat levels:** `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`

## Feeds

45 RSS feeds across 3 tiers:
- **Tier 1 (9):** Health Affairs, KFF, HRSA, CMS, Modern Healthcare, Fierce Healthcare, Becker's, STAT, AHA
- **Tier 2 (18):** NCSBN, NACHW, NRHA, MACPAC, NASHP, Commonwealth Fund, AAMC, AACN, WHO, ICN, etc.
- **Tier 3 (18):** Google News proxies for specific topics (nurse staffing, NLC, CHW Medicaid, rural hospital closure, etc.)

## Deploy

Push to GitHub → Vercel auto-deploys.

## License

AGPL-3.0
