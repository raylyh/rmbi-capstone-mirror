var width = 640,
    height = 400;

var radius = 20;

var color = d3.scaleOrdinal(d3.schemeCategory10);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "2px solid black");

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width/2, height/2));

function draw(data) {
  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .enter().append("line")
    .attr("stroke-width", function(d) { return Math.sqrt(d.weight);});

  var node = svg.append("g") //create a group of node group
    .attr("class", "nodes")
    .selectAll("g")
    .data(data.nodes)
    .enter().append("g");

  var circle = node.append("circle")//create circle in a node group
    .attr("r", radius)
    .attr("fill", function(d) { return color(d.group); })
    .call(d3.drag()
      .on("start", dragstart)
      .on("drag", dragging)
      .on("end", dragend));

  var labels = node.append("text") //create label in a node group
    .text(function(d) { return d.id;})
    .attr("dx", 20)
    .attr("dy", 5);

  simulation.nodes(data.nodes).on("tick", ticked);
  simulation.force("link").id( function(d) {return d.id;});
  simulation.force("link").links(data.links);

  d3.selectAll("g.nodes g").on("click", clicked); //testing clicking function

  function ticked() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")";
    });
  }

  function clicked() {
    d3.select(this).select("circle").attr("fill", "red"); //turns a clicked to red
    d3.select(this).select("text").text(function(d) {return d.name;});
  }
}

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
