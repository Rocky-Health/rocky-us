import { fetchProductVariations } from '@/lib/api/productVariations';
import { logger } from '@/utils/devLogger';

/**
 * Product Data Extractor with Variation Support
 * 
 * This module provides functions to extract and transform WooCommerce product data,
 * including support for fetching and processing product variations from the server.
 * 
 * IMPORTANT: Variation data is only fetched for variable products to optimize performance.
 * Simple products will skip the variation API call entirely.
 * 
 * Usage Examples:
 * 
 * 1. Basic product extraction (without variations):
 *    const product = extractProductData(rawProductData);
 * 
 * 2. Product extraction with variations (only for variable products):
 *    const variationData = await fetchProductVariationData(productId, productType);
 *    const product = extractProductData(rawProductData, variationData);
 *    // Access variation details: product.variationData.variationDetails[variationId]
 * 
 * 3. Transform multiple products with variations (auto-detects variable products):
 *    const products = await transformProductsArray(rawProductsArray, true);
 * 
 * 4. Transform single product with variations (auto-detects variable products):
 *    const product = await transformSingleProduct(rawProductData, true);
 * 
 * 5. Accessing variation details in components:
 *    const product = await transformSingleProduct(rawProductData, true);
 *    if (product.variationData.hasVariations) {
 *        Object.values(product.variationData.variationDetails).forEach(variation => {
 *            console.log(`Variation: ${variation.name}`);
 *            console.log(`Regular Price: $${variation.regular_price}`);
 *            console.log(`Sale Price: ${variation.sale_price ? '$' + variation.sale_price : 'N/A'}`);
 *            console.log(`Sale Percentage: ${variation.sale_percentage}%`);
 *            console.log(`Stock Status: ${variation.stock_status}`);
 *            console.log(`In Stock: ${variation.in_stock}`);
 *        });
 *    }
 * 
 * 6. Using the sale percentage helper function:
 *    import { calculateSalePercentage } from './productExtractor';
 *    const discount = calculateSalePercentage(100, 80); // Returns 20
 */

/**
 * Helper function to strip HTML tags from text
 * @param {string} htmlString - String containing HTML tags
 * @returns {string} Clean text without HTML tags
 */
const stripHtmlTags = (htmlString) => {
    if (!htmlString) return '';
    return htmlString.replace(/<[^>]*>/g, '').trim();
};

/**
 * Helper function to calculate sale percentage
 * @param {number} regularPrice - The regular price
 * @param {number|null} salePrice - The sale price (null if no sale)
 * @returns {number} Sale percentage (0 if no sale)
 */
export const calculateSalePercentage = (regularPrice, salePrice) => {
    if (!salePrice || regularPrice <= 0) return 0;
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
};

/**
 * Fetches and processes variation data for a product (only for variable products)
 * @param {string} productId - The product ID
 * @param {string} productType - The product type (e.g., 'variable', 'simple')
 * @returns {Promise<Object>} Processed variation data
 */
export const fetchProductVariationData = async (productId, productType = null) => {
    try {
        // If product type is provided and it's not a variable product, skip fetching
        if (productType && !productType.includes('variable')) {
            logger.log(`Skipping variation fetch for product ${productId} (type: ${productType}) - not a variable product`);
            return {
                hasVariations: false,
                variations: [],
                variationPrices: {},
                variationImages: {},
                variationAttributes: {},
                variationDetails: {},
                formattedVariations: []
            };
        }

        const variationData = await fetchProductVariations(productId);

        if (!variationData || !variationData.isVariableProduct) {
            return {
                hasVariations: false,
                variations: [],
                variationPrices: {},
                variationImages: {},
                variationAttributes: {},
                variationDetails: {},
                formattedVariations: []
            };
        }

        // Process variations to extract useful data
        const variations = variationData.allVariations || [];
        const variationPrices = {};
        const variationImages = {};
        const variationAttributes = {};
        const variationDetails = {};

        variations.forEach(variation => {
            const variationId = variation.id;

            // Store detailed price information
            variationPrices[variationId] = {
                price: parseFloat(variation.price || 0),
                regular_price: parseFloat(variation.regular_price || variation.price || 0),
                sale_price: variation.sale_price ? parseFloat(variation.sale_price) : null
            };

            // Store image information
            if (variation.image && variation.image.src) {
                variationImages[variationId] = {
                    src: variation.image.src,
                    alt: variation.image.alt || '',
                    title: variation.image.title || ''
                };
            }

            // Store attribute information
            variationAttributes[variationId] = variation.attributes || [];

            // Calculate sale percentage
            const regularPrice = parseFloat(variation.regular_price || variation.price || 0);
            const salePrice = variation.sale_price ? parseFloat(variation.sale_price) : null;
            const salePercentage = calculateSalePercentage(regularPrice, salePrice);

            // Store detailed variation information for components
            variationDetails[variationId] = {
                id: variationId,
                name: variation.name || '', // Variation name
                regular_price: regularPrice,
                sale_price: salePrice,
                sale_percentage: salePercentage, // Calculated sale percentage
                stock_status: variation.stock_status || 'instock', // Stock status
                price: parseFloat(variation.price || 0),
                sku: variation.sku || '',
                description: variation.description || '',
                image: variation.image ? {
                    src: variation.image.src,
                    alt: variation.image.alt || '',
                    title: variation.image.title || ''
                } : null,
                attributes: variation.attributes || [],
                purchasable: variation.purchasable || true,
                in_stock: variation.stock_status === 'instock'
            };
        });

        return {
            hasVariations: true,
            variations: variations,
            variationPrices: variationPrices,
            variationImages: variationImages,
            variationAttributes: variationAttributes,
            variationDetails: variationDetails, // Detailed variation info for components
            formattedVariations: variationData.formattedVariations || []
        };
    } catch (error) {
        logger.error(`Error fetching variation data for product ${productId}:`, error);
        return {
            hasVariations: false,
            variations: [],
            variationPrices: {},
            variationImages: {},
            variationAttributes: {},
            variationDetails: {},
            formattedVariations: []
        };
    }
};

/**
 * Extracts and transforms WooCommerce product data into a standardized format
 * @param {Object} productData - Raw WooCommerce product data
 * @param {Object} variationData - Optional variation data (if already fetched)
 * @returns {Object} Transformed product data with required attributes
 */
export const extractProductData = (productData, variationData = null) => {
    if (!productData) return null;

    // Extract images from the product data
    const images = productData.images?.map(img => img.src) || [];

    // Get the first image as the main image
    const mainImage = images[0] || '/placeholder.png';

    // Extract price information based on product type
    const isVariable = productData.type === 'variable';
    const regularPrice = productData.regular_price ? parseFloat(productData.regular_price) : 0;
    const salePrice = productData.sale_price ? parseFloat(productData.sale_price) : null;
    const basePrice = productData.price ? parseFloat(productData.price) : 0;

    // For variable products, use price field; for simple products, use regular_price field
    const displayPrice = salePrice || (isVariable ? basePrice : regularPrice);

    const attributes = productData.attributes || [];

    const sizeAttribute = attributes.find(attr =>
        attr.name.toLowerCase().includes('size') ||
        attr.name.toLowerCase().includes('pa_size')
    );
    const colorAttribute = attributes.find(attr =>
        attr.name.toLowerCase().includes('color') ||
        attr.name.toLowerCase().includes('pa_color')
    );

    // Sort sizes from small to XL for better UX
    const sortSizes = (sizes) => {
        const order = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size", "One Size Fits All"];
        return sizes.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    };

    const sizes = sortSizes(sizeAttribute?.options || ['One Size Fits All']);
    const colors = colorAttribute?.options?.map(color => ({
        name: color.toLowerCase(),
        value: getColorValue(color)
    })) || [{ name: 'default', value: '#000000' }];


    // Process variation data if provided
    const processedVariationData = variationData || {
        hasVariations: false,
        variations: [],
        variationPrices: {},
        variationImages: {},
        variationAttributes: {},
        variationDetails: {},
        formattedVariations: []
    };

    return {
        id: productData.id,
        name: productData.name,
        slug: productData.slug,
        description: stripHtmlTags(productData.description) || '',
        short_description: stripHtmlTags(productData.short_description) || '',
        images: images,
        image: mainImage,
        regular_price: regularPrice,
        sale_price: salePrice,
        base_price: basePrice,
        price: displayPrice,
        sizes: sizes,
        colors: colors,
        // Product type and variations
        type: productData.type || 'simple',
        variations: productData.variations || [],
        has_variations: processedVariationData.hasVariations || (productData.variations && productData.variations.length > 0) || false,
        // Enhanced variation data
        variationData: {
            hasVariations: processedVariationData.hasVariations,
            variations: processedVariationData.variations, // Raw variation data from API
            variationPrices: processedVariationData.variationPrices, // {variationId: {price, regular_price, sale_price}}
            variationImages: processedVariationData.variationImages, // {variationId: {src, alt, title}}
            variationAttributes: processedVariationData.variationAttributes, // {variationId: [attributes]}
            variationDetails: processedVariationData.variationDetails, // {variationId: {name, regular_price, sale_price, sale_percentage, stock_status, sku, description, image, attributes, purchasable, in_stock}}
            formattedVariations: processedVariationData.formattedVariations // Formatted variations for cart/display
        },
        // Additional fields that might be useful
        material: extractMaterial(productData),
        fit: 'true to size', // Default value
        modelInfo: '', // Default empty
        sizeChart: generateSizeChart(sizes),
        detailedDescription: stripHtmlTags(productData.description) || stripHtmlTags(productData.short_description) || ''
    };
};

/**
 * Helper function to get color hex value from color name
 * @param {string} colorName - Name of the color
 * @returns {string} Hex color value
 */
const getColorValue = (colorName) => {
    const colorMap = {
        'black': '#000000',
        'white': '#FFFFFF',
        'red': '#FF0000',
        'blue': '#0000FF',
        'green': '#008000',
        'yellow': '#FFFF00',
        'orange': '#FFA500',
        'purple': '#800080',
        'pink': '#FFC0CB',
        'gray': '#808080',
        'grey': '#808080',
        'brown': '#A52A2A',
        'navy': '#000080',
        'maroon': '#800000',
        'olive': '#808000',
        'teal': '#008080',
        'silver': '#C0C0C0',
        'gold': '#FFD700'
    };

    return colorMap[colorName.toLowerCase()] || '#000000';
};

/**
 * Helper function to extract material information from product data
 * @param {Object} productData - Raw product data
 * @returns {string} Material description
 */
const extractMaterial = (productData) => {
    // Try to find material in description or attributes
    const description = stripHtmlTags(productData.description || '').toLowerCase();
    const shortDesc = stripHtmlTags(productData.short_description || '').toLowerCase();

    if (description.includes('cotton') || shortDesc.includes('cotton')) {
        return '100% cotton';
    }
    if (description.includes('polyester') || shortDesc.includes('polyester')) {
        return '100% polyester';
    }
    if (description.includes('wool') || shortDesc.includes('wool')) {
        return '100% wool';
    }
    if (description.includes('silk') || shortDesc.includes('silk')) {
        return '100% silk';
    }

    return 'Premium materials'; // Default
};

/**
 * Helper function to generate size chart based on available sizes
 * @param {Array} sizes - Array of available sizes
 * @returns {Object} Size chart object
 */
const generateSizeChart = (sizes) => {
    const sizeChart = {};

    sizes.forEach(size => {
        if (size === 'One Size Fits All') {
            sizeChart[size] = 'Adjustable fit';
        } else if (size === 'S') {
            sizeChart[size] = 'Chest: 39"';
        } else if (size === 'M') {
            sizeChart[size] = 'Chest: 42"';
        } else if (size === 'L') {
            sizeChart[size] = 'Chest: 45"';
        } else if (size === 'XL') {
            sizeChart[size] = 'Chest: 48"';
        } else if (size === 'XXL') {
            sizeChart[size] = 'Chest: 51"';
        } else {
            // Generate generic size chart entries for other sizes
            sizeChart[size] = `Size ${size}`;
        }
    });

    return sizeChart;
};

/**
 * Transforms an array of WooCommerce products into the featured products format
 * @param {Array} products - Array of raw WooCommerce product data
 * @param {boolean} includeVariations - Whether to fetch variation data for each product
 * @returns {Array|Promise<Array>} Array of transformed product data (Promise if includeVariations is true)
 */
export const transformProductsArray = async (products, includeVariations = false) => {
    if (!Array.isArray(products)) return [];

    if (!includeVariations) {
        // Synchronous processing without variations
        return products
            .map(product => extractProductData(product))
            .filter(product => product !== null);
    }

    // Asynchronous processing with variations (only for variable products)
    const transformedProducts = await Promise.all(
        products.map(async (product) => {
            try {
                // Check if product is variable before fetching variation data
                const productType = product.type || 'simple';
                const isVariableProduct = productType.includes('variable');

                let variationData = null;
                if (isVariableProduct) {
                    // Only fetch variation data for variable products
                    variationData = await fetchProductVariationData(product.id, productType);
                }

                // Extract product data with variation information (if available)
                return extractProductData(product, variationData);
            } catch (error) {
                logger.error(`Error processing product ${product.id}:`, error);
                // Fallback to basic product data without variations
                return extractProductData(product);
            }
        })
    );

    return transformedProducts.filter(product => product !== null);
};

/**
 * Transforms a single product with variation data (only for variable products)
 * @param {Object} product - Raw WooCommerce product data
 * @param {boolean} includeVariations - Whether to fetch variation data
 * @returns {Object|Promise<Object>} Transformed product data (Promise if includeVariations is true)
 */
export const transformSingleProduct = async (product, includeVariations = false) => {
    if (!product) return null;

    if (!includeVariations) {
        return extractProductData(product);
    }

    try {
        // Check if product is variable before fetching variation data
        const productType = product.type || 'simple';
        const isVariableProduct = productType.includes('variable');

        let variationData = null;
        if (isVariableProduct) {
            // Only fetch variation data for variable products
            variationData = await fetchProductVariationData(product.id, productType);
        }

        return extractProductData(product, variationData);
    } catch (error) {
        logger.error(`Error processing product ${product.id}:`, error);
        return extractProductData(product);
    }
};
