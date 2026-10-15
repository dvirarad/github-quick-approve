// Shows a floating "Approve" button on GitHub pull request pages.
// GitHub navigates without full page loads, so the URL is re-checked periodically.

const BUTTON_ID = 'gqa-approve-button';
const LABEL = '✓ Approve';

function currentPr() {
  const m = location.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  return m ? { owner: m[1], repo: m[2], number: Number(m[3]) } : null;
}

function sync() {
  const pr = currentPr();
  const key = pr && `${pr.owner}/${pr.repo}#${pr.number}`;
  let btn = document.getElementById(BUTTON_ID);

  if (!pr) {
    btn?.remove();
    return;
  }
  if (btn && btn.dataset.pr === key) return;

  btn?.remove();
  btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.type = 'button';
  btn.dataset.pr = key;
  btn.textContent = LABEL;
  btn.title = `Approve ${key}`;
  btn.addEventListener('click', () => onClick(btn, pr));
  document.body.appendChild(btn);
}

function setState(btn, state, text, title) {
  btn.dataset.state = state;
  btn.textContent = text;
  if (title) btn.title = title;
}

function onClick(btn, pr) {
  if (btn.dataset.state === 'busy' || btn.dataset.state === 'done') return;
  setState(btn, 'busy', 'Approving…');

  chrome.runtime.sendMessage({ type: 'approve', pr }, (res) => {
    if (chrome.runtime.lastError || !res) {
      setState(btn, 'error', '✗ Failed: retry', chrome.runtime.lastError?.message || 'No response');
      return;
    }
    if (res.ok) {
      setState(btn, 'done', '✓ Approved');
      setTimeout(() => location.reload(), 800); // show the approval in the timeline
      return;
    }
    if (res.needsToken) {
      setState(btn, 'error', '⚙ Set token', res.error);
      chrome.runtime.sendMessage({ type: 'open-options' });
      setTimeout(() => setState(btn, '', LABEL), 4000);
      return;
    }
    setState(btn, 'error', '✗ Failed: retry', res.error);
    showToast(res.error);
  });
}

function showToast(text) {
  const toast = document.createElement('div');
  toast.className = 'gqa-toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 6000);
}

sync();
document.addEventListener('turbo:load', sync);
window.addEventListener('popstate', sync);
setInterval(sync, 1000);
