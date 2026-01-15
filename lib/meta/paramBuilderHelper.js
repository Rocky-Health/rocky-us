import { ParamBuilder } from 'capi-param-builder-nodejs';

const DOMAINS = ['myrocky.com', 'myrocky.ca', 'localhost'];

const buildFbc = (fbclid, timestamp = Date.now(), subdomainIndex = '1') => {
  if (!fbclid) return '';
  return `fb.${subdomainIndex}.${timestamp}.${fbclid}`;
};

export async function processMetaParameters(request, overrides = {}) {
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

    const overrideFbp = typeof overrides.fbp === 'string' ? overrides.fbp : '';
    const overrideFbc = typeof overrides.fbc === 'string' ? overrides.fbc : '';
    const overrideFbclid = typeof overrides.fbclid === 'string' ? overrides.fbclid : '';
    const fbclid = overrideFbclid || queryParams.fbclid || '';

    const fbp = overrideFbp || paramBuilder.getFbp(cookies) || '';
    let fbc = overrideFbc || paramBuilder.getFbc(cookies) || '';
    if (!fbc && fbclid) {
      fbc = buildFbc(fbclid);
    }

    return {
      fbp,
      fbc,
      fbclid,
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

