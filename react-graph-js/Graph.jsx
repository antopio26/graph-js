import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { GraphLibrary } from './source/graph'; // Adjust the import path as needed

// Import the necessary CSS for styling the graph
import './source/css/grapher.css';
import './source/css/theme.css';

/**
 * A React wrapper component for the GraphLibrary.
 * It manages the graph lifecycle and state within a React application.
 * This component is forwardRef-enabled to expose the saveSvg functionality.
 */
const GraphComponent = forwardRef(({
  nodes,
  edges,
  clusters,
  options,
  onNodeClick,
  onEdgeClick,
  onNodeArgumentClick
}, ref) => {
  const containerRef = useRef(null);
  // Use a ref to hold the graph library instance to call methods on it.
  const graphInstanceRef = useRef(null);

  // Expose the saveSvg method to parent components via the ref.
  useImperativeHandle(ref, () => ({
    saveSvg: (filename = 'graph.svg') => {
      if (graphInstanceRef.current) {
        graphInstanceRef.current.saveSvg(filename);
        console.log(`Saved SVG as ${filename}`);
      } else {
        console.error('Cannot save SVG: Graph instance is not available.');
      }
    }
  }));

  // Main effect for drawing and updating the graph
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // Clear the container before re-rendering
    containerRef.current.innerHTML = '';

    // Create a new graph instance
    const graph = new GraphLibrary(containerRef.current, {
      compound: true, // Enable clusters by default
      ...options,
    });
    graphInstanceRef.current = graph;

    // Add clusters, nodes, and edges from props
    if (clusters) {
      clusters.forEach(c => graph.addCluster(c));
    }
    if (nodes) {
      nodes.forEach(n => graph.addNode(n));
    }
    if (edges) {
      edges.forEach(e => graph.addEdge(e));
    }

    // --- Register Event Handlers ---
    // Use the callback props if they are provided
    if (onNodeClick) {
      graph.on('node:click', (nodeId) => {
        onNodeClick(nodeId);
      });
    }

    if (onEdgeClick) {
      graph.on('edge:click', (edgeInfo) => {
        onEdgeClick(edgeInfo);
      });
    }

    if (onNodeArgumentClick) {
      graph.on('node:argument:click', (argData) => {
        onNodeArgumentClick(argData);
      });
    }

    // Render the graph
    graph.render().then(() => {
      console.log('Graph rendered successfully with layout:', options?.direction || 'TB');
    }).catch(error => {
      console.error('Failed to render graph:', error);
    });

    // Cleanup function to run when the component unmounts or re-renders
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      graphInstanceRef.current = null;
    };
  }, [nodes, edges, clusters, options, onNodeClick, onEdgeClick, onNodeArgumentClick]); // Re-run effect if any of these props change

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative' // Important for SVG fitting
      }}
    />
  );
});

export default GraphComponent;