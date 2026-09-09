# Northbeam Automatic Order Retry System

## Overview

The Northbeam Auto-Retry system automatically attempts to resend recent orders to Northbeam that may have failed on the first attempt. This ensures complete order tracking without manual intervention.

## How It Works

### Architecture

```
┌─────────────────┐
│  Vercel Cron    │  Runs every 10 minutes
│  (Automated)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ /api/northbeam/auto-retry   │
│ - Queries recent WC orders  │
│ - Filters completed orders  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ /api/northbeam/backfill     │
│ - Fetches full order data   │
│ - Formats for Northbeam     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ /api/northbeam/orders       │
│ - Sends to Northbeam API    │
│ - Handles deduplication     │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Northbeam API             │
│   - Deduplicates on order_id│
│   - Returns success/error   │
└─────────────────────────────┘
```

### Key Features

1. **Automatic Retry**: Runs every 10 minutes via Vercel Cron
2. **Smart Filtering**: Only retries `processing` and `completed` orders
3. **Configurable Lookback**: Defaults to 2 hours, configurable via env var
4. **Built-in Deduplication**: Northbeam deduplicates by `order_id`, so safe to retry
5. **Safety Limits**: Max 50 orders per run (configurable)
6. **Full Logging**: Comprehensive logs for monitoring and debugging

### Why This Works

- **Northbeam deduplicates**: Sending the same order multiple times is safe
- **Recent orders only**: Only attempts orders from last 2 hours (configurable)
- **Status filtering**: Only tracks orders that matter (processing/completed)
- **Lightweight**: Uses existing backfill infrastructure

## Setup

### 1. Environment Variables

Add these to your `.env` file and Vercel environment:

```bash
# Required - Already configured
NB_CLIENT_ID=your_northbeam_client_id
NB_API_KEY=your_northbeam_api_key

# Optional - Cron Security
CRON_SECRET=your_random_secret_here  # Recommended for production

# Optional - Retry Configuration
NB_RETRY_LOOKBACK_MINUTES=120  # Default: 120 (2 hours)
NB_RETRY_MAX_ORDERS=50         # Default: 50 (safety limit)
```

### 2. Deploy to Vercel

The cron job is already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/northbeam/auto-retry",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

**Schedule**: `*/10 * * * *` = Every 10 minutes

After deploying, Vercel will automatically start running the cron job.

### 3. Verify Setup

Vercel Cron always calls this path with GET, so GET performs the real retry
work, the same as POST. Both share one internal function; the only
difference is the `?config=1` query param described below.

#### Check Configuration (no retry run)
```bash
curl -X GET "https://your-domain.com/api/northbeam/auto-retry?config=1" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Response:
```json
{
  "status": "ready",
  "configuration": {
    "northbeamConfigured": true,
    "lookbackMinutes": 120,
    "maxOrdersToRetry": 50,
    "afterDate": "2025-11-05T12:00:00.000Z"
  },
  "message": "Use GET (or POST) without ?config=1 to trigger the retry, or let Vercel Cron handle it automatically"
}
```

#### Trigger Manual Retry
```bash
curl -X GET https://your-domain.com/api/northbeam/auto-retry \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# POST does the same thing
curl -X POST https://your-domain.com/api/northbeam/auto-retry \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Response:
```json
{
  "success": true,
  "message": "Auto-retry completed",
  "duration": "1234ms",
  "lookbackMinutes": 120,
  "ordersAttempted": 15,
  "results": {
    "succeeded": 14,
    "failed": 1
  },
  "failedOrderIds": ["488172"]
}
```

## Monitoring

### Vercel Logs

View cron execution logs in Vercel:
1. Go to your project in Vercel Dashboard
2. Click "Logs" tab
3. Filter by `[NB Auto-Retry]`

### Log Messages

```
[NB Auto-Retry] ⏰ Starting automatic retry job
[NB Auto-Retry] Looking for orders after 2025-11-05T12:00:00.000Z
[NB Auto-Retry] Found 15 orders to attempt retry
[NB Auto-Retry] Calling backfill endpoint with 15 orders
[NB Auto-Retry] ✅ Completed in 1234ms: 14 succeeded, 1 failed
```

### Monitoring Failed Orders

The response includes `failedOrderIds` array for any orders that still fail after retry. You can:

1. **Monitor in Vercel Logs**: Check for failed order IDs
2. **Alert on Failures**: Set up Vercel log alerts
3. **Manual Investigation**: Use the order ID to investigate in WooCommerce/Northbeam

## Configuration Options

### Lookback Window

Control how far back to look for orders:

```bash
# Check last 1 hour
NB_RETRY_LOOKBACK_MINUTES=60

# Check last 4 hours
NB_RETRY_LOOKBACK_MINUTES=240

# Check last 24 hours (not recommended - too many orders)
NB_RETRY_LOOKBACK_MINUTES=1440
```

**Recommendation**: Keep between 60-240 minutes (1-4 hours)

### Max Orders Per Run

Safety limit to prevent overloading:

```bash
# Process more orders per run
NB_RETRY_MAX_ORDERS=100

# Process fewer orders per run (safer)
NB_RETRY_MAX_ORDERS=25
```

**Recommendation**: Keep between 25-100 orders

### Cron Schedule

Adjust frequency in `vercel.json`:

```json
{
  "schedule": "*/10 * * * *"  // Every 10 minutes (recommended)
  "schedule": "*/5 * * * *"   // Every 5 minutes (more aggressive)
  "schedule": "*/15 * * * *"  // Every 15 minutes (less aggressive)
  "schedule": "0 * * * *"     // Every hour (minimal)
}
```

## Troubleshooting

### No Orders Being Retried

**Possible causes:**
1. No recent orders in WooCommerce
2. Orders not in `processing` or `completed` status
3. Lookback window too short

**Solution:**
- Check WooCommerce for recent orders
- Verify order statuses
- Increase `NB_RETRY_LOOKBACK_MINUTES`

### High Failure Rate

**Possible causes:**
1. Northbeam API credentials invalid
2. Network issues
3. Invalid order data (e.g., country codes)

**Solution:**
- Verify `NB_CLIENT_ID` and `NB_API_KEY`
- Check Northbeam API status
- Review Northbeam error logs for specific issues

### Cron Not Running

**Possible causes:**
1. Not deployed to Vercel
2. Vercel cron not enabled (requires Pro plan)
3. Invalid cron schedule syntax

**Solution:**
- Verify deployment to Vercel
- Check Vercel plan (Hobby/Pro)
- Test manual trigger with POST request

## Security

### Cron Secret

**Highly Recommended**: Set a `CRON_SECRET` to prevent unauthorized access:

```bash
# Generate a secure random string
CRON_SECRET=$(openssl rand -base64 32)

# Add to Vercel environment
vercel env add CRON_SECRET
```

Without `CRON_SECRET`, anyone can trigger the endpoint.

### Vercel Cron Authentication

Vercel automatically adds authentication headers to cron requests. The endpoint checks:

```javascript
const authHeader = req.headers.get("authorization");
const cronSecret = process.env.CRON_SECRET;

if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

## FAQ

### Q: Will this create duplicate orders in Northbeam?

**A**: No. Northbeam deduplicates orders by `order_id`. Sending the same order multiple times is safe and intentional for retry purposes.

### Q: What happens if an order fails multiple times?

**A**: The system will keep retrying it every 10 minutes as long as it's within the lookback window (default 2 hours). After that, it won't be retried unless you manually backfill it.

### Q: Can I manually retry specific orders?

**A**: Yes! Use the backfill endpoint:

```bash
curl -X POST https://your-domain.com/api/northbeam/backfill \
  -H "Content-Type: application/json" \
  -d '{"order_ids": ["488172", "488173"]}'
```

### Q: Does this cost extra?

**A**: The cron job itself is included in Vercel Pro plans. API calls to Northbeam don't have additional costs beyond your existing plan.

### Q: How do I disable auto-retry?

**A**: Remove the cron configuration from `vercel.json` and redeploy:

```json
{
  "crons": [
    {
      "path": "/api/wp-cron",
      "schedule": "* * * * *"
    }
    // Removed: /api/northbeam/auto-retry
  ]
}
```

## Best Practices

1. **Start Conservative**: Begin with 10-minute intervals and 2-hour lookback
2. **Monitor Logs**: Check Vercel logs regularly for failures
3. **Set Alerts**: Configure Vercel log alerts for persistent failures
4. **Adjust as Needed**: Tune lookback window based on your order volume
5. **Use CRON_SECRET**: Always set this in production
6. **Test First**: Use manual POST trigger to test before relying on cron

## Related Documentation

- [Northbeam Country Code Fix](../NORTHBEAM_COUNTRY_CODE_FIX.md)
- [Northbeam API Documentation](https://docs.northbeam.io/docs/using-the-api)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

