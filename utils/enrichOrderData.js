import axios from 'axios';

const fetchProductDetails = async (productId) => {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://myrocky.com';
    const response = await axios.get(
      `${BASE_URL}/api/products/id/${productId}`,
      { timeout: 5000 }
    );
    return response.data;
  } catch (error) {
    console.warn(`[EnrichOrder] Error fetching product ${productId}:`, error.message);
    return null;
  }
};

const enrichLineItem = async (lineItem) => {
  if (lineItem.categories && Array.isArray(lineItem.categories) && lineItem.categories.length > 0) {
    if (!lineItem.category) {
      lineItem.category = lineItem.categories[0]?.name || 'General';
    }
    return lineItem;
  }

  const productDetails = await fetchProductDetails(lineItem.product_id);

  if (!productDetails) {
    return {
      ...lineItem,
      categories: [],
      category: 'General'
    };
  }

  return {
    ...lineItem,
    sku: lineItem.sku || productDetails.sku,
    categories: productDetails.categories || [],
    category: productDetails.categories?.[0]?.name || 'General'
  };
};

export const enrichOrderWithProductData = async (order, options = {}) => {
  const { force = false, debug = true } = options;

  if (!order || !order.id) {
    return order;
  }

  const alreadyEnriched = order.line_items?.every(
    item => item.categories && Array.isArray(item.categories) && item.categories.length > 0
  );

  if (alreadyEnriched && !force) {
    return order;
  }

  const enrichedLineItems = await Promise.all(
    (order.line_items || []).map(item => enrichLineItem(item))
  );

  return {
    ...order,
    line_items: enrichedLineItems,
    _enriched: true,
    _enrichment_timestamp: Date.now()
  };
};

