import cytoscape from "cytoscape";
import cola from "cytoscape-cola";
import { parse } from "papaparse";

cytoscape.use(cola);

const colaLayout = {
  name: "cola",
  nodeSpacing: function (node) {
    return 30;
  }, // space between nodes
  edgeLength: function (edge) {
    return 2080;
  }, // distance between connected nodes
  avoidOverlap: true, // prevent overlaps
  randomize: false, // start from deterministic positions
  maxSimulationTime: 500, // how long to run (ms)
};

async function loadData() {
  const csvText = await fetch("llw_system_analysis.csv").then((r) => r.text());
  const parsed = parse(csvText, { header: true }).data;
  const rawNodes = [];
  const edges = [];
  parsed.forEach((row) => {
    if (!row.id) return;
    if (row.id.includes("-")) {
      edges.push(row);
    } else {
      rawNodes.push(row);
    }
  });
  const nodesWithEdges = new Set();
  edges.forEach((e) => {
    if (e.source) nodesWithEdges.add(e.source);
    if (e.target) nodesWithEdges.add(e.target);
  });
  const nodeIds = new Set(rawNodes.map((n) => n.id));
  const parents = new Set();

  // Soft color palette
  const softColors = [
    "#FFB3BA", // soft pink
    "#BAFFC9", // soft mint
    "#BAE1FF", // soft blue
    "#FFE4BA", // soft peach
    "#E8BAFF", // soft purple
    "#B3FFE0", // soft aqua
    "#FFF4BA", // soft yellow
    "#FFB3E6", // soft magenta
    "#B3FFD8", // soft seafoam
    "#D4B3FF", // soft lavender
    "#FFD1B3", // soft coral
    "#B3FFB3", // soft lime
    "#B3D9FF", // soft sky
    "#FFB3D9", // soft rose
    "#D1FFB3", // soft spring
    "#F0B3FF", // soft orchid
    "#B3FFF4", // soft turquoise
    "#FFE0B3", // soft apricot
    "#B3C6FF", // soft periwinkle
    "#FFCCCC", // soft salmon
  ];

  // Create a map to store node colors
  const nodeColors = new Map();
  let colorIndex = 0;

  // Function to get next color from palette
  function getNextColor() {
    const color = softColors[colorIndex % softColors.length];
    colorIndex++;
    return color;
  }

  // Function to get root node ID
  function getRootId(nodeId) {
    const parts = nodeId.split(".");
    return parts[0];
  }

  // First assign colors to root nodes
  rawNodes.forEach((n) => {
    const rootId = getRootId(n.id);
    if (!nodeColors.has(rootId)) {
      nodeColors.set(rootId, getNextColor());
    }
    // Set this node's color to be the same as its root
    nodeColors.set(n.id, nodeColors.get(rootId));
  });

  rawNodes.forEach((n) => {
    const parts = n.id.split(".");
    if (parts.length > 1) {
      const pid = parts.slice(0, -1).join(".");
      if (nodeIds.has(pid)) {
        n.parent = pid;
        parents.add(pid);
      }
    }
  });
  const nodes = rawNodes.filter(
    (n) => nodesWithEdges.has(n.id) || parents.has(n.id) || n.parent
  );
  const elements = [];
  nodes.forEach((n) => {
    const color = nodeColors.get(n.id);
    elements.push({
      group: "nodes",
      data: {
        id: n.id,
        parent: n.parent,
        label: n.label,
        displayLabel: n.id + " " + n.label,
        description: n.description,
        trend: n.trend,
        reliability: n.reliability,
        references: n.references,
        reviewers: n.reviewers,
        organisation: n.organisation,
        mandate: n.mandate,
        comments: n.comments,
        color: color,
      },
    });
  });
  edges.forEach((e) => {
    if (!e.source || !e.target) return;
    const color =
      e.trend === "positive"
        ? "#4ade80"
        : e.trend === "negative"
        ? "#f87171"
        : "#d1d5db";
    elements.push({
      group: "edges",
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        displayLabel: e.id + " " + e.label,
        description: e.description,
        trend: e.trend,
        reliability: e.reliability,
        references: e.references,
        reviewers: e.reviewers,
        organisation: e.organisation,
        mandate: e.mandate,
        comments: e.comments,
        color: color,
      },
    });
  });
  renderGraph(elements);
}

function renderGraph(elements) {
  const cy = cytoscape({
    container: document.getElementById("cy"),
    elements: elements,
    style: [
      {
        selector: "node",
        style: {
          shape: "rectangle",
          "background-color": "data(color)",
          label: "data(displayLabel)",
          width: "label",
          height: "label",
          "text-wrap": "wrap",
          "text-max-width": 100,
          "text-valign": "center",
          "text-halign": "center",
          padding: "10px",
          color: "#000",
          "z-index": 10,
        },
      },
      {
        selector: ":parent",
        style: {
          shape: "rectangle",
          "text-valign": "top",
          "text-halign": "center",
          "text-margin-y": -10,
          "text-max-width": 300,
          "background-opacity": 0.1,
          padding: "10px",
          "font-weight": "bold",
          "font-size": "18px",
          label: "data(displayLabel)",
          "z-index": 11,
        },
      },
      {
        selector: "edge",
        style: {
          width: 2,
          "line-color": "data(color)",
          "target-arrow-color": "data(color)",
          "target-arrow-shape": "triangle",
          "arrow-scale": 1.5,
          label: "",
          "text-background-color": "#fff",
          "text-background-opacity": 1,
          "text-background-padding": "2px",
          "curve-style": "bezier",
          "z-index": 1,
        },
      },
    ],
    layout: colaLayout,
  });

  const sidebar = document.getElementById("sidebar");

  // Add styles for highlighted and faded elements
  cy.style()
    .selector(".highlighted")
    .style({
      "background-color": "data(color)",
      "line-color": "data(color)",
      "target-arrow-color": "data(color)",
      opacity: 1,
      "z-index": 999,
    })
    .selector(".faded")
    .style({
      opacity: 0.2,
      "z-index": 0,
    })
    .update();

  function highlightConnected(node) {
    // Clear previous highlights
    cy.elements().removeClass("highlighted faded");

    // If no node is selected, reset the view
    if (!node) {
      return;
    }

    // Get all directly connected elements
    let neighborhood = node.neighborhood().add(node);

    // Add compound parent if exists
    if (node.parent().length > 0) {
      const parent = node.parent();
      neighborhood = neighborhood.add(parent);
      // Add all siblings (other nodes with same parent)
      neighborhood = neighborhood.add(parent.children());
    }

    // Add compound children if node is compound
    if (node.isParent()) {
      neighborhood = neighborhood.add(node.children());
    }

    // Add edges connected to parent or children
    if (node.parent().length > 0) {
      neighborhood = neighborhood.add(node.parent().connectedEdges());
    }
    if (node.isParent()) {
      neighborhood = neighborhood.add(node.children().connectedEdges());
    }

    // Add connecting edges between highlighted nodes
    neighborhood = neighborhood.add(neighborhood.edgesTo(neighborhood));
    neighborhood = neighborhood.add(neighborhood.edgesWith(neighborhood));

    // Fade all elements
    cy.elements().addClass("faded");

    // Highlight the neighborhood
    neighborhood.removeClass("faded");
    neighborhood.addClass("highlighted");
  }

  function showInfo(d) {
    console.log("Showing info for:", d);
    sidebar.style.display = "block";
    sidebar.innerHTML = `
      <div class="space-y-4">
        <h2 class="text-xl font-bold mb-4">${d.label}</h2>
        ${
          d.description
            ? `<p class="mb-3"><strong>Description:</strong><br/>${d.description}</p>`
            : ""
        }
        ${d.trend ? `<p><strong>Trend:</strong> ${d.trend}</p>` : ""}
        ${
          d.reliability
            ? `<p><strong>Reliability:</strong> ${d.reliability}</p>`
            : ""
        }
        ${
          d.references
            ? `<p><strong>References:</strong><br/>${d.references}</p>`
            : ""
        }
        ${
          d.reviewers ? `<p><strong>Reviewers:</strong> ${d.reviewers}</p>` : ""
        }
        ${
          d.organisation
            ? `<p><strong>Organisation:</strong> ${d.organisation}</p>`
            : ""
        }
        ${d.mandate ? `<p><strong>Mandate:</strong> ${d.mandate}</p>` : ""}
        ${
          d.comments
            ? `<p><strong>Comments:</strong><br/>${d.comments}</p>`
            : ""
        }
      </div>
    `;
  }

  // Update click handlers
  cy.on("tap", "node", (evt) => {
    const node = evt.target;
    highlightConnected(node);
    showInfo(node.data());
  });

  cy.on("tap", "edge", (evt) => {
    showInfo(evt.target.data());
  });

  // Clear highlight when clicking background
  cy.on("tap", (evt) => {
    if (evt.target === cy) {
      highlightConnected(null);
      sidebar.style.display = "none";
    }
  });
}

loadData();
