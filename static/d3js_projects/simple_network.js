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
var link = svg.append("g")  // 'link' needs to be declared before 'node'
  .attr("class", "links");  // so that link is below node in graph
var node = svg.append("g")
  .attr("class", "nodes");


var t = svg.transition().duration(750);

var bbox = d3.select("svg.canvas").node().getBoundingClientRect();

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(link => link.id).distance(90))
    .force("charge", d3.forceManyBody().strength(-125*5))
    .force("center", d3.forceCenter(bbox.width/2, bbox.height/2))
    .force("collision", d3.forceCollide(radius*2));

var first_run = true;
// *****
// MAIN FUNCTION
// *****
function draw(data) {
  // INITIALIZE SIMULATION
  simulation.alpha(1).stop();
  simulation.nodes(data.nodes).force("link").links(data.links);
  // OVERWRITE NEW DATA with FILTERED NODE AND EDGE
  var link_data = data.links.filter(link => link.weight >= min_strength && link.group <= max_degree);
  var valid_id_set = d3.set(link_data.map(link => link.source.id).concat(link_data.map(link => link.target.id)));
  var node_data = data.nodes.filter(node => valid_id_set.has(node.id) && node.group <= max_degree);
  var current_customer_info = data.nodes.filter(node => node.group == 0)[0];
  var valid_key = d3.set(node_data.map(node => d3.keys(node)).flat()).values().slice(0, -5);  // slice away index, x, y, fx, fy
  simulation.nodes(node_data).force("link").links(link_data);
  // pause the simulation to load for the FIRST time
  if (first_run) {
    simulation.tick(300);
    first_run = false;
  }
  
  // DRAW EDGE
  link.selectAll("g")
    .data(link_data, d => d.source.id + '-' + d.target.id)
    .join(
      enter => enter.append("g").attr("id", d => d.source.id + '-' + d.target.id)
      .append("line")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
      .call(enter => enter.transition(t)  //animation
        .attr("stroke", d => color_weight(d.weight))
        .attr("stroke-width", d => Math.sqrt(d.weight)/2)),
      update => update,
      exit => exit
      .call(exit => exit.select("line").transition(t)
        .attr("stroke-width", 0))
      .transition(t).remove()
    );

  // DRAW NODE
  node.selectAll("g")
    .data(node_data, d => d.id)
    .join(
      enter => enter.append("g").attr("id", d => d.id)
      .call(enter => {
        enter.append("circle") //create circle in a node group
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
        .call(enter => enter.transition(t)  //animation
          .attr("r", radius)
          .attr("fill", d => color_degree(d.group)));
        enter.append("text") //create label in a node group
          .text(d => d.id)
          .attr("x", d => d.x + radius)
          .attr("y", d => d.y + 5)
        .call(enter => enter.transition(t)  //animation
          .attr("opacity", 1.0));
        }),
      update => update,
      exit => exit  // delete animation
      .call(exit => {
        exit.select("circle").transition(t).attr("r", 0);
        exit.select("text").transition(t).attr("opacity", 0);
      })
      .transition(t).remove()
    );

  //FUNCTIONALITY
  showInfo(); //intialize first

  d3.select("#showWeight").on("change", showWeight); // show weight if checked (call this func when checkbox changes)
  d3.selectAll("#degreeslider, #strengthslider").on("change", sliderChange); // testing degree slider to change the degree displayed
  d3.selectAll(".TableFilter").on("change", changeCheckboxInfo);

  d3.select("svg.canvas").call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null); //zooming function, avoid zooming when double-click
  // hover, click, and double-click on a node
  d3.selectAll("g.nodes g").on("mouseover", mouseover).on("mousedown", mousedown).on("dblclick", dblclicked).on("mouseout", mouseout);


  function showWeight() {
    if (d3.select("#showWeight").property("checked")) {
      link.selectAll("g").append("text")
        .text(d => d.weight)
        .attr("transform", d => "translate(" + (d.source.x+d.target.x)/2 + "," + (d.source.y+d.target.y)/2 + ")")
        .call(enter => enter.transition(t).attr('opacity', 1));
    } else {
      d3.selectAll("g.links").selectAll("text")
        .call(exit => exit.transition(t).attr('opacity', 0).remove());
    }
  }
  function sliderChange() {
    max_degree = document.getElementById("degreeslider").value;
    min_strength = document.getElementById("strengthslider").value;
    draw(data);
  }

  function showInfo() {
    d3.select("#degreeInfo").selectAll("table").remove();
    // DEGREE INFO TABLE
    table = d3.select("#degreeInfo").append("table");
    thead = table.append('tr');
    trow = table.append('tr');
    thead.append('th').text("Degree");
    trow.append('td').text("Count");
    for (var i = 0; i <= max_degree; i++) {
      thead.append('th').text(i);
      trow.append('td').text(node.selectAll("g").data().filter(d => d.group == i).length);
    }

    d3.select("#weightInfo").selectAll("table").remove();
    // WEIGHT INFO TABLE
    table = d3.select("#weightInfo").append("table");
    thead = table.append('tr');
    trow = table.append('tr');

    thead.append('th').text("Weight");
    trow.append('td').text("Count");
    for (var i = 0; i <= 5 - min_strength; i++) {
      thead.append('th').text((5-i));
      trow.append('td').text(link.selectAll("g").data().filter(d => d.weight == 5-i).length);
    }
    // UPDATE DEGREE AND STRENGTH OUTPUT IN HTML
    document.getElementById("degreesliderOutput").innerText = document.getElementById("degreeslider").value;
    document.getElementById("strengthsliderOutput").innerText = document.getElementById("strengthslider").value;
    // UPDATE ALL FUNCTIONALITY: EDGE WEIGHT SHOWN, POSSIBLE CHECKBOX
    showWeight();
    showCheckBox();
    changeCheckboxInfo();
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

  function changeCheckboxInfo() {
    var choices = d3.selectAll(".TableFilter").nodes().filter(x => x.checked).map(x => x.id);
    var data = [];
    // no clicked node
    if (d3.select(".clicked").node() == null) {
      for (var i = 0; i < choices.length; i++) {

          data.push([choices[i],current_customer_info[choices[i]]]);
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
    changeCheckboxInfo();
  }

  function mouseover(d) {
    if (!d3.select(previous_hover_node).empty()) {
      d3.select(previous_hover_node).classed("hovered", false);
    }
    d3.select(this).classed("hovered", true); //turns a hovered node to black
    previous_hover_node = this;
    d3.select(this).raise();  // put the hovered element as first element

    var current_id = d.id;

    var opacity_link_data = link.selectAll("g").data().filter(link => link.source.id == current_id || link.target.id == current_id);

    var opacity_link = [];
    for (var i in opacity_link_data){
      opacity_link.push([opacity_link_data[i].source.id, opacity_link_data[i].target.id]);
    }

    var adjlist = [];
    for (var row = 0; row < opacity_link.length; row ++){
      if (opacity_link[row][0] <= opacity_link[row][1]){
        adjlist.push([opacity_link[row][1] + '-' + opacity_link[row][0]]);
      } else {
        adjlist.push([opacity_link[row][0] + '-' + opacity_link[row][1]]);
      }

    }

    link.selectAll("g").select("line").style("stroke-width", 0.1);
    link.selectAll("g").select("text").style("opacity", 0.1);
    node.selectAll("g").select("circle").style("opacity", 0.1);
    node.selectAll("g").select("text").style("opacity", 0.1);

    for (var num in adjlist){
      d3.select("g[id='" + adjlist[num] + "']").select("line").style("stroke-width", 1);
      d3.select("g[id='" + adjlist[num] + "']").select("text").style("opacity", 1);
    }

    for (var num in opacity_link.flat()){
      d3.select("g[id='" + opacity_link.flat()[num] + "']").select("circle").style("opacity", 1);
      d3.select("g[id='" + opacity_link.flat()[num] + "']").select("text").style("opacity", 1);
    }
  }

  function mouseout(d){
    node.selectAll("circle").style("opacity", 1);
    link.selectAll("line").style("stroke-width", 1);
    d3.selectAll('text').style("opacity", 1);
  }

}

// FUNCTIONS
function dblclicked(d) {
  //double-clicked circle then update the submit form
  d3.select("#searchinput").property("value", d.id);
  document.getElementById("searchform").submit();
}

function zoomed() {
  d3.select(this).select("g").attr("transform", d3.event.transform);
}
