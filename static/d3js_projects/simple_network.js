var radius = 8;
var num_degree = 6;
var num_weight = 5;
var color_degree = d3.scaleOrdinal(d3.schemeSpectral[num_degree+1]).domain([...Array(num_degree+1).keys()]);
var color_weight = d3.scaleOrdinal(d3.schemeGreys[num_weight+1]).domain([...Array(num_weight+1).keys()]);
var max_degree = document.getElementById("degreeslider").value;
var min_strength = document.getElementById("strengthslider").value;

var previous_hover_node, previous_click_node = null;

var svg = d3.select("body").append("svg")
    .attr("class", "canvas")
    .attr("width", "100%")
    .attr("height", "60vh")
    .append("g");

var bbox = d3.select("svg.canvas").node().getBoundingClientRect();

// *****
// MAIN FUNCTION
// *****
function draw(data) {
  // DEFINE SIMULATION
  svg.selectAll("*").remove();
  // INITIALIZE SIMULATION
  var simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id(link => link.id))
      .force("charge", d3.forceManyBody().strength(-125*5))
      .force("center", d3.forceCenter(bbox.width/2, bbox.height/2))
      .force("collision", d3.forceCollide(radius*2))
      .stop();

  // OVERWRITE NEW DATA
  var link_data = data.links.filter(link => link.weight >= min_strength && link.group <= max_degree);
  var valid_id_set = d3.set(link_data.map(link => link.source.id).concat(link_data.map(link => link.target.id)));

  var node_data = data.nodes.filter(node => valid_id_set.has(node.id) && node.group <= max_degree);
  var valid_key = d3.set(node_data.map(node => d3.keys(node)).flat()).values().slice(0, -5);  // slice away index, x, y, fx, fy

  simulation.nodes(node_data).force("link").links(link_data);
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
    .attr("stroke", function(d) { return color_weight(d.weight); })
    .attr("stroke-width", function(d) { return Math.sqrt(d.weight)/2; })
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  // NODE
  var node = svg.append("g") //create a group of node group
    .attr("class", "nodes")
    .selectAll("g")
    .data(node_data)
    .enter().append("g")
    .attr("information",function(d) { return d.id; })
    .attr("id", "nodeInfo");

  var circle = node.append("circle") //create circle in a node group
    .attr("r", radius)
    .attr("fill", function(d) { return color_degree(d.group); })
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });

  var labels = node.append("text") //create label in a node group
    .text(function(d) { return d.id;})
    .attr("x", function(d) { return d.x + radius; })
    .attr("y", function(d) { return d.y + 5; });


  //FUNCTIONALITY
  showInfo(); //intialize first
  showCheckBox();
  checkboxInfo();

  d3.select("#showWeight").on("change", showWeight); // show weight if checked (call this func when checkbox changes)
  d3.select("#degreeslider").on("change", showDegree); // testing degree slider to change the degree displayed
  d3.select("#strengthslider").on("change", showStrength);  // testing degree slider to change the degree displayed
  d3.selectAll(".TableFilter").on("change", checkboxInfo);

  d3.select("svg.canvas").call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null); //zooming function, avoid zooming when double-click
  d3.selectAll("g.nodes g").on("mouseover", mouseover); // mouseover function select all g in g.nodes
  d3.selectAll("g.nodes g").on("mousedown", mousedown); // clicking function select all g in g.nodes
  d3.selectAll("g.nodes g").on("dblclick", dblclicked); // double click function



  function showWeight() {
    if (d3.select(this).property("checked")) {
        link.append("text")
        .text(edge => edge.weight)
        .attr("transform", function(d) { return "translate(" + (d.source.x+d.target.x)/2 + "," + (d.source.y+d.target.y)/2 + ")"; });
    } else {
      d3.selectAll("g.links text").remove();
    }
  }
  function showDegree(){
    max_degree = document.getElementById("degreeslider").value;
    draw(data);
  }
  function showStrength(){
    min_strength = document.getElementById("strengthslider").value;
    draw(data);
  }

  function showInfo(){

    d3.select("#degreeInfo").selectAll("table").remove();
    // DEGREE INFO
    table = d3.select("#degreeInfo").append("table");
    thead = table.append('tr');
    trow = table.append('tr');

    thead.append('th').text("Degree");
    trow.append('td').text("Count");
    for (var i = 0; i <= max_degree; i++) {
      thead.append('th').text(i);
      trow.append('td').text(node.filter(d => d.group == i).size());
    }

    d3.select("#weightInfo").selectAll("table").remove();
    // WEIGHT INFO
    table = d3.select("#weightInfo").append("table");
    thead = table.append('tr');
    trow = table.append('tr');

    thead.append('th').text("Weight");
    trow.append('td').text("Count");
    for (var i = 0; i <= 5 - min_strength; i++) {
      thead.append('th').text((5-i));
      trow.append('td').text(link.filter(d => d.weight == 5-i).size());
    }
    document.getElementById("degreesliderOutput").innerText = document.getElementById("degreeslider").value;
    document.getElementById("strengthsliderOutput").innerText = document.getElementById("strengthslider").value;
  }

  function showCheckBox(){
    var checkboxes = d3.select("#nodecheckboxes").selectAll("input")
    .data(valid_key)
    .enter()
    .append('label')
      .attr('id', key => key)
      .text(key => key)
    .append("input")
      .attr("id", key => key)
      .attr("class", "TableFilter")
      .attr("type", "checkbox")
      .attr("checked", true);
  }

  function checkboxInfo() {
    var choices = d3.selectAll(".TableFilter").nodes().filter(x => x.checked).map(x => x.id);
    var data = [];
    // no clicked node
    if (d3.select(".clicked").node() == null) {
      for (var i = 0; i < choices.length; i++) {
          data.push([choices[i],null]);
      }
    } else {
      var selected_node = d3.select(".clicked").data()[0];
      for (var key in selected_node) {
        if (choices.includes(key)){
          data.push([key,selected_node[key]]);
        }
      }
    }

    d3.select("#customerInfo").selectAll("table").remove();
    table = d3.select("#customerInfo").append("table")
    thead = table.append('tr')
    trow = table.append('tr')
    for (var i = 0; i < data.length; i++) {
      //display += str[i][0] + ":" + str[i][1] + "\t";
      thead.append('th').text(data[i][0]);
      trow.append('td').text(data[i][1]);
    }
  }

  function mousedown(d) {
    // define class for clicked node
    if (d3.select(this).classed("clicked")) {
      d3.select(this).classed("clicked", false); //turns a clicked node to red
    }
    else {
      d3.select(previous_click_node).classed("clicked", false); // remove previous clicked node attribute
      d3.select(this).classed("clicked", true);
      previous_click_node = this;
    }
    checkboxInfo();
  }
}

// FUNCTIONS
function mouseover(d) {
  if (!d3.select(previous_hover_node).empty()) {
    d3.select(previous_hover_node).classed("hovered", false);
  }
  d3.select(this).classed("hovered", true); //turns a hovered node to black
  previous_hover_node = this;
  d3.select(this).raise();  // put the hovered element as first element
}

function dblclicked(d) {
  //double-clicked circle then update the submit form
  d3.select("#searchinput").property("value", d.id);
  document.getElementById("searchform").submit();
}

function zoomed() {
  d3.select(this).select("g").attr("transform", d3.event.transform);
}
