# Steel Plant Tracker - Industrial Equipment Symbols

This update introduces customizable equipment icons to your machine zones, making the map instantly readable based on equipment type.

## How to use the new feature:
1. Use the drawing toolbar to draw a zone or pin a location (just like before).
2. Open the sliding **Menu**.
3. Under **Section 1: Machine Settings**, select the zone you just drew.
4. Use the new **Assign Equipment Type/Symbol** dropdown to choose an industrial symbol (e.g., Furnace, Conveyor, Valve, Motor).
5. Click **Update Machine Data**.

The symbol will immediately appear inside the machine's badge on the map, right next to the LED status light. These symbols also carry over into the dropdown lists to make managing the plant much easier.

## Instructions:
1. Extract the ZIP.
2. Ensure your `F_D1.jpg` is in the same folder.
3. Overwrite your previous `index.html` with this new one and push to GitHub Pages.


## Satellite map view (new)

The application now has two map modes: **Engineering Drawing** and **Satellite View**. The engineering drawing continues to use `F_D1.jpg`; the satellite view uses Esri World Imagery tiles through Leaflet.

### Set the plant location
1. Open the website and select **Satellite View**.
2. Enter the plant latitude and longitude and select **Go to plant location**, or click the plant location directly on the satellite map.
3. The selected site marker and coordinates are saved in that browser's LocalStorage.

The first satellite view opens over India as a general starting view. It does not identify the actual plant automatically. The plant coordinates must be supplied and verified. Existing engineering-drawing zones remain on the engineering map; they are not automatically georeferenced or copied onto the satellite map.

### Satellite imagery and internet access
Satellite tiles require an internet connection. The map displays Esri World Imagery with attribution. Tile availability, zoom level, usage terms and service conditions are controlled by Esri and its imagery providers; this is not an offline imagery package or a guarantee of unlimited free commercial use.
