# Van Nyay (वन न्याय) — Frontend MVP

**Tagline:** FIR से Judgment तक — एक Dashboard, कोई Date Miss नहीं

Van Nyay is a modern, responsive web application designed for Forest Officers, Investigating Officers (IO), and Legal Cells to manage and track forest offence cases efficiently.

## Features (Sprint 1-3)

- **Interactive Dashboard:** High-level metrics, pending charge sheets, and critical alerts.
- **Case Management (`/cases`):** Create new FIR Drafts (Offence Reports) with priority tagging.
- **Investigation Logs (`/cases/:id`):** Log site visits, seizures, arrests, and witness statements. Upload evidence.
- **Charge Sheet Compiler:** Auto-compile case data and simulate Digital Signature (DSC) signing.
- **Court Calendar (`/calendar`):** Visual tracking of upcoming hearings across jurisdictions.
- **Judgment OCR & Appeals:** Simulate extracting conviction details from uploaded PDFs and track appeal deadlines.
- **Alerts Center:** In-app notifications for overdue tasks and approaching deadlines.

## Technology Stack

- **Framework:** React 18 (Vite)
- **Routing:** React Router DOM
- **Styling:** Vanilla CSS + CSS Variables (Forest/Legal Theme)
- **Icons:** Lucide React
- **Icons & Typography:** Inter Font Family
- **Backend Architecture Setup:** Supabase (Client configured, awaiting remote database connection)

## Local Development Setup

To run the application locally in development mode:

1. Clone this repository.
2. Ensure you have Node.js installed.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

## Connecting to Supabase (Phase 2)

The `src/lib/supabase.ts` client is ready. To connect to a live Supabase backend:

1. Create a project at [supabase.com](https://supabase.com).
2. Execute the SQL schema found in `supabase/migrations/20230101000000_init_schema.sql` in the Supabase SQL Editor.
3. Create a `.env` file in the root of the project with your credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. Update the React components (`CaseList.tsx`, `CaseDetail.tsx`) to replace the mock React state with real `supabase.from('cases').select('*')` calls.

---
*Built with ❤️ for the Forest Department.*
