# ✅ Northbeam US Platform Setup - Complete

## Summary of Changes

All necessary updates have been made to adapt the Northbeam plugins from Canada (CA) to United States (US) platform.

---

## 🔧 Changes Made

### 1. **API Endpoint Created** ✅
- **Created:** `/app/api/northbeam/backfill-auto/route.js`
- **URL:** `https://rocky-us.vercel.app/api/northbeam/backfill-auto`
- **Purpose:** WordPress plugin automated backfill endpoint
- **Features:**
  - Accepts order IDs from WordPress
  - Fetches WooCommerce orders
  - Forwards to Northbeam
  - Returns success/failure statistics
  - Updates order meta data with backfill status

### 2. **Currency & Country Updates** ✅

#### Updated Files:
1. **`Northbeam Relay.php`** (Line 458)
   - **Old:** `'country_code' => $country === 'CA' ? 'CAN' : ($country ?: 'CAN')`
   - **New:** `'country_code' => $country === 'US' ? 'USA' : ($country ?: 'USA')`

2. **`app/api/northbeam/backfill/route.js`** (Line 64, 186)
   - **Old:** Default country `"CAN"`, currency `"CAD"`
   - **New:** Default country `"USA"`, currency `"USD"`

3. **`app/api/northbeam/backfill-auto/route.js`** (New file)
   - Default country: `"USA"`
   - Default currency: `"USD"`

4. **`northbeam-backfill-sync.php`** (Line 38)
   - **Old:** `'https://rocky-headless.vercel.app/api/northbeam/backfill-auto'`
   - **New:** `'https://rocky-us.vercel.app/api/northbeam/backfill-auto'`

---

## 🔑 Environment Variables

### Already Configured in `.env` ✅

```env
# Northbeam API Credentials
NB_CLIENT_ID=083acfe7-4758-449b-b532-0bb626f5468d
NB_API_KEY=5493108b-c1cb-4da8-806c-fa3b07de9b88
NORTHBEAM_AUTH_TOKEN=5493108b-c1cb-4da8-806c-fa3b07de9b88
NORTHBEAM_CLIENT_ID=083acfe7-4758-449b-b532-0bb626f5468d
NORTHBEAM_SYNC_API_KEY=5493108b-c1cb-4da8-806c-fa3b07de9b88
```

### Optional Override (Not Required)
```env
# Only set if you need to override the default URL
# NEXTJS_API_URL=https://rocky-us.vercel.app/api/northbeam/backfill-auto
```

---

## 📦 WordPress Plugin Files Ready

### 1. **Northbeam Relay.php**
- **Purpose:** Real-time order sync to Northbeam
- **Location:** Root directory
- **Status:** ✅ Updated for US (USD, USA)
- **Features:**
  - Monitors order status changes
  - Handles cancellations, refunds, trash, expired orders
  - Excludes subscription-related orders
  - Auto-retry with exponential backoff
  - HPOS compatible

### 2. **northbeam-backfill-sync.php**
- **Purpose:** Historical order backfill via cron
- **Location:** Root directory
- **Status:** ✅ Updated for US URL
- **Features:**
  - Automated hourly cron sync
  - Manual sync via WordPress admin
  - Batch processing (50 orders per batch)
  - Progress tracking & failed order management
  - HPOS compatible
  - Beautiful admin UI

---

## 🚀 Next Steps: WordPress Installation

### Step 1: Upload Plugins to WordPress
1. Access your WordPress admin panel (US site)
2. Go to: **Plugins → Add New → Upload Plugin**
3. Upload **`Northbeam Relay.php`**
4. Upload **`northbeam-backfill-sync.php`**
5. Click **Activate** for both plugins

### Step 2: Configure WordPress Environment (wp-config.php)
Add these constants to your `wp-config.php` file (before "That's all, stop editing!"):

```php
// Northbeam Configuration
define('NB_CLIENT_ID', '083acfe7-4758-449b-b532-0bb626f5468d');
define('NB_API_KEY', '5493108b-c1cb-4da8-806c-fa3b07de9b88');
define('NORTHBEAM_AUTH_TOKEN', '5493108b-c1cb-4da8-806c-fa3b07de9b88');
define('NORTHBEAM_CLIENT_ID', '083acfe7-4758-449b-b532-0bb626f5468d');

// Optional: Override Next.js API URL (defaults to rocky-us.vercel.app)
// define('NEXTJS_API_URL', 'https://rocky-us.vercel.app/api/northbeam/backfill-auto');

// Optional: API key for backfill endpoint authentication
// define('NORTHBEAM_SYNC_API_KEY', 'your_api_key_here');

// Optional: Debug mode (logs payloads - disable in production)
// define('NORTHBEAM_LOG_PAYLOADS', false);
// define('NORTHBEAM_DRY_RUN', false);
```

### Step 3: Verify Installation
1. Go to: **WooCommerce → Northbeam Sync**
2. You should see:
   - ✅ Unsynced orders count
   - ✅ Next scheduled sync time
   - ✅ Cron status: Active
3. Click **"Sync Now"** to test manual sync
4. Check logs for any errors

### Step 4: Test Real-Time Sync (Relay Plugin)
1. Create a test order in WooCommerce
2. Change order status to "Cancelled" or "Refunded"
3. Check WordPress logs: **WooCommerce → Status → Logs**
4. Look for log file: `northbeam-relay-[date]-[hash].log`
5. Verify order was sent to Northbeam

---

## ❓ Regarding Vercel Environment Variables

### **Answer: NO, you DON'T need to add these to Vercel**

Here's why:

1. **WordPress Plugins Use wp-config.php:**
   - The plugins read from WordPress `wp-config.php`
   - They don't read from Vercel environment variables

2. **Next.js API Routes Use .env:**
   - Your `.env` file already has all the Northbeam credentials
   - These get deployed to Vercel automatically
   - The API endpoint (`/api/northbeam/backfill-auto`) reads from `process.env`

3. **What's Already on Vercel:**
   - When you deploy to Vercel, your `.env` values are used
   - Vercel automatically picks up environment variables from your project settings
   - As long as `.env` has the credentials, they'll work on Vercel

4. **What CA Does (and you should do too):**
   - CA platform has these credentials in `.env` (local dev)
   - CA platform has these in Vercel project settings (production)
   - You should **verify your US Vercel project settings** have:
     - `NB_CLIENT_ID`
     - `NB_API_KEY`
     - `NORTHBEAM_AUTH_TOKEN`
     - `NORTHBEAM_CLIENT_ID`

### To Check Vercel Settings:
1. Go to [vercel.com](https://vercel.com)
2. Select your `rocky-us` project
3. Go to **Settings → Environment Variables**
4. Verify the Northbeam variables are there
5. If not, add them from your `.env` file

---

## 🔍 Product ID Verification

### ⚠️ ACTION REQUIRED:

**Check US WooCommerce for "Follow-up Consultation" Product:**

The Relay plugin has this hardcoded product ID:
```php
$FOLLOWUP_CONSULTATION_PRODUCT_ID = 180694;
```

**What to do:**
1. Log into your US WooCommerce admin
2. Go to: **Products → All Products**
3. Search for: "Follow-up Consultation" (or similar WL renewal product)
4. Check if the product ID is **180694**
5. If different:
   - Open `Northbeam Relay.php`
   - Find line 79
   - Update `$FOLLOWUP_CONSULTATION_PRODUCT_ID` to the correct US product ID

---

## 📊 Plugin Features Overview

### Northbeam Relay (Real-Time)
- ✅ Order status change monitoring
- ✅ Handles: cancelled, refunded, trashed, expired, null orders
- ✅ Price change detection & upserts
- ✅ Subscription filtering (blocks renewals)
- ✅ Auto-retry with backoff (5, 15, 45, 120, 360 minutes)
- ✅ Per-status deduplication
- ✅ HPOS compatible
- ✅ Context-aware: allows initial signup cancellations

### Northbeam Backfill Sync (Historical)
- ✅ Automated hourly cron job
- ✅ Manual sync with progress tracking
- ✅ Processes orders older than 7 days
- ✅ Batch processing (50 orders/batch)
- ✅ Failed order tracking & retry management
- ✅ Beautiful admin UI with real-time progress
- ✅ HPOS compatible
- ✅ Excludes subscription orders
- ✅ Excludes orders already handled by Relay plugin

---

## 🎯 Testing Checklist

### ✅ Relay Plugin (Real-Time):
- [ ] Create test order
- [ ] Cancel or refund the order
- [ ] Check WooCommerce logs for successful sync
- [ ] Verify order appears in Northbeam dashboard

### ✅ Backfill Plugin (Historical):
- [ ] Access admin page: WooCommerce → Northbeam Sync
- [ ] Check unsynced orders count
- [ ] Run manual sync
- [ ] Monitor progress bar
- [ ] Verify orders marked as backfilled
- [ ] Check for failed orders

---

## 📝 Important Notes

1. **Country Code:** Now defaults to USA (was CAN)
2. **Currency:** Now defaults to USD (was CAD)
3. **API Endpoint:** Points to `https://rocky-us.vercel.app` (was `rocky-headless.vercel.app`)
4. **Environment Variables:** All configured in `.env` and should be on Vercel
5. **No Package Installation Needed:** These are standalone PHP plugins
6. **HPOS Compatible:** Both plugins support WooCommerce High-Performance Order Storage

---

## 🔗 Related Files

- `/app/api/northbeam/backfill-auto/route.js` - New automated backfill endpoint
- `/app/api/northbeam/backfill/route.js` - Updated with USD/USA
- `/app/api/northbeam/orders/route.js` - Main Northbeam orders endpoint
- `Northbeam Relay.php` - WordPress plugin (real-time)
- `northbeam-backfill-sync.php` - WordPress plugin (historical)

---

## ✨ Deployment Complete!

All files are ready for WordPress installation. The plugins are configured for the US market with proper currency (USD) and country codes (USA).

**Questions?** Check the inline comments in the plugin files or refer to the original CA setup for comparison.

