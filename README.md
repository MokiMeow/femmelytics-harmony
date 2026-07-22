# Femmelytics Harmony

Femmelytics is a privacy-focused health tracker for menstrual cycles, symptoms,
mood, medications, journals, reports, community discussions, and a bounded AI
health-information assistant.

Live application: [femmelytics.vercel.app](https://femmelytics.vercel.app)

## Features

- Supabase authentication with protected application routes
- Cycle, mood, energy, and symptom tracking
- Medication schedules and adherence history
- Dashboard charts, pattern summaries, and PDF exports
- Private journal and member health-resource library
- Community forums with authenticated posting
- Google Calendar event preview and connection flow
- Authenticated Supabase Edge Functions for AI chat, speech, and report summaries
- Light, dark, and system themes

The AI surfaces provide general information and summaries; they do not diagnose,
prescribe, or replace a clinician.

## Local development

Requirements: Node.js 24.11+ and npm 11.6+.

```bash
git clone https://github.com/MokiMeow/femmelytics-harmony.git
cd femmelytics-harmony
npm ci
npm run dev
```

The browser uses the project's Supabase publishable client configuration. A
publishable/anonymous Supabase key is not a server secret; authorization is
enforced by the RLS policies in `supabase/migrations`.

For the Edge Functions, configure the OpenAI key only as a Supabase secret:

```bash
supabase secrets set OPENAI_API_KEY=your-rotated-key
```

Never create a `VITE_OPENAI_API_KEY` variable or ship a provider secret in the
browser bundle. Copy `supabase/functions/.env.example` only for local Edge
Function development and keep the populated file untracked.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run check
npm audit --audit-level=moderate
```

The project uses strict TypeScript, warning-free ESLint, Vitest, pinned GitHub
Actions, Dependabot, and a Vercel security-header policy.

## Supabase deployment

Apply the migration before relying on production data isolation:

```bash
supabase db push
supabase functions deploy ai-assistant
supabase functions deploy generate-report-summary
```

Both functions require verified JWTs. The migration replaces older policies,
limits private health data to its owner, and limits forum and health-article
reads to authenticated members.

## Deployment

Vercel runs `npm ci` and `npm run build`, publishes `dist`, rewrites application
routes to the SPA entry point, caches hashed assets, and applies CSP, HSTS,
clickjacking, MIME-sniffing, referrer, and permissions headers.

## License

MIT — see [LICENSE](LICENSE).
