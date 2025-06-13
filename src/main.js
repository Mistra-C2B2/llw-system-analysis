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
    return 80;
  }, // distance between connected nodes
  avoidOverlap: true, // prevent overlaps
  randomize: false, // start from deterministic positions
  maxSimulationTime: 5000, // how long to run (ms)
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
    const color =
      n.trend === "positive"
        ? "#4ade80"
        : n.trend === "negative"
        ? "#f87171"
        : "#d1d5db";
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
          label: "",
          "text-background-color": "#fff",
          "text-background-opacity": 1,
          "text-background-padding": "2px",
          "z-index": 1,
        },
      },
    ],
    layout: colaLayout,
  });

  const sidebar = document.getElementById("sidebar");
  function showInfo(d) {
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
    sidebar.classList.remove("hidden");
  }

  cy.on("tap", "node", (evt) => showInfo(evt.target.data()));
  cy.on("tap", "edge", (evt) => showInfo(evt.target.data()));

  // Close sidebar when clicking background
  cy.on("tap", (evt) => {
    if (evt.target === cy) {
      sidebar.classList.add("hidden");
    }
  });
}

loadData();
