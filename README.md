# llw-system-analysis
Living Lab West - System Analysis

## Usage

Start a local web server in this directory (for example `python3 -m http.server`) and open `index.html` in your browser to view the system visualization. The page uses Cytoscape.js to render a graph described by `edges.csv`.

`edges.csv` contains both nodes and edges. Important columns are:

- `Kod` – unique identifier for the row
- `Komponent (box)` – name of the node
- `Samband (pil)` – name of the interaction/edge
- `Beskrivning`
- `Trend`
- `Tillförlitlighet av kunskapen`
- `Exempel på källor`
- `Granskare`
- `Kommentar`
- `type` – either `Node` or `Edge`
- `from_node`, `to_node` – original source and target labels
- `from_node_corrected`, `to_node_corrected` – cleaned source and target labels used for building the graph

Rows where `type` is `Node` describe a node using `Kod` and `Komponent (box)`. Rows where `type` is `Edge` describe a connection between `from_node_corrected` and `to_node_corrected`. Any row missing a code or type is ignored.

When the page loads the CSV is parsed and displayed as a graph. Edges whose confidence includes "osäker" are shown with dashed lines. Clicking an edge displays its trend, confidence and reference. Clicking a node shows its label, description and counts of incoming and outgoing edges.
