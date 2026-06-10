import axios from 'axios';

const fetchProductDetails = async (productId) => {
  try {
    // Use absolute URL for client-side calls, relative for server-side
    const isServer = typeof window === 'undefined';
    const BASE_URL = isServer 
      ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.myrocky.com')
      : '';
    
    const url = `${BASE_URL}/api/products/id/${productId}`;
    
    console.log(`[EnrichOrder] Fetching product ${productId} from ${url}`);
    
    const response = await axios.get(url, { 
      timeout: 5000,
      headers: isServer ? {} : { 'Content-Type': 'application/json' }
    });
    
    if (response.data && response.data.categories) {
      console.log(`[EnrichOrder] Product ${productId} categories:`, 
        response.data.categories.map(c => c.slug || c.name).join(', '));
    } else {
      console.warn(`[EnrichOrder] Product ${productId} has NO categories`);
    }
    
    return response.data;
  } catch (error) {
    console.error(`[EnrichOrder] Error fetching product ${productId}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return null;
  }
};

const enrichLineItem = async (lineItem) => {
  // Check if already has categories
  if (lineItem.categories && Array.isArray(lineItem.categories) && lineItem.categories.length > 0) {
    console.log(`[EnrichOrder] Line item ${lineItem.id} already has categories:`, 
      lineItem.categories.map(c => c.slug || c.name).join(', '));
    if (!lineItem.category) {
      lineItem.category = lineItem.categories[0]?.name || 'General';
    }
    return lineItem;
  }

  console.log(`[EnrichOrder] Fetching details for line item ${lineItem.id}, product ${lineItem.product_id}`);

  const productDetails = await fetchProductDetails(lineItem.product_id);

  if (!productDetails || !productDetails.categories || productDetails.categories.length === 0) {
    console.warn(`[EnrichOrder] Failed to enrich line item ${lineItem.id} - no product details or categories`);
    return {
      ...lineItem,
      categories: [],
      category: 'General'
    };
  }

  const enriched = {
    ...lineItem,
    sku: lineItem.sku || productDetails.sku,
    categories: productDetails.categories || [],
    category: productDetails.categories?.[0]?.name || 'General'
  };

  console.log(`[EnrichOrder] ✅ Enriched line item ${lineItem.id} with ${enriched.categories.length} categories`);

  return enriched;
};

export const enrichOrderWithProductData = async (order, options = {}) => {
  const { force = false, debug = true } = options;

  if (!order || !order.id) {
    console.warn('[EnrichOrder] No order or order.id provided');
    return order;
  }

  console.log(`[EnrichOrder] Starting enrichment for order ${order.id}, ${order.line_items?.length || 0} line items`);

  const alreadyEnriched = order.line_items?.every(
    item => item.categories && Array.isArray(item.categories) && item.categories.length > 0
  );

  if (alreadyEnriched && !force) {
    console.log(`[EnrichOrder] Order ${order.id} already enriched, skipping`);
    return order;
  }

  try {
    const enrichedLineItems = await Promise.all(
      (order.line_items || []).map(item => enrichLineItem(item))
    );

    const enrichedOrder = {
      ...order,
      line_items: enrichedLineItems,
      _enriched: true,
      _enrichment_timestamp: Date.now()
    };

    const enrichedCount = enrichedLineItems.filter(
      item => item.categories && item.categories.length > 0
    ).length;

    console.log(`[EnrichOrder] ✅ Enrichment complete for order ${order.id}: ${enrichedCount}/${enrichedLineItems.length} items have categories`);

    return enrichedOrder;
  } catch (error) {
    console.error(`[EnrichOrder] Error enriching order ${order.id}:`, error);
    // Return original order on error rather than failing completely
    return order;
  }
};

