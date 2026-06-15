import { NextResponse } from 'next/server';
import { getGatewayConfig, META_CAPI_GATEWAYS } from '@/utils/metaCapiConfig';
import { hashEmail, hashPhone, hashSHA256 } from '@/utils/analytics/hashServerSide';
import { processMetaParameters } from '@/lib/meta/paramBuilderHelper';
import { toMoney } from '@/utils/priceFormatter';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

// Cold-start sanity: surfaces missing FB_ACCESS_TOKEN_* env vars once per
// function instance. Without this, a missing token returns 400 silently.
const _missingMetaTokens = Object.entries(META_CAPI_GATEWAYS)
  .filter(([, cfg]) => !cfg.accessToken)
  .map(([key]) => key);
if (_missingMetaTokens.length > 0) {
  console.warn(
    `[Meta CAPI] Cold start: missing FB_ACCESS_TOKEN for gateways: ${_missingMetaTokens.join(', ')}`
  );
}

const resolveEventTime = (payload, orderData) => {
  const candidates = [
    payload?.time_of_purchase_iso,
    orderData?.date_paid_gmt,
    orderData?.date_paid,
    orderData?.date_created_gmt,
    orderData?.date_created,
    orderData?.date_completed
  ];
  const chosen = candidates.find((d) => Number.isFinite(Date.parse(d)));
  if (chosen) {
    return Math.floor(Date.parse(chosen) / 1000);
  }
  return Math.floor(Date.now() / 1000);
};

const isRetryableStatus = (status) => status === 429 || (status >= 500 && status < 600);

const isRetryableError = (error) => {
  const code = error?.code || error?.cause?.code || '';
  if (['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'ENOTFOUND', 'ECONNREFUSED'].includes(code)) {
    return true;
  }
  const message = (error?.message || '').toLowerCase();
  return message.includes('timeout') || message.includes('network') || message.includes('fetch failed');
};

/**
 * Fetch complete order from WooCommerce if needed
 */
const fetchOrderFromWooCommerce = async (orderId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/wp-json/wc/v3/orders/${orderId}`,
      {
        auth: {
          username: CONSUMER_KEY,
          password: CONSUMER_SECRET
        },
        timeout: 10000
      }
    );

    return response.data;
  } catch (error) {
    console.error(`[Meta CAPI] Error fetching order ${orderId}:`, error.message);
    return null;
  }
};

/**
 * Fetch product details to enrich line items with categories
 */
const fetchProductDetails = async (productId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/wp-json/wc/v3/products/${productId}`,
      {
        auth: {
          username: CONSUMER_KEY,
          password: CONSUMER_SECRET
        },
        timeout: 5000
      }
    );
    return response.data;
  } catch (error) {
    console.warn(`[Meta CAPI] Error fetching product ${productId}:`, error.message);
    return null;
  }
};

/**
 * Enrich line items with product categories if missing
 */
const enrichLineItems = async (lineItems) => {
  const enrichedItems = await Promise.all(
    lineItems.map(async (item) => {
      // If categories already present, return as-is
      if (item.categories && Array.isArray(item.categories) && item.categories.length > 0) {
        return item;
      }

      // Fetch product details
      const productDetails = await fetchProductDetails(item.product_id);
      
      if (!productDetails) {
        return {
          ...item,
          categories: [],
          category: 'General'
        };
      }

      return {
        ...item,
        sku: item.sku || productDetails.sku,
        categories: productDetails.categories || [],
        category: productDetails.categories?.[0]?.name || 'General'
      };
    })
  );

  return enrichedItems;
};

/**
 * Fetch customer profile data for enhanced matching
 */
const fetchCustomerProfile = async (customerId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/wp-json/wc/v3/customers/${customerId}`,
      {
        auth: {
          username: CONSUMER_KEY,
          password: CONSUMER_SECRET
        },
        timeout: 5000
      }
    );
    return response.data;
  } catch (error) {
    console.warn(`[Meta CAPI] Could not fetch customer profile:`, error.message);
    return null;
  }
};

/**
 * Format date of birth to YYYYMMDD format
 */
const formatDOB = (dob) => {
  if (!dob) return '';
  
  try {
    // Handle various date formats
    const date = new Date(dob);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}${month}${day}`;
  } catch (error) {
    return '';
  }
};

/**
 * Normalize gender to 'm' or 'f'
 */
const normalizeGender = (gender) => {
  if (!gender) return '';
  
  const g = gender.toLowerCase().trim();
  
  if (g === 'male' || g === 'm') return 'm';
  if (g === 'female' || g === 'f') return 'f';
  
  return '';
};

/**
 * Main POST handler for Meta CAPI purchase events
 */
export async function POST(req) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Non-production environment',
      });
    }

    const payload = await req.json();
    let {
      order_id,
      gateway,
      rky_cat,
      value,
      subtotal,
      net_subtotal,
      shipping,
      tax,
      discount,
      currency, 
      content_ids, 
      num_items, 
      order_data,
      meta_params
    } = payload;

    // Validate gateway
    const gatewayConfig = getGatewayConfig(gateway);
    if (!gatewayConfig || !gatewayConfig.accessToken) {
      console.error(
        `[Meta CAPI] Refusing event for order ${order_id}: gateway "${gateway}" has no access token (env var FB_ACCESS_TOKEN_${gateway} is empty or missing).`
      );
      return NextResponse.json(
        { error: `Invalid gateway or missing access token: ${gateway}` },
        { status: 400 }
      );
    }

    // Skip $0 orders (100% discount)
    if (parseFloat(value) <= 0) {
      console.log(`[Meta CAPI] Skipping $0 order ${order_id} for gateway ${gateway}`);
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Zero value order',
        gateway,
        order_id
      });
    }

    // Fetch complete order if order_data is incomplete
    if (!order_data?.billing || !order_data?.line_items) {
      console.log(`[Meta CAPI] Fetching order ${order_id} from WooCommerce...`);
      order_data = await fetchOrderFromWooCommerce(order_id);
      
      if (!order_data) {
        return NextResponse.json(
          { error: 'Could not fetch order from WooCommerce' },
          { status: 500 }
        );
      }
    }

    // Enrich line items with categories if needed
    if (order_data.line_items && order_data.line_items.length > 0) {
      const needsEnrichment = order_data.line_items.some(
        item => !item.categories || !Array.isArray(item.categories) || item.categories.length === 0
      );
      
      if (needsEnrichment) {
        order_data.line_items = await enrichLineItems(order_data.line_items);
      }
    }

    // Extract billing info
    const billing = order_data?.billing || {};
    let userEmail = billing.email || '';
    let userPhone = billing.phone || '';
    let firstName = billing.first_name || '';
    let lastName = billing.last_name || '';
    let city = billing.city || '';
    let state = billing.state || '';
    let zip = billing.postcode || '';
    let country = billing.country || 'US';

    // Fetch customer profile for enhanced data (gender, DOB)
    let customerData = null;
    let gender = '';
    let dob = '';
    
    if (order_data?.customer_id && order_data.customer_id > 0) {
      customerData = await fetchCustomerProfile(order_data.customer_id);
      
      if (customerData) {
        // Enhance phone from customer profile if missing
        if (!userPhone && customerData.billing?.phone) {
          userPhone = customerData.billing.phone;
        }
        
        // Extract gender and DOB from meta_data
        const metaData = customerData.meta_data || [];
        
        const genderField = metaData.find(m => m.key === 'gender' || m.key === 'billing_gender');
        if (genderField) {
          gender = normalizeGender(genderField.value);
        }
        
        const dobField = metaData.find(m => m.key === 'date_of_birth' || m.key === 'billing_date_of_birth');
        if (dobField) {
          dob = formatDOB(dobField.value);
        }
      }
    }

    // Hash all PII
    const email = hashEmail(userEmail);
    const phone = hashPhone(userPhone, country);
    const fn = hashSHA256(firstName);
    const ln = hashSHA256(lastName);
    const ct = hashSHA256(city);
    const st = hashSHA256(state);
    const zp = hashSHA256(zip);
    const countryHash = hashSHA256(country);
    const ge = gender ? hashSHA256(gender) : '';
    const db = dob ? hashSHA256(dob) : '';
    const externalIdSource = payload.customer_id_canonical || payload.customer_id || order_data.customer_id;
    const external_id = externalIdSource ? hashSHA256(externalIdSource.toString()) : '';

    // Client Info
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';

    // Process Meta parameters (fbp, fbc)
    const metaParams = await processMetaParameters(req, meta_params || {});

    // Build event_source_url — prefer the real client-side page URL so Meta
    // treats this as a user-facing event. Fall back to a constructed www URL
    // for server-only callers (webhooks, jobs) that have no browser context.
    const eventSourceUrl =
      payload.event_source_url ||
      `https://www.myrocky.com/checkout/order-received/${order_id}`;

    // Stable event_id for deduplication on the PRIMARY pixel. Secondary
    // pixels get a suffixed event_id so each pixel maintains an
    // independent dedup namespace.
    const eventId = `purchase_${order_id}_${gateway}`;

    const resolvedCurrency = currency || order_data?.currency || 'USD';
    const eventTime = resolveEventTime(payload, order_data);

    // Build user_data object
    const userData = {
      client_ip_address: clientIP,
      client_user_agent: userAgent
    };

    // Add hashed user data fields
    if (email) userData.em = [email];
    if (phone) userData.ph = [phone];
    if (fn) userData.fn = [fn];
    if (ln) userData.ln = [ln];
    if (ct) userData.ct = [ct];
    if (st) userData.st = [st];
    if (zp) userData.zp = [zp];
    if (countryHash) userData.country = [countryHash];
    if (ge) userData.ge = [ge];
    if (db) userData.db = [db];
    if (external_id) userData.external_id = [external_id];

    // Add Meta parameters
    if (metaParams.fbp) userData.fbp = metaParams.fbp;
    if (metaParams.fbc) userData.fbc = metaParams.fbc;

    // Build custom_data object
    const customData = {
      value: toMoney(value),
      currency: resolvedCurrency,
      content_ids: content_ids || [],
      content_type: 'item',
      num_items: num_items || 0,
      order_id: `${order_id}-${gateway}`,
      rky_cat: rky_cat || gateway // NAD+ rides LONGEVITY but keeps rky_cat:'NAD'
    };

    // Add cost breakdown if available
    if (subtotal !== undefined) customData.subtotal = toMoney(subtotal);
    if (shipping !== undefined) customData.shipping = toMoney(shipping);
    if (tax !== undefined) customData.tax = toMoney(tax);
    if (discount !== undefined) customData.discount = toMoney(discount);

    const matchKeys = {
      has_email: !!userData.em?.length,
      has_phone: !!userData.ph?.length,
      has_external_id: !!userData.external_id?.length,
      has_fbp: !!userData.fbp,
      has_fbc: !!userData.fbc,
      has_name: !!userData.fn?.length || !!userData.ln?.length,
      has_location: !!userData.ct?.length || !!userData.st?.length || !!userData.zp?.length,
      has_country: !!userData.country?.length,
      has_gender: !!userData.ge?.length,
      has_dob: !!userData.db?.length
    };

    /**
     * Build a per-pixel CAPI fire target. user_data / custom_data /
     * event_source_url / event_time are kept byte-identical to the primary
     * so EMQ and data freshness are guaranteed equal across primary and
     * every secondary destination.
     */
    const buildEventPayload = (eventName, perPixelEventId) => ({
      event_name: eventName,
      event_time: eventTime,
      event_id: perPixelEventId,
      event_source_url: eventSourceUrl,
      action_source: 'website',
      user_data: userData,
      custom_data: customData,
    });

    /**
     * Targets:
     *   [0] primary       (gatewayConfig.pixelId + gatewayConfig.customEventName)
     *   [1..] secondary   (each gatewayConfig.secondaryPixels[i])
     *
     * All share gatewayConfig.accessToken (same System User authenticates
     * against every pixel listed for the gateway).
     */
    const targets = [
      {
        pixelId: gatewayConfig.pixelId,
        eventName: gatewayConfig.customEventName,
        eventId,
        label: gateway,
        isPrimary: true,
      },
      ...((gatewayConfig.secondaryPixels || []).map((sec, idx) => ({
        pixelId: sec.pixelId,
        eventName: sec.customEventName,
        // Suffix the per-pixel event_id with the secondary's event name so
        // each pixel's dedup namespace is independent and the log makes the
        // primary/secondary split obvious.
        eventId: `${eventId}_${sec.customEventName}`,
        label: `${gateway}/${sec.customEventName}`,
        isPrimary: false,
      }))),
    ];

    const sendOneTarget = async (target, attempt = 1) => {
      const url = `https://graph.facebook.com/v18.0/${target.pixelId}/events`;
      const eventPayload = buildEventPayload(target.eventName, target.eventId);

      if (attempt === 1) {
        console.log(`[Meta CAPI] Sending event for order ${order_id} to ${target.label}:`, {
          pixel_id: target.pixelId,
          event_name: eventPayload.event_name,
          event_id: eventPayload.event_id,
          action_source: eventPayload.action_source,
          event_time: eventPayload.event_time,
          value: eventPayload.custom_data.value,
          currency: eventPayload.custom_data.currency,
          match_keys: matchKeys,
        });
      }

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: gatewayConfig.accessToken,
            data: [eventPayload],
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          const retryable = isRetryableStatus(response.status);
          console.error(`[Meta CAPI] HTTP Error ${target.label} (attempt ${attempt}):`, {
            event_id: target.eventId,
            status: response.status,
            statusText: response.statusText,
            body: text,
            retryable,
          });

          if (attempt === 1 && retryable) {
            console.log(`[Meta CAPI] Retrying ${target.label}...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return sendOneTarget(target, 2);
          }

          throw new Error(`Meta API returned ${response.status}: ${text.substring(0, 200)}`);
        }

        const data = await response.json();

        if (data.error) {
          console.error(`[Meta CAPI] Error ${target.label}:`, data.error);
          throw new Error(data.error.message || 'Meta API error');
        }

        console.log(`[Meta CAPI] ✅ Success ${target.label}:`, {
          event_id: target.eventId,
          events_received: data.events_received || 0,
          fbtrace_id: data.fbtrace_id,
        });

        return {
          success: true,
          pixel_id: target.pixelId,
          event_name: target.eventName,
          event_id: target.eventId,
          events_received: data.events_received || 0,
          fbtrace_id: data.fbtrace_id,
        };
      } catch (error) {
        if (attempt === 1 && isRetryableError(error)) {
          console.log(`[Meta CAPI] Retrying ${target.label} after error...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return sendOneTarget(target, 2);
        }
        return {
          success: false,
          pixel_id: target.pixelId,
          event_name: target.eventName,
          event_id: target.eventId,
          error: error?.message || 'unknown error',
        };
      }
    };

    // Fire all targets in parallel — secondaries must not block / depend on
    // primary, and a secondary failure must not poison the primary result.
    const results = await Promise.all(targets.map((t) => sendOneTarget(t)));
    const primaryResult = results[0];
    const secondaryResults = results.slice(1);

    // Primary failure is the only thing that makes the overall request
    // fail. Any secondary failure is logged above and surfaced in the
    // response body but does not flip HTTP status.
    if (!primaryResult.success) {
      return NextResponse.json(
        {
          success: false,
          gateway,
          primary: primaryResult,
          secondaries: secondaryResults,
          error: primaryResult.error || 'Primary CAPI fire failed',
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      gateway,
      event_id: primaryResult.event_id,
      events_received: primaryResult.events_received,
      fbtrace_id: primaryResult.fbtrace_id,
      // Surface the per-target breakdown so caller logs / debugging can
      // see secondary fire outcomes alongside the primary result.
      primary: primaryResult,
      secondaries: secondaryResults,
    });

  } catch (error) {
    console.error('[Meta CAPI] System Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

