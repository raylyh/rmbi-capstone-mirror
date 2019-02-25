var width = 640,
    height = 400;

var radius = 8;

var degree = [0,1,2,3,4,5,6]
var current_degree = 6
var color = d3.scaleOrdinal(d3.schemeSpectral[7]).domain(degree);

var weight_degree = [1,2,3,4,5]
var weight_color = d3.scaleOrdinal(d3.schemeGreys[5]).domain(weight_degree);

var previous_hover_node;
var previous_click_node;

var svg = d3.select("body").append("svg")
    .attr("class", "canvas")
    .attr("width", "100%")
    .attr("height", "90vh")
    .append("g");


var max_degree = document.getElementById("degreeslider").value;
var min_strength = document.getElementById("strengthslider").value;

// *****
// MAIN FUNCTION
// *****
function draw(data) {
  // DEFINE SIMULATION

  // EDGE
  var node_data = [];

  var link_data = [];

  var valid_id  = [];

  for(var row = 0; row < data.links.length; row++) {
    if (data.links[row].weight >= min_strength && data.links[row].group <= max_degree){
      link_data.push({
        // TODO Don't make it so hardcode
        source: data.links[row].source,
        target: data.links[row].target,
        weight: data.links[row].weight,
        group : data.links[row].group,
        type  : data.links[row].type
         });
      valid_id.push(data.links[row].source, data.links[row].target);
       }
  };

  var valid_id_set = new Set(valid_id) // + new Set(link_data.target);

  for(var row = 0; row < data.nodes.length; row++) {
    if (data.nodes[row].group <= max_degree && valid_id_set.has(data.nodes[row].id)){
      node_data.push({

        // TODO Don't make it so hardcode
            address: data.nodes[row].address,
            age    : data.nodes[row].age,
            gender : data.nodes[row].gender,
            id     : data.nodes[row].id,
            name   : data.nodes[row].name,
            group  : data.nodes[row].group
         });
       }
  };

  svg.selectAll("*").remove();

  var simulation = d3.forceSimulation(node_data)
      .force("link", d3.forceLink(link_data).id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody().strength(-125*5))
      .force("center", d3.forceCenter(width/2, height/2))
      .force("collision", d3.forceCollide(radius*2))
      .stop();

  simulation.force("link").distance(90);
  // pause the simulation to load
  simulation.tick(300);

  // EDGE
  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(link_data)
    .enter().append("g");

  var line = link.append("line")
    .attr("stroke", function(d) { return weight_color(d.weight); })
    .attr("stroke-width", function(d) { return Math.sqrt(d.weight)/2; })
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  // var weight = link.append("text") // show weight number of a link
  //   .text(function(d) { return d.weight;} )
  //   .attr("x", function(d) { return (d.source.x+d.target.x)/2; })
  //   .attr("y", function(d) { return (d.source.y+d.target.y)/2; });


  // NODE
  var node = svg.append("g") //create a group of node group
    .attr("class", "nodes")
    .selectAll("g")
    .data(node_data)
    .enter().append("g");

  var circle = node.append("circle") //create circle in a node group
    .attr("r", radius)
    .attr("fill", function(d) { return color(d.group); })
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });

  var labels = node.append("text") //create label in a node group
    .text(function(d) { return d.id;})
    .attr("x", function(d) { return d.x + radius; })
    .attr("y", function(d) { return d.y + 5; });


  //FUNCTIONALITY
  d3.select("svg.canvas").call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null); //zooming function, avoid zooming when double-click
  d3.select("#showWeight").on("change", showWeight); // show weight if checked (call this func when checkbox changes)
  showInfo(); //intialize first
  d3.select("#degreeslider").on("change", showDegree); // testing degree slider to change the degree displayed
  d3.select("#strengthslider").on("change", showStrength);  // testing degree slider to change the degree displayed
  d3.selectAll("g.nodes g").on("mouseover", mouseover); //testing mouseover function select all g in g.nodes
  d3.selectAll("g.nodes g").on("mousedown", clicked); //testing clicking function select all g in g.nodes
  d3.selectAll("g.nodes g").on("dblclick", dblclicked); //testing double click
  d3.selectAll(".checkboxes label input").on("change", checkboxInfo);

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

  function showInfo(){
    var display = "";
    for (var i = 0; i <= max_degree; i++) {
      display += "Degree " + i + ":" + node.filter(function(d) { return d.group == i;}).size() + "\t"
    }
    d3.select("#degreeInfo").text(display);

    var display = "";
    for (var i = 0; i <= 5 - min_strength; i++) {
      display += "Weight " + (5-i) + ":" + link.filter(function(d) { return d.weight == (5-i);}).size() + "\t"
    }
    d3.select("#weightInfo").text(display);
  }

  function showDegree(){
    max_degree = document.getElementById("degreeslider").value;
    draw(data);
  }

  function showStrength(){
    min_strength = document.getElementById("strengthslider").value;
    draw(data);
  }
}

// FUNCTIONS
function mouseover(d) {
  if (!d3.select(previous_hover_node).empty()) {
    d3.select(previous_hover_node).classed("hovered", false);
  }
  d3.select(this).classed("hovered", true); //turns a hovered node to black
  previous_hover_node = this;
  d3.select(this).raise();
}

function clicked(d) {
  // show the info of clicked node
  var display = "";
  //slice away unwanted keys: index, x, y, vy, vx, fx, fy
  var str = d3.zip(d3.keys(d).slice(0, -5), d3.values(d).slice(0, -5));
  // create checkboxes
  console.log(str)
  var checkboxes = d3.select("#checkboxes").selectAll("input")
  .data(str)
  .enter()
  .append('label')
    .attr('for',function(d,i){ return d[0]; })
    .text(function(d) { return d[0]; });

  checkboxes.append("input")
    .attr("checked", true)
    .attr("type", "checkbox")
    .attr("id", function(d,i) { return d[0]; })
    .attr("onClick", "change(this)");

  checkboxes.append("text")
    .text('\t');

  // Show info
  for (var i = 0; i < str.length; i++) {
    display += str[i][0] + ":" + str[i][1] + "\t";
  }
  d3.select("#customerInfo").text(display);

  if (d3.select(this).classed("clicked")) {
    d3.select(this).classed("clicked", false); //turns a clicked node to red
  }
  else {
    d3.select(previous_click_node).classed("clicked", false); // remove previous clicked node attribute
    d3.select(this).classed("clicked", true);
    previous_click_node = this;
  }
}

function checkboxInfo() {
  console.log(this)
}

function dblclicked(d) {
  //double-clicked circle to be green and then update the submit form
  d3.select(this).select("circle").attr("fill", "green");
  d3.select("#searchinput").property("value", d.id);
  document.getElementById("searchform").submit();
}

function zoomed() {
  d3.select(this).select("g").attr("transform", d3.event.transform);
}
