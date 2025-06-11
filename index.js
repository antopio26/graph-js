import { GraphLibrary } from "./source/graph.js";

const graph = new GraphLibrary();
graph.addNode("A");
graph.addNode("B");
graph.addEdge("A", "B");
console.log(graph.getNodes()); // Output: ['A', 'B']
console.log(graph.getEdges()); // Output: [['A', 'B']]
console.log(graph.hasNode("A")); // Output: true    
console.log(graph.hasEdge("A", "B")); // Output: true
console.log(graph.hasEdge("B", "A")); // Output: false
console.log(graph.getNeighbors("A")); // Output: ['B']
console.log(graph.getNeighbors("B")); // Output: ['A']
console.log(graph.getDegree("A")); // Output: 1
console.log(graph.getDegree("B")); // Output: 1

graph.render().then(() => {
  console.log("Graph rendered successfully.");
}).catch((error) => {
  console.error("Error rendering graph:", error);
});

// Save the graph to a file
import { writeFileSync } from "fs";
const graphData = JSON.stringify({
  nodes: graph.getNodes(),
  edges: graph.getEdges()
}, null, 2);
writeFileSync("graph.json", graphData, "utf8");