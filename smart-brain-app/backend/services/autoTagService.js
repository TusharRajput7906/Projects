const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Comprehensive stop-words list
const STOP_WORDS = new Set([
  'the','a','an','is','in','it','to','and','or','for','on','at','by','with',
  'from','of','as','this','that','be','are','was','were','been','has','have',
  'had','do','does','did','will','would','could','should','may','might','shall',
  'can','not','no','nor','so','yet','but','if','then','than','when','where',
  'who','which','what','how','why','all','any','both','each','few','more',
  'most','other','some','such','into','through','during','before','after',
  'above','below','between','out','off','over','under','again','further',
  'here','there','about','up','down','very','just','its','his','her','their',
  'our','your','my','we','us','you','he','she','they','i','me','him','them',
  'also','well','like','get','got','go','going','make','made','one','two',
  'new','good','great','use','used','using',
]);

// Topic clusters: keyword → topic label
const TOPIC_MAP = {
  // Technology
  javascript: 'technology', python: 'technology', code: 'technology',
  programming: 'technology', software: 'technology', developer: 'technology',
  api: 'technology', react: 'technology', node: 'technology',
  database: 'technology', ai: 'technology', machine: 'technology',
  learning: 'technology', neural: 'technology', model: 'technology',
  // Business
  startup: 'business', product: 'business', market: 'business',
  revenue: 'business', customer: 'business', growth: 'business',
  strategy: 'business', company: 'business', business: 'business',
  // Science
  research: 'science', study: 'science', data: 'science', analysis: 'science',
  experiment: 'science', biology: 'science', physics: 'science',
  // Design
  design: 'design', ux: 'design', ui: 'design', typography: 'design',
  color: 'design', layout: 'design', interface: 'design',
  // Health
  health: 'health', fitness: 'health', nutrition: 'health', mental: 'health',
  exercise: 'health', diet: 'health', medical: 'health',
  // Finance
  finance: 'finance', money: 'finance', invest: 'finance', stock: 'finance',
  crypto: 'finance', bitcoin: 'finance', budget: 'finance',
};

/**
 * Extract top keywords from text using frequency + stemming
 * @param {string} text
 * @param {number} count  max keywords to return
 * @returns {string[]}
 */
function extractKeywords(text, count = 8) {
  if (!text || typeof text !== 'string') return [];

  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  const freq = {};

  for (const token of tokens) {
    if (token.length < 3) continue;
    if (STOP_WORDS.has(token)) continue;
    const stemmed = stemmer.stem(token);
    freq[token] = (freq[token] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

/**
 * Infer topics from keywords
 * @param {string[]} keywords
 * @returns {string[]}
 */
function inferTopics(keywords) {
  const topics = new Set();
  for (const kw of keywords) {
    const topic = TOPIC_MAP[kw.toLowerCase()];
    if (topic) topics.add(topic);
  }
  return [...topics];
}

/**
 * Detect content type from URL
 * @param {string} url
 * @returns {string}
 */
function detectTypeFromUrl(url) {
  if (!url || typeof url !== 'string') return 'note';

  const u = url.toLowerCase();
  if (u.includes('youtube.com/watch') || u.includes('youtu.be/')) return 'youtube';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'tweet';
  if (u.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/)) return 'image';
  if (u.match(/\.pdf(\?.*)?$/)) return 'pdf';
  if (u.match(/medium\.com|dev\.to|hashnode|substack|blog\./)) return 'article';
  return 'link';
}

/**
 * Compute Jaccard similarity between two tag arrays
 * Used for "related items" matching
 */
function jaccardSimilarity(tagsA, tagsB) {
  if (!tagsA.length && !tagsB.length) return 0;
  const setA = new Set(tagsA);
  const setB = new Set(tagsB);
  const intersection = [...setA].filter(t => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

module.exports = { extractKeywords, inferTopics, detectTypeFromUrl, jaccardSimilarity };
