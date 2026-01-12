import { ParamBuilder } from 'capi-param-builder-nodejs';

const DOMAINS = ['myrocky.com', 'myrocky.ca', 'localhost'];

export async function processMetaParameters(request) {
  try {
    const paramBuilder = new ParamBuilder(DOMAINS);

    const host = request.headers.get('host') || '';
    const url = new URL(request.url);
    
    const queryParams = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = {};
    
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [key, ...valueParts] = cookie.split('=');
        if (key && valueParts.length > 0) {
          cookies[key.trim()] = valueParts.join('=').trim();
        }
      });
    }

    const referer = request.headers.get('referer') || '';

    const updatedCookies = paramBuilder.processRequest(
      host,
      queryParams,
      cookies,
      referer
    );

    const fbp = paramBuilder.getFbp(cookies) || '';
    const fbc = paramBuilder.getFbc(cookies) || '';

    return {
      fbp,
      fbc,
      updatedCookies,
      processed: true
    };
  } catch (error) {
    console.error('[ParamBuilder] Error processing Meta parameters:', error);
    
    const cookieHeader = request.headers.get('cookie') || '';
    const fbp = cookieHeader.match(/_fbp=([^;]+)/)?.[1] || '';
    const fbc = cookieHeader.match(/_fbc=([^;]+)/)?.[1] || '';
    
    return {
      fbp,
      fbc,
      updatedCookies: [],
      processed: false,
      error: error.message
    };
  }
}

