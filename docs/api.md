Of course. Here is the full `api.md` documentation for the `GraphLibrary`, updated with the latest features for event handling and styling.

# GraphLibrary API Documentation

`GraphLibrary` is a high-level JavaScript library designed to simplify the creation, layout, and rendering of complex graphs. It acts as a user-friendly wrapper for the underlying `grapher.js` (rendering) and `dagre.js` (layout) engines.

---

## `GraphLibrary`

This is the main class you will interact with to build and manage your graph visualization.

### `constructor(container, options)`

Creates a new graph instance within a specified HTML element.

-   **`container`** (`HTMLElement`): **Required.** The DOM element where the graph will be rendered.
-   **`options`** (`object`): Optional. A configuration object for the graph's layout and behavior.
    -   `direction` (`string`): The direction for the graph layout. Defaults to `'TB'`.
        -   `'TB'`: Top to Bottom
        -   `'BT'`: Bottom to Top
        -   `'LR'`: Left to Right
        -   `'RL'`: Right to Left
    -   `nodeSep` (`number`): The separation (in pixels) between nodes on the same rank. Defaults to `50`.
    -   `rankSep` (`number`): The separation (in pixels) between ranks (layers) of nodes. Defaults to `60`.
    -   `compound` (`boolean`): Set to `true` to enable support for compound nodes (clusters). Defaults to `true`.

**Example:**

```javascript
const graphContainer = document.getElementById('graph-container');
const graph = new GraphLibrary(graphContainer, {
  direction: 'LR', // Layout from left to right
  rankSep: 80
});
```
---
### `addNode(nodeOptions)`

Adds a single node to the graph.

-   **`nodeOptions`** (`object`): An object containing the configuration for the node.
    -   `id` (`string`): **Required.** A unique identifier for the node.
    -   `label` (`string`): The text to display in the node's header.
    -   `parent` (`string`): The ID of a cluster to render this node inside of.
    -   `styleClass` (`string`): A custom CSS class to apply to the node's SVG group for advanced styling.
    -   `arguments` (`object`): Key-value pairs to display as a list of properties within the node.
    -   `style` (`object`): An object for direct styling of the node.
        -   `backgroundColor` (`string`): Sets the background color of the node's header.
        -   `borderColor` (`string`): Sets the border color of the node's header.
        -   `argSeparator` (`string`): A custom separator string to use between the name and value of an argument (e.g., `' = '` or `' '`). Defaults to `': '`.

**Examples:**

```javascript
// A simple node
graph.addNode({ id: 'start', label: 'Start' });

// A styled node with arguments and a custom separator
graph.addNode({
  id: 'gemm1',
  label: 'Gemm',
  style: {
    backgroundColor: '#dbeafe', // light blue
    borderColor: '#93c5fd',
    argSeparator: ' ' // Use a space instead of a colon
  },
  arguments: {
    'B': '(256x256)',
    'C': '(256)'
  }
});

// A node within a cluster
graph.addNode({
  id: 'web_server',
  label: 'Web Server',
  parent: 'frontend_cluster'
});
```
---
### `addEdge(edgeOptions)`

Adds a directed edge to connect two nodes.

-   **`edgeOptions`** (`object`): An object containing the configuration for the edge.
    -   `from` (`string`): **Required.** The ID of the source node.
    -   `to` (`string`): **Required.** The ID of the target node.
    -   `label` (`string`): Text to display along the edge.
    -   `id` (`string`): An optional unique ID for the edge's SVG element.
    -   `styleClass` (`string`): A custom CSS class for the edge's path.
    -   `minlen` (`number`): The minimum rank separation for this edge.
    -   `weight` (`number`): A weight to influence the layout engine.

**Example:**
```javascript
graph.addEdge({ from: 'start', to: 'gemm1', label: 'batch_input' });
```
---
### `addCluster(clusterOptions)`

Adds a cluster (a compound node) to group other nodes. Note: `options.compound` must be `true`.

-   **`clusterOptions`** (`object`): An object containing the configuration for the cluster.
    -   `id` (`string`): **Required.** A unique identifier for the cluster.
    -   `label` (`string`): A text label to display for the cluster.
    -   `parent` (`string`): The ID of another cluster to nest this cluster inside.
    -   `styleClass` (`string`): A custom CSS class for the cluster's SVG group.
    -   `style` (`object`): An object for direct styling of the cluster.
        -   `backgroundColor` (`string`): The background color of the cluster's rectangle.
        -   `rx` (`number`): The x-axis radius for rounded corners.
        -   `ry` (`number`): The y-axis radius for rounded corners.

**Example:**
```javascript
// A top-level cluster
graph.addCluster({
  id: 'backend_services',
  label: 'Backend Services',
  style: {
    backgroundColor: 'rgba(239, 246, 255, 0.5)', // very light blue
    rx: 10,
    ry: 10
  }
});

// A nested cluster
graph.addCluster({
  id: 'database_layer',
  label: 'Databases',
  parent: 'backend_services'
});
```
---
### `render()`

Renders the graph in the container element. This is an asynchronous operation.

**Example:**

```javascript
async function drawGraph() {
  try {
    await graph.render();
    console.log("Graph rendered successfully.");
  } catch (error) {
    console.error("Failed to render graph:", error);
  }
}

drawGraph();
```
---
### `on(eventType, callback)`

Registers an event listener for graph interactions.

-   **`eventType`** (`string`): The name of the event to listen for.
-   **`callback`** (`function`): The function to execute when the event fires.

#### Supported Events

-   **`node:click`**: Fires when the main body of a node (its header or argument background) is clicked.
    -   *Callback receives:* `nodeId` (`string`)
-   **`edge:click`**: Fires when an edge is clicked.
    -   *Callback receives:* `edgeInfo` (`object`) - An object with details like `{ from, to, id, label }`.
-   **`node:argument:click`**: Fires when a specific argument within a node is clicked.
    -   *Callback receives:* `argData` (`object`) - An object with details `{ nodeId, name, value }`.

**Example:**

```javascript
// General click on the node 'gemm1'
graph.on('node:click', (nodeId) => {
  console.log(`Node ${nodeId} was clicked.`);
});

// Specific click on an argument inside 'gemm1'
graph.on('node:argument:click', (argData) => {
  // Example: "Argument 'B' on node 'gemm1' with value '(256x256)' was clicked."
  console.log(
    `Argument '${argData.name}' on node '${argData.nodeId}' with value '${argData.value}' was clicked.`
  );
});

// Click on an edge
graph.on('edge:click', (edgeInfo) => {
  console.log(`Edge from '${edgeInfo.from}' to '${edgeInfo.to}' was clicked.`);
});
```