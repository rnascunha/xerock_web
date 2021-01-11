//import {Wifi_Router, Mesh_Net, Mesh_Device} from './mesh_net.js';
import {Wifi_Router, Mesh_Net, Mesh_Device} from './mesh_system.js';
import * as d3 from 'd3';

const full_width = 450,
      full_height = 220,
      num_data = 20,
      margin = {top: 20, right: 20, bottom: 20, left: 40},
      factor_min = 1.05,
      factor_max = 0.95;

export function update_rssi_graph(dev, graph)
{
    let dataset = dev.rssi_arr().slice(-num_data),
        n = dataset.length,
        svg = d3.select('#' + 'esp32-rssi-graph' + dev.mac().replace(/:/g, '')),
        g = svg.select('g');

    let width = full_width - margin.left - margin.right // Use the window's width 
      , height = full_height - margin.top - margin.bottom; // Use the window's height

    let xScale = d3.scaleLinear()
        .domain([0, n - 1]) // input
        .range([0, width]); // output

    let yScale = d3.scaleLinear()
        .domain([d3.max(dev.rssi_arr()) * factor_min, d3.min(dev.rssi_arr()) * factor_max]) // input 
        .range([height, 0]); // output 

    let line = d3.line()
        .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
        .y(function(d) { return yScale(d); }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    g.select("path")
        .datum(dataset) // 10. Binds data to the line 
        .attr("class", "line") // Assign a class for styling 
        .transition()
        .attr("d", line).transition().delay(1000);

    g.selectAll(".dot")
        .data(dataset)
      .join("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .on('mouseover', _mouse_over_handler)
        .on('mouseout', _mouse_out_handler)
        .transition()
        .attr("cx", function(d, i) { return xScale(i); })
        .attr("cy", function(d) { return yScale(d); })
        .attr("r", 5);

    g.select('.x.axis').transition()
        .call(d3.axisTop(xScale)); // Create an axis component with d3.axisBottom
    g.select('.y.axis').transition()
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    
    
    function _mouse_over_handler(ev, d)
    {
        const i = g.selectAll(".dot").nodes().indexOf(this);
        g.append('svg:text')
            .attr('id', "t" + d + "-" + i)
            .attr('x', function() { return xScale(i); })
            .attr('y', function() { return yScale(d) -5; })
            .text(function(){ return d; });
    }

    function _mouse_out_handler(ev, d)
    {
        const i = g.selectAll(".dot").nodes().indexOf(this);
        d3.select("#t" + d + "-" + i).remove();
    }

}

export function draw_rssi_graph(dev)
{
    let dataset = dev.rssi_arr().slice(-num_data)
      , width = full_width - margin.left - margin.right // Use the window's width 
      , height = full_height - margin.top - margin.bottom; // Use the window's height

    let n = dataset.length;

    let xScale = d3.scaleLinear()
        .domain([0, n - 1]) // input
        .range([0, width]); // output

    let yScale = d3.scaleLinear()
        .domain([d3.max(dev.rssi_arr()) * factor_min, d3.min(dev.rssi_arr()) * factor_max]) // input 
        .range([height, 0]); // output 

    let line = d3.line()
        .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
        .y(function(d) { return yScale(d); }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    let svg = d3.create("svg").attr('id', 'esp32-rssi-graph' + dev.mac().replace(/:/g, '')),
        g = svg.attr("width", width + margin.left + margin.right)
        .attr('class', 'esp32-rssi-graph')
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
        .attr("class", "x axis")
//        .attr("transform", "translate(0,0)")
        .call(d3.axisTop(xScale)); // Create an axis component with d3.axisBottom

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    return svg.node();
}

function date_scale_format(date) 
{
  return (d3.timeMinute(date) < date ? d3.timeFormat('%H:%M:%S') : d3.timeFormat('%H:%M'))(date);
}

export function update_rssi_parent_graph(dev, parent, graph)
{
    let dataset = dev.rssi_object()[parent].slice(-num_data),
        parent_name = parent.replace(/:/g, ''),
        n = dataset.length,
        svg = d3.select('#' + 'esp32-rssi-graph-' + dev.mac().replace(/:/g, '') + '-' + parent_name),
        g = svg.select('g');

    let width = full_width - margin.left - margin.right // Use the window's width 
      , height = full_height - margin.top - margin.bottom; // Use the window's height

    let xScale = d3.scaleTime()
        .domain([d3.min(dev.rssi_object()[parent], v => v.time), 
                 d3.max(dev.rssi_object()[parent], v => v.time)]) // input
        .range([0, width]).nice(); // output

    let yScale = d3.scaleLinear()
        .domain([d3.max(dev.rssi_object()[parent], v => v.rssi) * factor_min , 
                 d3.min(dev.rssi_object()[parent], v => v.rssi) * factor_max]) // input 
        .range([height, 0]); // output 

    let line = d3.line()
        .x(function(d) { return xScale(d.time); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.rssi); }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    g.select("path")
        .datum(dataset) // 10. Binds data to the line 
        .attr("class", "line") // Assign a class for styling 
        .transition()
        .attr("d", line).transition().delay(1000);

    g.selectAll(".dot")
        .data(dataset)
      .join("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .on('mouseover', _mouse_over_handler)
        .on('mouseout', _mouse_out_handler)
        .transition()
        .attr("cx", function(d) { return xScale(d.time); })
        .attr("cy", function(d) { return yScale(d.rssi); })
        .attr("r", 5);

    g.select('.x.axis').transition()
        .call(d3.axisTop(xScale).ticks(5).tickFormat(date_scale_format)); // Create an axis component with d3.axisBottom
    g.select('.y.axis').transition()
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
    
    function _mouse_over_handler(ev, d, i)
    {
        g.append('svg:text')
            .attr('id', "t" + parent_name + d.rssi + "-" + i)
            .attr('x', function(){ return xScale(d.time); })
            .attr('y', function(){ return yScale(d.rssi) - 8; })
            .attr('text-anchor', 'middle')
            .text(function(){ return `${d.rssi}(${date_scale_format(d.time)})`; });
    }

    function _mouse_out_handler(ev, d, i)
    {
        d3.select("#t" + parent_name + d.rssi + "-" + i).remove();
    }

}

export function draw_rssi_parent_graph(dev, parent)
{
    let dataset = dev.rssi_object()[parent].slice(-num_data)
        , parent_name = parent.replace(/:/g, '')
      , width = full_width - margin.left - margin.right // Use the window's width 
      , height = full_height - margin.top - margin.bottom; // Use the window's height

    let n = dataset.length;

    let xScale = d3.scaleTime()
        .domain([d3.min(dev.rssi_object()[parent], v => v.time), 
                 d3.max(dev.rssi_object()[parent], v => v.time)]) // input
        .range([0, width]).nice(); // output

    let yScale = d3.scaleLinear()
        .domain([d3.max(dev.rssi_object()[parent], v => v.rssi) * factor_min, 
                 d3.min(dev.rssi_object()[parent], v => v.rssi) * factor_max]) // input 
        .range([height, 0]); // output 

    let line = d3.line()
        .x(function(d) { return xScale(d.time); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.rssi); }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    let svg = d3.create("svg").attr('id', 'esp32-rssi-graph-' + dev.mac().replace(/:/g, '') + '-' + parent_name),
        g = svg.attr("width", width + margin.left + margin.right)
        .attr('class', 'esp32-rssi-graph')
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.append("g")
        .attr("class", "x axis")
        .call(d3.axisTop(xScale).ticks(5).tickFormat(date_scale_format)); // Create an axis component with d3.axisBottom

    g.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    return svg.node();
}

//export function update_rssi_parent_graph(dev, parent, graph)
//{
//    let dataset = dev.rssi_object()[parent].slice(-num_data),
//        parent_name = parent.replace(/:/g, ''),
//        n = dataset.length,
//        svg = d3.select('#' + 'esp32-rssi-graph-' + dev.mac().replace(/:/g, '') + '-' + parent_name),
//        g = svg.select('g');
//
//    let width = full_width - margin.left - margin.right // Use the window's width 
//      , height = full_height - margin.top - margin.bottom; // Use the window's height
//
//    let xScale = d3.scaleLinear()
//        .domain([0, n - 1]) // input
//        .range([0, width]); // output
//
//    let yScale = d3.scaleLinear()
//        .domain([d3.max(dev.rssi_object()[parent], v => v.rssi) * factor_min , 
//                 d3.min(dev.rssi_object()[parent], v => v.rssi) * factor_max]) // input 
//        .range([height, 0]); // output 
//
//    let line = d3.line()
//        .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
//        .y(function(d) { return yScale(d.rssi); }) // set the y values for the line generator 
//        .curve(d3.curveMonotoneX) // apply smoothing to the line
//
//    g.select("path")
//        .datum(dataset) // 10. Binds data to the line 
//        .attr("class", "line") // Assign a class for styling 
//        .transition()
//        .attr("d", line).transition().delay(1000);
//
//    g.selectAll(".dot")
//        .data(dataset)
//      .join("circle") // Uses the enter().append() method
//        .attr("class", "dot") // Assign a class for styling
//        .on('mouseover', _mouse_over_handler)
//        .on('mouseout', _mouse_out_handler)
//        .transition()
//        .attr("cx", function(d, i) { return xScale(i); })
//        .attr("cy", function(d) { return yScale(d.rssi); })
//        .attr("r", 5);
//
//    g.select('.x.axis').transition()
//        .call(d3.axisTop(xScale)); // Create an axis component with d3.axisBottom
//    g.select('.y.axis').transition()
//        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
//    
//    function _mouse_over_handler(d, i)
//    {
//        g.append('svg:text')
//            .attr('id', "t" + parent_name + d.rssi + "-" + i)
//            .attr('x', function() { return xScale(i); })
//            .attr('y', function() { return yScale(d.rssi) - 5; })
//            .text(function(){ return d.rssi; });
//    }
//
//    function _mouse_out_handler(d, i)
//    {
//        d3.select("#t" + parent_name + d.rssi + "-" + i).remove();
//    }
//
//}
//
//export function draw_rssi_parent_graph(dev, parent)
//{
//    let dataset = dev.rssi_object()[parent].slice(-num_data)
//        , parent_name = parent.replace(/:/g, '')
//      , width = full_width - margin.left - margin.right // Use the window's width 
//      , height = full_height - margin.top - margin.bottom; // Use the window's height
//
//    let n = dataset.length;
//
//    let xScale = d3.scaleLinear()
//        .domain([0, n - 1]) // input
//        .range([0, width]); // output
//
//    let yScale = d3.scaleLinear()
//        .domain([d3.max(dev.rssi_object()[parent], v => v.rssi) * factor_min, 
//                 d3.min(dev.rssi_object()[parent], v => v.rssi) * factor_max]) // input 
//        .range([height, 0]); // output 
//
//    let line = d3.line()
//        .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
//        .y(function(d) { return yScale(d.rssi); }) // set the y values for the line generator 
//        .curve(d3.curveMonotoneX) // apply smoothing to the line
//
//    let svg = d3.create("svg").attr('id', 'esp32-rssi-graph-' + dev.mac().replace(/:/g, '') + '-' + parent_name),
//        g = svg.attr("width", width + margin.left + margin.right)
//        .attr('class', 'esp32-rssi-graph')
//        .attr("height", height + margin.top + margin.bottom)
//      .append("g")
//        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
//    g.append("g")
//        .attr("class", "x axis")
//        .call(d3.axisTop(xScale)); // Create an axis component with d3.axisBottom
//
//    g.append("g")
//        .attr("class", "y axis")
//        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft
//
//    return svg.node();
//}

function _height_measure(nodes, height, index)
{
    if(nodes.children){
        let leg = (nodes.children.length - 1) / 2;
        
        height[0] = -leg + index - 0.5;
        height[1] = leg + index + 0.5;
        
        nodes.children.forEach((child, idx) => {
            let temp = _height_measure(child, Object.assign([], height), index + leg - idx);
            height[0] = temp[0] < height[0] ? temp[0] : height[0];
            height[1] = temp[1] > height[1] ? temp[1] : height[1];
        }); 
    };
    
    return height;
}

function height_measure(nodes)
{
    let temp = _height_measure(nodes, [-0.5, 0.5], 0);
    return Math.round(temp[1] - temp[0]);
}

export function draw_tree(container, nodes, net)
{
    const base_width_per_node = 140,
          base_height_per_leaf = 40;

    let margin = {top: 5, right: 60, bottom: 15, left: 60},
        width = base_width_per_node * nodes.height,
        height = base_height_per_leaf * height_measure(nodes);
    
    // declares a tree layout and assigns the size
    let treemap = d3.tree()
            .size([height, width]);

    // maps the node data to the tree layout
    nodes = treemap(nodes);

    let svg = d3.create('svg');
    svg.attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);

    let g = svg.append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    let treelink = d3.linkHorizontal()
                        .x(d => d.y)
                        .y(d => d.x);

    let link = g.selectAll(".link")
                .data(nodes.links())
                .join('path')
                    .attr('class', 'link')
                    .attr('id', function(d){ return 'textPath' + d.target.data.mac(); })
                    .attr('d', treelink);

    // adds each node as a group
    let node = g.selectAll(".node")
        .data(nodes.descendants())
        .join('g')
        .attr("class", function(d) { 
          return "node" + 
            (d.children ? " node--internal" : " node--leaf") +
                (d.data instanceof Wifi_Router ? " node--router" : 
                        (d.data.layer() == 1 ? " node--br" : ""))})
        .attr("transform", function(d) { 
          return "translate(" + d.y + "," + d.x + ")"; });

    node.append("circle")
        .attr('class', 'esp32-mesh-node-circle')
        .attr("r", 10)
        .on('click', _open_dev_data)
        .append('title').text(function(d){ return d.data.mac() + 
            (d.data instanceof Wifi_Router ? " (Router)" : 
                        (d.data.layer() == 1 ? " (BR)" : ""));});

    // adds the text to the node
    node.append("text")
      .attr("dy", ".35em")
      .attr("y", 20)
//      .attr("y", function(d) { return d.depth % 2 ? -20 : 20; })
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.mac(); });

    g.selectAll('.link-rssi')
        .data(nodes.links())
            .join('text')
                .attr('x', function(d){
                    return `${(d.target.y - d.source.y)/ 2}`
                })
                .attr('dy', '5px')
            .append('textPath')
            .attr('xlink:href', function(d){ return '#textPath' + d.target.data.mac(); })
            .style("text-anchor", "middle")
            .text(function(d){ return d.target.data.rssi(); });

    function _open_dev_data(ev, d)
    {
        let dev = d.data;
        const id_prefix = 'esp32-mesh-dev-net-';

        if(!(dev instanceof Mesh_Device)) return;
        
        let dev_name = dev.mac().replace(/:/g, ''),
            menu = container.querySelector('#' + id_prefix + dev_name);
        
        if(menu){
            menu.dispatchEvent(new Event('click'));
        }
    }
    
    return svg.node();
}