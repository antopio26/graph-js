/**
 * @file graph.js
 * @description A library for creating and rendering graphs using grapher.js.
 * This library provides a higher-level API to simplify graph construction
 * and leverages grapher.js for SVG rendering and layout.
 */

import * as grapher from '../source/grapher.js';
// Assuming dagre.js is implicitly used by grapher.Graph.layout as per grapher.js
// If grapher.Graph.layout needs an explicit dagre worker, that would be an advanced setup.

/**
 * Represents a graph visualization.
 * This class acts as a facade for grapher.js, simplifying graph creation,
 * layout, and rendering.
 */
export class GraphLibrary {
    /**
     * Creates an instance of the Graph.
     * @param {HTMLElement} container - The HTML element where the graph will be rendered.
     * @param {object} [options={}] - Configuration options for the graph.
     * @param {string} [options.direction='TB'] - Layout direction ('TB', 'BT', 'LR', 'RL').
     * @param {number} [options.nodeSep=50] - Separation between nodes.
     * @param {number} [options.rankSep=50] - Separation between ranks (layers).
     * @param {boolean} [options.compound=true] - Whether the graph supports compound nodes (clusters).
     */
    constructor(container, options = {}) {
        if (!container || !(container instanceof HTMLElement)) {
            throw new Error('A valid HTML container element must be provided.');
        }
        this.container = container;
        this.options = {
            direction: 'TB',
            nodeSep: 50,
            rankSep: 50,
            compound: true,
            ...options,
        };

        this._nodes = new Map(); // Stores user-defined node options
        this._edges = [];   // Stores user-defined edge options
        this._clusters = new Map(); // Stores user-defined cluster options
        this._eventListeners = new Map();

        /** @private @type {grapher.Graph | null} */
        this.grapherInstance = null;

        // Ensure container has a non-static position for SVG fitting.
        if (typeof window !== 'undefined' && window.getComputedStyle) {
            if (window.getComputedStyle(this.container).position === 'static') {
                this.container.style.position = 'relative';
            }
        }
    }

    /**
     * Adds a node to the graph.
     * @param {object} nodeOpts - Options for the node.
     * @param {string} nodeOpts.id - Unique identifier for the node. This will also be used as `grapher.Node.name`.
     * @param {string} [nodeOpts.label=''] - Text label for the node.
     * @param {string} [nodeOpts.parent] - ID of the parent cluster if this node is part of a compound graph.
     * @param {string} [nodeOpts.styleClass] - CSS class to apply to the node's SVG group.
     * @param {object} [nodeOpts.style] - Styling options.
     * @param {string} [nodeOpts.style.backgroundColor] - Background color for the node's header.
     * @param {string} [nodeOpts.style.borderColor] - Border color for the node's header.
     * @param {string} [nodeOpts.style.argSeparator] - Separator for arguments, e.g., ' ' or ' = '.
     * @param {number} [nodeOpts.style.width] - Initial width for layout. `grapher.Node.measure()` will override.
     * @param {number} [nodeOpts.style.height] - Initial height for layout. `grapher.Node.measure()` will override.
     * @param {object} [nodeOpts.arguments] - Key-value pairs for arguments. Values can be strings,
     * `grapher.Node` instances, or arrays of `grapher.Node`.
     */
    addNode(nodeOpts) {
        if (!nodeOpts || !nodeOpts.id) {
            throw new Error('Node options with an `id` must be provided.');
        }
        if (this._nodes.has(nodeOpts.id) || this._clusters.has(nodeOpts.id)) {
            console.warn(`Node or cluster with ID '${nodeOpts.id}' already exists. Overwriting is not supported.`);
            return;
        }
        this._nodes.set(nodeOpts.id, { label: nodeOpts.id, ...nodeOpts });
    }

    /**
     * Adds an edge connecting two nodes.
     * @param {object} edgeOpts - Options for the edge.
     * @param {string} edgeOpts.from - ID of the source node.
     * @param {string} edgeOpts.to - ID of the target node.
     * @param {string} [edgeOpts.id] - Optional ID for the edge's SVG path element.
     * @param {string} [edgeOpts.label=''] - Text label for the edge.
     * @param {string} [edgeOpts.styleClass] - CSS class for the edge's SVG path.
     * @param {number} [edgeOpts.minlen] - Minimum length for layout (Dagre).
     * @param {number} [edgeOpts.weight] - Weight for layout (Dagre).
     */
    addEdge(edgeOpts) {
        if (!edgeOpts || !edgeOpts.from || !edgeOpts.to) {
            throw new Error('Edge options with `from` and `to` IDs must be provided.');
        }
        this._edges.push({ ...edgeOpts });
    }

    /**
     * Adds a cluster (compound node) to the graph.
     * @param {object} clusterOpts - Options for the cluster.
     * @param {string} clusterOpts.id - Unique identifier for the cluster. This will also be `grapher.Node.name`.
     * @param {string} [clusterOpts.label=''] - Text label displayed within the cluster.
     * @param {string} [clusterOpts.parent] - ID of a parent cluster for nesting.
     * @param {string} [clusterOpts.styleClass] - CSS class for the cluster's SVG group.
     * @param {object} [clusterOpts.style] - Styling options.
     * @param {string} [clusterOpts.style.backgroundColor] - Background color of the cluster.
     * @param {number} [clusterOpts.style.rx] - X-axis radius for rounded corners.
     * @param {number} [clusterOpts.style.ry] - Y-axis radius for rounded corners.
     */
    addCluster(clusterOpts) {
        if (!this.options.compound) {
            console.warn('Cannot add cluster: graph is not configured as compound. Set `options.compound` to true.');
            return;
        }
        if (!clusterOpts || !clusterOpts.id) {
            throw new Error('Cluster options with an `id` must be provided.');
        }
        if (this._nodes.has(clusterOpts.id) || this._clusters.has(clusterOpts.id)) {
            console.warn(`Node or cluster with ID '${clusterOpts.id}' already exists. Overwriting is not supported.`);
            return;
        }
        this._clusters.set(clusterOpts.id, { label: clusterOpts.id, ...clusterOpts });
    }

    /**
     * Renders the graph in the specified container.
     * This method orchestrates the creation of grapher.js objects, layout,
     * SVG building, and final rendering.
     * @returns {Promise<void>} A promise that resolves when rendering is complete or rejects on error.
     */
    async render() {
        this.container.innerHTML = ''; // Clear previous content

        this.grapherInstance = new grapher.Graph(this.options.compound);

        // 1. Create and set grapher.Node instances for clusters
        this._clusters.forEach(clusterOpts => {
            const gClusterNode = new grapher.Node();
            gClusterNode.name = clusterOpts.id; // Used by grapher.Graph for internal referencing
            gClusterNode.id = clusterOpts.id;   // Used for the SVG element's ID attribute
            gClusterNode.class = `cluster ${clusterOpts.styleClass || ''}`.trim();
            if (clusterOpts.style?.rx) gClusterNode.rx = clusterOpts.style.rx;
            if (clusterOpts.style?.ry) gClusterNode.ry = clusterOpts.style.ry;

            // Store style and label info for application after build
            gClusterNode._isCluster = true;
            gClusterNode._clusterLabelText = clusterOpts.label;
            gClusterNode._clusterBackgroundColor = clusterOpts.style?.backgroundColor;

            this.grapherInstance.setNode(gClusterNode);
        });

        // 2. Create and set grapher.Node instances for regular nodes
        this._nodes.forEach(nodeOpts => {
            const gNode = new grapher.Node();
            gNode.name = nodeOpts.id;
            gNode.id = nodeOpts.id;
            gNode.class = nodeOpts.styleClass || '';

            const header = gNode.header();
            const headerEntry = header.add(null, ['node-label'], nodeOpts.label || nodeOpts.id, nodeOpts.label || nodeOpts.id);
            if (nodeOpts.style?.backgroundColor) headerEntry.backgroundColor = nodeOpts.style.backgroundColor;
            if (nodeOpts.style?.borderColor) headerEntry.borderColor = nodeOpts.style.borderColor;

            // Attach a click handler to the header to emit a general node click
            headerEntry.on('click', () => {
                this._emit('node:click', nodeOpts.id);
            });

            if (nodeOpts.arguments && Object.keys(nodeOpts.arguments).length > 0) {
                const argList = gNode.list();
                
                // Attach a click handler to the argument list background
                argList.on('click', () => {
                    this._emit('node:click', nodeOpts.id);
                });
                
                for (const [argName, argValue] of Object.entries(nodeOpts.arguments)) {
                    const argument = new grapher.Argument(argName, argValue);
                    if (argument.type === undefined) { // Simple value
                        argument.separator = (nodeOpts.style && nodeOpts.style.argSeparator !== undefined) ? nodeOpts.style.argSeparator : ': ';
                    }

                    // Set the activate handler for the specific argument
                    argument.activate = () => {
                        this._emit('node:argument:click', {
                            nodeId: nodeOpts.id,
                            name: argName,
                            value: argValue
                        });
                    };
                    argList.add(argument);
                }
            }
            // Pass initial dimensions if provided; grapher.Node.measure() will refine these
            gNode.width = nodeOpts.style?.width || 0;
            gNode.height = nodeOpts.style?.height || 0;

            this.grapherInstance.setNode(gNode);
        });

        // 3. Set parent-child relationships for compound graph
        if (this.options.compound) {
            this._clusters.forEach(clusterOpts => {
                if (clusterOpts.parent) {
                    this.grapherInstance.setParent(clusterOpts.id, clusterOpts.parent);
                }
            });
            this._nodes.forEach(nodeOpts => {
                if (nodeOpts.parent) {
                    this.grapherInstance.setParent(nodeOpts.id, nodeOpts.parent);
                }
            });
        }

        // 4. Create and set grapher.Edge instances
        this._edges.forEach(edgeOpts => {
            const sourceNodeEntry = this.grapherInstance.node(edgeOpts.from);
            const targetNodeEntry = this.grapherInstance.node(edgeOpts.to);

            if (!sourceNodeEntry || !targetNodeEntry) {
                console.warn(`Skipping edge from '${edgeOpts.from}' to '${edgeOpts.to}': one or both nodes not found.`);
                return;
            }

            const gEdge = new grapher.Edge(sourceNodeEntry.label, targetNodeEntry.label);
            gEdge.v = edgeOpts.from; // Source node name for grapher.Graph
            gEdge.w = edgeOpts.to;   // Target node name for grapher.Graph

            if (edgeOpts.id) gEdge.id = edgeOpts.id; // For SVG element ID
            gEdge.class = edgeOpts.styleClass || '';
            gEdge.label = edgeOpts.label || '';

            // Properties for Dagre layout (used by grapher.Graph.layout)
            gEdge.minlen = edgeOpts.minlen || 1;
            gEdge.weight = edgeOpts.weight || 1;
            // grapher.Edge.width & height are for its label, calculated by grapher.Graph.build or layout
            // grapher.Edge.labeloffset and labelpos are used by grapher.Graph.layout

            this.grapherInstance.setEdge(gEdge);
        });

        // 5. Configure grapher.Graph options for its internal layout process
        // Workaround for the layout logic bug in grapher.js
        let grapherLayoutDirection = this.options.direction;
        if (this.options.direction === 'TB' || this.options.direction === 'BT') {
            grapherLayoutDirection = 'vertical';
        }

        this.grapherInstance.options = {
            direction: grapherLayoutDirection,
            // dagre specific options that grapher.Graph.layout might use:
            nodesep: this.options.nodeSep,
            ranksep: this.options.rankSep,
            // Add other dagre options here if grapher.Graph.layout supports them
        };
        this.grapherInstance.identifier = "graphjs-render"; // For potential logging in grapher.js

        // 6. Build SVG structure (creates the actual SVG elements)
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.container.appendChild(svgElement);
        this.grapherInstance.build(document, svgElement);

        // 7. Perform measurements (important for layout, now that elements are built)
        this.grapherInstance.measure();

        // 8. Perform layout
        try {
            const layoutResult = await this.grapherInstance.layout(); // Assumes grapher.Graph.layout uses Dagre
            if (layoutResult === 'graph-layout-cancelled') {
                console.warn('Graph layout was cancelled.');
                return;
            }
        } catch (error) {
            console.error('Error during graph layout:', error);
            return;
        }

        // 9. Apply custom styles after SVG elements are created
        this._applyCustomStyles(this.grapherInstance);

        // 10. Update SVG with layout coordinates and final appearances
        this.grapherInstance.update();

        // 11. Fit SVG to its content
        this._fitSvgToContent(svgElement);

        // 12. Attach event listeners
        this._attachEventListeners(this.grapherInstance);
    }

    /**
     * Registers an event listener for graph events.
     * @param {string} eventType - The event type (e.g., 'node:click', 'edge:click').
     * @param {function} callback - The callback function.
     */
    on(eventType, callback) {
        if (typeof callback !== 'function') {
            console.warn(`Callback for event '${eventType}' is not a function.`);
            return;
        }
        if (!this._eventListeners.has(eventType)) {
            this._eventListeners.set(eventType, []);
        }
        this._eventListeners.get(eventType).push(callback);
    }

    /**
     * Saves the rendered graph as an SVG file, embedding all CSS styles.
     * @param {string} [filename='graph.svg'] - The desired filename for the SVG file.
     */
    saveSvg(filename = 'graph.svg') {
        const svgElement = this.container.querySelector('svg');
        if (!svgElement) {
            console.error('SVG element not found. Please render the graph first.');
            alert('Please render a graph before trying to save it.');
            return;
        }

        // Clone the SVG element to avoid modifying the one in the DOM
        const svgClone = svgElement.cloneNode(true);
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        // Create a <style> element
        const styleElement = document.createElement('style');
        
        // Aggregate all CSS rules from document stylesheets
        let cssText = '';
        for (const styleSheet of Array.from(document.styleSheets)) {
            try {
                if (styleSheet.cssRules) {
                    for (const rule of Array.from(styleSheet.cssRules)) {
                        cssText += rule.cssText + '\n';
                    }
                }
            } catch (e) {
                console.warn("Cannot read cross-origin stylesheet. Styles from it won't be embedded.", e);
            }
        }
        
        styleElement.textContent = cssText;

        // Add the <style> element to the <defs> section of the SVG
        let defs = svgClone.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svgClone.prepend(defs);
        }
        defs.appendChild(styleElement);
        
        const svgData = svgClone.outerHTML;
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }


    /**
     * @private
     * Emits an event to all registered listeners.
     * @param {string} eventType - The event type.
     * @param {any} data - Data to pass to the event listeners.
     */
    _emit(eventType, data) {
        if (this._eventListeners.has(eventType)) {
            this._eventListeners.get(eventType).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventType}:`, error);
                }
            });
        }
    }

    /**
     * @private
     * Applies custom styles to the generated SVG elements.
     * This is called after `grapherInstance.build()`.
     * @param {grapher.Graph} gInstance - The grapher.Graph instance.
     */
    _applyCustomStyles(gInstance) {
        gInstance.nodes.forEach((nodeEntry) => {
            const gNode = nodeEntry.label; // This is the grapher.Node instance
            if (gNode._isCluster && gNode.rectangle) {
                // Style cluster rectangle
                if (gNode._clusterBackgroundColor) {
                    gNode.rectangle.style.fill = gNode._clusterBackgroundColor;
                }
                // Add cluster label
                if (gNode._clusterLabelText && gNode.element) {
                    const labelElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    labelElement.textContent = gNode._clusterLabelText;
                    // Position label within the cluster (adjust as needed)
                    labelElement.setAttribute('x', String(-gNode.width / 2 + 10)); // Relative to cluster center
                    labelElement.setAttribute('y', String(-gNode.height / 2 + 20));
                    labelElement.setAttribute('class', 'cluster-label'); // For CSS styling
                    gNode.element.appendChild(labelElement);
                }
            } else if (gNode._blocks) {
                // Style regular node parts (e.g., header entries)
                gNode._blocks.forEach(block => {
                    if (block instanceof grapher.Node.Header) {
                        block._entries.forEach(entry => {
                            if (entry.path) { // path is created in grapher.Node.Header.Entry.build
                                if (entry.backgroundColor) {
                                    entry.path.style.fill = entry.backgroundColor;
                                }
                                if (entry.borderColor) {
                                    entry.path.style.stroke = entry.borderColor;
                                }
                            }
                        });
                    }
                    // Potentially style ArgumentList or other block types here
                });
            }
        });

        // Edge styling can also be done here if `gEdge.class` is not sufficient
        // For example, by finding `gEdge.element` and applying styles.
    }


    /**
     * @private
     * Adjusts the SVG element's dimensions and viewBox to fit its content.
     * @param {SVGElement} svgElement - The SVG root element.
     */
    _fitSvgToContent(svgElement) {
        if (typeof svgElement.getBBox !== 'function') return;

        const bbox = svgElement.getBBox();
        if (bbox.width === 0 && bbox.height === 0 && bbox.x === 0 && bbox.y === 0) {
            // BBox might be zero if there's no content or content is not visible yet.
            // Set a default small size or skip.
            svgElement.setAttribute('width', '100');
            svgElement.setAttribute('height', '50');
            return;
        }

        const margin = 20;
        const viewBoxX = bbox.x - margin;
        const viewBoxY = bbox.y - margin;
        const viewBoxWidth = bbox.width + margin * 2;
        const viewBoxHeight = bbox.height + margin * 2;

        svgElement.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
        svgElement.setAttribute('width', String(viewBoxWidth));
        svgElement.setAttribute('height', String(viewBoxHeight));
    }

    /**
     * @private
     * Attaches event listeners to SVG elements for interactivity.
     * Note: Most handlers are now set during node creation. This method handles edges.
     * @param {grapher.Graph} gInstance - The grapher.Graph instance.
     */
    _attachEventListeners(gInstance) {
        // Node listeners are now attached during the `addNode` process to allow
        // for more granular control (e.g., clicking arguments vs. headers).

        gInstance.edges.forEach((edgeEntry) => {
            const gEdge = edgeEntry.label; // grapher.Edge instance
            // grapher.js already adds some listeners to gEdge.hitTest for focus
            // We can add our click listener to the same element or gEdge.element
            const clickableElement = gEdge.hitTest || gEdge.element;
            if (clickableElement) {
                clickableElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this._emit('edge:click', { from: gEdge.v, to: gEdge.w, id: gEdge.id, label: gEdge.label });
                });
            }
        });
    }
}
