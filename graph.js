/*
 * graph-l.js
 *
 * A comprehensive and intuitive wrapper for the dagre.js and grapher.js libraries,
 * designed to simplify the creation and rendering of complex graphs.
 *
 * Author: Gemini
 * Version: 1.0.0
 */

import { layout } from './dagre.js';
import * as grapher from './grapher.js';

/**
 * A class to create and manage graph visualizations.
 */
export class GraphLibrary {
    /**
     * @param {HTMLElement} container - The HTML element to render the graph in.
     * @param {object} [options={}] - Configuration options for the graph.
     * @param {string} [options.direction='TD'] - The direction of the graph layout (e.g., 'TB', 'LR').
     * @param {number} [options.nodeSep=50] - The separation between nodes.
     * @param {number} [options.rankSep=50] - The separation between ranks (layers).
     * @param {boolean} [options.compound=true] - Whether to enable support for compound graphs (clusters).
     */
    constructor(container, options = {}) {
        if (!container) {
            throw new Error('A container element must be provided.');
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

        this.container.style.position = 'relative';
    }

    /**
     * Adds a node to the graph.
     * @param {object} nodeOptions - The options for the node.
     * @param {string} nodeOptions.id - A unique identifier for the node.
     * @param {string} [nodeOptions.label=''] - The text to display inside the node.
     * @param {object} [nodeOptions.style={}] - Custom styling for the node.
     * @param {string} [nodeOptions.style.shape='rect'] - The shape of the node ('rect', 'circle', 'ellipse').
     * @param {string} [nodeOptions.style.backgroundColor='#fff'] - The background color of the node.
     * @param {string} [nodeOptions.style.borderColor='#000'] - The border color of the node.
     * @param {number} [nodeOptions.style.width=120] - The width of the node.
     * @param {number} [nodeOptions.style.height=60] - The height of the node.
     * @param {string} [nodeOptions.parent] - The ID of the parent cluster.
     */
    addNode(nodeOptions) {
        if (!nodeOptions.id) {
            throw new Error('Node ID must be provided.');
        }
        if (this._nodes.has(nodeOptions.id)) {
            console.warn(`Node with ID '${nodeOptions.id}' already exists. It will be overwritten.`);
        }

        const node = {
            label: '',
            style: {
                shape: 'rect',
                backgroundColor: '#fff',
                borderColor: '#000',
                width: 120,
                height: 60,
            },
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
     * @param {string} [edgeOptions.style.color='#000'] - The color of the edge line.
     * @param {string} [edgeOptions.style.arrowhead='normal'] - The style of the arrowhead.
     */
    addEdge(edgeOptions) {
        if (!edgeOptions.from || !edgeOptions.to) {
            throw new Error('Edge must have "from" and "to" properties.');
        }

        const edge = {
            label: '',
            style: {
                color: '#000',
                arrowhead: 'normal',
            },
            ...edgeOptions,
        };

        this._edges.push(edge);
    }

    /**
     * Adds a cluster to group nodes.
     * @param {object} clusterOptions - The options for the cluster.
     * @param {string} clusterOptions.id - A unique identifier for the cluster.
     * @param {string} [clusterOptions.label=''] - The text to display for the cluster.
     * @param {string} [clusterOptions.parent] - The ID of a parent cluster for nesting.
     * @param {object} [clusterOptions.style={}] - Custom styling for the cluster.
     * @param {string} [clusterOptions.style.backgroundColor='rgba(0,0,0,0.05)'] - The background color of the cluster.
     */
    addCluster(clusterOptions) {
        if (!clusterOptions.id) {
            throw new Error('Cluster ID must be provided.');
        }
        if (this._clusters.has(clusterOptions.id)) {
            console.warn(`Cluster with ID '${clusterOptions.id}' already exists.`);
            return;
        }

        const cluster = {
            label: '',
            style: {
                backgroundColor: 'rgba(0,0,0,0.05)',
            },
            ...clusterOptions,
        };

        this._clusters.set(cluster.id, cluster);
    }

    /**
     * Renders the graph to the container.
     */
    async render() {
        this.container.innerHTML = ''; // Clear previous content

        const g = new grapher.Graph(this.options.compound);

        // Add clusters first
        this._clusters.forEach(cluster => {
            const clusterNode = new grapher.Node();
            clusterNode.rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
             if (cluster.style && cluster.style.rx) {
                clusterNode.rectangle.setAttribute('rx', cluster.style.rx);
            }
            if (cluster.style && cluster.style.ry) {
                clusterNode.rectangle.setAttribute('ry', cluster.style.ry);
            }
            clusterNode.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            clusterNode.element.setAttribute('class', 'cluster');
             if(cluster.style && cluster.style.backgroundColor) {
                clusterNode.rectangle.style.fill = cluster.style.backgroundColor;
            }
            clusterNode.element.appendChild(clusterNode.rectangle);

            if (cluster.label) {
                const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                label.textContent = cluster.label;
                label.setAttribute('x', 10);
                label.setAttribute('y', 20);
                clusterNode.element.appendChild(label);
            }

            g.setNode({ name: cluster.id, label: clusterNode });
            if (cluster.parent) {
                g.setParent(cluster.id, cluster.parent);
            }
        });

        // Add nodes
        const dagreNodes = [];
        this._nodes.forEach(node => {
            const grapherNode = this._createGrapherNode(node);
            g.setNode({ name: node.id, label: grapherNode });
            if (node.parent) {
                g.setParent(node.id, node.parent);
            }

            dagreNodes.push({
                v: node.id,
                width: node.style.width,
                height: node.style.height,
                parent: node.parent
            });
        });

        // Add edges
        const dagreEdges = [];
        this._edges.forEach(edge => {
            const fromNode = g.node(edge.from);
            const toNode = g.node(edge.to);

            if (!fromNode || !toNode) {
                console.error(`Edge references non-existent node. From: ${edge.from}, To: ${edge.to}`);
                return;
            }

            const grapherEdge = new grapher.Edge(fromNode.label, toNode.label);
            grapherEdge.label = edge.label;
            g.setEdge({ v: edge.from, w: edge.to, label: grapherEdge });

            dagreEdges.push({
                v: edge.from,
                w: edge.to,
                label: edge.label,
                minlen: edge.minlen || 1,
                weight: edge.weight || 1
            });
        });

        // Layout the graph
        const state = {};
        const layoutOptions = {
            rankdir: this.options.direction,
            nodesep: this.options.nodeSep,
            ranksep: this.options.rankSep,
        };

        await layout(dagreNodes, dagreEdges, layoutOptions, state);

        // Apply layout to grapher nodes
        dagreNodes.forEach(node => {
            const grapherNode = g.node(node.v).label;
            grapherNode.x = node.x;
            grapherNode.y = node.y;
            grapherNode.width = node.width;
            grapherNode.height = node.height;
        });
        
        // Apply layout to edges
        dagreEdges.forEach(edge => {
            const grapherEdge = g.edge(edge.v, edge.w).label;
            grapherEdge.points = edge.points;
             if ('x' in edge) {
                grapherEdge.x = edge.x;
                grapherEdge.y = edge.y;
            }
        });

        // Build and render SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.container.appendChild(svg);
        
        g.build(document, svg);
        g.measure();
        g.update();

        // Fit SVG to content
        this._fitSvgToContent(svg);
        this._attachEventListeners(g);
    }

    /**
     * Register an event listener.
     * @param {string} event - The name of the event (e.g., 'node:click').
     * @param {function} callback - The function to call when the event is triggered.
     */
    on(event, callback) {
        if (!this._eventListeners.has(event)) {
            this._eventListeners.set(event, []);
        }
        this._eventListeners.get(event).push(callback);
    }

    _createGrapherNode(node) {
        const grapherNode = new grapher.Node();
        const header = grapherNode.header();

        const title = header.add(null, ['node-item-type'], node.label, node.label);
        title.path.style.fill = node.style.backgroundColor;
        title.path.style.stroke = node.style.borderColor;
        
        return grapherNode;
    }
    
    _fitSvgToContent(svg) {
        const bbox = svg.getBBox();
        const margin = 20;
        const width = bbox.width + margin * 2;
        const height = bbox.height + margin * 2;
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `${bbox.x - margin} ${bbox.y - margin} ${width} ${height}`);
    }

    _attachEventListeners(graphInstance) {
        graphInstance.nodes.forEach(node => {
            if(node.label.element) {
                node.label.element.addEventListener('click', () => {
                    this._emit('node:click', node.v);
                });
            }
        });
        
         graphInstance.edges.forEach(edge => {
            if(edge.label.element) {
                edge.label.element.addEventListener('click', () => {
                    this._emit('edge:click', { from: edge.v, to: edge.w });
                });
            }
        });
    }

    _emit(event, data) {
        if (this._eventListeners.has(event)) {
            this._eventListeners.get(event).forEach(callback => callback(data));
        }
    }
}
