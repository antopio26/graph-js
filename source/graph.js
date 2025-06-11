/*
 * graph.js
 *
 * A comprehensive and intuitive wrapper for the dagre.js and grapher.js libraries,
 * designed to simplify the creation and rendering of complex graphs.
 * This is a rewritten version for improved clarity, robustness, and feature alignment
 * with the provided documentation and examples.
 *
 * Author: Gemini
 * Version: 2.3.0 (Patched and Enhanced)
 */

import { layout } from './dagre.js';
import * as grapher from './grapher.js';

/**
 * A class to create and manage graph visualizations, acting as a facade
 * for dagre.js (layout) and grapher.js (rendering).
 */
export class GraphLibrary {
    /**
     * @param {HTMLElement} container - The HTML element to render the graph in.
     * @param {object} [options={}] - Configuration options for the graph.
     * @param {string} [options.direction='TB'] - The direction of the graph layout ('TB', 'BT', 'LR', 'RL').
     * @param {number} [options.nodeSep=50] - The separation between nodes.
     * @param {number} [options.rankSep=50] - The separation between ranks (layers).
     * @param {boolean} [options.compound=true] - Enables support for compound graphs (clusters).
     */
    constructor(container, options = {}) {
        if (!container || !(container instanceof HTMLElement)) {
            throw new Error('A valid container HTML element must be provided.');
        }

        this.container = container;
        this.options = {
            direction: 'TB',
            nodeSep: 50,
            rankSep: 50,
            compound: true,
            ...options,
        };

        this._nodes = new Map();
        this._edges = [];
        this._clusters = new Map();
        this._eventListeners = new Map();

        if (getComputedStyle(this.container).position === 'static') {
            this.container.style.position = 'relative';
        }
    }

    /**
     * Adds a node to the graph definition.
     * @param {object} nodeOptions - The options for the node.
     * @param {string} nodeOptions.id - A unique identifier for the node.
     * @param {string} [nodeOptions.label=''] - The text to display inside the node.
     * @param {object} [nodeOptions.style={}] - Custom styling for the node.
     * @param {string} [nodeOptions.style.backgroundColor] - The background color of the node.
     * @param {string} [nodeOptions.style.borderColor] - The border color of the node.
     * @param {number} [nodeOptions.style.width=120] - The width of the node.
     * @param {number} [nodeOptions.style.height=60] - The height of the node.
     * @param {object} [nodeOptions.properties] - A map of key-value pairs to display as a list of properties within the node.
     * @param {string} [nodeOptions.styleClass] - A CSS class to apply to the node group for custom styling.
     * @param {string} [nodeOptions.parent] - The ID of the parent cluster.
     */
    addNode(nodeOptions) {
        if (!nodeOptions.id) {
            throw new Error('Node ID must be provided.');
        }
        if (this._nodes.has(nodeOptions.id) || this._clusters.has(nodeOptions.id)) {
            console.warn(`A node or cluster with ID '${nodeOptions.id}' already exists. Overwriting is not supported; please use unique IDs.`);
            return;
        }

        const node = {
            label: '',
            style: {},
            properties: {},
            ...nodeOptions,
        };

        this._nodes.set(node.id, node);
    }

    /**
     * Adds an edge to connect two nodes.
     * @param {object} edgeOptions - The options for the edge.
     * @param {string} edgeOptions.from - The ID of the source node.
     * @param {string} edgeOptions.to - The ID of the target node.
     * @param {string} [edgeOptions.label=''] - The text to display on the edge.
     * @param {object} [edgeOptions.style={}] - Custom styling for the edge.
     * @param {string} [edgeOptions.styleClass] - A CSS class to apply to the edge path for custom styling.
     */
    addEdge(edgeOptions) {
        if (!edgeOptions.from || !edgeOptions.to) {
            throw new Error('Edge must have "from" and "to" properties.');
        }
        if (!this._nodes.has(edgeOptions.from) && !this._clusters.has(edgeOptions.from)) {
            console.warn(`Edge 'from' node '${edgeOptions.from}' does not exist.`);
        }
        if (!this._nodes.has(edgeOptions.to) && !this._clusters.has(edgeOptions.to)) {
            console.warn(`Edge 'to' node '${edgeOptions.to}' does not exist.`);
        }

        this._edges.push({
            label: '',
            style: {},
            ...edgeOptions,
        });
    }

    /**
     * Adds a cluster to group nodes.
     * @param {object} clusterOptions - The options for the cluster.
     * @param {string} clusterOptions.id - A unique identifier for the cluster.
     * @param {string} [clusterOptions.label=''] - The text to display for the cluster.
     * @param {string} [clusterOptions.parent] - The ID of a parent cluster for nesting.
     * @param {object} [clusterOptions.style={}] - Custom styling for the cluster.
     * @param {string} [clusterOptions.style.backgroundColor] - The background color of the cluster.
     * @param {number} [clusterOptions.style.rx] - X-axis radius for rounded corners.
     * @param {number} [clusterOptions.style.ry] - Y-axis radius for rounded corners.
     * @param {string} [clusterOptions.styleClass] - A CSS class to apply to the cluster group.
     */
    addCluster(clusterOptions) {
        if (!clusterOptions.id) {
            throw new Error('Cluster ID must be provided.');
        }
        if (this._clusters.has(clusterOptions.id) || this._nodes.has(clusterOptions.id)) {
            console.warn(`A cluster or node with ID '${clusterOptions.id}' already exists. Please use unique IDs.`);
            return;
        }

        const cluster = {
            label: '',
            style: {},
            ...clusterOptions,
        };

        this._clusters.set(cluster.id, cluster);
    }

    /**
     * Renders the graph in the container. This is an asynchronous operation.
     * @returns {Promise<void>} A promise that resolves when rendering is complete.
     */
    async render() {
        this.container.innerHTML = ''; 

        const { dagreNodes, dagreEdges } = this._prepareDagreData();

        const state = {};
        const layoutOptions = {
            rankdir: this.options.direction,
            nodesep: this.options.nodeSep,
            ranksep: this.options.rankSep,
        };

        try {
            await layout(dagreNodes, dagreEdges, layoutOptions, state);
        } catch (error) {
            console.error('Error during graph layout:', error);
            return;
        }

        const g = this._buildGrapherGraph(dagreNodes, dagreEdges);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.container.appendChild(svg);
        
        g.build(document, svg);
        
        this._applyNodeStyles(g);
        this._styleClusters(g);
        
        g.measure();
        g.update();

        this._fitSvgToContent(svg);
        this._attachEventListeners(g);
    }

    /**
     * Registers an event listener for graph events.
     * @param {string} event - The name of the event (e.g., 'node:click', 'edge:click').
     * @param {function} callback - The function to call when the event is triggered.
     */
    on(event, callback) {
        if (!this._eventListeners.has(event)) {
            this._eventListeners.set(event, []);
        }
        this._eventListeners.get(event).push(callback);
    }

    /** @private */
    _prepareDagreData() {
        const dagreNodes = [];
        this._clusters.forEach(cluster => {
            dagreNodes.push({ v: cluster.id, parent: cluster.parent });
        });
        this._nodes.forEach(node => {
            dagreNodes.push({
                v: node.id,
                width: node.style?.width || 120,
                height: node.style?.height || 60,
                parent: node.parent
            });
        });

        const dagreEdges = this._edges.map(edge => {
            const label = edge.label || '';
            // Estimate label dimensions for layout
            const estimatedWidth = label.length * 7; 
            const estimatedHeight = label ? 18 : 0;
            return {
                v: edge.from,
                w: edge.to,
                label: label,
                minlen: 1,
                weight: 1,
                width: estimatedWidth,
                height: estimatedHeight,
                labeloffset: 10,
                labelpos: 'r',
            };
        });

        return { dagreNodes, dagreEdges };
    }
    
    /**
     * @private 
     * Constructs a grapher.js graph instance from the layouted dagre data.
     */
    _buildGrapherGraph(layoutedNodes, layoutedEdges) {
        const g = new grapher.Graph(this.options.compound);
        const nodeMap = new Map([...this._nodes, ...this._clusters]);

        layoutedNodes.forEach(nodeData => {
            const info = nodeMap.get(nodeData.v);
            const isCluster = this._clusters.has(nodeData.v);
            
            const grapherNode = isCluster 
                ? this._createGrapherCluster(info)
                : this._createGrapherNode(info);

            Object.assign(grapherNode, nodeData);
            
            grapherNode.name = nodeData.v;
            g.setNode(grapherNode);
            
            if (info.parent) {
                g.setParent(nodeData.v, info.parent);
            }
        });

        layoutedEdges.forEach(edgeData => {
            const fromNode = g.node(edgeData.v);
            const toNode = g.node(edgeData.w);
            if (!fromNode || !toNode) return;

            const edgeInfo = this._edges.find(e => e.from === edgeData.v && e.to === edgeData.w && e.label === edgeData.label);
            const grapherEdge = new grapher.Edge(fromNode.label, toNode.label);
            
            Object.assign(grapherEdge, edgeData);
            grapherEdge.class = edgeInfo?.styleClass || '';

            g.setEdge(grapherEdge);
        });

        return g;
    }

    /** @private */
    _createGrapherNode(nodeInfo) {
        const grapherNode = new grapher.Node();
        grapherNode.class = nodeInfo.styleClass || '';

        const header = grapherNode.header();
        const title = header.add(null, ['node-item-type'], nodeInfo.label, nodeInfo.label);

        if (nodeInfo.style?.backgroundColor) {
            title.backgroundColor = nodeInfo.style.backgroundColor;
        }
        if (nodeInfo.style?.borderColor) {
            title.borderColor = nodeInfo.style.borderColor;
        }
        
        if (nodeInfo.properties && Object.keys(nodeInfo.properties).length > 0) {
            const list = grapherNode.list();
            for (const [key, value] of Object.entries(nodeInfo.properties)) {
                const argument = list.argument(key, String(value));
                argument.separator = ': ';
                list.add(argument);
            }
        }
        
        return grapherNode;
    }
    
    /** @private */
    _applyNodeStyles(graphInstance) {
        graphInstance.nodes.forEach((node, nodeId) => {
            if (this._clusters.has(nodeId)) return;

            const grapherNode = node.label;
            for (const block of grapherNode._blocks) {
                if (block instanceof grapher.Node.Header) {
                    for (const entry of block._entries) {
                        if (entry.path) {
                            if (entry.backgroundColor) {
                                entry.path.style.fill = entry.backgroundColor;
                            }
                            if (entry.borderColor) {
                                entry.path.style.stroke = entry.borderColor;
                            }
                        }
                    }
                }
            }
        });
    }

    /** @private */
    _createGrapherCluster(clusterInfo) {
        const clusterNode = new grapher.Node();
        clusterNode.class = clusterInfo.styleClass || '';
        
        if (clusterInfo.style?.rx) clusterNode.rx = clusterInfo.style.rx;
        if (clusterInfo.style?.ry) clusterNode.ry = clusterInfo.style.ry;

        return clusterNode;
    }
    
    /** @private */
    _styleClusters(graphInstance) {
        this._clusters.forEach(clusterInfo => {
            const clusterNode = graphInstance.node(clusterInfo.id)?.label;
            if (clusterNode?.element) {
                if (clusterInfo.style?.backgroundColor && clusterNode.rectangle) {
                    clusterNode.rectangle.style.fill = clusterInfo.style.backgroundColor;
                }
                if (clusterInfo.label) {
                    const labelElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    labelElement.textContent = clusterInfo.label;
                    labelElement.setAttribute('x', -clusterNode.width / 2 + 10);
                    labelElement.setAttribute('y', -clusterNode.height / 2 + 20);
                    labelElement.setAttribute('font-family', 'sans-serif');
                    labelElement.setAttribute('font-size', '14px');
                    clusterNode.element.appendChild(labelElement);
                }
            }
        });
    }

    /** @private */
    _fitSvgToContent(svg) {
        if (!svg.getBBox) return;
        const bbox = svg.getBBox();
        if (bbox.width === 0 || bbox.height === 0) return;
        
        const margin = 20;
        const width = bbox.width + margin * 2;
        const height = bbox.height + margin * 2;
        
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `${bbox.x - margin} ${bbox.y - margin} ${width} ${height}`);
    }

    /** @private */
    _attachEventListeners(graphInstance) {
        graphInstance.nodes.forEach((node, nodeId) => {
            const element = node.label.element;
            if (element && !this._clusters.has(nodeId)) {
                element.addEventListener('click', () => {
                    this._emit('node:click', nodeId);
                });
            }
        });
        
        graphInstance.edges.forEach(edge => {
            const hitArea = edge.label.hitTest; 
            if (hitArea) {
                hitArea.addEventListener('click', () => {
                    this._emit('edge:click', { from: edge.v, to: edge.w });
                });
            }
        });
    }

    /** @private */
    _emit(event, data) {
        if (this._eventListeners.has(event)) {
            this._eventListeners.get(event).forEach(callback => callback(data));
        }
    }
}