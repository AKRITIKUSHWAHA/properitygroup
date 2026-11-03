# Production 301 Redirect Architecture & Legacy Matrix

**Practice:** UK Property Surveying Practice  
**Compliance Standard:** RICS Home Survey Standard & Part 9 Master Delivery Specification  
**Status:** Implemented & Verified in Production Server Config (`public/_redirects`)

---

## 1. Executive Summary & Regulatory Rationale
In accordance with Part 9 of the platform specification, commercial construction project management and general real estate brokerage services have been formally retired from this practice. This ensures 100% regulatory focus on independent RICS-aligned residential surveying, defect diagnostics, valuation appraisals, and CPR Part 35 expert witness proceedings.

All legacy incoming web traffic, indexed URLs, external backlinks, and bookmarks are permanently redirected via **HTTP 301 Permanent Redirect** to their corresponding accredited surveying disciplines.

---

## 2. Active 301 Permanent Redirect Matrix

| Decommissioned Route | HTTP Code | Target RICS Service Route | Target Service Title |
| :--- | :--- | :--- | :--- |
| `/construction/*` | `301 Permanent` | `/services/building-survey-level-3` | Level 3 Building Survey |
| `/construction` | `301 Permanent` | `/services/building-survey-level-3` | Level 3 Building Survey |
| `/real-estate/*` | `301 Permanent` | `/services/valuation-report` | RICS Red Book Valuation |
| `/real-estate` | `301 Permanent` | `/services/valuation-report` | RICS Red Book Valuation |

---

## 3. Server Configuration Deployment

### Netlify / Cloudflare Pages (`_redirects`)
```
/construction/*    /services/building-survey-level-3  301!
/construction      /services/building-survey-level-3  301!
/real-estate/*     /services/valuation-report         301!
/real-estate       /services/valuation-report         301!
/*                 /index.html                        200
```

### Nginx Configuration
```nginx
location ^~ /construction {
    return 301 /services/building-survey-level-3;
}

location ^~ /real-estate {
    return 301 /services/valuation-report;
}
```

### Apache `.htaccess`
```apache
RewriteEngine On
RewriteRule ^construction(/.*)?$ /services/building-survey-level-3 [R=301,L]
RewriteRule ^real-estate(/.*)?$ /services/valuation-report [R=301,L]
```

