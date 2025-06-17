import cytoscape from "cytoscape";
import cola from "cytoscape-cola";
import { parse } from "papaparse";
const csvData = await fetch("/llw_system_analysis.csv").then((response) =>
  response.text()
);
const logo = "/C2B2-logo.svg";

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
  const csvText = csvData;
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

// Show initial sidebar content
function showInitialSidebar() {
  sidebar.innerHTML = `
      <div class="pt-6 mb-4 flex flex-col items-center">
      <img src="${logo}" alt="Logo" class="w-60 mb-2" />
      <h1 class="text-2xl font-extrabold text-white-800 leading-tight text-center">Living Lab West</h1>
      <div class="text-2xl font-bold text-white-500 font-medium text-center">Systemanalys</div>
      </div>
      <div class="mb-4">
      <p class="text-white-700 text-base">
        <span class="font-semibold">Välkommen!</span> Utforska systemets komponenter och relationer genom att klicka på noder eller kanter i grafen.
      </p>
      </div>
      <ul class="list-inside list-disc text-white-700 space-y-2 text-sm">
      <li><span class="font-medium">Noder</span> representerar systemkomponenter</li>
      <li>
        <span class="font-medium">Kanter</span> visar relationer:
        <ul class="ml-6 mt-1 space-y-1">
        <li>
          <span class="inline-block w-3 h-3 rounded-full bg-green-300 align-middle mr-1"></span>
          <span class="text-green-300">Positiv effekt</span>
        </li>
        <li>
          <span class="inline-block w-3 h-3 rounded-full bg-yellow-300 align-middle mr-1"></span>
          <span class="text-yellow-300">Otydlig effekt</span>
        </li>
        <li>
          <span class="inline-block w-3 h-3 rounded-full bg-red-300 align-middle mr-1"></span>
          <span class="text-red-300">Negativ effekt</span>
        </li>
        </ul>
      </li>
      <li><span class="font-medium">Färgade grupper</span> visar hierarkisk struktur</li>
      </ul>
      <div class="flex-grow"></div>
      <div class="mt-6 text-xs text-white/40 text-right sticky bottom-0">
      &copy; ${new Date().getFullYear()} Mistra Co-Creating Better Blue.
      </div>
    `;
  // Ensure sidebar uses flex layout with column direction and full height
  sidebar.style.display = "flex";
  sidebar.style.flexDirection = "column";
  sidebar.style.height = "100%";
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

  function fitElementsToViewport(elements) {
    // If only one node is selected, use larger padding
    let padding = 100;
    if (elements.length === 1 && elements[0].isNode && elements[0].isNode()) {
      padding = 300;
    }
    cy.animate({
      fit: {
        eles: elements,
        padding: padding,
      },
      duration: 500,
    });
  }

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
      fitElementsToViewport(neighborhood);
    } else if (element.isParent()) {
      // For compound nodes

      // Add all descendants of the compound node
      neighborhood = element.add(element.descendants());

      // Get all edges connected to the compound node and its descendants
      const connectedEdges = neighborhood.connectedEdges();
      neighborhood = neighborhood.add(connectedEdges);

      // Add all nodes connected to any node in the hierarchy
      const connectedNodes = connectedEdges.connectedNodes();
      neighborhood = neighborhood.add(connectedNodes);

      // If any connected node is a compound, add its children too
      connectedNodes.forEach((node) => {
        if (node.isParent()) {
          neighborhood = neighborhood.add(node.descendants());
        }
      });

      // Add all edges between highlighted nodes
      neighborhood = neighborhood.add(neighborhood.edgesWith(neighborhood));

      // Fit the view to show the edge and connected nodes
      fitElementsToViewport(neighborhood);
    } else {
      // For regular nodes
      neighborhood = element.neighborhood().add(element);

      // // Add compound children if node is compound
      neighborhood.forEach((node) => {
        if (node.isParent()) {
          neighborhood = neighborhood.add(node.descendants());
        }
      });

      // Fit the view to show the edge and connected nodes
      fitElementsToViewport(neighborhood);
    }

    // Fade all elements
    cy.elements().addClass("faded");

    // Highlight the neighborhood
    neighborhood.forEach((node) => {
      node.removeClass("faded");
      // Highlight the node or edge
      node.addClass("highlighted");
      if (node.isParent()) {
        node.addClass("parent");
      }
    });
  }

  function showInfo(d) {
    sidebar.innerHTML = `
      <div class="flex flex-col h-full">
      <div class="mb-6">
        <h2 class="text-2xl font-extrabold text-white mb-2">${
          d.label || "Detaljer"
        }</h2>
        <div class="text-xs text-white/70">${d.displayLabel || ""}</div>
      </div>
      <div class="space-y-4 flex-1">
        ${
          d.description
            ? `<div>
            <div class="font-semibold text-white mb-1">Beskrivning</div>
            <div class="text-white/90 text-sm leading-relaxed">${d.description}</div>
          </div>`
            : ""
        }
        ${
          d.trend
            ? `<div>
            <span class="font-semibold text-white">Trend:</span>
            <span class="inline-block ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              d.trend === "positive"
                ? "bg-green-100 text-green-700"
                : d.trend === "negative"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }">${d.trend.charAt(0).toUpperCase() + d.trend.slice(1)}</span>
          </div>`
            : ""
        }
        ${
          d.reliability
            ? `<div>
            <span class="font-semibold text-white">Tillförlitlighet:</span>
            <span class="inline-block ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              d.reliability.toLowerCase() === "hög"
                ? "bg-green-100 text-green-700"
                : d.reliability.toLowerCase() === "medel"
                ? "bg-yellow-100 text-yellow-700"
                : d.reliability.toLowerCase() === "låg"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }">${d.reliability}</span>
          </div>`
            : ""
        }
        ${
          d.references
            ? `<div>
            <div class="font-semibold text-white mb-1">Referenser</div>
            <div class="text-white/80 text-xs whitespace-pre-line">${d.references}</div>
          </div>`
            : ""
        }
        ${
          d.reviewers
            ? `<div>
            <span class="font-semibold text-white">Granskare:</span>
            <span class="ml-2 text-white/90">${d.reviewers}</span>
          </div>`
            : ""
        }
        ${
          d.organisation
            ? `<div>
            <span class="font-semibold text-white">Organisation:</span>
            <span class="ml-2 text-white/90">${d.organisation}</span>
          </div>`
            : ""
        }
        ${
          d.mandate
            ? `<div>
            <span class="font-semibold text-white">Mandat:</span>
            <span class="ml-2 text-white/90">${d.mandate}</span>
          </div>`
            : ""
        }
        ${
          d.comments
            ? `<div>
            <div class="font-semibold text-white mb-1">Kommentarer</div>
            <div class="text-white/80 text-xs whitespace-pre-line">${d.comments}</div>
          </div>`
            : ""
        }
      </div>
      <div class="flex-grow"></div>
      <div class="mt-8 text-xs text-white/40 text-right">
        &copy; ${new Date().getFullYear()} Mistra Co-Creating Better Blue.
      </div>
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
      showInitialSidebar(); // Show welcome message

      // Animate to fit all elements in view, accounting for sidebar
      cy.animate({
        fit: {
          eles: cy.elements(),
          padding: 50,
        },
        duration: 500,
      });
    }
  });

  // Show initial sidebar on load
}

// Show initial sidebar immediately
showInitialSidebar();

// Call loadData and show initial sidebar content again after data is loaded
loadData().then(() => {
  showInitialSidebar();
});
