// Smart Brain — Content Script
// Runs on every page. Listens for messages from popup or background.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_META') {
    const og = (prop) =>
      document.querySelector(`meta[property="${prop}"]`)?.content ||
      document.querySelector(`meta[name="${prop}"]`)?.content || '';

    sendResponse({
      title:        og('og:title')       || document.title,
      description:  og('og:description') || og('description') || '',
      ogImage:      og('og:image')       || og('twitter:image') || '',
      siteName:     og('og:site_name')   || '',
      author:       og('author')         || og('article:author') || '',
      url:          window.location.href,
    });
  }
  return true; // keep channel open for async
});
