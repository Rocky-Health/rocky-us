/**
 * Capture fbclid from URL and store as _fbc cookie
 * Format of _fbc cookie: fb.{subdomain_index}.{creation_time}.{fbclid}
 */
export function captureMetaParameters() {
  if (typeof window === 'undefined') {
    return { fbp: '', fbc: '', fbclid: '' };
  }

  try {
    const params = new URLSearchParams(window.location.search || '');
    const fbclid = params.get('fbclid');
    const hostname = window.location.hostname;

    const domain = getETLDPlusOne(hostname);

    const existingFbp = getCookie('_fbp');
    const existingFbc = getCookie('_fbc');

    let fbp = existingFbp;
    if (!fbp) {
      const creationTime = Date.now();
      const subdomainIndex = '1';
      fbp = `fb.${subdomainIndex}.${creationTime}`;
      
      setCookie('_fbp', fbp, domain, 90);
      console.log('[Meta Helper] Generated new _fbp:', fbp);
    }

    let fbc = existingFbc;
    if (fbclid) {
      const existingFbclid = existingFbc ? existingFbc.split('.').pop() : '';
      
      if (fbclid !== existingFbclid) {
        const clickTime = Date.now();
        const subdomainIndex = '1';
        fbc = `fb.${subdomainIndex}.${clickTime}.${fbclid}`;
        
        setCookie('_fbc', fbc, domain, 7);
        console.log('[Meta Helper] Captured fbclid and set _fbc:', fbc);
      }
    }

    return {
      fbp: fbp || '',
      fbc: fbc || '',
      fbclid: fbclid || ''
    };
  } catch (error) {
    console.error('[Meta Helper] Error capturing Meta parameters:', error);
    return { fbp: '', fbc: '', fbclid: '' };
  }
}

function getCookie(name) {
  if (typeof document === 'undefined') return '';
  
  try {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(row => row.startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : '';
  } catch (error) {
    return '';
  }
}

function setCookie(name, value, domain, days) {
  try {
    const maxAge = days * 24 * 60 * 60;
    
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
    } else {
      document.cookie = `${name}=${value};path=/;max-age=${maxAge};domain=${domain};SameSite=Lax;Secure`;
      document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax;Secure`;
    }
  } catch (error) {
    console.error('[Meta Helper] Error setting cookie:', error);
  }
}

function getETLDPlusOne(hostname) {
  try {
    hostname = hostname.split(':')[0];
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return hostname;
    }
    
    const parts = hostname.split('.');
    
    if (parts.length <= 2) {
      return hostname;
    }
    
    return parts.slice(-2).join('.');
  } catch (error) {
    return hostname;
  }
}

export function initializeMetaCookies() {
  if (typeof window === 'undefined') return;
  
  captureMetaParameters();
  
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('popstate', () => {
      setTimeout(() => captureMetaParameters(), 100);
    });
  }
}

