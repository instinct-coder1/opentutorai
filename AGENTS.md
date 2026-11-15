<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

<!-- AGENT-MEMORY:BEGIN -->
## Project rules (agent-maintained)

- App was migrated from Bolt (Vite + React Router + Supabase); `.lovable/migrate-external-project/ledger.json` tracks what is migrated vs pending — update it when data/users are imported.
- Auth: email/password via Lovable Cloud; one `AuthProvider` in `__root.tsx` is the only `onAuthStateChange` subscriber (filters events, invalidates router/queries). Why: avoid duplicate listeners and refetch storms.
- Signed-in pages live under `src/routes/_authenticated/` (client-only `beforeLoad` gate, redirects to `/login?redirect=`); `/app` is the shell layout. Why: session is in browser storage, SSR cannot see it.
- `profiles.id` equals the auth user id; owner-only RLS, no anon access, no delete. Why: preserved from the source schema.
- `legacy_user_map` maps original Bolt user ids/emails to new auth ids and is service-role only; imported users claim accounts via the reset-password email (verifies email ownership). Why: old password hashes are never imported.
- Migrated UI kit lives in `src/components/app/` (not `components/ui`, which is shadcn) and uses only semantic tokens from `src/styles.css`.
<!-- AGENT-MEMORY:END -->
