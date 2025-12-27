# Northbeam Backfill-Auto Endpoint - Complete Implementation Guide
## For US Platform Deployment

**Date:** December 27, 2025  
**Source Repo:** rocky-headless (Canadian Platform)  
**Status:** ✅ Production-Ready Blueprint

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Critical Configuration Details](#critical-configuration-details)
6. [Verification Checklist](#verification-checklist)
7. [Testing Procedures](#testing-procedures)
8. [Troubleshooting](#troubleshooting)
9. [Monitoring & Logging](#monitoring--logging)

---

## 🎯 Overview

The `/api/northbeam/backfill-auto` endpoint is an **automated cron-triggered system** that syncs WooCommerce orders to Northbeam for historical attribution tracking.

### Key Features:
- ✅ **Automated hourly cron job** (runs on WP/WC server)
- ✅ **Intelligent deduplication** (prevents double-counting)
- ✅ **Relay plugin detection** (skips already-synced orders)
- ✅ **Retry logic** (up to 3 attempts per order)
- ✅ **Batch processing** (50 orders per batch)
- ✅ **Rich structured JSON logging** (Vercel-compatible)
- ✅ **WooCommerce HPOS Compatible** (production-safe)
- ✅ **Rate limiting safe** (sequential processing)

### What It Does:
1. WP Cron fetches unsynced orders from WooCommerce (last 30 days)
2. Batches orders into groups of 50
3. Sends to Next.js API endpoint via HTTPS
4. API validates, maps, and forwards to Northbeam
5. Updates WC order meta on success/failure
6. Logs everything for debugging

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────┐
│   WordPress/WooCommerce Server     │
│   (Your WP installation)           │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  WP Cron (Every Hour)        │  │
│  │  - Query unsynced orders     │  │
│  │  - Check deduplication flags │  │
│  │  - Create batches (50 each)  │  │
│  └────────────┬─────────────────┘  │
│               │                     │
│               │ POST /api/northbeam/│
│               │      backfill-auto  │
└───────────────┼─────────────────────┘
                │
                │ HTTPS (SSL enforced)
                ▼
┌─────────────────────────────────────┐
│   Next.js API (Vercel/Your Host)   │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  /api/northbeam/backfill-auto│  │
│  │  1. Validate credentials     │  │
│  │  2. Check deduplication      │  │
│  │  3. Map WC → NB format       │  │
│  │  4. Rich logging             │  │
│  └────────────┬─────────────────┘  │
│               │                     │
│               │ POST /api/northbeam/│
│               │      orders         │
│               ▼                     │
│  ┌──────────────────────────────┐  │
│  │  /api/northbeam/orders       │  │
│  │  - Add product category tags │  │
│  │  - Skip follow-up products   │  │
│  │  - Send to Northbeam API     │  │
│  └────────────┬─────────────────┘  │
└────────────────┼────────────────────┘
                 │
                 │ HTTPS
                 ▼
┌─────────────────────────────────────┐
│   Northbeam API                    │
│   https://api.northbeam.io/v2/     │
│   orders                           │
└─────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │  Success?      │
        └────────────────┘
             │      │
        Yes  │      │  No
             ▼      ▼
    ┌──────────┐  ┌──────────┐
    │ Mark     │  │ Increment│
    │ Synced   │  │ Retry    │
    │ in WC    │  │ Counter  │
    └──────────┘  └──────────┘
```

---

## ✅ Prerequisites

### 1. **Next.js API Setup**
- Next.js 13+ with App Router
- Vercel deployment (or any Node.js host)
- Environment variables access

### 2. **WooCommerce Configuration**
- WooCommerce 9.0+ (HPOS compatible)
- REST API enabled
- Consumer Key/Secret with read/write permissions

### 3. **Northbeam Account**
- Active Northbeam account
- API credentials (Client ID + API Key)
- V2 API access

### 4. **WordPress Plugin**
- Custom WP plugin for cron management
- WP Cron enabled (or system cron)

---

## 🔧 Step-by-Step Implementation

### STEP 1: Create the Next.js API Endpoint

#### File: `app/api/northbeam/backfill-auto/route.js`

Copy the complete endpoint from the source repo. Key sections:

**Critical Helper Functions:**
```javascript
// 1. Structured Logging (Vercel-compatible)
const logInfo = (message, data = {}) => {
  console.log(JSON.stringify({
    level: 'info',
    timestamp: new Date().toISOString(),
    message,
    service: 'northbeam-backfill',
    ...data
  }));
};

// 2. Deduplication Check
const checkIfAlreadySynced = (order) => {
  // Check Relay plugin meta (real-time sync)
  const relayMeta = order.meta_data.find(m => m.key === '_nb_last_pushed_total');
  if (relayMeta) {
    return { synced: true, handled_by_relay: true };
  }
  
  // Check backfill meta
  const nbBackfilled = order.meta_data.find(m => m.key === '_northbeam_backfilled');
  if (nbBackfilled?.value === 'yes') {
    return { synced: true, handled_by_relay: false };
  }
  
  return { synced: false };
};

// 3. Mark Order as Synced
const markOrderAsSynced = async (orderId) => {
  const updateData = {
    meta_data: [
      { key: '_northbeam_backfilled', value: 'yes' },
      { key: '_northbeam_backfilled_at', value: new Date().toISOString() },
      { key: '_northbeam_last_backfill_attempt', value: new Date().toISOString() }
    ]
  };
  await wooApi.put(`orders/${orderId}`, updateData);
};

// 4. Map WooCommerce to Northbeam Format
const mapWooToNorthbeamOrder = (order) => {
  // Extract AWIN meta (for US, check your affiliate program)
  const getMetaValue = (key) => {
    return order?.meta_data?.find(m => m.key === key)?.value || '';
  };
  
  // Build order object...
  // (see full implementation in source file)
};
```

**Main POST Handler:**
```javascript
export async function POST(req) {
  const requestId = `backfill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.order_ids) ? body.order_ids : [];
    const forceResync = Boolean(body?.force_resync);
    
    // Validate Northbeam credentials
    const clientId = process.env.NB_CLIENT_ID;
    const apiKey = process.env.NB_API_KEY;
    
    // Process each order
    for (const rawId of ids) {
      // 1. Fetch from WooCommerce
      // 2. Check deduplication
      // 3. Map to Northbeam format
      // 4. Send to /api/northbeam/orders
      // 5. Update WC meta
    }
    
    return NextResponse.json({ success: true, stats: {...} });
  } catch (error) {
    logError('Backfill request failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### STEP 2: Verify Supporting Endpoint

#### File: `app/api/northbeam/orders/route.js`

Ensure you have the `/api/northbeam/orders` endpoint that:
1. Accepts order array
2. Adds product category tags
3. Sends to Northbeam API
4. Returns success/failure status

**Key Configuration:**
```javascript
const clientId = process.env.NB_CLIENT_ID || process.env.NORTHBEAM_CLIENT_ID;
const apiKey = process.env.NB_API_KEY || process.env.NORTHBEAM_AUTH_TOKEN;

const response = await fetch("https://api.northbeam.io/v2/orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Data-Client-ID": clientId,
    Authorization: apiKey,
  },
  body: JSON.stringify(payload),
});
```

**Important:** The endpoint validates and cleans timestamps to prevent future dates (but allows historical dates for backfill).

---

### STEP 3: Configure Environment Variables

Add to your `.env` or Vercel environment:

```bash
# Northbeam API Credentials
NB_CLIENT_ID=your-us-client-id-here
NB_API_KEY=your-us-api-key-here

# Legacy names (optional fallbacks)
NORTHBEAM_CLIENT_ID=your-us-client-id-here
NORTHBEAM_AUTH_TOKEN=your-us-api-key-here

# Site URL (for internal API calls)
NEXT_PUBLIC_SITE_URL=https://your-us-domain.com
BASE_URL=https://your-us-domain.com
SITE_URL=https://your-us-domain.com

# WooCommerce API Credentials
CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxx
CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxx
```

**⚠️ CRITICAL:** Ensure these match your US Northbeam account, not Canadian!

---

### STEP 4: Create WooCommerce API Client

#### File: `lib/woocommerce.js`

Ensure you have a WooCommerce API client configured:

```javascript
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

export const api = new WooCommerceRestApi({
  url: process.env.BASE_URL,
  consumerKey: process.env.CONSUMER_KEY,
  consumerSecret: process.env.CONSUMER_SECRET,
  version: "wc/v3",
  queryStringAuth: true, // Force Basic Auth for HTTPS
});
```

---

### STEP 5: WordPress Cron Plugin

You need a WordPress plugin that:
1. Schedules hourly cron job
2. Queries unsynced orders
3. Creates batches
4. Sends to Next.js API

**Key WP Plugin Functions:**

```php
// Register cron schedule
add_filter('cron_schedules', function($schedules) {
  $schedules['rocky_hourly'] = [
    'interval' => 3600,
    'display' => 'Every Hour'
  ];
  return $schedules;
});

// Schedule cron event
if (!wp_next_scheduled('rocky_northbeam_hourly_sync')) {
  wp_schedule_event(time(), 'rocky_hourly', 'rocky_northbeam_hourly_sync');
}

// Cron callback
add_action('rocky_northbeam_hourly_sync', function() {
  // 1. Query orders with meta_query:
  //    - Missing '_northbeam_backfilled' OR != 'yes'
  //    - Missing '_nb_last_pushed_total' (not handled by Relay)
  //    - Date range: last 30 days
  //    - Status: completed OR processing
  
  // 2. Batch orders (50 per batch)
  
  // 3. Send POST request to:
  //    https://your-domain.com/api/northbeam/backfill-auto
  //    Body: {
  //      order_ids: [123, 456, 789],
  //      batch_id: "cron_timestamp_batch_1",
  //      wp_cron_run: "cron_timestamp"
  //    }
});
```

**WP Query Example:**
```php
$args = [
  'limit' => 50,
  'status' => ['completed', 'processing'],
  'date_created' => '>=' . (time() - 30 * DAY_IN_SECONDS),
  'meta_query' => [
    'relation' => 'AND',
    [
      'relation' => 'OR',
      ['key' => '_northbeam_backfilled', 'compare' => 'NOT EXISTS'],
      ['key' => '_northbeam_backfilled', 'value' => 'yes', 'compare' => '!=']
    ],
    ['key' => '_nb_last_pushed_total', 'compare' => 'NOT EXISTS']
  ]
];

$orders = wc_get_orders($args);
```

---

### STEP 6: Deploy to Vercel

```bash
# 1. Add files to git
git add app/api/northbeam/backfill-auto/route.js
git add app/api/northbeam/orders/route.js
git add lib/woocommerce.js

# 2. Commit
git commit -m "Add Northbeam backfill-auto endpoint"

# 3. Push to trigger Vercel deployment
git push origin main

# 4. Add environment variables in Vercel dashboard:
#    - NB_CLIENT_ID
#    - NB_API_KEY
#    - CONSUMER_KEY
#    - CONSUMER_SECRET
#    - BASE_URL
```

---

## 🔍 Critical Configuration Details

### 1. **Order Meta Keys**

The system uses **distinct meta keys** to avoid conflicts with Northbeam's Relay plugin:

| Meta Key | Purpose | Value |
|----------|---------|-------|
| `_northbeam_backfilled` | Marks order as synced by backfill system | `"yes"` |
| `_northbeam_backfilled_at` | Timestamp of successful sync | ISO 8601 string |
| `_northbeam_backfill_attempts` | Number of retry attempts | Integer string |
| `_northbeam_last_backfill_attempt` | Last attempt timestamp | ISO 8601 string |
| `_nb_last_pushed_total` | ⚠️ **Relay plugin marker** - DO NOT TOUCH | Set by Relay |

**Why Distinct Keys?**
- Relay plugin uses `_nb_last_pushed_total` for real-time sync
- Backfill system uses `_northbeam_backfilled` for historical sync
- This prevents double-counting and sync conflicts

---

### 2. **Deduplication Logic**

The endpoint checks in this order:

```javascript
// 1. Check if Relay already synced it
if (order has '_nb_last_pushed_total' meta) {
  → Skip (handled_by_relay)
}

// 2. Check if backfill already synced it
if (order has '_northbeam_backfilled' === 'yes') {
  → Skip (already_backfilled)
}

// 3. Otherwise, sync it
→ Process order
```

**Override:** Use `force_resync: true` in request body to bypass checks.

---

### 3. **Order Mapping Details**

**Date Hierarchy:**
```javascript
time_of_purchase = 
  order.date_paid_gmt ||
  order.date_created_gmt ||
  order.date_paid ||
  order.date_completed ||
  order.date_created
```

**Customer ID Logic:**
```javascript
if (customer_id > 0) → "wc:123456"
else if (email exists) → "email:user@example.com"
else if (phone exists) → "phone:5551234567"
```

**Order Tags:**
```javascript
[
  "Completed",              // Status tag
  "OTC",                    // Lifecycle tag
  "source:AWIN",           // Affiliate source (if applicable)
  "awin_awc:xxx",          // Affiliate meta (if applicable)
  "item-category-1:ED"     // Product category tags
]
```

---

### 4. **Retry Logic**

Failed orders follow this pattern:

1. **Attempt 1:** Immediate (during cron run)
2. **Attempt 2:** Next cron run (1 hour later)
3. **Attempt 3:** Next cron run (2 hours later)
4. **After 3 failures:** Stop trying (requires manual intervention)

**Implementation:**
- `_northbeam_backfill_attempts` is incremented on each failure
- WP cron plugin checks: `attempts < 3` before retrying

---

### 5. **Currency Configuration**

**Canadian Platform:** Uses `CAD` as default  
**US Platform:** Change to `USD`

Update in `mapWooToNorthbeamOrder`:
```javascript
currency: order?.currency || "USD",  // Change from CAD to USD
```

Update default country code in shipping address:
```javascript
country_code: order.shipping.country === "US" ? "USA" : order.shipping.country || "USA"
```

---

## ✅ Verification Checklist

### Pre-Deployment Checklist

- [ ] **Endpoint created:** `app/api/northbeam/backfill-auto/route.js`
- [ ] **Orders endpoint exists:** `app/api/northbeam/orders/route.js`
- [ ] **WooCommerce client configured:** `lib/woocommerce.js`
- [ ] **Environment variables set:**
  - [ ] `NB_CLIENT_ID` (US Northbeam account)
  - [ ] `NB_API_KEY` (US Northbeam account)
  - [ ] `CONSUMER_KEY` (US WooCommerce)
  - [ ] `CONSUMER_SECRET` (US WooCommerce)
  - [ ] `BASE_URL` (US domain)
- [ ] **Currency changed to USD** (if applicable)
- [ ] **Country codes updated** (US → USA)
- [ ] **Affiliate meta keys adjusted** (AWIN → your affiliate program)
- [ ] **Code deployed to Vercel**
- [ ] **Environment variables synced in Vercel dashboard**

### Post-Deployment Checklist

- [ ] **Test endpoint manually:**
  ```bash
  curl -X POST https://your-domain.com/api/northbeam/backfill-auto \
    -H "Content-Type: application/json" \
    -d '{"order_ids": [12345], "force_resync": true}'
  ```
- [ ] **Check Vercel logs** for structured JSON output
- [ ] **Verify WC order meta** updated with `_northbeam_backfilled`
- [ ] **Check Northbeam dashboard** for order (wait 24-48h)
- [ ] **Install WP cron plugin** on WordPress
- [ ] **Verify cron scheduled:**
  ```bash
  wp cron event list --allow-root
  # Look for: rocky_northbeam_hourly_sync
  ```
- [ ] **Trigger manual cron run:**
  ```bash
  wp cron event run rocky_northbeam_hourly_sync --allow-root
  ```
- [ ] **Monitor first automatic run** (after 1 hour)

---

## 🧪 Testing Procedures

### Test 1: Single Order Manual Sync

```bash
# 1. Find a test order ID from WooCommerce
ORDER_ID=12345

# 2. Send POST request
curl -X POST https://your-domain.com/api/northbeam/backfill-auto \
  -H "Content-Type: application/json" \
  -d '{
    "order_ids": ['"$ORDER_ID"'],
    "force_resync": true,
    "batch_id": "manual_test"
  }'

# Expected Response:
{
  "success": true,
  "request_id": "backfill_1234567890_xyz",
  "batch_id": "manual_test",
  "stats": {
    "total": 1,
    "succeeded": 1,
    "failed": 0,
    "skipped": 0
  },
  "results": [
    {
      "id": "12345",
      "status": "success",
      "synced_at": "2025-12-27T...",
      "duration_ms": 1234
    }
  ]
}
```

**Verify:**
1. Check WC order meta in admin:
   - `_northbeam_backfilled` = "yes"
   - `_northbeam_backfilled_at` = timestamp
2. Check Vercel logs for structured JSON
3. Check Northbeam dashboard (wait 24-48 hours)

---

### Test 2: Batch Processing

```bash
# Send multiple orders
curl -X POST https://your-domain.com/api/northbeam/backfill-auto \
  -H "Content-Type: application/json" \
  -d '{
    "order_ids": [12345, 12346, 12347, 12348, 12349],
    "batch_id": "test_batch_1"
  }'

# Check logs
vercel logs --follow | grep "northbeam-backfill"
```

---

### Test 3: Deduplication

```bash
# 1. Sync an order
curl -X POST https://your-domain.com/api/northbeam/backfill-auto \
  -H "Content-Type: application/json" \
  -d '{"order_ids": [12345]}'

# 2. Try to sync same order again (without force_resync)
curl -X POST https://your-domain.com/api/northbeam/backfill-auto \
  -H "Content-Type: application/json" \
  -d '{"order_ids": [12345]}'

# Expected: Order should be SKIPPED
{
  "results": [
    {
      "id": "12345",
      "status": "skipped",
      "reason": "already_backfilled"
    }
  ]
}
```

---

### Test 4: Relay Plugin Detection

```bash
# If an order was already synced by Relay plugin:
# - It will have '_nb_last_pushed_total' meta
# - Backfill should skip it

# Expected Response:
{
  "results": [
    {
      "id": "12345",
      "status": "skipped",
      "reason": "handled_by_relay",
      "handled_by_relay": true
    }
  ]
}
```

---

### Test 5: Error Handling

```bash
# Send invalid order ID
curl -X POST https://your-domain.com/api/northbeam/backfill-auto \
  -H "Content-Type: application/json" \
  -d '{"order_ids": [999999999]}'

# Expected: Order not found
{
  "results": [
    {
      "id": "999999999",
      "status": "not_found"
    }
  ]
}
```

---

### Test 6: WordPress Cron Trigger

```bash
# SSH into WordPress server
ssh user@your-server

# Trigger manual cron
wp cron event run rocky_northbeam_hourly_sync --allow-root

# Check WP logs
tail -f /var/www/html/wp-content/debug.log | grep "Northbeam"
```

---

## 🐛 Troubleshooting

### Issue 1: Orders Not Syncing

**Symptoms:** Orders remain unsynced after cron runs

**Check:**
1. **Vercel Logs:**
   ```bash
   vercel logs --follow | grep "error"
   ```
2. **WP Debug Log:**
   ```bash
   tail -f wp-content/debug.log
   ```
3. **Order Meta:**
   ```bash
   wp post meta list ORDER_ID --allow-root | grep northbeam
   ```

**Common Causes:**
- Northbeam credentials incorrect
- WooCommerce API credentials invalid
- Orders already have `_nb_last_pushed_total` (handled by Relay)
- Max retry attempts (3) exceeded
- Order status not "completed" or "processing"

**Fix:**
```bash
# 1. Verify credentials
vercel env pull .env
cat .env | grep NB_

# 2. Test WC API manually
curl https://your-domain.com/wp-json/wc/v3/orders/12345 \
  -u "CONSUMER_KEY:CONSUMER_SECRET"

# 3. Force resync specific order
curl -X POST https://your-domain.com/api/northbeam/backfill-auto \
  -H "Content-Type: application/json" \
  -d '{"order_ids": [12345], "force_resync": true}'
```

---

### Issue 2: Duplicate Orders in Northbeam

**Symptoms:** Same order appears multiple times in Northbeam

**Check:**
1. Order meta in WC:
   ```bash
   wp post meta list ORDER_ID --allow-root
   ```
2. Look for:
   - `_northbeam_backfilled` should be "yes"
   - If missing, meta update failed

**Fix:**
1. Manually mark as synced:
   ```bash
   wp post meta update ORDER_ID _northbeam_backfilled yes --allow-root
   wp post meta update ORDER_ID _northbeam_backfilled_at "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" --allow-root
   ```

2. Check WooCommerce REST API permissions:
   - Ensure Consumer Key has `read_write` permissions
   - Test meta update manually via API

---

### Issue 3: Cron Not Running

**Symptoms:** No automatic syncs happening

**Check:**
```bash
# 1. List scheduled crons
wp cron event list --allow-root

# 2. If missing, reactivate plugin
wp plugin deactivate rocky-northbeam-sync --allow-root
wp plugin activate rocky-northbeam-sync --allow-root

# 3. Verify it's scheduled now
wp cron event list --allow-root | grep northbeam
```

**Alternative: System Cron**
If WP Cron is unreliable, use system cron:

```bash
# Edit crontab
crontab -e

# Add hourly job
0 * * * * cd /var/www/html && wp cron event run rocky_northbeam_hourly_sync --allow-root --quiet
```

---

### Issue 4: Vercel Timeout (504)

**Symptoms:** API returns 504 Gateway Timeout

**Cause:** Batch size too large (>50 orders)

**Fix:**
1. **Reduce batch size in WP plugin:**
   ```php
   $this->batch_size = 25; // Reduce from 50 to 25
   ```

2. **Or split large batches:**
   ```php
   // In WP plugin cron callback
   $batches = array_chunk($order_ids, 25);
   foreach ($batches as $batch) {
     // Send request
     // Sleep 10 seconds between batches
     sleep(10);
   }
   ```

---

### Issue 5: Wrong Currency/Country

**Symptoms:** Orders show CAD instead of USD, or CAN instead of USA

**Fix:**
Update in `app/api/northbeam/backfill-auto/route.js`:

```javascript
// Change line ~294
currency: order?.currency || "USD",  // Was: "CAD"

// Change line ~272
country_code: order.shipping.country === "US" 
  ? "USA" 
  : order.shipping.country || "USA"  // Was: "CAN"
```

Redeploy:
```bash
git commit -am "Fix currency and country codes for US"
git push origin main
```

---

## 📊 Monitoring & Logging

### Vercel Logs

**View in Dashboard:**
1. Go to: https://vercel.com/your-team/project
2. Click "Logs" tab
3. Filter by: `service:northbeam-backfill`

**View in CLI:**
```bash
# Real-time logs
vercel logs --follow

# Filter for backfill service
vercel logs --follow | grep "northbeam-backfill"

# Filter for errors only
vercel logs --follow | grep "level:error"

# Search specific request
vercel logs | grep "request_id:backfill_1234567890"
```

---

### Log Structure

All logs are JSON-formatted for easy parsing:

```json
{
  "level": "info",
  "timestamp": "2025-12-27T10:30:00.000Z",
  "message": "Backfill request received",
  "service": "northbeam-backfill",
  "request_id": "backfill_1735296600_xyz123",
  "batch_id": "cron_1735296600_batch_1",
  "wp_cron_run": "cron_1735296600",
  "order_count": 50,
  "force_resync": false
}
```

**Key Log Events:**

| Message | Level | What It Means |
|---------|-------|---------------|
| `Backfill request received` | info | New batch started |
| `Order skipped: handled_by_relay` | info | Order already synced by Relay plugin |
| `Order skipped: already_backfilled` | info | Order already backfilled |
| `Sending order to Northbeam` | info | Order being synced |
| `Order synced successfully` | info | ✅ Success |
| `Northbeam API error` | error | ❌ Northbeam rejected order |
| `Error processing order` | error | ❌ WooCommerce or network error |
| `Backfill batch completed` | info | Batch finished with stats |

---

### Monitoring Queries

**Search for failed orders:**
```bash
vercel logs | grep "level:error" | grep "northbeam-backfill"
```

**Search specific order:**
```bash
vercel logs | grep "order_id:12345"
```

**Get batch summary:**
```bash
vercel logs | grep "Backfill batch completed"
```

**Check sync rate:**
```bash
# Count successful syncs in last hour
vercel logs --since=1h | grep "Order synced successfully" | wc -l
```

---

### Performance Metrics

**Expected Performance:**
- **Average order sync time:** 500-1500ms per order
- **Batch processing time (50 orders):** 30-60 seconds
- **Vercel function timeout:** 60 seconds (Pro), 10 seconds (Hobby)
- **Northbeam API rate limit:** No published limit (anecdotal: 100+ req/min safe)

**If sync is slow:**
1. Check Northbeam API response times
2. Check WooCommerce API response times
3. Consider reducing batch size
4. Check Vercel region (should be same as WC server)

---

## 🎯 Success Criteria

Your implementation is successful when:

- [x] Manual test order syncs successfully
- [x] Order meta is updated in WooCommerce
- [x] Vercel logs show structured JSON output
- [x] Deduplication works (skips already-synced orders)
- [x] Relay plugin orders are skipped
- [x] Retry logic works (failed orders retried up to 3 times)
- [x] WP cron runs hourly automatically
- [x] Orders appear in Northbeam dashboard (24-48h delay)
- [x] No duplicate orders in Northbeam
- [x] Currency and country codes are correct (USD/USA)

---

## 📚 Additional Resources

### Source Files to Review:

1. **`app/api/northbeam/backfill-auto/route.js`** - Main endpoint (597 lines)
2. **`app/api/northbeam/orders/route.js`** - Northbeam API client (425 lines)
3. **`lib/woocommerce.js`** - WooCommerce API client
4. **`docs/northbeam-automated-backfill-system.md`** - Original documentation

### Key Environment Variables:

```bash
# Northbeam
NB_CLIENT_ID=your-client-id
NB_API_KEY=your-api-key

# WooCommerce
CONSUMER_KEY=ck_xxxxx
CONSUMER_SECRET=cs_xxxxx
BASE_URL=https://your-domain.com

# Site URLs (for internal API calls)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### WooCommerce Order Meta Keys:

| Key | Purpose |
|-----|---------|
| `_northbeam_backfilled` | Backfill sync flag |
| `_northbeam_backfilled_at` | Backfill timestamp |
| `_northbeam_backfill_attempts` | Retry counter |
| `_northbeam_last_backfill_attempt` | Last attempt timestamp |
| `_nb_last_pushed_total` | ⚠️ Relay plugin flag (don't modify) |

---

## 🚀 Quick Start Summary

**For a new US platform implementation:**

1. **Copy 3 files:**
   - `app/api/northbeam/backfill-auto/route.js`
   - `app/api/northbeam/orders/route.js`
   - `lib/woocommerce.js`

2. **Update for US:**
   - Change `CAD` → `USD`
   - Change `CAN` → `USA`
   - Update Northbeam credentials (US account)
   - Update WooCommerce credentials (US store)

3. **Deploy:**
   ```bash
   git add .
   git commit -m "Add Northbeam backfill system"
   git push origin main
   ```

4. **Configure Vercel:**
   - Add environment variables
   - Test endpoint manually

5. **Install WP Plugin:**
   - Upload custom plugin
   - Activate plugin
   - Verify cron scheduled

6. **Monitor:**
   - Check Vercel logs
   - Wait for first automatic run
   - Verify orders sync successfully

---

## ⚠️ Critical Warnings

1. **DO NOT** modify `_nb_last_pushed_total` meta - it's owned by Relay plugin
2. **DO NOT** backfill orders already handled by Relay (unless using `force_resync`)
3. **DO NOT** exceed batch size of 50 orders (Vercel timeout risk)
4. **DO NOT** run multiple cron jobs simultaneously (race conditions)
5. **DO** use distinct meta keys to avoid confusion with Relay
6. **DO** validate Northbeam credentials before deploying
7. **DO** test with a single order before batch processing
8. **DO** monitor logs for first 24 hours after deployment

---

**End of Implementation Guide**

For questions or issues, refer to:
- Source repo: `rocky-headless`
- Original documentation: `docs/northbeam-automated-backfill-system.md`
- Vercel logs: `vercel logs --follow | grep "northbeam-backfill"`

