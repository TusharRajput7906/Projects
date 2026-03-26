const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape Open Graph + meta tags from any URL
 * @param {string} url
 * @returns {object} metadata
 */
async function scrapeMetadata(url) {
  try {
    const { data } = await axios.get(url, {
      timeout: 8000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SmartBrainBot/1.0; +http://smartbrain.app)',
      },
    });

    const $ = cheerio.load(data);

    const getMeta = (name) =>
      $(`meta[property="${name}"]`).attr('content') ||
      $(`meta[name="${name}"]`).attr('content') ||
      '';

    const title =
      getMeta('og:title') ||
      getMeta('twitter:title') ||
      $('title').first().text().trim() ||
      '';

    const description =
      getMeta('og:description') ||
      getMeta('twitter:description') ||
      getMeta('description') ||
      $('p').first().text().trim().slice(0, 300) ||
      '';

    const thumbnailUrl =
      getMeta('og:image') ||
      getMeta('twitter:image') ||
      '';

    const siteName =
      getMeta('og:site_name') ||
      new URL(url).hostname.replace('www.', '') ||
      '';

    const author =
      getMeta('author') ||
      getMeta('article:author') ||
      getMeta('twitter:creator') ||
      '';

    const publishDate =
      getMeta('article:published_time') ||
      getMeta('og:updated_time') ||
      '';

    const favicon =
      $('link[rel="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      `https://${new URL(url).hostname}/favicon.ico`;

    // Rough word count from body text
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(' ').length;

    return { title, description, thumbnailUrl, siteName, author, publishDate, favicon, wordCount, bodyText };
  } catch (err) {
    console.warn(`Scrape failed for ${url}:`, err.message);
    return { title: '', description: '', thumbnailUrl: '', siteName: '', author: '', publishDate: '', favicon: '', wordCount: 0, bodyText: '' };
  }
}

/**
 * Get YouTube video metadata via oEmbed (no API key needed)
 * @param {string} url
 * @returns {object}
 */
async function scrapeYoutube(url) {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const { data } = await axios.get(oembedUrl, { timeout: 6000 });

    // Extract video ID for thumbnail
    const videoIdMatch = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : '';
    const thumbnailUrl = videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : data.thumbnail_url || '';

    return {
      title: data.title || '',
      description: `YouTube video by ${data.author_name}`,
      thumbnailUrl,
      siteName: 'YouTube',
      author: data.author_name || '',
      publishDate: '',
      favicon: 'https://www.youtube.com/favicon.ico',
      wordCount: 0,
      bodyText: data.title || '',
    };
  } catch (err) {
    return await scrapeMetadata(url);
  }
}

/**
 * Main entry — auto-selects scraper based on URL type
 */
async function fetchMetadata(url) {
  if (!url) return {};
  const u = url.toLowerCase();
  if (u.includes('youtube.com/watch') || u.includes('youtu.be/')) {
    return scrapeYoutube(url);
  }
  return scrapeMetadata(url);
}

module.exports = { fetchMetadata };
