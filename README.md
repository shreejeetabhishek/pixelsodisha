# Plant Tracker – Bidirectional Zone Deletion Sync (v6)

## Included
- `index.html` – updated application
- `F_D1.jpg` – engineering drawing asset

## Fix
Deleting a zone in either map now deletes its linked counterpart in the other map.

- Engineering zone deletion removes its transferred satellite copy (`transferredFrom`) and/or a manually linked satellite peer (`linkGroupId`).
- Satellite zone deletion removes its linked engineering peer and any satellite copies derived from the same engineering zone.
- Worker assignments pointing to deleted zones are cleared.
- Unlinked, independently created satellite-only zones are preserved when an engineering zone is deleted.
- Factory Reset now clears engineering zones, satellite zones, workers, and connection routes from both views.
- Both map layers, dropdowns, dashboard and localStorage are refreshed after deletion.

## Deploy
Replace `index.html` and `F_D1.jpg` in the GitHub Pages repository. Keep both files in the same directory. Do not clear browser site data.

## Test
1. Ensure an engineering zone has a transferred or linked satellite counterpart.
2. Delete the engineering zone using the map's delete tool.
3. Switch to Satellite View: the corresponding linked/transferred zone and its badge should be gone.
4. Repeat by deleting from Satellite View and verify its linked engineering zone is also removed.
5. Create an independent satellite-only zone, delete an unrelated engineering zone, and verify the independent satellite zone remains.
6. Use Factory Reset only if you intend to clear all zone data on both maps.

Data is stored in browser LocalStorage; it does not synchronize across different devices or browsers.
