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
    return 280;
  }, // distance between connected nodes
  avoidOverlap: true, // prevent overlaps
  randomize: true, // start from deterministic positions
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
        : "#FFD34E"; // Mustard yellow for neutral trends
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
          "z-index": 100,
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
          "background-opacity": 0.2,
          padding: "10px",
          "font-weight": "bold",
          "font-size": "18px",
          "border-color": "data(color)",
          "border-width": 2,
          "border-style": "solid",
          label: "data(displayLabel)",
          "z-index": 10,
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
      "background-opacity": 1,
      "z-compound-depth": "top",
    })
    .selector(".highlighted.parent")
    .style({
      "background-opacity": 0.2, // Make compound node background visible when highlighted
      "background-color": "data(color)",
      "border-color": "data(color)",
      "border-opacity": 1,
      "z-compound-depth": "top",
    })
    .selector(".faded")
    .style({
      "background-opacity": 0.2,
      "background-color": "#d1d5db", // Light gray for faded elements
      "border-opacity": 0.2,
      "border-color": "#d1d5db", // Light gray for faded elements
      "edge-opacity": 0.2,
      "line-color": "#d1d5db", // Light gray for faded edges
      "target-arrow-color": "#d1d5db", // Light gray for faded edges
      "text-opacity": 0.2,
      "text-color": "#d1d5db", // Dark gray for faded text
      "z-compound-depth": "bottom",
    })
    .update();

  function highlightConnected(element) {
    // Clear previous highlights
    cy.elements().removeClass("highlighted faded");

    // If no element is selected, reset the view
    if (!element) {
      return;
    }

    let neighborhood;

    if (element.isEdge()) {
      // For edges, highlight the edge and its connected nodes
      neighborhood = element.connectedNodes().add(element);

      // Add all children of connected nodes
      const connectedCompounds = element.connectedNodes().children();
      neighborhood = neighborhood.add(connectedCompounds);

      // // Add all children of connected compound nodes
      connectedCompounds.forEach((compound) => {
        neighborhood = neighborhood.add(compound.descendants());
      });

      // Fit the view to show the edge and connected nodes
      cy.animate({
        fit: {
          eles: neighborhood,
          padding: 50, // Add some padding around the elements
        },
        duration: 500, // Animation duration in milliseconds
      });
    } else if (element.isParent()) {
      // For compound nodes, highlight complete subgraph
      // Start with the compound node itself
      neighborhood = element.add(element.descendants());

      // Get all edges connected to the compound node and its descendants
      const connectedEdges = neighborhood.connectedEdges();
      neighborhood = neighborhood.add(connectedEdges);

      // Add all nodes connected to any node in the hierarchy
      const connectedNodes = connectedEdges.connectedNodes().not(neighborhood);
      neighborhood = neighborhood.add(connectedNodes);

      // If any connected node is a compound, add its children too
      connectedNodes.forEach((node) => {
        if (node.isParent()) {
          neighborhood = neighborhood.add(node.descendants());
        }
      });

      // Add all edges between highlighted nodes
      neighborhood = neighborhood.add(neighborhood.edgesWith(neighborhood));
    } else {
      // For regular nodes
      neighborhood = element.neighborhood().add(element);

      // Get connected compound parents
      let connectedCompounds = neighborhood.nodes().parents();

      // Add compound parent if exists
      if (element.parent().length > 0) {
        const parent = element.parent();
        neighborhood = neighborhood.add(parent);
        neighborhood = neighborhood.add(parent.children());
      }

      // Add compound children if node is compound
      if (element.isParent()) {
        neighborhood = neighborhood.add(element.descendants());
      }

      // Add all compound parents that are connected through edges
      neighborhood = neighborhood.add(connectedCompounds);

      connectedCompounds.forEach((compound) => {
        neighborhood = neighborhood.add(compound.descendants());
      });

      // Add edges connected to parent or children
      if (element.parent().length > 0) {
        neighborhood = neighborhood.add(element.parent().connectedEdges());
      }
      if (element.isParent()) {
        neighborhood = neighborhood.add(element.descendants().connectedEdges());
      }

      // Add connecting edges between highlighted nodes
      neighborhood = neighborhood.add(neighborhood.edgesTo(neighborhood));
      neighborhood = neighborhood.add(neighborhood.edgesWith(neighborhood));
    }

    // Fade all elements
    cy.elements().addClass("faded");

    // Highlight the neighborhood
    neighborhood.forEach((node) => {
      console.log(
        "Highlighted node/edge id:",
        node.id(),
        "isParent:",
        node.isParent ? node.isParent() : false
      );
      node.removeClass("faded");
      // Highlight the node or edge
      node.addClass("highlighted");
      if (node.isParent()) {
        node.addClass("parent");
      }
      console.log(node);
    });
    // neighborhood.removeClass("faded");
    // neighborhood.addClass("highlighted");
  }

  function showInfo(d) {
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
    const edge = evt.target;
    highlightConnected(edge);
    showInfo(edge.data());
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
