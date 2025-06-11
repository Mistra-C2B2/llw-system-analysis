# llw-system-analysis
Living Lab West - System Analysis

## Usage

Start a local web server in this directory (for example `python3 -m http.server`) and open `index.html` in your browser to view the system visualization. The page uses Cytoscape.js to render a graph described by `edges.csv`.

`edges.csv` contains both nodes and edges in one file. Important columns are:

- `Kod`
- `Beteckning:  Komponent (box) Interaktion (pil)`
- `Beskrivning`
- `Samband (pil) från`
- `Samband /(pil) till`
- `Trend`
- `Tillförlitlighet av kunskapen`
- `Exempel på källor`
- `Granskare`
- `Kommentar`
- `Organisation`
- `Mandat`

Rows whose `Kod` contains a dash (`-`) represent edges, using the `Samband` fields to specify the source and target. Rows without a dash are interpreted as nodes. Any row without a code is ignored.

When the page loads, the CSV is fetched, parsed and displayed as a graph. Edges are styled according to their trend and dashed if the confidence indicates uncertainty.
Clicking an edge shows its trend, confidence and reference. Clicking a node displays its label, description and counts of incoming and outgoing edges.
