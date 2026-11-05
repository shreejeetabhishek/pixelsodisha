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
