var width = 640,
    height = 400;

var radius = 10;

var degree = [6,5,4,3,2,1,0]
var color = d3.scaleOrdinal(d3.schemeYlGnBu[7]).domain(degree);

var weight_degree = [1,2,3,4,5]
var weight_color = d3.scaleOrdinal(d3.schemeGreys[5]).domain(weight_degree);

var svg = d3.select("body").append("svg")
    .attr("class", "canvas")
    .attr("width", width)
    .attr("height", height)
    .style("border", "2px solid black")
    .style("background", "#ffeec8")
    .append("g");

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody().strength(-125))
    .force("center", d3.forceCenter(width/2, height/2));

function draw(data) {
  // EDGE
  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .enter().append("g");

  var line = link.append("line")
    .attr("stroke", function(d) { return weight_color(d.weight); })
    .attr("stroke-opacity", 1.0)
    .attr("stroke-width", function(d) { return d.weight; });

  var weight = link.append("text") // show weight number of a link
    .text(function(d) { return d.weight;} )
    .attr("fill", "#2C4050")
    .attr("font-size", 14);

  // NODE
  var node = svg.append("g") //create a group of node group
    .attr("class", "nodes")
    .selectAll("g")
    .data(data.nodes)
    .enter().append("g");

  var circle = node.append("circle") //create circle in a node group
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

  d3.select("svg.canvas").call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null); //zooming function, avoid zooming when double-click
  d3.select("#showWeight").on("change", showWeight); // show weight if checked (call this func when checkbox changes)
  d3.selectAll("g.nodes g").on("click", clicked); //testing clicking function select all g in g.nodes
  d3.selectAll("g.nodes g").on("dblclick", dblclicked); //testing double click

  simulation.nodes(data.nodes).on("tick", ticked);
  simulation.force("link").id( function(d) {return d.id;});
  simulation.force("link").links(data.links);

  function ticked() {
    line.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })

    d3.selectAll("g.links text").attr("transform", function(d) { return "translate(" + (d.source.x+d.target.x)/2 + "," + (d.source.y+d.target.y)/2 + ")"; });
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  }

  function showWeight() {
    if (d3.select(this).property("checked")) {
      link
        .append("text")
        .text(function(d) { return d.weight;} )
        .attr("fill", "#2C4050")
        .attr("font-size", 14)
        .attr("transform", function(d) { return "translate(" + (d.source.x+d.target.x)/2 + "," + (d.source.y+d.target.y)/2 + ")"; });
    } else {
      d3.selectAll("g.links text").data([]).exit().remove();
    }
  }
}

// FUNCTIONS
function clicked(d) {
  d3.selectAll("g.nodes g circle").attr("fill", function(d) { return color(d.group); });
  d3.select(this).select("circle").attr("fill", "red"); //turns a clicked node to red

  // show the info of clicked node
  var display = "";
  //slice away unwanted keys: index, x, y, vy, vx, fx, fy
  var str = d3.zip(d3.keys(d).slice(0, -7), d3.values(d).slice(0, -7));
  for (var i = 0; i < str.length; i++) {
    display += str[i][0] + ":" + str[i][1] + "\t";
  }
  d3.select("#info").select("text").text(display);
}

function dblclicked(d) {
  //double-clicked circle to be green and then update the submit form
  d3.select(this).select("circle").attr("fill", "green");
  d3.select("#searchinput").property("value", d.id);
  document.getElementById("searchform").submit();
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

function zoomed() {
  d3.select(this).select("g").attr("transform", d3.event.transform);
}
