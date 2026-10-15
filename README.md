# GitHub Quick Approve

Chrome extension that adds a floating **✓ Approve** button to every GitHub pull request page.
One click submits an approving review through the GitHub API, then reloads the page.

## Install

1. Open `chrome://extensions`, turn on **Developer mode** (top right).
2. Click **Load unpacked** and pick this folder.
3. The settings page opens when you click the extension's toolbar icon. Paste a GitHub token and click **Save & test**:
   - Fine-grained token: *Pull requests: Read and write* on the repos you review, or
   - Classic token with the `repo` scope (authorize it for SSO if your org requires it).

## Use

Open any PR (`github.com/<owner>/<repo>/pull/<n>`), then click **✓ Approve** in the bottom-right corner.
If GitHub refuses (for example, it's your own PR or you already have a pending draft review), the button turns red and GitHub's error message is shown.
