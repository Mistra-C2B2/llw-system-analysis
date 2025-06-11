# llw-system-analysis
Living Lab West - System Analysis

## Usage

Start a local web server in this directory (for example `python3 -m http.server`) and open `index.html` in your browser to view the system visualization. The page uses Cytoscape.js to render a graph described by `edges.csv`.

`edges.csv` now contains the following columns:

- `source` – the ID of the source node
- `target` – the ID of the target node
- `effect` – either `positive` or `negative`
- `confidence` – either `sure` or `unsure`
- `reference` – free‑text references or notes

When the page loads, the CSV is fetched, parsed and displayed as a graph. Edges are styled according to their effect (green for positive, red for negative) and dashed if the confidence is unsure.
