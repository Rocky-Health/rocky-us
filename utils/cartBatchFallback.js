import { logger } from "@/utils/devLogger";

/**
 * Utility functions for intelligent cart batch fallback strategies
 * Handles scenarios where batch operations fail and individual calls are needed
 */

/**
 * Process items individually with intelligent delays and error handling
 * @param {Array} items - Array of cart items to process
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Results of individual processing
 */
export const processItemsIndividuallyWithFallback = async (
  items,
  options = {}
) => {
  const {
    endpoint = "/api/cart/add-item",
    delayBetweenRequests = 100, // ms delay between requests
    maxRetries = 2,
    onProgress = null, // callback for progress updates
    headers = { "Content-Type": "application/json" },
  } = options;

  const results = [];
  let successfulItems = 0;
  let failedItems = 0;

  logger.log(
    `Starting individual processing for ${items.length} items with ${delayBetweenRequests}ms delays`
  );

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let attempts = 0;
    let success = false;

    while (attempts < maxRetries && !success) {
      try {
        attempts++;

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: items.length,
            item: item,
            attempt: attempts,
            status: "processing",
          });
        }

        logger.log(
          `Processing item ${i + 1}/${items.length} (attempt ${attempts}): ${
            item.productId
          }`
        );

        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        results.push({
          status: "success",
          item: item,
          result: result,
          attempts: attempts,
        });

        successfulItems++;
        success = true;

        logger.log(
          `✅ Item ${i + 1} added successfully (${attempts} attempts)`
        );

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: items.length,
            item: item,
            attempt: attempts,
            status: "success",
          });
        }
      } catch (error) {
        logger.error(
          `❌ Attempt ${attempts} failed for item ${i + 1}:`,
          error.message
        );

        if (attempts >= maxRetries) {
          // Final failure
          results.push({
            status: "error",
            item: item,
            error: error.message,
            attempts: attempts,
          });
          failedItems++;

          if (onProgress) {
            onProgress({
              current: i + 1,
              total: items.length,
              item: item,
              attempt: attempts,
              status: "failed",
              error: error.message,
            });
          }
        } else {
          // Wait longer before retry (exponential backoff)
          const retryDelay = delayBetweenRequests * Math.pow(2, attempts - 1);
          logger.log(`⏳ Retrying in ${retryDelay}ms...`);
          await sleep(retryDelay);
        }
      }
    }

    // Add delay between items to avoid overwhelming the server
    if (i < items.length - 1) {
      await sleep(delayBetweenRequests);
    }
  }

  const summary = {
    success: successfulItems > 0,
    total_items: items.length,
    successful_items: successfulItems,
    failed_items: failedItems,
    results: results,
    message:
      failedItems > 0
        ? `Individual processing completed: ${successfulItems}/${items.length} items added`
        : `All ${successfulItems} items added successfully via individual processing`,
  };

  logger.log(`Individual processing summary:`, {
    success: summary.success,
    total_items: summary.total_items,
    successful_items: summary.successful_items,
    failed_items: summary.failed_items,
  });
  return summary;
};

/**
 * Determine optimal fallback strategy based on error type and context
 * @param {Object} batchError - The error from batch processing
 * @param {Array} items - Items that failed in batch
 * @returns {Object} Recommended fallback strategy
 */
export const determineFallbackStrategy = (batchError, items) => {
  const itemCount = items.length;

  // Default strategy
  let strategy = {
    method: "individual",
    delayBetweenRequests: 100,
    maxRetries: 2,
    splitIntoChunks: false,
    chunkSize: 1,
  };

  // Analyze error type and adjust strategy
  if (batchError.response?.status === 429) {
    // Rate limiting - use longer delays
    strategy.delayBetweenRequests = 1000;
    strategy.maxRetries = 3;
    logger.log("Rate limiting detected - using longer delays");
  } else if (batchError.response?.status === 413 || itemCount > 50) {
    // Payload too large or many items - consider chunking
    strategy.splitIntoChunks = true;
    strategy.chunkSize = Math.min(10, Math.ceil(itemCount / 5));
    logger.log(
      `Large payload detected - splitting into chunks of ${strategy.chunkSize}`
    );
  } else if (batchError.response?.data?.code?.includes("nonce")) {
    // Nonce errors - minimal delays, fewer retries
    strategy.delayBetweenRequests = 50;
    strategy.maxRetries = 1;
    logger.log("Nonce error detected - using minimal delays");
  } else if (itemCount > 20) {
    // Many items - moderate delays to be server-friendly
    strategy.delayBetweenRequests = 200;
    logger.log("Many items detected - using moderate delays");
  }

  return strategy;
};

/**
 * Split items into smaller chunks for processing
 * @param {Array} items - Items to split
 * @param {number} chunkSize - Size of each chunk
 * @returns {Array} Array of item chunks
 */
export const chunkItems = (items, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Process items in chunks with delays between chunks
 * @param {Array} items - Items to process
 * @param {Object} strategy - Processing strategy
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Combined results
 */
export const processInChunks = async (items, strategy, options = {}) => {
  const chunks = chunkItems(items, strategy.chunkSize);
  const allResults = [];
  let totalSuccessful = 0;
  let totalFailed = 0;

  logger.log(
    `Processing ${items.length} items in ${chunks.length} chunks of ${strategy.chunkSize}`
  );

  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];

    logger.log(
      `Processing chunk ${chunkIndex + 1}/${chunks.length} (${
        chunk.length
      } items)`
    );

    const chunkResult = await processItemsIndividuallyWithFallback(chunk, {
      ...options,
      delayBetweenRequests: strategy.delayBetweenRequests,
      maxRetries: strategy.maxRetries,
    });

    allResults.push(...chunkResult.results);
    totalSuccessful += chunkResult.successful_items;
    totalFailed += chunkResult.failed_items;

    // Add delay between chunks
    if (chunkIndex < chunks.length - 1) {
      const chunkDelay = strategy.delayBetweenRequests * 2;
      logger.log(`⏳ Waiting ${chunkDelay}ms before next chunk...`);
      await sleep(chunkDelay);
    }
  }

  return {
    success: totalSuccessful > 0,
    total_items: items.length,
    successful_items: totalSuccessful,
    failed_items: totalFailed,
    results: allResults,
    chunks_processed: chunks.length,
    message: `Chunk processing completed: ${totalSuccessful}/${items.length} items added in ${chunks.length} chunks`,
  };
};

/**
 * Sleep utility function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Main intelligent fallback function
 * @param {Array} items - Items to process
 * @param {Object} batchError - Original batch error
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processing results
 */
export const intelligentFallback = async (items, batchError, options = {}) => {
  logger.log("🔄 Starting intelligent fallback processing...");

  const strategy = determineFallbackStrategy(batchError, items);

  if (strategy.splitIntoChunks) {
    return await processInChunks(items, strategy, options);
  } else {
    return await processItemsIndividuallyWithFallback(items, {
      ...options,
      delayBetweenRequests: strategy.delayBetweenRequests,
      maxRetries: strategy.maxRetries,
    });
  }
};
