# llw-system-analysis

Living Lab West - System Analysis

## Interactive Visualization

Start the dev server and open the printed URL in your browser to explore the
system analysis. The app fetches `llw_system_analysis.csv` and displays an
interactive network using Cytoscape.js. Nodes are organised hierarchically
based on their numeric id (e.g. `2` contains `2.1` and `2.2`), using
compound nodes so related topics are grouped together.
Nodes are automatically arranged using Cytoscape's force-directed `cose`
layout so the network is easier to read.

## Development with Vite

1. Install [Node.js](https://nodejs.org/) (version 18+).
2. In VS Code, open the project folder and run the following in the integrated terminal:
   ```bash
   npm install
   npm run dev
   ```
3. Navigate to the printed local URL (usually <http://localhost:5173>) to see the app with hot reload.

Editing `index.html` or `app.js` will automatically refresh the page.

## Building & Deployment

To generate a production build:

```bash
npm run build
```

The static files will be generated in the `dist/` folder. Use `npm run preview`
to serve the build locally or deploy the contents of `dist/` to any static
hosting service (GitHub Pages, Netlify, Vercel, etc.).
