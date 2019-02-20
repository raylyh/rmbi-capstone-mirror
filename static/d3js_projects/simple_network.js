var width = 640,
    height = 400;

var radius = 8;

var degree = [0,1,2,3,4,5,6]
var current_degree = 6
var color = d3.scaleOrdinal(d3.schemeSpectral[7]).domain(degree);

var weight_degree = [1,2,3,4,5]
var weight_color = d3.scaleOrdinal(d3.schemeGreys[5]).domain(weight_degree);

var max_degree = document.getElementById("degreeslider").value;

var max_strength = document.getElementById("strenghslider").value;

var svg = d3.select("body").append("svg")
    .attr("class", "canvas")
    .attr("width", "100%")
    .attr("height", height)
    .append("g");

<<<<<<< HEAD

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink())
    .force("charge", d3.forceManyBody().strength(-125))
    .force("center", d3.forceCenter(width/2, height/2))
    .alphaTarget(1);

=======
>>>>>>> bb8b1d717655f6294f6fa6e072875011a38848ff
// *****
// MAIN FUNCTION
// *****
function draw(data) {
<<<<<<< HEAD
=======
  // DEFINE SIMULATION
  var simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody().strength(-125))
      .force("center", d3.forceCenter(width/2, height/2))
      .force("collision", d3.forceCollide(20))
      .stop();
  // link the simulation with data
  simulation.force("link").links(data.links);
  // pause the simulation to load
  for (var i = 0; i < 300; ++i) simulation.tick();
>>>>>>> bb8b1d717655f6294f6fa6e072875011a38848ff

  // EDGE
  var node_data = [];

  var link_data = [];

  for(var row = 0; row < data.nodes.length; row++) {
    if (data.nodes[row].group <= max_degree){
      node_data.push({
             id: data.nodes[row].id,
             name: data.nodes[row].name,
             group: data.nodes[row].group
         });
       }
  }

  for(var row = 0; row < data.links.length; row++) {
    if (data.links[row].weight <= max_strength){
      link_data.push({
        source: data.links[row].source,
        target: data.links[row].target,
        weight: data.links[row].weight
         });
       }
  }

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line");

  link.exit().remove();
  link = link.data(link_data).enter().append("g");

  var line = link.append("line")
    .attr("stroke", function(d) { return weight_color(d.weight); })
    .attr("stroke-width", function(d) { return d.weight; })
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  var weight = link.append("text") // show weight number of a link
    .text(function(d) { return d.weight;} )
    .attr("x", function(d) { return (d.source.x+d.target.x)/2; })
    .attr("y", function(d) { return (d.source.y+d.target.y)/2; });


  // NODE

  var node = svg.append("g") //create a group of node group
    .attr("class", "nodes")
    .selectAll("g");

    node.exit().remove();
    node = node.data(node_data).enter().append("g");

  var circle = node.append("circle") //create circle in a node group
    .attr("r", radius)
    .attr("fill", function(d) { return color(d.group); })
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
    /*
    .call(d3.drag()
      .on("start", dragstart)
      .on("drag", dragging)
      .on("end", dragend));
    */
  var labels = node.append("text") //create label in a node group
    .text(function(d) { return d.id;})
    .attr("x", function(d) { return d.x + radius; })
    .attr("y", function(d) { return d.y + 5; });


  //FUNCTIONALITY
  d3.select("svg.canvas").call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null); //zooming function, avoid zooming when double-click
  showInfo(); //intialize first
  d3.select("#showWeight").on("change", showWeight); // show weight if checked (call this func when checkbox changes)
  d3.select("#degreeslider").on("change", showDegree); // testing degree slider to change the degree displayed
<<<<<<< HEAD
  d3.select("#strenghslider").on("change", showStrength);
  d3.selectAll("g.nodes g").on("click", clicked); //testing clicking function select all g in g.nodes
  d3.selectAll("g.nodes g").on("dblclick", dblclicked); //testing double click

  simulation.nodes(node_data).on("tick", ticked);
  simulation.force("link").id( function(d) {return d.id;});
  simulation.force("link").links(link_data);
  simulation.alpha(1).restart();

  function ticked() {
    line.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })

    d3.selectAll("g.links text").attr("transform", function(d) { return "translate(" + (d.source.x+d.target.x)/2 + "," + (d.source.y+d.target.y)/2 + ")"; });
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  }

=======
  d3.selectAll("g.nodes g").on("mouseover", clicked); //testing clicking function select all g in g.nodes
  d3.selectAll("g.nodes g").on("dblclick", dblclicked); //testing double click

>>>>>>> bb8b1d717655f6294f6fa6e072875011a38848ff
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

<<<<<<< HEAD
  function showInfo(){
=======
  function showDegree() {
    //TODO: change the degree based on slider value
    current_degree = document.getElementById("degreeslider").value
    // another method: d3.select(this).node().value
    alert(current_degree);

>>>>>>> bb8b1d717655f6294f6fa6e072875011a38848ff
    var display = "";
    for (var i = 0; i <= current_degree; i++) {
      display += "Degree " + i + ":" + node.filter(function(d) { return d.group == i;}).size() + "\t"
    }
    d3.select("#degreeInfo").text(display);
  }

  function showDegree(){

    max_degree = document.getElementById("degreeslider").value;
    draw(data);
  }

  function showStrength(){
    max_strength = document.getElementById("strenghslider").value;
    draw(data);
  }

}

// FUNCTIONS
function clicked(d) {
  d3.selectAll("g.nodes g circle").attr("fill", function(d) { return color(d.group); });
  d3.select(this).select("circle").attr("fill", "black"); //turns a clicked node to red

  // show the info of clicked node
  var display = "";
  //slice away unwanted keys: index, x, y, vy, vx, fx, fy
  var str = d3.zip(d3.keys(d).slice(0, -7), d3.values(d).slice(0, -7));
  for (var i = 0; i < str.length; i++) {
    display += str[i][0] + ":" + str[i][1] + "\t";
  }
  d3.select("#customerInfo").text(display);
}

function dblclicked(d) {
  //double-clicked circle to be green and then update the submit form
  d3.select(this).select("circle").attr("fill", "green");
  d3.select("#searchinput").property("value", d.id);
  document.getElementById("searchform").submit();
}

/*
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
*/

function zoomed() {
  d3.select(this).select("g").attr("transform", d3.event.transform);
}
