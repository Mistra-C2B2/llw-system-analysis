// Fetch and render the CSV as an interactive network
async function init() {
  try {
    const nodeMap = new Map();
      let color = 'bg-gray-300';
      if (trend.startsWith('pos')) {
        color = 'bg-green-400';
      } else if (trend.startsWith('neg')) {
        color = 'bg-red-400';
      }
    edges.forEach(e => {
      connectedIds.add(e.data.source);
      connectedIds.add(e.data.target);
    });

    const parentIds = new Set();
    for (const id of connectedIds) {
      let parent = id.includes('.') ? id.substring(0, id.lastIndexOf('.')) : null;
      while (parent) {
        parentIds.add(parent);
        parent = parent.includes('.') ? parent.substring(0, parent.lastIndexOf('.')) : null;
      }
    }

    const nodes = [];
    for (const [id, node] of nodeMap) {
      if (connectedIds.has(id) || parentIds.has(id)) {
        nodes.push(node);
      }
    }

      // Force-directed layout with tighter spacing
      layout: {
        name: 'cose',
        padding: 30,
        fit: true,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
        animate: false
      }
    cy.fit();


    parsed.data.forEach((row) => {
      const trend = (row.trend || "").toLowerCase();
      const color = trend.startsWith("pos")
        ? "green"
        : trend.startsWith("neg")
        ? "red"
        : "gray";

      if (row.source && row.target) {
        edges.push({
          data: {
            id: row.id,
            source: row.source,
            target: row.target,
            label: row.label,
            description: row.description,
            trend: row.trend,
            reliability: row.reliability,
          },
        });
      } else {
        const parentId = row.id.includes(".")
          ? row.id.substring(0, row.id.lastIndexOf("."))
          : undefined;
        nodes.push({
          data: {
            id: row.id,
            parent: parentId,
            label: row.label,
            description: row.description,
            trend: row.trend,
            reliability: row.reliability,
            color,
          },
        });
      }
    });

    const cy = cytoscape({
      container: document.getElementById("cy"),
      elements: { nodes, edges },
      style: [
        {
          selector: "node",
          style: {
            shape: "round-rectangle",
            "background-color": "data(color)",
            label: "data(label)",
            "text-valign": "center",
            color: "#000",
            "text-wrap": "wrap",
            "text-max-width": 80,
            padding: 10,
            "font-size": 10,
          },
        },
        {
          selector: ":parent",
          style: {
            "background-opacity": 0.1,
            padding: 20,
          },
        },
        {
          selector: "edge",
          style: {
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
            width: 2,
            "line-color": "#999",
            "target-arrow-color": "#999",
            label: "data(label)",
            "font-size": 8,
            "text-background-color": "#fff",
            "text-background-opacity": 1,
            "text-background-padding": 2,
          },
        },
      ],
      // Use a force directed layout so nodes are not aligned in a single row
      layout: { name: "cose", padding: 5 },
    });

    // Tooltips
    cy.nodes().forEach((node) => {
      const content = `<strong>${node.data("label")}</strong><br>${node.data(
        "description"
      )}<br>Trend: ${node.data("trend")}<br>Reliability: ${node.data(
        "reliability"
      )}`;
      const ref = node.popperRef();
      const dummy = ref.getBoundingClientRect;
      ref.getBoundingClientRect = () => ({
        width: 0,
        height: 0,
        top: node.renderedPosition("y"),
        left: node.renderedPosition("x"),
        right: node.renderedPosition("x"),
        bottom: node.renderedPosition("y"),
      });
      const tip = tippy(document.createElement("div"), {
        getReferenceClientRect: ref.getBoundingClientRect,
        trigger: "manual",
        content,
        placement: "bottom",
      });
      node.on("mouseover", () => tip.show());
      node.on("mouseout", () => tip.hide());
    });
  } catch (err) {
    console.error("Failed to load CSV", err);
  }
}

document.addEventListener("DOMContentLoaded", init);
