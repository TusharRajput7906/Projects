const API_URL = 'http://localhost:5000/api';

const TYPE_EMOJI = { article: '📰', youtube: '▶️', tweet: '🐦', image: '🖼️', pdf: '📄', link: '🔗' };

function detectType(url) {
  const u = (url || '').toLowerCase();
  if (u.includes('youtube.com/watch') || u.includes('youtu.be/')) return 'youtube';
  if (u.includes('twitter.com') || u.includes('x.com'))           return 'tweet';
  if (u.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/))                  return 'image';
  if (u.match(/\.pdf(\?|$)/))                                       return 'pdf';
  if (u.match(/medium\.com|dev\.to|substack|hashnode|blog\./))     return 'article';
  return 'link';
}

function showStatus(msg, type) {
  const el = document.getElementById('status-msg');
  el.className = `status ${type}`;
  el.textContent = msg;
  el.style.display = 'block';
}

function renderTags(tags) {
  const box = document.getElementById('tags-box');
  if (!tags || tags.length === 0) {
    box.innerHTML = '<span style="font-size:11px;color:#475569;">No tags detected</span>';
    return;
  }
  box.innerHTML = tags.map(t => `<span class="tag">#${t}</span>`).join('');
}

// ── Load current tab info ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url   = tab.url   || '';
  const title = tab.title || '';
  const type  = detectType(url);

  // Fill preview
  document.getElementById('preview-title').textContent = title || url;
  document.getElementById('preview-url').textContent   = url;
  document.getElementById('preview-thumb').textContent = TYPE_EMOJI[type] || '🔗';

  // Badge
  const badge = document.getElementById('type-badge');
  badge.textContent = type;
  badge.className   = `badge badge-${type}`;

  // Get OG image from content script
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const og = document.querySelector('meta[property="og:image"]');
        const tags = document.title.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 6);
        return { ogImage: og?.content || '', autoTags: tags };
      },
    });
    if (result?.ogImage) {
      const img = document.createElement('img');
      img.src   = result.ogImage;
      img.className = 'preview-thumb';
      img.onerror   = () => {};
      document.getElementById('preview-thumb').replaceWith(img);
    }
    renderTags(result?.autoTags || []);
  } catch {
    renderTags([]);
  }

  // ── Save button ─────────────────────────────────────────────────────────────
  document.getElementById('save-btn').addEventListener('click', async () => {
    const btn  = document.getElementById('save-btn');
    const note = document.getElementById('note-input').value.trim();

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div>&nbsp;Saving…';

    try {
      const res = await fetch(`${API_URL}/items`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title, type, content: note }),
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Server error');

      showStatus('✅ Saved to your Brain!', 'success');
      btn.innerHTML = '✅ Saved!';

      setTimeout(() => window.close(), 1600);
    } catch (err) {
      showStatus(`❌ ${err.message}`, 'error');
      btn.disabled = false;
      btn.innerHTML = '🧠 Save to Brain';
    }
  });
});
