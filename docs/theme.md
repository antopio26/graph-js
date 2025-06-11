# Graph Theme Documentation

This document explains the structure and usage of the standard graph theme (`theme.css`). The theme is designed to be flexible, consistent, and easy to customize through CSS variables and semantic class names.

## 1. Color Palette

The core of the theme is a modern color palette defined as CSS variables in the `:root` scope. This allows for easy customization of the graph's look and feel by changing these variables in one place.

The available colors are:

| Variable Name  | Hex Code | Description         |
|-----------------|--------------------|---------------------|
| `--indigo-dye`  | `#08415c`          | Deep, dark blue   |
| `--persian-red` | `#cc2936`          | Vibrant, strong red  |
| `--tea-rose-red`| `#ebbab9`          | Light, soft pink |
| `--slate-grey`  | `#4A5568`          | Neutral, cool grey|
| `--emerald-green`| `#059669`         | Rich, success green|

## 2. Semantic Color Mapping

To ensure a consistent and meaningful visual language, the color palette is mapped to semantic purposes. These variables are then used to style the different types of nodes.

| Semantic Variable   | Mapped Color Variable | Default Usage |
|-----------------------|--------------------------|----------------------|
| `--color-primary-bg`  | `--indigo-dye`           | For 'gemm' nodes      |
| `--color-secondary-bg`| `--slate-grey`           | For 'op' nodes        |
| `--color-danger-bg`   | `--persian-red`          | For 'act' nodes       |
| `--color-success-bg`  | `--emerald-green`        | For 'data' nodes      |
| `--color-warning-bg`  | `--tea-rose-red`         | For 'flatten' nodes   |

## 3. Usage

To apply a style to a node, use the corresponding generic style class in your JavaScript when defining the node.

Available Node Classes:

*   `.node-primary`
*   `.node-secondary`
*   `.node-danger`
*   `.node-success`
*   `.node-warning`

Example:

````javascript
// In your graph definition file (e.g., comprehensive-test.html)

// Apply the primary style (Indigo Dye)
graph.addNode({
  id: "gemm1",
  label: "Gemm",
  styleClass: "node-primary",
  // ...
});

// Apply the danger style (Persian Red)
graph.addNode({
  id: "relu1",
  label: "Relu",
  styleClass: "node-danger",
});
````

## 4. Customization

You can easily change the entire look of the graph by modifying the CSS variables in `theme.css`.

For example, to change the primary node color from blue to a deep purple, you would only need to change one line:

````css
/* In theme.css */
:root {
  --color-primary-bg: #5b21b6; /* Changed from --indigo-dye */
  /* ... other variables */
}
````

All nodes with the class `.node-primary` will automatically update to the new color.

## 5. Hover Effects

The theme includes built-in hover effects for nodes, arguments, and edges for better user interaction.

*   **Node Header**: When hovered, the header background becomes white, the text becomes black, and a red border appears.
*   **Node Argument**: When hovered, a red border appears around the argument's bounding box.
*   **Edge**: When hovered, the edge's line and arrowhead change to the `--color-edge-hover` color (Persian Red by default).

These hover styles are defined by the following variables:

*   `--color-hover-bg: #ffffff`
*   `--color-hover-text: #000000`
*   `--color-hover-border: #cc2936`
*   `--color-edge-hover: #cc2936`