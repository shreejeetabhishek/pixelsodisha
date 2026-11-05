# Plant Tracker – Satellite Map + Flexible Connections

## Included
- `index.html` – updated Leaflet-based plant tracker.
- `F_D1.jpg` – engineering drawing used by the engineering map.

## New flexible connection feature
1. Open **Connections** from the top toolbar.
2. Choose **Draw route**.
3. Tap/click two or more points on the active map. Add extra points to create bends.
4. Choose **Finish route** and enter a route name.
5. Switch between Engineering Drawing and Satellite View: each map stores its own route geometry.
6. Use the Leaflet Draw pencil/edit control on the left map toolbar to drag route vertices. Finish the edit to save it.

Engineering drawing coordinates and satellite latitude/longitude are deliberately independent. Routes are stored in browser LocalStorage under `plant_connection_routes_v1`; they are not yet synchronized across devices or saved to Supabase. Equipment IDs and automatic endpoint snapping are planned for the database integration phase.

## Deployment
Keep `index.html` and `F_D1.jpg` in the same directory. Replace the existing files in your GitHub Pages repository and commit/push. Leaflet and Leaflet Draw are loaded from public CDNs, and satellite imagery uses Esri World Imagery tiles with attribution.

## Important
- The plant location marker is a reference point, not a verified equipment survey.
- Routes drawn on each map are independent; they do not automatically georeference the engineering drawing.
- Browser LocalStorage is device/browser-specific. Back up data before clearing browser storage.
