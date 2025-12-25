import { NextResponse } from 'next/server';
import { getGatewayConfig, getGatewayUrl } from '@/utils/metaCapiConfig';
import { hashEmail, hashPhone, hashSHA256 } from '@/utils/analytics/hashServerSide';
import { processMetaParameters } from '@/lib/meta/paramBuilderHelper';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

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
    const payload = await req.json();
    let { 
      order_id, 
      gateway, 
      value, 
      subtotal,
      net_subtotal,
      shipping,
      tax,
      discount,
      currency, 
      content_ids, 
      num_items, 
      order_data 
    } = payload;

    // Validate gateway
    const gatewayConfig = getGatewayConfig(gateway);
    if (!gatewayConfig || !gatewayConfig.accessToken) {
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
    let country = billing.country || 'CA';

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
    const external_id = order_data.customer_id ? hashSHA256(order_data.customer_id.toString()) : '';

    // Client Info
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || '';
    const userAgent = req.headers.get('user-agent') || '';

    // Process Meta parameters (fbp, fbc)
    const metaParams = await processMetaParameters(req);

    // Build event_source_url
    const eventSourceUrl = `https://myrocky.com/checkout/order-received/${order_id}`;

    // Generate stable event_id for deduplication
    const eventId = `purchase_${order_id}_${gateway}`;

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
      value: parseFloat(value),
      currency: currency || 'CAD',
      content_ids: content_ids || [],
      content_type: 'item',
      num_items: num_items || 0,
      order_id: `${order_id}-${gateway}`,
      rky_cat: gateway
    };

    // Add cost breakdown if available
    if (subtotal !== undefined) customData.subtotal = parseFloat(subtotal);
    if (shipping !== undefined) customData.shipping = parseFloat(shipping);
    if (tax !== undefined) customData.tax = parseFloat(tax);
    if (discount !== undefined) customData.discount = parseFloat(discount);

    // Build Meta CAPI event payload
    const eventPayload = {
      event_name: gatewayConfig.customEventName, // Cryptic event name (e.g., RKY_TNT)
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: eventSourceUrl,
      action_source: 'website',
      user_data: userData,
      custom_data: customData
    };

    console.log(`[Meta CAPI] Sending event for order ${order_id} to ${gateway}:`, {
      pixel_id: gatewayConfig.pixelId,
      event_name: eventPayload.event_name,
      value: eventPayload.custom_data.value,
      has_fbp: !!userData.fbp,
      has_fbc: !!userData.fbc,
      has_gender: !!ge,
      has_dob: !!db
    });

    // Send to Meta Graph API
    const metaUrl = getGatewayUrl(gateway);
    
    const sendEvent = async (attempt = 1) => {
      try {
        const response = await fetch(metaUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            access_token: gatewayConfig.accessToken,
            data: [eventPayload]
          })
        });

        if (!response.ok) {
          const text = await response.text();
          console.error(`[Meta CAPI] HTTP Error ${gateway} (attempt ${attempt}):`, {
            status: response.status,
            statusText: response.statusText,
            body: text
          });
          
          // Retry once on failure
          if (attempt === 1) {
            console.log(`[Meta CAPI] Retrying ${gateway}...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return sendEvent(2);
          }
          
          throw new Error(`Meta API returned ${response.status}: ${text.substring(0, 200)}`);
        }

        const data = await response.json();

        if (data.error) {
          console.error(`[Meta CAPI] Error ${gateway}:`, data.error);
          return NextResponse.json({ 
            success: false, 
            error: data.error.message || 'Meta API error' 
          }, { status: 400 });
        }

        console.log(`[Meta CAPI] ✅ Success ${gateway}:`, {
          event_id: eventId,
          events_received: data.events_received || 0,
          fbtrace_id: data.fbtrace_id
        });

        return NextResponse.json({
          success: true,
          gateway,
          event_id: eventId,
          events_received: data.events_received || 0,
          fbtrace_id: data.fbtrace_id
        });
      } catch (error) {
        if (attempt === 1) {
          console.log(`[Meta CAPI] Retrying ${gateway} after error...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return sendEvent(2);
        }
        throw error;
      }
    };

    return await sendEvent();

  } catch (error) {
    console.error('[Meta CAPI] System Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

