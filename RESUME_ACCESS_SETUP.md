# Private employer resume access

The resume is NOT in the public assets folder. The `private_upload` directory is for your local setup only and MUST NOT be committed to GitHub Pages.

1. Run the SQL in `supabase/migrations/20261103000000_resume_access.sql` in your Supabase SQL Editor.
2. In Supabase Storage open the **private-resumes** bucket and upload `private_upload/Orion_Ford_Resume.docx` as `Orion_Ford_Resume.docx`. Keep the bucket PRIVATE.
3. Set Supabase Edge Function secrets `RESUME_ACCESS_CODE` to the private code you chose, `ALLOWED_ORIGIN` to the exact public website origin (for example `https://odotofrva.github.io`), and `RESUME_RATE_SALT` to a random long string. Do not place secrets in HTML, GitHub or frontend JavaScript.
4. Deploy: `supabase functions deploy resume-access --no-verify-jwt` (public endpoint with server-side access code validation and rate limiting).
5. In `index.html`, set `window.MNC_RESUME_ENDPOINT` to your function URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/resume-access`. This URL is public and is NOT a secret.
6. Publish `index.html`, `membership.html`, `assets/` and other public site files, plus any existing Supabase community form files. Exclude `private_upload/` and private documents from the public repository.

Security note: A four digit code has limited entropy. The function caps requests to five attempts per hour per IP, but shared or distributed attackers may bypass this. For stronger security, use a longer code, employer accounts, CAPTCHA, and stronger server-side throttling. A signed URL expires after 60 seconds, but a downloaded document can be retained or shared.

Visible hyphens were removed from customer facing HTML text, labels and image descriptions. Technical filenames, URLs, CSS classes, code identifiers, and protocol names remain unchanged so the website still functions.
