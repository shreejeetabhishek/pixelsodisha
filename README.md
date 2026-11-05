# Steel Plant Tracker - Advanced Animation & Settings Update

This version introduces the heavy customization, live machine status animations, and detailed worker logic requested.

## High-End Features Added:
1. **Machine Status Settings Panel**: 
   - A new control block allows you to select any vectorized zone you drew and change its live status to **Running**, **Maintenance**, or **Offline**.
2. **Live Map Animations**: 
   - **Blinking LEDs**: Every badge now has an LED status light. It blinks fast green (Running), pulses slowly yellow (Maintenance), or stays solid red (Offline).
   - **Flowing Connections**: If you draw a polyline (connection route) and set it to running, the dashed lines will actually animate across the screen to simulate material flow!
   - **Pulsing Zones**: Active machines/polygons will subtly pulse their background color on the map.
3. **Advanced Worker Customization**:
   - You can now assign specific roles (Operator, Technician, Supervisor, Safety).
   - The UI cleanly lists workers inside the map badge, showing their specific designation right next to their name.
4. **Dark Mode Blueprint UI**:
   - The sidebar has been styled in a dark "Command Center" theme to make the neon greens, yellows, and reds of the machine animations stand out sharply against the schematic.

## Instructions:
1. Extract the ZIP.
2. Ensure your `F_D1.jpg` is in the same folder.
3. Overwrite your previous `index.html` with this new one and push to GitHub Pages.
