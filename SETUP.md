# Setup

Manual steps needed to run the multi-user app. Do them in order — the app won't
let anyone sign in until step 1 is done.

## 1. Google Sign-In (required)

1. [Google Cloud Console](https://console.cloud.google.com/) → create a project.
2. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name, support email, developer email
   - Scopes: leave the defaults (`openid`, `email`, `profile` are non-sensitive and need no verification)
   - **Publish the app to Production.** In Testing mode consent expires after 7 days.
3. **Credentials → Create credentials → OAuth client ID → Web application**
   - Authorized redirect URIs:
     - `https://dndvalten.vercel.app/api/auth/callback`
     - `http://localhost:3000/api/auth/callback` (for `vercel dev`)
4. Copy the client ID and secret into Vercel → Settings → Environment Variables:

   | Variable | Value |
   |---|---|
   | `GOOGLE_CLIENT_ID` | from step 3 |
   | `GOOGLE_CLIENT_SECRET` | from step 3 |
   | `OWNER_EMAIL` | your email — **only this account can sign in** |

`OWNER_EMAIL` is the signup gate. Leave it set while you verify the migration;
delete the variable when you want the app open to everyone.

## 2. Migrate the Valten character (one-time)

The old data still lives in the four global Redis keys. Import it into your
account **before opening the app**, so the empty-sheet defaults don't get saved
over the top.

1. Sign in once at `https://dndvalten.vercel.app` (creates your user record).
2. Open `https://dndvalten.vercel.app/api/auth/me` and copy the `uid`.
3. Run, with `SYNC_SECRET` from your Vercel env:

   ```bash
   curl -X POST https://dndvalten.vercel.app/api/migrate \
     -H "Authorization: Bearer $SYNC_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"uid":"<uid from step 2>"}'
   ```

4. Reload the app — "Valten" appears in the character list with spells, avatar,
   and backstory intact (backstory/personality/appearance are now editable
   fields, and the Undead Condition moved to a Features card).
5. Once verified, delete [api/migrate.js](api/migrate.js) and the old global
   `state` / `config` / `spelldb` / `avatar` keys in the Upstash console.

## 3. Google Sheet template (optional)

1. Make a copy of your existing sheet.
2. Delete the Valten rows from Profile, Stats, Saves, Skills, Attacks,
   Equipment, Currency, Features, Spellcasting, Spell Slots, and Custom Spells.
   **Keep the SpellData tab** — that spell database is the main value of the
   template.
3. Add an Instructions tab explaining: make a copy → Extensions → Apps Script →
   Project Settings → Script Properties → set `SYNC_SECRET` to the token from
   the app (Character list → Sheet sync) and `WEBHOOK_URL` to
   `https://dndvalten.vercel.app/api/sync-sheet` → run `createTrigger()` then
   `syncToApp()`.
4. Share: **Anyone with the link → Viewer**.
5. Put the URL in `SHEET_TEMPLATE_URL` at the top of
   [src/CharacterList.jsx](src/CharacterList.jsx).

**Re-point your own sheet:** the shared `SYNC_SECRET` no longer works for sheet
sync. In the app, open Character list → Sheet sync on Valten, copy the token,
and paste it into that sheet's `SYNC_SECRET` script property.

## 4. Stripe credit packs (optional — avatars are gated without it)

Every account starts with 1 free avatar credit. Beyond that, generation returns
402 and the app shows a buy button, which needs Stripe configured.

1. Stripe Dashboard → **Products** → new product "Avatar generations ×10",
   one-time price €3 → copy the **price ID** (`price_…`).
2. **Developers → Webhooks** → add endpoint
   `https://dndvalten.vercel.app/api/stripe-webhook`, event
   `checkout.session.completed` → copy the **signing secret** (`whsec_…`).
3. Vercel env vars:

   | Variable | Value |
   |---|---|
   | `STRIPE_SECRET_KEY` | `sk_…` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_…` from step 2 |
   | `STRIPE_PRICE_ID` | `price_…` from step 1 |

4. Test with Stripe test keys first: `stripe listen --forward-to
   localhost:3000/api/stripe-webhook`, card `4242 4242 4242 4242`. Then verify
   on the real deployment too — the raw-body handling for signature
   verification is the usual thing that breaks only in production.
5. Give yourself credits without paying: set `credits:<your-uid>` to e.g. `999`
   in the Upstash console.

To change the pack size, edit `CREDITS_PER_PACK` in
[api/stripe-webhook.js](api/stripe-webhook.js) (and the price in Stripe).

## Environment variables

| Variable | Set by | Purpose |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Upstash integration | storage |
| `GEMINI_API_KEY` | you | avatar generation |
| `GOOGLE_CLIENT_ID` / `_SECRET` | step 1 | sign-in |
| `OWNER_EMAIL` | step 1 | signup gate — delete to open registration |
| `SYNC_SECRET` | legacy | only used by `api/migrate.js`; delete both after migrating |
| `STRIPE_*` | step 4 | payments |

For local `vercel dev`, mirror these into `.env.local`.

## Limits worth knowing

- **Upstash free tier**: 10k commands/day. Roughly 2 commands per 20s while a
  sheet is actively edited, so ~25 continuous editing-hours a day. Upgrade to
  pay-as-you-go, or raise `PERIODIC_SAVE_MS` in
  [src/hooks/usePersistedState.js](src/hooks/usePersistedState.js), if you hit it.
- **Vercel Hobby**: 12 serverless functions max. There are currently 11
  (12 while `api/migrate.js` exists — delete it after migrating).
- **Avatars** are downscaled to 768px JPEG before storage; raw Gemini PNGs
  exceed Upstash's 1MB value limit.
