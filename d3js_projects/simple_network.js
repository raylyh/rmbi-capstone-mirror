var width = 960,
    height = 600;

var color = d3.scaleOrdinal(d3.schemeCategory10);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "2px solid black");

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width/2, height/2));

d3.json("d3js_projects/testing.json").then(function(data) {

  console.log(data.links);

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .enter().append("line")
    .attr("stroke-width", function(d) { return Math.sqrt(d.weight);});

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(data.nodes)
    .enter().append("circle")
    .attr("r", 20)
    .attr("fill", function(d) { return color(d.group); })
    .call(d3.drag()
      .on("start", dragstart)
      .on("drag", dragging)
      .on("end", dragend));

  node.append("title")
      .text(function(d) { return d.id; });

  simulation.nodes(data.nodes).on("tick", ticked);
  simulation.force("link").id( function(d) {return d.id;});
  simulation.force("link").links(data.links);

  function ticked() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}
});


function dragstart(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragging(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragend(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}