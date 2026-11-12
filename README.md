# StockPilot – Inventory & Sales Management
React + Vite + TypeScript + Tailwind + Recharts + Lucide + React Router. All data lives in browser localStorage (key `stockpilot-v1`). No backend, no API keys.

## Run
    npm install
    npm run dev        # http://localhost:5173
    npm run build      # typecheck + production build to dist/
    npm run preview
    npm run check      # verifies seed data integrity (totals, SKUs, stock history)

## User guide
- **Products**: add/edit/view/delete; duplicate SKUs rejected; margin and status shown. Opening stock is set on creation; afterwards change stock only via Inventory so history stays correct. Products used on invoices cannot be deleted.
- **Inventory**: stock in/out/adjustment (adjustment = set counted quantity) with date and reason; negative stock blocked; filter history by date, product, type.
- **Sales**: pick products and quantities (limited to stock), discount, payment method/status. Creates a unique invoice number, deducts stock and logs movements. Open an invoice to print it or record further payments.
- **Suppliers / Customers**: CRUD (suppliers with linked products cannot be deleted), customer sales history and totals.
- **Reports**: six reports, date-range filter, CSV export, print.
- **Settings**: business details, currency (default INR), default low-stock threshold, Reset Demo Data (with confirmation).

## Deploy to Cloudflare Pages
1. Push the project to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Build command `npm run build`, output directory `dist`, Node 18+.
4. Deploy. `public/_redirects` already provides SPA routing fallback.
(Or: `npm run build && npx wrangler pages deploy dist`.)

## Known limitations
Invoices cannot be voided/edited; customers cannot be deleted; single-browser storage only; bundle is a single ~650 kB chunk.
