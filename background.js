// Submits the approval through the GitHub REST API, so it keeps working
// when GitHub reshuffles its PR page markup.

const API = 'https://api.github.com';

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'approve') {
    approve(msg.pr).then(sendResponse);
    return true; // keep the channel open for the async response
  }
  if (msg.type === 'open-options') {
    chrome.runtime.openOptionsPage();
  }
});

chrome.action.onClicked.addListener(() => chrome.runtime.openOptionsPage());

async function approve({ owner, repo, number }) {
  const { token } = await chrome.storage.local.get('token');
  if (!token) {
    return { ok: false, needsToken: true, error: 'No GitHub token set' };
  }

  let res;
  try {
    res = await fetch(`${API}/repos/${owner}/${repo}/pulls/${number}/reviews`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event: 'APPROVE' }),
    });
  } catch (err) {
    return { ok: false, error: `Network error: ${err.message}` };
  }

  if (res.ok) return { ok: true };
  return { ok: false, needsToken: res.status === 401, error: await errorMessage(res) };
}

async function errorMessage(res) {
  try {
    const data = await res.json();
    const details = (data.errors || []).map((e) => (typeof e === 'string' ? e : e.message));
    return [data.message, ...details].filter(Boolean).join(': ') || `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}
