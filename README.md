# Steel Plant Tracker - Zoom Scaling Update

This update introduces dynamic CSS scaling to the map badges, solving the issue of badges overlapping and clustering when the map is fully zoomed out on a mobile device.

## Key Changes:
1. **Dynamic Visibility based on Zoom**: 
   - When you are **zoomed in** (`zoom: 0` or higher), the badge shows full details: Location, count, and the exact names and roles of every worker.
   - When you zoom out slightly (`zoom: -1`), the badge shrinks, hiding the long list of workers to save space, but keeping the zone name and headcount visible.
   - When you **zoom all the way out** (`zoom: -2`), the badge collapses completely into just the animated LED light. This gives you a clear, uncluttered view of the entire plant floor and its overall machine statuses (Green/Amber/Red dots) without text overlap.

## Instructions:
1. Extract the ZIP.
2. Ensure your `F_D1.jpg` is in the same folder.
3. Overwrite your previous `index.html` with this new one and push to GitHub Pages.
