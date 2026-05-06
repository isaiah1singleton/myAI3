# LeaseLens

**Link**: https://my-ai-3-nu.vercel.app/login

LeaseLens is a renter-focused AI assistant built with Next.js. It helps users evaluate apartments, compare listings, estimate affordability, review lease text, spot risky listings, and stay organized across saved apartments, tours, and applications.

This repository includes:

- a chat-based apartment assistant
- structured AI tools for renter workflows
- persistent user accounts with Supabase auth
- saved chat history across sessions
- saved apartment workflow tracking

## What The Assistant Does

LeaseLens is designed for apartment hunting, not general chat. The assistant can:

- collect renter preferences
- score apartment fit
- compare multiple apartments
- estimate affordability and upfront costs
- flag suspicious or risky listings
- review lease and rental documents
- save apartments to a shortlist
- track tours and applications
- draft landlord and broker messages

The main UI is an authenticated workspace with:

- a past chats sidebar
- a central chat area
- a workflow panel for shortlist, tours, and applications

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- AI SDK
- OpenAI
- Supabase Auth and PostgREST
- Pinecone
- Exa
- Tailwind CSS

## Project Structure

```text
app/
  api/chat/
    route.ts                 # main chat API route
    tools/                   # apartment and support tools
  login/page.tsx             # login and signup UI
  page.tsx                   # authenticated app workspace
  parts/                     # shared page-level UI
  terms/                     # terms page

components/
  apartments/                # shortlist, workflow, history, tours, applications
  auth/                      # auth provider
  messages/                  # chat message rendering
  ui/                        # reusable UI primitives

lib/
  apartment-*.ts             # scoring, workflow, lease, affordability helpers
  moderation.ts              # input moderation
  pinecone.ts                # vector search integration
  supabase/                  # auth and persistence clients

types/
  apartment.ts               # shared renter domain types

supabase/
  schema.sql                 # database schema and RLS policies

config.ts                    # model and app-level config
prompts.ts                   # system prompt and behavior rules
env.template                 # required environment variables
```

## Core Files

### `app/page.tsx`

The main authenticated workspace. It:

- redirects signed-out users to login
- loads chat history from Supabase
- loads saved apartments, tours, and applications
- renders the main chat area
- syncs workflow state back to Supabase

### `app/login/page.tsx`

The login and signup screen for Supabase email/password auth.

### `app/api/chat/route.ts`

The main API route for the assistant. It:

- receives chat messages
- runs moderation checks
- sends messages to the model
- exposes the tool set used by the apartment assistant

### `app/api/chat/tools/`

Each file in this folder defines one tool the assistant can call. Current tools cover:

- apartment preference collection
- listing ingestion
- fit scoring
- apartment comparison
- affordability analysis
- listing risk detection
- lease review
- shortlist actions
- tour checklist generation
- application planning
- landlord message drafting

When you add or remove a tool, also update:

- `app/api/chat/route.ts`
- `components/messages/tool-call.tsx`
- `components/messages/assistant-message.tsx`

### `components/apartments/`

This folder contains the renter workflow UI:

- `chat-history-panel.tsx`
- `workflow-panel.tsx`
- `shortlist-panel.tsx`
- `tour-manager.tsx`
- `application-tracker.tsx`
- `dashboard-overview.tsx`

### `lib/supabase/`

This folder contains the lightweight client-side integration for:

- signing in
- signing up
- refreshing sessions
- loading saved chats
- storing saved apartments and workflow state

### `types/apartment.ts`

This is the main shared schema file for the renter assistant. It defines:

- renter preferences
- apartment listings
- fit score results
- affordability and risk results
- lease review results
- saved apartments
- tours
- applications

## How To Replicate The Repository

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd myAI3
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your environment file

Copy `env.template` into `.env.local` and fill in the values.

Required variables:

```env
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Optional but supported:

```env
EXA_API_KEY=
PINECONE_API_KEY=
FIREWORKS_API_KEY=
```

### 4. Set up Supabase

Create a Supabase project.

Then open the Supabase SQL editor and run:

- `supabase/schema.sql`

This creates:

- `public.chat_sessions`
- `public.user_workspaces`

It also adds row-level security policies so users can only access their own data.

In Supabase Auth:

- enable Email/Password sign-in

### 5. Set up optional integrations

If you want the full feature set:

- add an Exa API key for web search
- add a Pinecone API key for vector search
- make sure the Pinecone index name matches `config.ts`

The app will still run without Exa and Pinecone, but those features will not work.

### 6. Start the app locally

```bash
npm run dev
```

Then open:

- [http://localhost:3000](http://localhost:3000)

## Typical Local Test Flow

1. Sign up for a new account on `/login`
2. Start a new apartment search
3. Ask the assistant to evaluate or compare listings
4. Save strong options to the shortlist
5. Refresh the page and confirm:
   - past chats still exist
   - saved apartments still exist
   - tours and applications still exist

## Customization

### Change the assistant identity

Edit `config.ts`:

- `AI_NAME`
- `OWNER_NAME`
- `WELCOME_MESSAGE`
- `MODEL`

### Change assistant behavior

Edit `prompts.ts`.

This controls:

- tone
- tool-calling behavior
- apartment workflow guidance
- refusal and safety behavior

### Add or remove tools

Follow the repository rule in `AGENTS.md`:

1. create or remove a tool in `app/api/chat/tools/`
2. register it in `app/api/chat/route.ts`
3. update `components/messages/tool-call.tsx`
4. update `components/messages/assistant-message.tsx`

## Notes

- `.env.local`, `.next/`, `node_modules/`, and `*.tsbuildinfo` should not be committed
- `env.template` and `supabase/schema.sql` should be committed
- the `object-tracking` directory is intentionally separate from the apartment assistant workflow

## Troubleshooting

### Supabase table error

If you see:

`Could not find the table 'public.chat_sessions' in the schema cache`

run the SQL in `supabase/schema.sql`, then refresh the schema cache if needed:

```sql
notify pgrst, 'reload schema';
```

### Login works but no data loads

Check:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Email/Password auth is enabled
- the SQL schema has been applied

### Web search does not work

Check `EXA_API_KEY`.

### Vector search does not work

Check:

- `PINECONE_API_KEY`
- the index name in `config.ts`
- that your index contains data

## Summary

LeaseLens is an apartment-hunting AI workspace, not a generic chatbot. The repository combines chat, renter decision support, account persistence, and apartment workflow tracking in one app. To replicate it, you mainly need:

- Node/npm
- environment variables
- Supabase setup
- optional Exa and Pinecone keys

Once those are in place, the app should run locally with persistent login, past chats, and saved apartment workflows.
