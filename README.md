# llw-system-analysis
Living Lab West - System Analysis

## Usage

You can simply open `index.html` in your browser or serve the folder with a small web server (for example `python3 -m http.server`). When served over HTTP the page loads `edges.csv` directly. When opened from the file system, the script falls back to an embedded copy of the same CSV so you do not get a CORS error.

`edges.csv` now contains the following columns:

- `source` – the ID of the source node
- `target` – the ID of the target node
- `effect` – either `positive` or `negative`
- `confidence` – either `sure` or `unsure`
- `reference` – free‑text references or notes

When the page loads, the CSV is fetched, parsed and displayed as a graph. Edges are styled according to their effect (green for positive, red for negative) and dashed if the confidence is unsure.
