# Plant Tracker — Operations Prototype

A standalone, responsive HTML/CSS/vanilla-JavaScript demonstration of the proposed Plant Tracker operations modules.

## Run locally
Open `index.html` in a browser, or use VS Code Live Server.

## Publish on GitHub Pages
1. Create or choose a GitHub repository.
2. Upload the contents of this folder (keep `index.html` at repository root).
3. Open **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then Save.
6. Open the published Pages URL after deployment finishes.

## Prototype scope
- Overview dashboard
- Official plant, area and shift communication channels
- Guided and natural-language report demonstrations
- Workforce and attendance
- Individual equipment monitoring and floor summaries
- Safety observations
- Supervisor/manager approval workflow illustration
- Configurable shift and handover screens
- Illustrative plant map
- History and sample CSV export
- Responsive desktop/mobile layout

## Important
This is a frontend-only simulation. Sample data is hardcoded in `app.js`; actions show demonstration feedback and do not create authoritative operational records. There is no authentication, database, live map, WhatsApp integration, real notifications, or real approval. Do not use it to direct plant operations or make safety decisions.

The later integration should replace sample arrays and demo event handlers with authenticated Supabase queries and server-side workflows, while retaining the UI components that are approved.
