# React Graph JS

React Graph JS is a React wrapper for the `GraphLibrary`, enabling easy creation, customization, and rendering of interactive graphs and visualizations. It supports nodes, edges, clusters, and semantic styling through CSS.

## Features

- **Interactive Graphs**: Clickable nodes, edges, and arguments.
- **Cluster Support**: Create compound graphs with nested clusters.
- **Customizable Themes**: Modify graph appearance using CSS variables.
- **Semantic Styling**: Apply predefined styles for nodes and edges.
- **Event Handling**: Register callbacks for graph interactions.
- **SVG Export**: Save rendered graphs as SVG files.

## Installation

Install the package via npm:

```bash
npm install react-graph-js
```

## Usage

### Basic Example

```jsx
import React from 'react';
import GraphComponent from 'react-graph-js';
import 'react-graph-js/dist/styles.css';

const App = () => {
  const nodes = [
    { id: 'input', label: 'Input', styleClass: 'node-info' },
    { id: 'process', label: 'Process', styleClass: 'node-primary' },
    { id: 'output', label: 'Output', styleClass: 'node-success' },
  ];

  const edges = [
    { from: 'input', to: 'process', label: 'Data Flow' },
    { from: 'process', to: 'output', label: 'Result' },
  ];

  return (
    <GraphComponent
      nodes={nodes}
      edges={edges}
      options={{ direction: 'TB', rankSep: 50, nodeSep: 50 }}
      onNodeClick={(nodeId) => console.log(`Node clicked: ${nodeId}`)}
      onEdgeClick={(edgeInfo) => console.log(`Edge clicked: ${edgeInfo.from} -> ${edgeInfo.to}`)}
    />
  );
};

export default App;
```

### Advanced Example with Clusters

```jsx
const clusters = [
  { id: 'frontend', label: 'Frontend Services', style: { backgroundColor: 'rgba(250, 173, 20, 0.1)', rx: 10, ry: 10 } },
  { id: 'backend', label: 'Backend Services', style: { backgroundColor: 'rgba(89, 126, 247, 0.1)', rx: 10, ry: 10 } },
];

const nodes = [
  { id: 'user', label: 'User', styleClass: 'node-info' },
  { id: 'web', label: 'Web Server', parent: 'frontend', styleClass: 'node-primary' },
  { id: 'api', label: 'API Gateway', parent: 'backend', styleClass: 'node-secondary' },
];

const edges = [
  { from: 'user', to: 'web', label: 'Request' },
  { from: 'web', to: 'api', label: 'API Call' },
];
```

## Customization

### CSS Variables

You can customize the graph's appearance by modifying the CSS variables in `theme.css`. For example:

```css
:root {
  --color-primary-bg: #5b21b6; /* Deep purple */
  --color-success-bg: #059669; /* Emerald green */
}
```

### Semantic Styling

Use predefined style classes for nodes:
- `.node-primary`
- `.node-secondary`
- `.node-success`
- `.node-danger`
- `.node-warning`

### Hover Effects

Built-in hover effects for nodes, arguments, and edges:
- **Node Header**: Background becomes white, text becomes black, and a red border appears.
- **Edge**: Line and arrowhead change to `--color-edge-hover`.

## API

### Props

| Prop                | Type     | Description                                      |
|---------------------|----------|--------------------------------------------------|
| `nodes`             | `Array`  | List of nodes to render.                        |
| `edges`             | `Array`  | List of edges to render.                        |
| `clusters`          | `Array`  | List of clusters for compound graphs.           |
| `options`           | `Object` | Graph configuration options (e.g., layout).     |
| `onNodeClick`       | `Function` | Callback for node click events.                |
| `onEdgeClick`       | `Function` | Callback for edge click events.                |
| `onNodeArgumentClick` | `Function` | Callback for argument click events.          |

### Methods

#### `saveSvg(filename)`
Saves the rendered graph as an SVG file.

#### `render()`
Renders the graph in the container element.

## Development

### Build the Package

Run the following command to build the package:
```bash
npm run build
```

### Publish the Package

Log in to npm and publish:
```bash
npm login
npm publish
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## Links

- [Documentation](docs/)
- [API Reference](docs/api.md)
- [Theme Guide](docs/theme.md)