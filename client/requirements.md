## Packages
(none needed)

## Notes
Uses existing stack: React 18 + TypeScript + Vite + Tailwind + TanStack Query v5 + wouter + lucide-react + framer-motion (already installed)
Assumes backend implements the API contract in @shared/routes and returns JSON matching Zod schemas
Preview endpoint is GET /api/wiki/preview?url=... (URL as query param)
Generate endpoint is POST /api/wiki/generate
History supports optional q filter: GET /api/wiki/history?q=...
