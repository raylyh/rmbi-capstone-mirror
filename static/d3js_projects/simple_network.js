var width = 640,
    height = 400;

var radius = 8;

var degree = [0,1,2,3,4,5,6];
var degree2 = [Array(7).keys()]
var current_degree = 6;
var color = d3.scaleOrdinal(d3.schemeSpectral[7]).domain(degree);

var weight_degree = [1,2,3,4,5];
var weight_color = d3.scaleOrdinal(d3.schemeGreys[5]).domain(weight_degree);

var previous_hover_node;
var previous_click_node;

var svg = d3.select("body").append("svg")
    .attr("class", "canvas")
    .attr("width", "100%")
    .attr("height", "60vh")
    .append("g");


var max_degree = document.getElementById("degreeslider").value;
var min_strength = document.getElementById("strengthslider").value;
var temp_data = null;

// *****
// MAIN FUNCTION
// *****
function draw(data) {
  // DEFINE SIMULATION

  // EDGE
  var temp_node_data = [];
  var node_data = [];

  var temp_link_data = [];
  var link_data = [];

  var valid_id  = [];
  var valid_key = [];

  for(var row = 0; row < data.links.length; row++) {
    var row_data = {};
    if (data.links[row].weight >= min_strength && data.links[row].group <= max_degree){
      for (var key in data.links[row]) {
        row_data[key] = data.links[row][key];
      }
      temp_link_data.push({row_data});
      valid_id.push(data.links[row].source, data.links[row].target);
       }
  };
  for (var row = 0; row <temp_link_data.length; row++){
    link_data[row] = temp_link_data[row].row_data
  };

  var valid_id_set = new Set(valid_id);

  for(var row = 0; row < data.nodes.length; row++) {
    var row_data = {};
    if (data.nodes[row].group <= max_degree && valid_id_set.has(data.nodes[row].id)){
      for (var key in data.nodes[row]) {
        row_data[key] = data.nodes[row][key];
        valid_key.push(key);
      }
      temp_node_data.push({row_data});
       }
  };
  for (var row = 0; row <temp_node_data.length; row++){
    node_data[row] = temp_node_data[row].row_data
  };

  console.log(node_data);
  valid_key = new Set(valid_key); // for information selection bar
  valid_key = Array.from(valid_key); // convert into list

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
    .enter().append("g")
    .attr("information",function(d) { return d.id; })
    .attr("id", "nodeInfo");

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
  showCheckBox();
  checkboxInfo();
  d3.select("#degreeslider").on("change", showDegree); // testing degree slider to change the degree displayed
  d3.select("#strengthslider").on("change", showStrength);  // testing degree slider to change the degree displayed
  d3.selectAll("g.nodes g").on("mouseover", mouseover); //testing mouseover function select all g in g.nodes
  d3.selectAll("g.nodes g").on("mousedown", clicked); //testing clicking function select all g in g.nodes
  d3.selectAll("g.nodes g").on("dblclick", dblclicked); //testing double click
  d3.selectAll(".TableFilter").on("change", checkboxInfo);

  function showWeight() {
    if (d3.select(this).property("checked")) {
        link.append("text")
        .text(function(d) { return d.weight;} )
        .attr("fill", "#2C4050")
        .attr("font-size", 14)
        .attr("transform", function(d) { return "translate(" + (d.source.x+d.target.x)/2 + "," + (d.source.y+d.target.y)/2 + ")"; });
    } else {
      d3.selectAll("g.links text").data([]).exit().remove();
    }
  }

  function showInfo(){

    d3.select("#degreeInfo").selectAll("table").data([]).exit().remove();
    table = d3.select("#degreeInfo").append("table");
    thead = table.append('tr');
    trow = table.append('tr');
    thead.append('th').text("Degree");
    trow.append('td').text("Count");

    for (var i = 0; i <= max_degree; i++) {
      thead.append('th').text(i);
      trow.append('td').text(node.filter(function(d) { return d.group == i;}).size());
    }

    d3.select("#weightInfo").selectAll("table").data([]).exit().remove();
    table = d3.select("#weightInfo").append("table");
    thead = table.append('tr');
    trow = table.append('tr');
    thead.append('th').text("Weight");
    trow.append('td').text("Count");

    for (var i = 0; i <= 5 - min_strength; i++) {
      thead.append('th').text((5-i));
      trow.append('td').text(link.filter(function(d) { return d.weight == (5-i);}).size());
    }
    document.getElementById("degreesliderOutput").innerText = document.getElementById("degreeslider").value;
    document.getElementById("strengthsliderOutput").innerText = document.getElementById("strengthslider").value;
  }

  function showCheckBox(){
    var checkboxes = d3.select("#checkboxes").selectAll("input")
    .data(valid_key)
    .enter()
    .append('label')
      .attr('name',function(d){ return d; })
      .text(function(d) { return d; });

    checkboxes.append("input")
      .attr("checked", true)
      .attr("type", "checkbox")
      .attr("value", function(d) { return d; })
      .attr("class", "TableFilter");
  }

  function showDegree(){
    max_degree = document.getElementById("degreeslider").value;
    draw(data);
  }

  function showStrength(){
    min_strength = document.getElementById("strengthslider").value;
    draw(data);
  }

  function checkboxInfo(){

    var choices = [];
    d3.selectAll(".TableFilter").each(function(d){
      cb = d3.select(this);
      if(cb.property("checked")){
        choices.push(cb.property("value"));
    }});

    var data = [];

    if (temp_data === null){
      if(choices.length > 0){
        for (var i = 0; i < choices.length; i ++){
            data.push([choices[i],null]);
          }
      }
    } else {
      for (var i = 0; i <= temp_data.length; i ++){
        for (var key in temp_data[i]){
          if (choices.includes(key)){
            data.push([key,temp_data[i][key]]);
          }
        }
      }
    }

    d3.select("#customerInfo").selectAll("table").data([]).exit().remove();
    table = d3.select("#customerInfo").append("table")
    thead = table.append('tr')
    trow = table.append('tr')
    for (var i = 0; i < data.length; i++) {
      //display += str[i][0] + ":" + str[i][1] + "\t";
      thead.append('th').text(data[i][0]);
      trow.append('td').text(data[i][1]);
      }
    }

    function clicked(d) {
      temp_data = [];
      temp_data.push(d);
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
  d3.select(this).raise();
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
