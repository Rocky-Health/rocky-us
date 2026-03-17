# Northbeam Backfill-Auto - Quick Implementation Checklist
 
## 🎯 Pre-Implementation
 
- [ ] Review full implementation guide: `NORTHBEAM_BACKFILL_AUTO_IMPLEMENTATION_GUIDE.md`
- [ ] Have Northbeam US credentials ready (Client ID + API Key)
- [ ] Have WooCommerce US credentials ready (Consumer Key + Secret)
- [ ] Confirm WooCommerce REST API is enabled
- [ ] Confirm WooCommerce version is 9.0+ (HPOS compatible)

---

## 📁 Files to Copy/Create

### From Canadian Repo → US Repo

- [ ] Copy: `app/api/northbeam/backfill-auto/route.js` (597 lines)
- [ ] Verify exists: `app/api/northbeam/orders/route.js` (425 lines)
- [ ] Verify exists: `lib/woocommerce.js`

### Modifications Required

- [ ] **Currency:** Change `CAD` to `USD` in `mapWooToNorthbeamOrder` (~line 294)
- [ ] **Country:** Change `CAN` to `USA` in shipping address mapping (~line 272)
- [ ] **Affiliate Meta:** Update AWIN keys if using different affiliate program (~line 206-207)

---

## 🔑 Environment Variables

### Add to Vercel Dashboard

- [ ] `NB_CLIENT_ID` = `[US Northbeam Client ID]`
- [ ] `NB_API_KEY` = `[US Northbeam API Key]`
- [ ] `CONSUMER_KEY` = `[US WooCommerce Consumer Key]`
- [ ] `CONSUMER_SECRET` = `[US WooCommerce Consumer Secret]`
- [ ] `BASE_URL` = `[US Site URL]`
- [ ] `NEXT_PUBLIC_SITE_URL` = `[US Site URL]`

### Optional Legacy Fallbacks

- [ ] `NORTHBEAM_CLIENT_ID` (optional, same as NB_CLIENT_ID)
- [ ] `NORTHBEAM_AUTH_TOKEN` (optional, same as NB_API_KEY)

---

## 🚀 Deployment

- [ ] Commit changes to git
- [ ] Push to trigger Vercel deployment
- [ ] Wait for deployment to complete
- [ ] Verify deployment URL is accessible

---

## 🧪 Testing (Critical)

### Test 1: Manual Single Order Sync

```bash
curl -X POST https://[YOUR-US-DOMAIN]/api/northbeam/backfill-auto \
  -H "Content-Type: application/json" \
  -d '{"order_ids": [YOUR_TEST_ORDER_ID], "force_resync": true}'
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "total": 1,
    "succeeded": 1,
    "failed": 0,
    "skipped": 0
  }
}
```

- [ ] Response status is 200 OK
- [ ] `succeeded: 1` in response
- [ ] No errors in Vercel logs

### Test 2: Verify WooCommerce Order Meta

In WP Admin or WP CLI:
```bash
wp post meta list [ORDER_ID] --allow-root | grep northbeam
```

**Expected Meta Keys:**
- [ ] `_northbeam_backfilled` = `yes`
- [ ] `_northbeam_backfilled_at` = [ISO timestamp]
- [ ] `_northbeam_last_backfill_attempt` = [ISO timestamp]

### Test 3: Check Vercel Logs

```bash
vercel logs --follow | grep "northbeam-backfill"
```

**Expected Log Events:**
- [ ] `Backfill request received`
- [ ] `Fetching order from WooCommerce`
- [ ] `Sending order to Northbeam`
- [ ] `Order synced successfully`
- [ ] `Backfill batch completed`

**Verify:**
- [ ] All logs are valid JSON
- [ ] `level` field is present (info/error/warning)
- [ ] `service: northbeam-backfill` in all logs
- [ ] No error-level logs

### Test 4: Deduplication Check

Run same order sync again (without force_resync):
```bash
curl -X POST https://[YOUR-US-DOMAIN]/api/northbeam/backfill-auto \
  -H "Content-Type: application/json" \
  -d '{"order_ids": [YOUR_TEST_ORDER_ID]}'
```

**Expected Response:**
```json
{
  "results": [{
    "id": "[ORDER_ID]",
    "status": "skipped",
    "reason": "already_backfilled"
  }]
}
```

- [ ] Order is skipped
- [ ] Reason is `already_backfilled`

---

## 🔧 WordPress Plugin Setup

### If Using Custom Plugin

- [ ] Upload plugin to: `/wp-content/plugins/rocky-northbeam-sync/`
- [ ] Activate plugin in WP Admin → Plugins
- [ ] Configure API URL if needed (in wp-config.php or plugin settings)

### Verify Cron Scheduled

```bash
wp cron event list --allow-root | grep northbeam
```

**Expected Output:**
```
rocky_northbeam_hourly_sync    [next run time]    rocky_hourly
```

- [ ] Cron event is listed
- [ ] Next run time is within 1 hour

### Manual Trigger Test

```bash
wp cron event run rocky_northbeam_hourly_sync --allow-root
```

- [ ] Command completes without errors
- [ ] Check WP debug log for output
- [ ] Check Vercel logs for API requests
- [ ] Verify orders are synced in WC

---

## 📊 Post-Deployment Monitoring

### First Hour

- [ ] Monitor Vercel logs continuously
- [ ] Watch for first automatic cron run
- [ ] Verify batch processing works
- [ ] Check for any errors

### First Day

- [ ] Review Vercel log summary
- [ ] Check WooCommerce for updated order meta
- [ ] Verify unsynced order count decreases
- [ ] Monitor error rate (should be <5%)

### First Week

- [ ] Check Northbeam dashboard (orders appear after 24-48h)
- [ ] Verify attribution data is accurate
- [ ] Compare order counts: WC vs Northbeam
- [ ] Audit for any missing or duplicate orders

---

## 🐛 Common Issues & Quick Fixes

### Issue: 500 Internal Server Error

**Check:**
- [ ] Northbeam credentials are correct (US account!)
- [ ] WooCommerce credentials are correct
- [ ] Environment variables are set in Vercel

**Fix:**
```bash
vercel env pull .env
cat .env | grep NB_
```

### Issue: Orders Not Updating Meta

**Check:**
- [ ] WooCommerce REST API permissions (read_write)
- [ ] Consumer Key/Secret are valid
- [ ] Order exists and is not deleted

**Fix:**
```bash
# Test WC API directly
curl https://[YOUR-DOMAIN]/wp-json/wc/v3/orders/[ORDER_ID] \
  -u "[CONSUMER_KEY]:[CONSUMER_SECRET]"
```

### Issue: Cron Not Running

**Check:**
- [ ] WP Cron is enabled (not disabled in wp-config.php)
- [ ] Plugin is activated
- [ ] Cron event is scheduled

**Fix:**
```bash
# Reactivate plugin
wp plugin deactivate rocky-northbeam-sync --allow-root
wp plugin activate rocky-northbeam-sync --allow-root

# Verify cron
wp cron event list --allow-root
```

### Issue: Duplicate Orders in Northbeam

**Check:**
- [ ] Order meta `_northbeam_backfilled` is set
- [ ] Meta update didn't fail silently

**Fix:**
```bash
# Manually mark as synced
wp post meta update [ORDER_ID] _northbeam_backfilled yes --allow-root
wp post meta update [ORDER_ID] _northbeam_backfilled_at "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" --allow-root
```

---

## 📋 Sign-Off Checklist

Before marking as complete:

- [ ] Manual test order synced successfully
- [ ] WooCommerce order meta updated correctly
- [ ] Vercel logs show structured JSON
- [ ] Deduplication works (tested)
- [ ] WP cron is scheduled and running
- [ ] No errors in logs after first automatic run
- [ ] Currency is USD (not CAD)
- [ ] Country codes are USA (not CAN)
- [ ] Test order appears in Northbeam dashboard (wait 24-48h)

---

## 🆘 Need Help?

**Resources:**
- Full guide: `NORTHBEAM_BACKFILL_AUTO_IMPLEMENTATION_GUIDE.md`
- Source repo: `rocky-headless`
- Original docs: `docs/northbeam-automated-backfill-system.md`

**Debug Commands:**
```bash
# Vercel logs
vercel logs --follow | grep "northbeam-backfill"

# WP cron status
wp cron event list --allow-root

# WP order meta
wp post meta list [ORDER_ID] --allow-root | grep northbeam

# Test endpoint
curl -X POST https://[DOMAIN]/api/northbeam/backfill-auto \
  -H "Content-Type: application/json" \
  -d '{"order_ids": [ORDER_ID], "force_resync": true}'
```

---

**Quick Reference: Key Meta Keys**

| Meta Key | Purpose |
|----------|---------|
| `_northbeam_backfilled` | Marks order as synced |
| `_northbeam_backfilled_at` | Sync timestamp |
| `_nb_last_pushed_total` | ⚠️ Relay plugin (DON'T TOUCH) |

**Quick Reference: Log Levels**

| Level | Meaning |
|-------|---------|
| `info` | Normal operation |
| `warning` | Non-critical issue |
| `error` | Failed sync/critical issue |

**Quick Reference: Order Statuses**

| Status | Action |
|--------|--------|
| `success` | ✅ Synced to Northbeam |
| `skipped` | Already synced or handled by Relay |
| `failed` | Error occurred, will retry |
| `not_found` | Order doesn't exist in WC |
| `error` | Critical error occurred |

---

**Implementation Status:** [ ] Not Started [ ] In Progress [ ] Testing [ ] Complete

**Date Started:** ___________  
**Date Completed:** ___________  
**Implemented By:** ___________

