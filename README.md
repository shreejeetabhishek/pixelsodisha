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


## Engineering drawing editor restoration
- Replaced the basic prompt-driven drawing interaction with a proper editor toolbar: Select/Move, Line, Rectangle, Polygon, Marker, Finish Polygon, Rename, Delete and Undo.
- Line and rectangle are drawn by dragging. Polygon is created by tapping its corners and pressing Finish Polygon. Marker is placed with one tap.
- Select/Move lets the user select and drag existing annotations. Rename/Delete act on the selected annotation. Undo restores the previous saved geometry snapshot.
- Drawing annotations retain stable IDs, so existing Workforce `drawingId` associations and drawing-zone data cards continue to reference the same features.
- Mouse and touch pointer events are handled on the SVG drawing overlay; two-finger gestures remain available for viewer navigation.
- Existing annotation data in `plant_tracker_engineering_annotations_v1` is loaded without clearing or replacing it.


## Prototype readiness check (static checks performed)
The final package was checked before delivery:
- ZIP archive integrity: passed (`testzip` returned no corrupt member).
- JavaScript syntax: passed for `app.js` and inline scripts in the 3D, engineering drawing and satellite pages using Node.js syntax checks.
- HTML IDs: duplicate IDs removed; a final scan found no duplicate IDs in the HTML pages.
- Local asset references: checked for missing local `src`/`href` references.
- Engineering drawing image: `F_D1.jpg` is included at repository root and referenced by `engineering-drawing.html`.
- Drawing editor: tool handlers and SVG overlay are present for Select/Move, Line, Rectangle, Polygon, Marker, Finish Polygon, Rename, Delete and Undo. Annotation data remains in `plant_tracker_engineering_annotations_v1`.
- Workforce/map/drawing linkage: uses `plant_tracker_org_hierarchy_v1`, `plant_tracker_map_features_v1` and `plant_tracker_engineering_annotations_v1`; same-tab custom events and cross-tab storage events refresh the relevant drawing/map displays.
- 3D page: duplicate full-screen control ID was removed. The 3D viewer library and illustrative GLB are remote dependencies and require internet access.
- Satellite page: Leaflet and Esri imagery are remote dependencies and require internet access.

## Important scope of this readiness check
This is a static and source-level prototype check, not a production certification. A real browser/device end-to-end run could not be completed in this environment because a Playwright browser binary was not installed. Test the final ZIP on the target Android phone and desktop browser before operational use. All data is browser-local; this package does not provide multi-user Supabase synchronisation, authentication, role enforcement, or production audit guarantees. The illustrative 3D scene is not a surveyed model of the Angul plant and is not geometrically registered to satellite or engineering coordinates.


## Engineering drawing responsiveness update
- Drawing previews now update only the active SVG shape instead of rebuilding the entire annotation layer on every pointer movement.
- Moving an existing annotation uses a temporary SVG transform during the drag; geometry is committed and saved once on pointer release.
- Hierarchy assignments are read once per redraw rather than once for every annotation.
- New shapes are created immediately with a default name; use Rename after placement instead of blocking the drawing gesture with a browser prompt.
- These changes reduce repeated DOM creation, LocalStorage reads and JSON cloning during touch/mouse movement, especially on mobile devices.


# Shared persistence and manual GitHub backup

## What is now implemented
- A shared persistence adapter (`sync.js`) watches the existing LocalStorage document keys used by the prototype. Local edits are written immediately to browser storage, marked pending, then queued to Supabase when an authorised user is signed in.
- Shared documents include Workforce hierarchy and audit, satellite GeoJSON, engineering annotations, 3D markers, explicit zone-to-drawing links, and the earlier Plant Tracker v4/v1 legacy keys.
- Engineering, satellite, Workforce and 3D pages load the same adapter and refresh their visible state when remote documents arrive.
- The first sync uploads local documents that do not yet exist in Supabase. Documents already in Supabase are hydrated to a clean browser. The browser's localStorage is retained as a cache/draft.
- A floating **Data & Sync** panel supports Supabase email/password sign-in, Sync now, sign out, full JSON backup export and backup import.
- Exported backup JSON is designed for manual commit to GitHub (for example, save it under `backups/`). The website does NOT push or modify GitHub automatically.
- No GitHub token, Supabase service-role key, or other privileged credential is included in frontend files. `config.js` contains only the Supabase project URL, publishable/anon key and plant ID; configure strict RLS before deployment.

## Configure Supabase
1. Open your Supabase project → SQL Editor.
2. Run `supabase/001_shared_drawing_storage.sql`.
3. In Authentication, create/invite the authorised operator accounts. Public sign-up should remain disabled for an internal plant system.
4. Copy the Auth user UUID for each authorised account.
5. As project owner in SQL Editor, add the first membership (replace the UUID):
   ```sql
   insert into public.plant_memberships (plant_id,user_id,role)
   values ('ANGUL-PLANT-001','AUTH_USER_UUID_HERE','site_manager');
   ```
   Add one membership row per authorised user. Supported role text is currently descriptive; refine role-specific write policies before production.
6. Copy `config.example.js` to `config.js`. Set:
   - `supabaseUrl`: Project URL
   - `supabaseAnonKey`: publishable/anon key (never service-role)
   - `plantId`: same exact ID used in membership rows (`ANGUL-PLANT-001` by default)
7. Commit `config.js` to the public repository only after confirming it contains no secret. The anon/publishable key is intended for browser use; database RLS is the security boundary.
8. Deploy and open **Data & Sync**. Sign in with an authorised Supabase Auth account, then select **Sync now**.

## Data and compatibility
The adapter intentionally preserves existing browser keys rather than renaming or replacing them:
- `plant_tracker_org_hierarchy_v1`
- `plant_tracker_org_audit_v1`
- `plant_tracker_map_features_v1`
- `plant_tracker_engineering_annotations_v1`
- `plant_tracker_3d_markers_v1`
- `plant_tracker_zone_links_v1`
- `plant_zones_v4`, `plant_workers_v4`, `plant_satellite_zones_v1`,
  `plant_connection_routes_v1`, `plant_site_location_v1`,
  `plant_zone_alignment_v1`, `plant_satellite_viewport_v1`

Stable `zoneId` and drawing annotation `id` values are not regenerated by this adapter. Workforce `zoneId` and `drawingId` relationships are retained; the adapter derives `plant_tracker_zone_links_v1` from those existing assignments.

## GitHub manual backup workflow
1. Open **Data & Sync → Export full backup**.
2. Save the downloaded JSON file into the repository, preferably `backups/`.
3. Review the file for operational or personal data before committing. The export can contain employee names, employee IDs, workforce assignments, map coordinates and audit history.
4. Commit and push the backup manually. GitHub history then provides a versioned archive.
5. To restore, open **Data & Sync → Import backup**, select the JSON file, review the restored map/drawing/workforce views, then Sync now.

Do not commit backups to a public repository if they contain identifiable employee or sensitive operational information. Prefer a private GitHub repository and restrict access.

## Important limitations / production hardening
- This is an initial shared-document sync layer, not a fully conflict-free collaborative editor. Simultaneous edits to the same document can conflict; do not have multiple people edit the same map/drawing at once until revision-aware conflict resolution and locking are added.
- Supabase email/password authentication is exposed in the Data & Sync panel. The existing prototype's role selector is still a demo control, not server-enforced authorisation. The SQL currently permits any active plant member to write plant documents. Replace this with role- and document-specific policies and server-validated approvals before operational use.
- Browser autosave works without Supabase. Cross-device sync requires internet, Supabase setup, a valid membership row and sign-in.
- GitHub is manual by design, per the requested architecture. No automatic repository write is attempted.
- The existing engineering drawing and satellite geometry remain different coordinate systems. `plant_tracker_zone_links_v1` links them by stable IDs; it does not transform engineering pixels into GPS coordinates or calibrate the illustrative 3D model.
- Run a full device acceptance test with a copy of the data before operational use. Keep an exported backup before first cloud hydration.


## Linked deletion and autosave behaviour
- Satellite geometry changes are automatically written to localStorage shortly after drawing/editing/deleting; the explicit Save map button remains available.
- Engineering annotation create/move/rename/delete/undo writes the engineering annotation document immediately to localStorage.
- When a Workforce position is linked to both a satellite zone and a drawing annotation, `sync.js` derives a stable zone-link record in `plant_tracker_zone_links_v1`.
- Deleting a satellite zone asks whether its linked drawing annotations and Workforce references should also be removed/unlinked.
- Deleting a linked engineering annotation asks whether its paired satellite feature should also be removed and Workforce references unlinked.
- These operations preserve the position records themselves; they remove only the spatial association. A full audit-grade soft-delete/recovery workflow is a production hardening item.


# Temporary prototype storage: GitHub via Cloudflare Worker (Option B)
The selected prototype storage option is GitHub repository JSON storage through a Cloudflare Worker. Supabase is retained as a future adapter, but should not be activated as a second writer at the same time.
- `github-sync.js` adds a GitHub prototype save panel to Overview, Engineering Drawing, Satellite View and 3D pages.
- `cloudflare-worker/worker.js` authenticates the prototype save password, keeps the GitHub PAT server-side, reads/writes the repository data file, and uses GitHub file SHA to reject stale writes.
- `github-config.js` contains only the deployed Worker URL and plant ID. Fill it after deploying the Worker.
- Follow `cloudflare-worker/README.md` to create a fine-grained GitHub token, set Worker secrets, configure repository/branch/origin and deploy.
- LocalStorage remains the immediate local cache. The repository JSON bundle contains the existing map, engineering drawing, workforce, zone-link and 3D marker records.
- This is a single-shared-password prototype, not role-based employee access. Use a private repository and avoid sensitive employee data.

## Automatic drawing/data merge

The GitHub adapter now uses a three-way merge when the repository SHA has changed:

- It compares the last version loaded by this browser, the current local snapshot, and the latest repository snapshot.
- Changes to different object properties and records with stable IDs are merged automatically.
- Array records are matched using stable identifiers such as `id`, `annotationId`, `zoneId`, `workerId`, `featureId`, `routeId`, `markerId`, `drawingId`, or `uuid`.
- Primitive arrays are combined without duplicate values.
- Concurrent edits to the same field, and delete-versus-edit cases, are surfaced in the GitHub save panel for review. The local value is retained for a same-field edit; modified records are retained when the other side deleted them.
- The Worker also converts GitHub's concurrent-write rejection into a version conflict so the browser can fetch and merge again.

This is automatic conflict-aware merging, not a live collaborative cursor/CRDT system. For reliable cross-device merges, keep stable IDs on every drawing annotation, zone, worker, route and marker. If a record has no recognized stable ID, simultaneous edits to its containing array may need manual review. Test with two browsers before relying on it for operational records.
