# MENOCLONE Motorsports secure community form

## 1. Supabase
Create a Supabase project at https://supabase.com/dashboard and run `supabase/migrations/20261102000000_community_applications.sql` in SQL Editor. Confirm RLS is enabled and there are **no anon policies**. Review applications in Table Editor (private dashboard).

## 2. Cloudflare Turnstile
Create a Turnstile widget at https://dash.cloudflare.com/ with the EXACT domain hosting your site (for example `odotofrva.github.io`, or your custom domain). Copy the public site key and secret key. Add localhost to allowed hostnames only for local development.

## 3. Configure the public HTML
In `index.html`, replace `YOUR_PROJECT_REF` with your Supabase project reference and `YOUR_TURNSTILE_SITE_KEY` with the public Turnstile site key. These two values are safe to expose. Do not put secret or service-role keys in HTML.

## 4. Deploy the Edge Function
Install Supabase CLI, login, and link the project. From the folder containing `supabase/`, run:

```
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set ALLOWED_ORIGIN=https://YOUR_SITE_DOMAIN TURNSTILE_SECRET_KEY=YOUR_SECRET_KEY
supabase functions deploy community-apply --no-verify-jwt
```

Use the exact site origin (e.g. `https://odotofrva.github.io`, without a trailing slash) for `ALLOWED_ORIGIN`. Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to hosted functions; keep them server-side. If your deployment uses a custom domain, set that origin instead. If both domains must work, extend the function's origin check to an explicit allowlist.

## 5. Publish and test
Upload the `index.html` and existing `assets/` files to GitHub Pages. Test a successful registration, invalid input, missing captcha, and confirm that visitors cannot read applications. Confirm new entries appear as `pending` in the private Supabase Table Editor. Test with the live domain, not `file://`.

## Security notes
The browser sends submissions only to the Edge Function. RLS prevents anonymous reads and writes. Turnstile verification happens server-side, not in the browser. Origin checks and CAPTCHA reduce abuse but do not replace rate limiting; enable Supabase/Cloudflare rate limits before public launch. Set a retention policy, publish a privacy notice with contact and deletion-request details, and restrict Supabase dashboard access to trusted administrators. Admin approval is a database status only; it does not yet grant authenticated membership, location passes, or protected member content. Email confirmation and duplicate-handling can be added later.
