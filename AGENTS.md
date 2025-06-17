# LLW System Analysis Visualization - Project Guide

## 📊 Project Overview

This is a modern lightweight web-based system visualization tool based on:

- Cytoscape.js for interactive network rendering.
- PapaParse for CSV parsing.
- Tailwind CSS for styling.
- Pure HTML5 + JavaScript (ES6) — no frameworks, no build tools required.

The app fetches a CSV file containing nodes and edges and dynamically builds an interactive network diagram representing system dependencies.

## 🔧 Tech Stack

| Layer                 | Tech           | Notes                           |
| --------------------- | -------------- | ------------------------------- |
| Frontend              | HTML5 + ES6    | Pure frontend                   |
| Network Graph         | Cytoscape.js   | Main network rendering          |
| CSV Parsing           | PapaParse.js   | Lightweight CSV parser          |
| Styling               | TailwindCSS    | Utility-first modern CSS        |
| Build Tool (optional) | Vite           | For hot-reload dev server       |
| Deployment            | Static hosting | GitHub Pages / Netlify / Vercel |

## 💻 Development Guidelines

### Node and Edge Structure

// Nodes
{
id: "1",
label: "Example Node",
description: "This is an example node"
trend: "positive",
reliability: "medium",
references: "Foo et al. 2002",
reviewers: "FA",
organisation: "IMO",
mandate: "",
comments: "No clue"
}

// Edges
{
id: "1-2"
source: "1",
target: "2",
label: "Example edge",
description: "This is an example edge"
trend: "positive",
reliability: "medium",
references: "Foo et al. 2002",
reviewers: "FA",
organisation: "IMO",
mandate: "",
comments: "No clue"

}

### UI Styling Standards

- Use TailwindCSS for consistent styling.
- Color nodes based on trend:

  - Positive → bg-green-400
  - Negative → bg-red-400
  - Unknown → bg-gray-300

- Rounded rectangle nodes (roundrectangle).
- Text aligned center, padding applied for readability.
- Tooltips on hover: display label, description, trend, reliability.

## 🧪 Testing Strategy

Because this is a pure frontend project, testing is mostly:

- Visual testing — verify network structure renders correctly.
- CSV testing — verify that input data parses as expected.
- Browser console — monitor logs for data load errors.

## 🚀 Deployment

- Fully static site.

## 🔗 Key Libraries CDN

<!-- Cytoscape.js -->
<script src="https://unpkg.com/cytoscape@3.23.0/dist/cytoscape.min.js"></script>

<!-- PapaParse -->
<script src="https://unpkg.com/papaparse@5.3.2/papaparse.min.js"></script>

<!-- Tailwind CSS (CDN version for quick start) -->
<script src="https://cdn.tailwindcss.com"></script>
