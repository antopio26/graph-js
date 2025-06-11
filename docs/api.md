# GraphLibrary Documentation

`GraphLibrary` is a JavaScript library designed to simplify the creation and rendering of complex graphs. It acts as a wrapper for the `dagre.js` (for layout) and `grapher.js` (for rendering) libraries, providing an intuitive API.

## Table of Contents

- [Installation](#installation)
- [API Reference](#api-reference)
  - [`GraphLibrary`](#graphlibrary)
    - [`constructor(container, options)`](#constructorcontainer-options)
    - [`addNode(nodeOptions)`](#addnodenodeoptions)
    - [`addEdge(edgeOptions)`](#addedgedgeoptions)
    - [`addCluster(clusterOptions)`](#addclusterclusteroptions)
    - [`render()`](#render)
    - [`on(event, callback)`](#onevent-callback)
- [Usage Examples](#usage-examples)
  - [Basic Graph](#basic-graph)
  - [Graph with Clusters](#graph-with-clusters)
  - [Event Handling](#event-handling)

## Installation

To use `GraphLibrary`, ensure you have the `dagre.js` and `grapher.js` files in the same directory or configure the import paths correctly.

```html
<!-- Example of inclusion in HTML -->
<div
  id="graph-container"
  style="width: 800px; height: 600px; border: 1px solid black;"
></div>
<script type="module">
  import { GraphLibrary } from "./graph.js";
  // Your code here
</script>
```

## API Reference

### `GraphLibrary`

The main class for creating and managing graph visualizations.

#### `constructor(container, options = {})`

Creates a new instance of `GraphLibrary`.

- **`container`**: `HTMLElement` - The HTML element where the graph will be rendered. Required.
- **`options`**: `object` (optional) - Configuration options for the graph.
  - `direction`: `string` (optional, default: `'TB'`) - The direction of the graph layout (e.g., `'TB'` for Top-to-Bottom, `'LR'` for Left-to-Right).
  - `nodeSep`: `number` (optional, default: `50`) - The separation between nodes.
  - `rankSep`: `number` (optional, default: `50`) - The separation between ranks (layers).
  - `compound`: `boolean` (optional, default: `true`) - Enables support for compound graphs (clusters).

#### `addNode(nodeOptions)`

Adds a node to the graph.

- **`nodeOptions`**: `object` - Options for the node.
  - `id`: `string` - A unique identifier for the node. Required.
  - `label`: `string` (optional, default: `''`) - The text to display inside the node.
  - `style`: `object` (optional) - Custom styling for the node.
    - `shape`: `string` (optional, default: `'rect'`) - The shape of the node (`'rect'`, `'circle'`, `'ellipse'`).
    - `backgroundColor`: `string` (optional, default: `'#fff'`) - The background color of the node.
    - `borderColor`: `string` (optional, default: `'#000'`) - The border color of the node.
    - `width`: `number` (optional, default: `120`) - The width of the node.
    - `height`: `number` (optional, default: `60`) - The height of the node.
  - `properties`: `object` (optional) - A map of key-value pairs to display as a list of properties within the node.
  - `parent`: `string` (optional) - The ID of the parent cluster.

#### `addEdge(edgeOptions)`

Adds an edge to connect two nodes.

- **`edgeOptions`**: `object` - Options for the edge.
  - `from`: `string` - The ID of the source node. Required.
  - `to`: `string` - The ID of the target node. Required.
  - `label`: `string` (optional, default: `''`) - The text to display on the edge.
  - `style`: `object` (optional) - Custom styling for the edge.
    - `color`: `string` (optional, default: `'#000'`) - The color of the edge line.
    - `arrowhead`: `string` (optional, default: `'normal'`) - The style of the arrowhead.

#### `addCluster(clusterOptions)`

Adds a cluster to group nodes.

- **`clusterOptions`**: `object` - Options for the cluster.
  - `id`: `string` - A unique identifier for the cluster. Required.
  - `label`: `string` (optional, default: `''`) - The text to display for the cluster.
  - `parent`: `string` (optional) - The ID of a parent cluster for nesting.
  - `style`: `object` (optional) - Custom styling for the cluster.
    - `backgroundColor`: `string` (optional, default: `'rgba(0,0,0,0.05)'`) - The background color of the cluster.
    - `rx`: `number` (optional) - X-axis radius for rounded corners.
    - `ry`: `number` (optional) - Y-axis radius for rounded corners.

#### `async render()`

Renders the graph in the specified container. This method is asynchronous.

#### `on(event, callback)`

Registers an event listener.

- **`event`**: `string` - The name of the event (e.g., `'node:click'`, `'edge:click'`).
  - `'node:click'`: Fires when a node is clicked. The callback receives the node ID.
  - `'edge:click'`: Fires when an edge is clicked. The callback receives an object `{ from: string, to: string }`.
- **`callback`**: `function` - The function to call when the event is triggered.

## Usage Examples

### Basic Graph

```html
<div
  id="graph-container"
  style="width: 800px; height: 600px; border: 1px solid black;"
></div>
<script type="module">
  import { GraphLibrary } from "./graph.js";

  const container = document.getElementById("graph-container");
  const graph = new GraphLibrary(container, { direction: "LR" });

  graph.addNode({
    id: "node1",
    label: "Node A",
    style: { backgroundColor: "#a7c957", borderColor: "#386641" },
  });
  graph.addNode({ id: "node2", label: "Node B" });
  graph.addNode({
    id: "node3",
    label: "Node C",
    style: {
      shape: "circle",
      width: 80,
      height: 80,
      backgroundColor: "#f2e8cf",
    },
  });

  graph.addEdge({ from: "node1", to: "node2", label: "Connection 1-2" });
  graph.addEdge({
    from: "node1",
    to: "node3",
    label: "Connection 1-3",
    style: { color: "#bc4749" },
  });

  graph
    .render()
    .then(() => {
      console.log("Graph rendered!");
    })
    .catch((error) => {
      console.error("Error during rendering:", error);
    });
</script>
```

### Graph with Clusters

```html
<div
  id="graph-container-cluster"
  style="width: 900px; height: 700px; border: 1px solid #ccc;"
></div>
<script type="module">
  import { GraphLibrary } from "./graph.js";

  const container = document.getElementById("graph-container-cluster");
  const graph = new GraphLibrary(container, { nodeSep: 70, rankSep: 70 });

  // Clusters
  graph.addCluster({
    id: "clusterA",
    label: "Alpha Group",
    style: { backgroundColor: "rgba(255, 0, 0, 0.1)", rx: 10, ry: 10 },
  });
  graph.addCluster({
    id: "clusterB",
    label: "Beta Group",
    parent: "clusterA",
    style: { backgroundColor: "rgba(0, 0, 255, 0.05)" },
  });

  // Nodes
  graph.addNode({ id: "n1", label: "Node 1", parent: "clusterA" });
  graph.addNode({ id: "n2", label: "Node 2", parent: "clusterA" });
  graph.addNode({ id: "n3", label: "Node 3 (in Beta)", parent: "clusterB" });
  graph.addNode({ id: "n4", label: "Node 4 (in Beta)", parent: "clusterB" });
  graph.addNode({ id: "n5", label: "External Node" });

  // Edges
  graph.addEdge({ from: "n1", to: "n2", label: "Internal A" });
  graph.addEdge({ from: "n3", to: "n4", label: "Internal Beta" });
  graph.addEdge({ from: "n1", to: "n3", label: "A -> Beta" });
  graph.addEdge({ from: "n2", to: "n5", label: "A -> External" });
  graph.addEdge({ from: "n4", to: "n5", label: "Beta -> External" });

  graph.render();
</script>
```

### Event Handling

```html
<div
  id="graph-container-events"
  style="width: 800px; height: 600px; border: 1px solid black;"
></div>
<p id="event-output">Click on a node or an edge.</p>
<script type="module">
  import { GraphLibrary } from "./graph.js";

  const container = document.getElementById("graph-container-events");
  const output = document.getElementById("event-output");
  const graph = new GraphLibrary(container);

  graph.addNode({ id: "eventNode1", label: "Click me!" });
  graph.addNode({ id: "eventNode2", label: "Me too!" });
  graph.addEdge({
    from: "eventNode1",
    to: "eventNode2",
    label: "Clickable Edge",
  });

  graph.on("node:click", (nodeId) => {
    output.textContent = `Node clicked: ${nodeId}`;
    console.log("Node clicked:", nodeId);
  });

  graph.on("edge:click", (edgeData) => {
    output.textContent = `Edge clicked: from ${edgeData.from} to ${edgeData.to}`;
    console.log("Edge clicked:", edgeData);
  });

  graph.render();
</script>
```
