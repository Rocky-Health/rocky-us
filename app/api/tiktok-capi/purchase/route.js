import { NextResponse } from 'next/server';
import { getTikTokGatewayConfig, getTikTokEndpoint } from '@/utils/tiktokCapiConfig';
import { hashEmail, hashPhone, hashSHA256 } from '@/utils/analytics/hashServerSide';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL;
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

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
    console.error(`[TikTok CAPI] Error fetching order ${orderId}:`, error.message);
    return null;
  }
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
    console.warn(`[TikTok CAPI] Could not fetch customer profile:`, error.message);
    return null;
  }
};

export async function POST(req) {
  try {
    const payload = await req.json();
    let { order_id, gateway, value, currency, contents, order_data } = payload;

    const gatewayConfig = getTikTokGatewayConfig(gateway);
    
    if (!order_data?.billing || !order_data?.line_items) {
      console.log(`[TikTok CAPI] Fetching order ${order_id} from WooCommerce...`);
      order_data = await fetchOrderFromWooCommerce(order_id);
      
      if (!order_data) {
        return NextResponse.json(
          { error: 'Could not fetch order from WooCommerce' },
          { status: 500 }
        );
      }
    }
    
    const billing = order_data?.billing || {};
    let userEmail = billing.email || '';
    let userPhone = billing.phone || '';
    
    // Fetch customer profile data if registered user
    let customerData = null;
    if (order_data?.customer_id && order_data.customer_id > 0) {
      customerData = await fetchCustomerProfile(order_data.customer_id);
    }
    
    // Enhance phone from customer profile if missing
    if (!userPhone && customerData?.billing?.phone) {
      userPhone = customerData.billing.phone;
    }
    
    // Hash user data
    const email = hashEmail(userEmail);
    const phone = hashPhone(userPhone, 'CA');
    const external_id = order_data.customer_id ? hashSHA256(order_data.customer_id.toString()) : '';
    
    // Client Info
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '';
    const user_agent = req.headers.get('user-agent') || '';
    
    // Extract TikTok cookies
    const cookieHeader = req.headers.get('cookie') || '';
    const getCookie = (name) => {
        const match = cookieHeader.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };
    const ttp = getCookie('_ttp');
    const ttclid = getCookie('ttclid');

    // Build page URL
    const pageUrl = `https://www.myrocky.com/checkout/order-received/${order_id}`;

    // Build user context
    const userContext = {};
    
    if (email && email.length > 0) userContext.email = email;
    if (phone && phone.length > 0) userContext.phone_number = phone;
    if (external_id && external_id.length > 0) userContext.external_id = external_id;
    if (ip && ip.length > 0) userContext.ip = ip;
    if (user_agent && user_agent.length > 0) userContext.user_agent = user_agent;
    if (ttp && ttp.length > 0) userContext.ttp = ttp;

    // Build context object
    const contextObj = {
      page: {
        url: pageUrl
      },
      user: userContext
    };
    
    // Add ad context if we have ttclid
    if (ttclid && ttclid.length > 0) {
      contextObj.ad = {
        callback: ttclid
      };
    }

    // TikTok Events API v1.3 Payload
    const eventPayload = {
      pixel_code: gatewayConfig.pixelId,
      event: gatewayConfig.eventName, // 'CompletePayment'
      event_id: `purchase_${order_id}_${gateway}`,
      timestamp: new Date().toISOString(),
      context: contextObj,
      properties: {
        contents: contents || [],
        currency: currency || 'CAD',
        value: parseFloat(value)
      }
    };

    console.log(`[TikTok CAPI] Sending event for order ${order_id} to ${gateway}:`, {
      pixel_code: eventPayload.pixel_code,
      event: eventPayload.event,
      value: eventPayload.properties.value,
      has_ttclid: !!eventPayload.context.ad?.callback
    });

    // Send to TikTok
    const response = await fetch(getTikTokEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': gatewayConfig.accessToken
      },
      body: JSON.stringify(eventPayload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[TikTok CAPI] HTTP Error ${gateway}:`, {
        status: response.status,
        statusText: response.statusText,
        body: text
      });
      throw new Error(`TikTok API returned ${response.status}: ${text.substring(0, 200)}`);
    }

    const data = await response.json();

    if (data.code !== 0) {
        console.error(`[TikTok CAPI] Error ${gateway}:`, data);
        return NextResponse.json({ success: false, error: data.message }, { status: 400 });
    }

    console.log(`[TikTok CAPI] ✅ Success ${gateway}:`, {
      event_id: eventPayload.event_id,
      response: data
    });

    return NextResponse.json({
      success: true,
      gateway,
      event_id: eventPayload.event_id
    });

  } catch (error) {
    console.error('[TikTok CAPI] System Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

