# grapher.js API Documentation

## Table of Contents

1.  [Introduction](#introduction)
2.  [Namespace: `grapher`](#namespace-grapher)
    *   Class: `grapher.Graph`
    *   Class: `grapher.Node`
        *   Class: `grapher.Node.Header`
        *   Class: `grapher.Node.Header.Entry`
        *   Class: `grapher.Node.Canvas`
    *   Class: `grapher.ArgumentList`
    *   Class: `grapher.Argument`
    *   Class: `grapher.Edge`
        *   Class: `grapher.Edge.Curve`
        *   Class: `grapher.Edge.Path`
3.  Exports

## Introduction

The `grapher.js` file provides the core rendering engine for graphs using SVG. It defines classes for constructing, laying out, and rendering graphs, including nodes, edges, and compound (clustered) structures. This module is primarily concerned with SVG element creation and manipulation.

## Namespace: `grapher`

The `grapher` namespace encapsulates all components related to graph rendering.

---

### Class: `grapher.Graph`

Represents a graph structure that can be rendered as an SVG. It manages nodes, edges, and their hierarchical relationships (for compound graphs).

#### Constructor

##### `new grapher.Graph(compound)`

Creates an instance of a graph.

| Parameter  | Type    | Description                                                      |
| :--------- | :------ | :--------------------------------------------------------------- |
| `compound` | `boolean` | Whether the graph supports compound nodes (clusters).            |

#### Properties

*   **`nodes`**: `Map<string, {v: string, label: grapher.Node \| object}>`
    *   Gets all nodes in the graph.
*   **`edges`**: `Map<string, {v: string, w: string, label: grapher.Edge \| object}>`
    *   Gets all edges in the graph.
*   **`options`**: `object` (Expected to be set externally)
    *   Contains layout options like `direction`.
*   **`identifier`**: `string` (Expected to be set externally)
    *   Used for logging purposes, particularly in the `layout` method.

#### Methods

##### `setNode(node)`

Adds or updates a node in the graph.

| Parameter | Type   | Description                                                                 |
| :-------- | :----- | :-------------------------------------------------------------------------- |
| `node`    | `object` | The node object to add. Must have a `name` property and can have other keys. |

##### `setEdge(edge)`

Adds an edge to the graph.

| Parameter | Type   | Description                                                                                                |
| :-------- | :----- | :--------------------------------------------------------------------------------------------------------- |
| `edge`    | `object` | The edge object. Must have `v` (source node name) and `w` (target node name) properties, plus other keys. |
**Throws**:
*   `Error`: If the source or target node does not exist.

##### `setParent(node, parent)`

Sets the parent for a node, used in compound graphs.

| Parameter | Type   | Description                                  |
| :-------- | :----- | :------------------------------------------- |
| `node`    | `string` | The name of the node.                        |
| `parent`  | `string` | The name of the parent node (cluster).       |
**Returns**: `this` - The graph instance for chaining.
**Throws**:
*   `Error`: If not a compound graph or if setting the parent creates a cycle.

##### `hasNode(key)`

Checks if a node exists in the graph.

| Parameter | Type   | Description             |
| :-------- | :----- | :---------------------- |
| `key`     | `string` | The name of the node.   |
**Returns**: `boolean` - True if the node exists, false otherwise.

##### `node(key)`

Retrieves a node from the graph.

| Parameter | Type   | Description             |
| :-------- | :----- | :---------------------- |
| `key`     | `string` | The name of the node.   |
**Returns**: `{{v: string, label: grapher.Node \| object}} \| undefined` - The node entry or undefined if not found.

##### `edge(v, w)`

Retrieves an edge from the graph.

| Parameter | Type   | Description                   |
| :-------- | :----- | :---------------------------- |
| `v`       | `string` | The name of the source node.  |
| `w`       | `string` | The name of the target node.  |
**Returns**: `{{v: string, w: string, label: grapher.Edge \| object}} \| undefined` - The edge entry or undefined if not found.

##### `parent(key)`

Gets the parent of a node in a compound graph.

| Parameter | Type   | Description             |
| :-------- | :----- | :---------------------- |
| `key`     | `string` | The name of the node.   |
**Returns**: `string \| null` - The name of the parent node, or null if it has no parent or not a compound graph.

##### `children([key])`

Gets the children of a node (if it's a cluster) or all top-level nodes.

| Parameter | Type   | Description                                                                 |
| :-------- | :----- | :-------------------------------------------------------------------------- |
| `key`     | `string` | (Optional) The name of the parent node. If undefined, returns top-level nodes. |
**Returns**: `string[] \| null \| IterableIterator<string>` - An array of child node names, or an iterator for all node keys if key is `\x00` and not compound, or null.

##### `build(document, origin)`

Builds the SVG structure for the graph.

| Parameter  | Type         | Description                                  |
| :--------- | :----------- | :------------------------------------------- |
| `document` | `Document`   | The SVG document object.                     |
| `origin`   | `SVGElement` | The SVG element to append the graph to.      |

##### `measure()`

Measures the dimensions of all nodes in the graph.

##### `async layout([worker])`

Lays out the graph using Dagre.js.

| Parameter | Type     | Description                                                |
| :-------- | :------- | :--------------------------------------------------------- |
| `worker`  | `Worker` | (Optional) Web worker to perform layout calculations.      |
**Returns**: `Promise<string>` - A promise that resolves to an empty string on success, or 'graph-layout-cancelled' if cancelled.

##### `update()`

Updates the visual representation of all nodes and edges in the graph.

---

### Class: `grapher.Node`

Represents a node in the graph. A node can be composed of several blocks like headers, lists, or a canvas.

#### Constructor

##### `new grapher.Node()`

Creates an instance of a Node.

#### Properties

*   **`width`**: `number` - The calculated width of the node.
*   **`height`**: `number` - The calculated height of the node.
*   **`x`**: `number` - The x-coordinate of the node's center.
*   **`y`**: `number` - The y-coordinate of the node's center.
*   **`element`**: `SVGElement` - The main SVG group element for this node.
*   **`border`**: `SVGPathElement` - The SVG path element for the node's border.
*   **`class`**: `string` - CSS class string to be applied to the node's main group element.
*   **`id`**: `string` - ID to be applied to the node's main group element.
*   **`rectangle`**: `SVGRectElement` - (For cluster nodes) The SVG rect element representing the cluster background.
*   **`rx`**: `number` - (For cluster nodes) The x-radius for rounded corners of the cluster's rectangle.
*   **`ry`**: `number` - (For cluster nodes) The y-radius for rounded corners of the cluster's rectangle.

#### Methods

##### `header()`

Adds a header block to the node.
**Returns**: `grapher.Node.Header` - The created header block.

##### `list()`

Adds an argument list block to the node.
**Returns**: `grapher.ArgumentList` - The created argument list block.

##### `canvas()`

Adds a canvas block to the node.
**Returns**: `grapher.Node.Canvas` - The created canvas block.

##### `build(document, parent)`

Builds the SVG elements for this node.

| Parameter  | Type         | Description                                      |
| :--------- | :----------- | :----------------------------------------------- |
| `document` | `Document`   | The SVG document object.                         |
| `parent`   | `SVGElement` | The parent SVG element to append this node to.   |

##### `measure()`

Measures the dimensions of the node based on its blocks.

##### `layout()`

Lays out the blocks within the node.

##### `update()`

Updates the SVG representation of the node with its current position and dimensions.

##### `select()`

Applies a 'select' visual state to the node.
**Returns**: `SVGElement[]` - An array containing the selected SVG element, or an empty array.

##### `deselect()`

Removes the 'select' visual state from the node.

#### Static Methods

##### `roundedRect(x, y, width, height, r1, r2, r3, r4)`

Generates an SVG path data string for a rounded rectangle.

| Parameter | Type    | Description                                  |
| :-------- | :------ | :------------------------------------------- |
| `x`       | `number`  | The x-coordinate of the top-left corner.     |
| `y`       | `number`  | The y-coordinate of the top-left corner.     |
| `width`   | `number`  | The width of the rectangle.                  |
| `height`  | `number`  | The height of the rectangle.                 |
| `r1`      | `boolean` | Whether the top-left corner is rounded.      |
| `r2`      | `boolean` | Whether the top-right corner is rounded.     |
| `r3`      | `boolean` | Whether the bottom-right corner is rounded.  |
| `r4`      | `boolean` | Whether the bottom-left corner is rounded.   |
**Returns**: `string` - The SVG path data string.

---

### Class: `grapher.Node.Header`

Represents a header block within a `grapher.Node`. A header can contain multiple entries.

#### Constructor

##### `new grapher.Node.Header()`

Creates an instance of Node.Header.

#### Properties

*   **`width`**: `number` - The calculated width of the header.
*   **`height`**: `number` - The calculated height of the header.
*   **`first`**: `boolean` - True if this is the first block in the parent node.
*   **`last`**: `boolean` - True if this is the last block in the parent node.

#### Methods

##### `add(id, classList, content, tooltip, handler)`

Adds an entry to the header.

| Parameter   | Type       | Description                                  |
| :---------- | :--------- | :------------------------------------------- |
| `id`        | `string`   | The ID for the entry's element.              |
| `classList` | `string[]` | A list of CSS classes for the entry.         |
| `content`   | `string`   | The text content of the entry.               |
| `tooltip`   | `string`   | The tooltip text for the entry.              |
| `handler`   | `function` | A handler function (not currently used in build). |
**Returns**: `grapher.Node.Header.Entry` - The created entry.

##### `build(document, parent)`

Builds the SVG elements for this header block. (Inherits `document` and `parent` from `grapher.Node.build`)

##### `measure()`

Measures the dimensions of the header based on its entries.

##### `layout()`

Lays out the entries within the header.

##### `update()`

Updates the SVG representation of the header and its entries.

---

### Class: `grapher.Node.Header.Entry`

Represents a single entry within a `grapher.Node.Header`.

#### Constructor

##### `new grapher.Node.Header.Entry(id, classList, content, tooltip, handler)`

Creates an instance of Node.Header.Entry.

| Parameter   | Type       | Description                                  |
| :---------- | :--------- | :------------------------------------------- |
| `id`        | `string`   | The ID for the entry's SVG element.          |
| `classList` | `string[]` | CSS classes for the entry.                   |
| `content`   | `string`   | Text content of the entry.                   |
| `tooltip`   | `string`   | Tooltip text.                                |
| `handler`   | `function` | Click handler (not directly used by this class, but stored). |

#### Properties

*   **`width`**: `number` - The calculated width of the entry.
*   **`height`**: `number` - The calculated height of the entry.
*   **`backgroundColor`**: `string` - Background color to apply to the entry's path.
*   **`borderColor`**: `string` - Border color to apply to the entry's path.

#### Methods

##### `on(event, callback)`

Registers an event listener for this entry.

| Parameter  | Type       | Description                       |
| :--------- | :--------- | :-------------------------------- |
| `event`    | `string`   | The event name (e.g., 'click').   |
| `callback` | `function` | The callback function.            |

##### `emit(event, [data])`

Emits an event on this entry.

| Parameter | Type   | Description                                  |
| :-------- | :----- | :------------------------------------------- |
| `event`   | `string` | The event name.                              |
| `data`    | `any`  | (Optional) Data to pass to the event listeners. |

##### `build(document, parent)`

Builds the SVG elements for this header entry. (Inherits `document` and `parent` from `grapher.Node.Header.build`)

##### `measure()`

Measures the dimensions of the header entry based on its text content.

##### `layout()`

Lays out the header entry. (Currently a no-op as positioning is handled by parent).

---

### Class: `grapher.Node.Canvas`

Represents a canvas block within a `grapher.Node`. This class is currently a placeholder and does not implement extensive rendering logic.

#### Constructor

##### `new grapher.Node.Canvas()`

Creates an instance of Node.Canvas.

#### Properties

*   **`width`**: `number` - The width of the canvas block (default: 0).
*   **`height`**: `number` - The height of the canvas block (default: 80).
*   **`first`**: `boolean` - True if this is the first block in the parent node.
*   **`last`**: `boolean` - True if this is the last block in the parent node.

#### Methods

##### `build(document, parent)`

Builds the SVG elements for the canvas. (Currently a no-op).

##### `update()`

Updates the SVG representation of the canvas. (Currently a no-op).

---

### Class: `grapher.ArgumentList`

Represents a list of arguments or properties within a `grapher.Node`.

#### Constructor

##### `new grapher.ArgumentList()`

Creates an instance of ArgumentList.

#### Properties

*   **`width`**: `number` - The calculated width of the argument list.
*   **`height`**: `number` - The calculated height of the argument list.
*   **`first`**: `boolean` - True if this is the first block in the parent node.
*   **`last`**: `boolean` - True if this is the last block in the parent node.

#### Methods

##### `argument(name, value)`

Creates a new argument.

| Parameter | Type                                         | Description                                                                 |
| :-------- | :------------------------------------------- | :-------------------------------------------------------------------------- |
| `name`    | `string`                                     | The name of the argument.                                                   |
| `value`   | `string \| grapher.Node \| grapher.Node[]` | The value of the argument.                                                  |
**Returns**: `grapher.Argument` - The created argument.

##### `add(value)`

Adds an argument to the list.

| Parameter | Type               | Description             |
| :-------- | :----------------- | :---------------------- |
| `value`   | `grapher.Argument` | The argument to add.    |

##### `on(event, callback)`

Registers an event listener for this argument list.

| Parameter  | Type       | Description                       |
| :--------- | :--------- | :-------------------------------- |
| `event`    | `string`   | The event name (e.g., 'click').   |
| `callback` | `function` | The callback function.            |

##### `emit(event, [data])`

Emits an event on this argument list.

| Parameter | Type   | Description                                  |
| :-------- | :----- | :------------------------------------------- |
| `event`   | `string` | The event name.                              |
| `data`    | `any`  | (Optional) Data to pass to the event listeners. |

##### `build(document, parent)`

Builds the SVG elements for this argument list. (Inherits `document` and `parent` from `grapher.Node.build`)

##### `measure()`

Measures the dimensions of the argument list based on its items.

##### `layout()`

Lays out the items within the argument list.

##### `update()`

Updates the SVG representation of the argument list and its items.

---

### Class: `grapher.Argument`

Represents a single argument or property, which can be a simple key-value pair or can contain a nested `grapher.Node` or an array of them.

#### Constructor

##### `new grapher.Argument(name, content)`

Creates an instance of Argument.

| Parameter | Type                                         | Description                                                                                     |
| :-------- | :------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| `name`    | `string`                                     | The name (label) of the argument.                                                               |
| `content` | `string \| grapher.Node \| grapher.Node[]` | The content of the argument. Can be a string, a Node, or an array of Nodes.                     |

#### Properties

*   **`width`**: `number` - The calculated width of the argument.
*   **`height`**: `number` - The calculated height of the argument.
*   **`name`**: `string` - The name of the argument.
*   **`content`**: `string \| grapher.Node \| grapher.Node[]` - The content of the argument.
*   **`tooltip`**: `string` - Tooltip text for the argument.
*   **`separator`**: `string` - Separator string to display between name and content (e.g., ': ').
*   **`type`**: `string \| undefined` - Automatically determined type: 'node', 'node[]', or undefined for simple content.
*   **`focus`**: `function` - Optional function to call on pointerover.
*   **`blur`**: `function` - Optional function to call on pointerleave.
*   **`activate`**: `function` - Optional function to call on click.

#### Methods

##### `build(document, parent)`

Builds the SVG elements for this argument. (Inherits `document` and `parent` from `grapher.ArgumentList.build`)

##### `measure()`

Measures the dimensions of the argument based on its content.

##### `layout()`

Lays out the content of the argument, especially if it contains nested nodes.

##### `update()`

Updates the SVG representation of the argument.

##### `select()`

Applies a 'select' visual state to the argument.
**Returns**: `SVGElement[]` - An array containing the selected SVG element, or an empty array.

##### `deselect()`

Removes the 'select' visual state from the argument.

---

### Class: `grapher.Edge`

Represents an edge connecting two nodes in the graph.

#### Constructor

##### `new grapher.Edge(from, to)`

Creates an instance of Edge.

| Parameter | Type           | Description                |
| :-------- | :------------- | :------------------------- |
| `from`    | `grapher.Node` | The source node object.    |
| `to`      | `grapher.Node` | The target node object.    |

#### Properties
*   **`id`**: `string` - ID for the edge's path element.
*   **`class`**: `string` - CSS class for the edge's path element.
*   **`label`**: `string` - Text label for the edge.
*   **`minlen`**: `number` - Minimum length for Dagre layout.
*   **`weight`**: `number` - Weight for Dagre layout.
*   **`width`**: `number` - Width of the edge label (calculated).
*   **`height`**: `number` - Height of the edge label (calculated).
*   **`labeloffset`**: `number` - Offset for the label from the edge path.
*   **`labelpos`**: `string` - Position of the label ('r', 'l', 'c').
*   **`points`**: `Array<{x: number, y: number}>` - Array of points defining the edge path, set by layout.
*   **`x`**: `number` - x-coordinate of the edge label center.
*   **`y`**: `number` - y-coordinate of the edge label center.
*   **`element`**: `SVGPathElement` - The main SVG path element for the edge.
*   **`hitTest`**: `SVGPathElement` - A wider, invisible path for easier mouse interaction.
*   **`labelElement`**: `SVGTextElement` - The SVG text element for the edge label.

#### Methods

##### `build(document, edgePathGroupElement, edgePathHitTestGroupElement, edgeLabelGroupElement)`

Builds the SVG elements for this edge.

| Parameter                     | Type         | Description                                  |
| :---------------------------- | :----------- | :------------------------------------------- |
| `document`                    | `Document`   | The SVG document object.                     |
| `edgePathGroupElement`        | `SVGElement` | The SVG group for edge paths.                |
| `edgePathHitTestGroupElement` | `SVGElement` | The SVG group for edge hit testing.          |
| `edgeLabelGroupElement`       | `SVGElement` | The SVG group for edge labels.               |

##### `update()`

Updates the SVG representation of the edge, including its path and label position.

##### `select()`

Applies a 'select' visual state to the edge.
**Returns**: `SVGElement[]` - An array containing the selected SVG element, or an empty array.

##### `deselect()`

Removes the 'select' visual state from the edge.

---

### Class: `grapher.Edge.Curve`

Helper class to generate a curved path based on a series of points. Used by `grapher.Edge` to draw its path.

#### Constructor

##### `new grapher.Edge.Curve(points)`

Creates an instance of Edge.Curve.

| Parameter | Type                               | Description                                  |
| :-------- | :--------------------------------- | :------------------------------------------- |
| `points`  | `Array<{x: number, y: number}>`    | An array of points defining the curve.       |

#### Properties

*   **`path`**: `grapher.Edge.Path`
    *   Gets the generated path object.

#### Methods

##### `point(x, y)`

Adds a point to the curve calculation.

| Parameter | Type     | Description                        |
| :-------- | :------- | :--------------------------------- |
| `x`       | `number` | The x-coordinate of the point.     |
| `y`       | `number` | The y-coordinate of the point.     |

##### `curve(x, y)`

Calculates and adds a Bezier curve segment to the path.

| Parameter | Type     | Description                                            |
| :-------- | :------- | :----------------------------------------------------- |
| `x`       | `number` | The x-coordinate of the target point for the curve.    |
| `y`       | `number` | The y-coordinate of the target point for the curve.    |

---

### Class: `grapher.Edge.Path`

Helper class to build an SVG path data string.

#### Constructor

##### `new grapher.Edge.Path()`

Creates an instance of Edge.Path.

#### Properties

*   **`data`**: `string`
    *   Gets the accumulated SVG path data string.

#### Methods

##### `moveTo(x, y)`

Adds a "moveTo" command to the path data.

| Parameter | Type     | Description          |
| :-------- | :------- | :------------------- |
| `x`       | `number` | The x-coordinate.    |
| `y`       | `number` | The y-coordinate.    |

##### `lineTo(x, y)`

Adds a "lineTo" command to the path data.

| Parameter | Type     | Description          |
| :-------- | :------- | :------------------- |
| `x`       | `number` | The x-coordinate.    |
| `y`       | `number` | The y-coordinate.    |

##### `bezierCurveTo(x1, y1, x2, y2, x, y)`

Adds a "bezierCurveTo" command to the path data.

| Parameter | Type     | Description                                  |
| :-------- | :------- | :------------------------------------------- |
| `x1`      | `number` | The x-coordinate of the first control point. |
| `y1`      | `number` | The y-coordinate of the first control point. |
| `x2`      | `number` | The x-coordinate of the second control point.|
| `y2`      | `number` | The y-coordinate of the second control point.|
| `x`       | `number` | The x-coordinate of the end point.           |
| `y`       | `number` | The y-coordinate of the end point.           |

##### `closePath()`

Adds a "closePath" command to the path data.

---

## Exports

The following components are exported from `grapher.js`:

*   `Graph`
*   `Node`
*   `Edge`
*   `Argument`

