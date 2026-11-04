# MENOCLONE MOTORSPORTS full screen setup

This package adds a visitor initiated FULL SCREEN control and an installable Progressive Web App. Browsers do not permit a site to hide the address bar automatically in a normal browser tab. The full screen button requires a visitor click and can be exited with Escape. Installing the site to a device home screen lets it launch in standalone display mode on supporting browsers.

To deploy: upload all files to the root of the existing GitHub Pages repository, preserving assets/ and other folders. GitHub Pages serves the PWA over HTTPS. On mobile, use the browser Add to Home Screen / Install App action. Browser support varies.

To show a branded domain instead of github.io in normal browser tabs, configure a custom domain in GitHub Pages and update DNS records at your domain provider. Full screen is not a security or URL masking feature.

Existing Supabase credentials and resume access must be configured separately; do not publish private resumes or server secrets in the repository.
