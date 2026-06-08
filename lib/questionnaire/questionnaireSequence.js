/**
 * Questionnaire Sequence Service
 *
 * Manages the sessionStorage queue that drives sequential questionnaire flows
 * when an order contains 2+ products that each require their own questionnaire.
 *
 * Queue shape (stored as JSON under QUEUE_KEY):
 * {
 *   orderId:  string,   // WooCommerce order ID
 *   seskey:   string,   // base64-encoded seskey (pre-generated, valid for 10 min)
 *   verticals: string[], // ordered list of vertical slugs, e.g. ["wl","ed"]
 *   currentIndex: number // 0-based index of the questionnaire currently in progress
 * }
 */

const QUEUE_KEY = "rky_quiz_sequence";

// ----- Slug → display name -----
export const VERTICAL_DISPLAY_NAMES = {
  wl: "Weight Loss",
  ed: "ED",
  hair: "Hair",
  mh: "Mental Health",
  skincare: "Skincare",
  smoking: "Zonnic",
  longevity: "Longevity",
};

// ----- Flow param → vertical slug -----
export const FLOW_PARAM_TO_VERTICAL = {
  "wl-flow": "wl",
  "ed-flow": "ed",
  "hair-flow": "hair",
  "mh-flow": "mh",
  "smoking-flow": "smoking",
  "longevity-flow": "longevity",
  "skincare-flow": "skincare",
};

// ----- Vertical slug → quiz base path -----
// These must stay in sync with getRedirectPath() in OrderReceivedPageContent
export const VERTICAL_QUIZ_PATH = {
  wl: "/wl-consultation",
  ed: "/ed-consultation-quiz",
  hair: "/hair-main-questionnaire",
  mh: "/mh-quiz",
  smoking: "/smoking-consultation",
  longevity: "/nad-consultation-quiz",
  skincare: null, // skincare path is dynamic (quiz type); handled separately
};

// ----- sessionStorage helpers -----

function readQueue() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function writeQueue(queue) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (_) {
    // sessionStorage unavailable — sequence degrades gracefully
  }
}

// ----- Public API -----

/**
 * Build a new sequence queue and persist it.
 *
 * @param {object} params
 * @param {string} params.orderId
 * @param {string} params.seskey   Pre-generated seskey (call generateSeskey before storing)
 * @param {string[]} params.verticals  Ordered vertical slugs (e.g. ["wl","ed"])
 * @returns {object} The created queue object
 */
export function buildQueue({ orderId, seskey, verticals }) {
  const queue = {
    orderId,
    seskey,
    verticals,
    currentIndex: 0,
  };
  writeQueue(queue);
  return queue;
}

/**
 * Peek at the current queue without modifying it.
 * Returns null if no queue exists or if it is exhausted.
 */
export function peekQueue() {
  const queue = readQueue();
  if (!queue) return null;
  if (queue.currentIndex >= queue.verticals.length) return null;
  return queue;
}

/**
 * Get the vertical slug at the current index without advancing.
 */
export function currentVertical() {
  const queue = peekQueue();
  return queue ? queue.verticals[queue.currentIndex] : null;
}

/**
 * Get the vertical slug at the next index (the one that will be shown in the intermission).
 */
export function nextVertical() {
  const queue = peekQueue();
  if (!queue) return null;
  const nextIdx = queue.currentIndex + 1;
  return nextIdx < queue.verticals.length ? queue.verticals[nextIdx] : null;
}

/**
 * Advance the queue to the next item.
 * Returns the updated queue, or null if exhausted.
 */
export function advanceQueue() {
  const queue = readQueue();
  if (!queue) return null;
  const updated = { ...queue, currentIndex: queue.currentIndex + 1 };
  writeQueue(updated);
  return updated.currentIndex < updated.verticals.length ? updated : null;
}

/**
 * Clear the queue entirely (call after the last questionnaire completes).
 */
export function clearQueue() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(QUEUE_KEY);
  } catch (_) {
    // ignore
  }
}

/**
 * Returns true if a multi-questionnaire sequence is active and not yet exhausted.
 */
export function hasActiveSequence() {
  return peekQueue() !== null;
}

/**
 * Returns true if the current item is the last one in the sequence.
 */
export function isLastInSequence() {
  const queue = peekQueue();
  if (!queue) return false;
  return queue.currentIndex === queue.verticals.length - 1;
}

/**
 * Return human-readable progress info: { n, total }
 * n is 1-based index of the questionnaire currently being shown (after advance).
 * i.e. when showing quiz #2 of 3, returns { n: 2, total: 3 }.
 */
export function getSequenceProgress() {
  const queue = peekQueue();
  if (!queue) return null;
  return {
    n: queue.currentIndex + 1,
    total: queue.verticals.length,
  };
}

/**
 * Build the full URL for a given vertical quiz, using the values from the queue.
 *
 * @param {string} vertical  Slug, e.g. "ed"
 * @param {object} queue     Queue object from peekQueue()
 * @param {string} [purchasedProductName]  Optional product name for the purchased_product param
 * @returns {string|null}
 */
export function buildQuizUrl(vertical, queue, purchasedProductName) {
  if (!queue) return null;
  const basePath = VERTICAL_QUIZ_PATH[vertical];
  if (!basePath) return null;

  const params = new URLSearchParams();
  if (queue.orderId) params.append("order-id", queue.orderId);
  params.append("stage", "consultation-after-checkout");
  params.append("view", "consultation");
  if (purchasedProductName) params.append("purchased_product", purchasedProductName);
  params.append("seskey", queue.seskey);

  return `${basePath}?${params.toString()}`;
}
