const input = document.getElementById('token');
const status = document.getElementById('status');

function show(text, cls) {
  status.textContent = text;
  status.className = cls;
}

chrome.storage.local.get('token').then(({ token }) => {
  if (token) input.value = token;
});

document.getElementById('save').addEventListener('click', async () => {
  const token = input.value.trim();
  await chrome.storage.local.set({ token });
  if (!token) return show('Token cleared.', '');

  show('Testing…', '');
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return show(`Saved, but GitHub rejected it (HTTP ${res.status}).`, 'err');
    const user = await res.json();
    show(`Saved. Authenticated as @${user.login}.`, 'ok');
  } catch (err) {
    show(`Saved, but the test failed: ${err.message}`, 'err');
  }
});
