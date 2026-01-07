# Elvobz Parfums — Admin Dashboard

A lightweight admin dashboard for managing reservations and users in the Elvobz Parfums project.

## Quick Start

Prerequisites: Node.js (LTS) and npm or bun.

```bash
# Clone the repository
git clone https://github.com/aesxiety/Elvobz-Parfums-Project.git
cd Elvobz-Parfums-Project

# Install dependencies
npm install

# Start development server
npm run dev
```

Notes:
- If you use `nvm`, install Node via the nvm instructions: https://github.com/nvm-sh/nvm#installing-and-updating

## Development

- The app is built with Vite + React + TypeScript.
- UI components come from shadcn/ui and Tailwind CSS is used for styling.
- Source code lives under the `src/` directory.

Useful scripts (from package.json):

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure (important files)

- `src/main.tsx` — app entry
- `src/App.tsx` — top-level app component
- `src/pages/Admin.tsx` — Admin dashboard (reservations & users)
- `src/integrations/supabase/client.ts` — Supabase client config
- `src/components/` — shared UI components

## Technologies

- Vite
- TypeScript
- React
- Tailwind CSS
- shadcn-ui
- Supabase (Postgres + Auth)



## Contributing

- Open an issue or submit a pull request.
- Keep changes focused and add tests where applicable.

## Troubleshooting

- If you see type errors when interacting with Supabase, check your generated types and adjust queries to the Postgrest client API 

## Contact / Links

- Instagram Elvobz : https://instagram.com/

---


