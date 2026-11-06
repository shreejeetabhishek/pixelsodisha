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


## Engineering drawing
- `F_D1.jpg` is the original engineering drawing and is stored in the repository root.
- Open it from **Plant map → Engineering drawing**. The dedicated `engineering-drawing.html` viewer supports fit-to-screen, zoom, drag-to-pan, touch pinch zoom, and 90° rotation.
- Keep the filename `F_D1.jpg` unchanged; the viewer references it directly.


## Satellite map
- `satellite-view.html` opens an interactive satellite map centred on Yard 1 at `20.8954690, 84.9788749`.
- Satellite imagery is streamed from Esri World Imagery; OpenStreetMap is available as a street-map layer. Internet access is required for the map tiles and Leaflet library.
- The supplied coordinate is a reference marker, not a verified plant boundary. Confirm the exact plant perimeter and zone coordinates before drawing operational geofences.
- `assets/3d/` is reserved for future locally stored illustrative GLB/GLTF models. No dimensionally accurate 3D plant model is included yet.


## In-browser map editor (prototype)
- Open **Plant map → Satellite view → Enable map editing**.
- Leaflet.draw tools let you draw polygons, rectangles, lines and point markers; edit vertices and delete selected features.
- New features ask for a name and type. Click a saved feature while edit mode is on to rename/reclassify it.
- **Save map** stores drawn features in browser LocalStorage (`plant_tracker_map_features_v1`). Leaving edit mode also saves pending changes.
- **Export GeoJSON** downloads the map geometry; **Import GeoJSON** restores a previous export in another browser/device.
- The Yard 1 reference pin is separate from editable features and is not removed by clearing drawn features.
- Map tiles and Leaflet/Leaflet.draw libraries load from online providers/CDNs. Internet access is required.
- This is a frontend prototype: LocalStorage is per browser/device and is not shared with other users. Editing is not yet role-protected, and no Supabase sync or multi-user conflict handling is included. Add server-side authentication/authorization before operational deployment.


## 3D illustrative site view
- Open `3d-view.html` for one complete pre-arranged industrial ore-processing and haulage site model.
- The model is served from the publisher's CDN: `https://cdn.3dassets.dev/assets/13465/v1/model.glb`.
- Publisher source: https://3dassets.dev/packs/ore-processing-and-haulage-plant
- Publisher states the model pack is CC0 1.0 Universal. The scene includes crushing, conveyors, milling/separation, storage and rail loadout.
- The GLB is streamed, not bundled in this ZIP. Internet access and CDN availability are required. See `assets/3d/README.md` for how to self-host it later.
- This is an illustrative generic site, not a surveyed reconstruction of the Angul plant.


## Integrated map / drawing / 3D controls update
- Satellite map: full-screen control; Leaflet Draw toolbar is visible on entry; polygon, rectangle, line and marker tools are available. The map editor persists drawn GeoJSON in browser LocalStorage and supports export/import.
- Engineering drawing: full-screen control plus Select, Rectangle, Polygon and Pin annotation tools. These drawing annotations are stored locally in the browser under `plant_tracker_engineering_annotations_v1`.
- 3D site viewer: full-screen control, orbit/zoom/pan, and user-added illustrative hotspot labels saved locally under `plant_tracker_3d_markers_v1`.
- Logo is now inline SVG on the standalone viewer pages to avoid broken relative image paths.
- Important: satellite polygons, engineering-image annotations and 3D hotspots are separate coordinate systems. This frontend update makes drawing/annotation available in each view, but does not yet automatically register one geometry across all three coordinate systems. That requires explicit calibration between the engineering drawing, geographic coordinates and 3D model coordinates. LocalStorage is per browser/device; no Supabase sync or multi-user editing is implemented.


## Mobile drawing repair
- Satellite map uses a single-column mobile layout: the map is full width and the information/edit panel moves below it.
- Satellite map viewport has a taller mobile height; map attribution wraps within the map.
- Engineering drawing tools capture touch/pointer events on the SVG overlay itself, preventing the parent pan handler from stealing drawing gestures.
- Select, Rectangle, Polygon and Pin modes visibly indicate the active tool. Rectangle/Pin use press-drag-release; Polygon uses taps and a double-tap to finish.


## Organisation hierarchy and position assignment
- Workforce now contains a configurable hierarchy with Site VP, Site Head, Site Manager, Site Incharge, Department Head, Department Incharge, Supervisor, Technician, Operator, Electrician, Rigger, Fitter, Welder/Cutter, Driver, Helper, Cleaner and Peon.
- Position records have IDs, department, parent/reporting position, incumbent and occupied/vacant state.
- Authorized prototype roles can assign vacant positions, replace/reassign an incumbent, or vacate a position. Each change is persisted in LocalStorage and appears in the Overview coverage summary and History & Audit.
- The acting-role selector is a prototype testing control, not authentication. Do not use it to grant real permissions.
- The data is shared among pages in the same browser through LocalStorage and a custom change event. It is not shared across devices/users, and the existing communications, equipment, reports, safety, attendance and approvals sample records are not yet backed by one production database.
- Before operational use, implement Supabase tables, authenticated employee identities, scoped role grants, RLS, audited server-side assignment functions, and database-backed relationships. Client-side role checks are only for demonstrating the workflow.


## Position-to-zone linkage
- Every satellite-drawn vector feature receives a stable `zoneId` in GeoJSON properties. Position records may reference that `zoneId` and an optional engineering annotation ID.
- Workforce position actions include **Link site zone / Change zone**. The user selects an existing satellite vector zone and, optionally, its matching engineering-drawing annotation.
- The Workforce table displays the linked zone. Satellite map popups and the feature list show the positions and current incumbents assigned to each zone.
- Engineering drawing annotations display the linked position roles and incumbents. This links operational responsibility to the selected drawing annotation; it does not mathematically transform the engineering image geometry into satellite coordinates.
- Updates use LocalStorage and refresh across open tabs in the same browser. The data is not shared across separate users/devices until moved to a shared backend.
- Existing feature geometry and IDs are preserved; zone IDs are added to GeoJSON properties where missing. Do not delete existing browser storage during testing.


## Floating vector-zone data cards
- Satellite View renders a dark floating data card for every saved vector zone/feature. Cards are positioned from the feature's geographic centre and recalculate after map pan/zoom; nearby cards receive screen-space offsets to reduce overlap.
- Cards show zone name, status (only when a status value exists; otherwise explicitly "Status not reported"), assigned personnel count, linked position count and up to two role/incumbent labels.
- Tapping a card highlights its vector boundary and opens a detailed zone popup with every linked position, employee and employee ID.
- Engineering Drawing annotations now open a floating data card showing all positions linked to that drawing annotation.
- Cards are driven by stable `zoneId` / `drawingId` relationships and the same LocalStorage position records. Reassignment updates the records used by both map and drawing cards.
- The generic 3D illustrative model is not geographically calibrated to the site or the engineering drawing. It remains a separate illustrative view; automatic 3D-to-map geometry synchronization requires a measured model coordinate transform and is not claimed here.
- All current synchronization remains browser-local. Different devices/users require Supabase and server-side authorization.
