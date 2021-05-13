import * as d3 from 'd3';

export function draw_resource_tree(data)
{
    const tree_data = d3.hierarchy(data);
    let i = 0; 
    tree_data.eachBefore(d => d.index = i++);

    const root = tree_data;
    const nodes = root.descendants();
    const nodeSize = 10, width = 70, columns = 200;

    const svg = d3.create("svg")
                  .attr("viewBox", [-nodeSize / 2, -nodeSize * 3 / 2, width, (nodes.length + 1) * nodeSize])
    //              .attr("font-family", "sans-serif")
                  .attr("font-size", 7)
                  .style("overflow", "visible");

    const link = svg.append("g")
          .attr("fill", "none")
          .attr("stroke", "#999")
        .selectAll("path")
        .data(root.links())
        .join("path")
          .attr("d", d => `
            M${d.source.depth * nodeSize},${d.source.index * nodeSize}
            V${d.target.index * nodeSize}
            h${nodeSize}
          `);

      const node = svg.append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
          .attr("transform", d => `translate(0,${d.index * nodeSize})`);

      node.append("circle")
          .attr("cx", d => d.depth * nodeSize)
          .attr("r", 2.5)
          .attr("fill", d => d.children ? null : "#999");

      node.append("text")
          .attr('cursor', 'pointer')
          .attr("dy", "0.32em")
          .attr("x", d => d.depth * nodeSize + 6)
          .text(d => d.data.name);

      node.append("title")
          .text(d => d.ancestors().reverse().map(d => d.data.name).join("/"));

    //  for (const {label, value, format, x} of columns) {
    //    svg.append("text")
    //        .attr("dy", "0.32em")
    //        .attr("y", -nodeSize)
    //        .attr("x", x)
    //        .attr("text-anchor", "end")
    //        .attr("font-weight", "bold")
    //        .text(label);
    //
    //    node.append("text")
    //        .attr("dy", "0.32em")
    //        .attr("x", x)
    //        .attr("text-anchor", "end")
    //        .attr("fill", d => d.children ? null : "#555")
    //      .data(root.copy().sum(value).descendants())
    //        .text(d => format(d.value, d));
    //  }
    
    return svg;
}