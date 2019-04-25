var radius = 8;
var num_degree = 6;
var num_weight = 5;
var color_degree = d3.scaleOrdinal(d3.schemeSpectral[num_degree+1]).domain([...Array(num_degree+1).keys()]);
var color_weight = d3.scaleOrdinal(d3.schemeGreys[num_weight+1]).domain([...Array(num_weight+1).keys()]);
var max_degree = document.getElementById("degreeslider").value;
var min_strength = document.getElementById("strengthslider").value;
var previous_click_node = null;

var tooltip = d3.select("body").select(".right").append("div")
  .attr("class", "tooltiptext")
  .style("opacity", 0);

var svg = d3.select("body").select(".right").append("svg")
  .attr("class", "canvas")
  .attr("width", "100%")
  .attr("height", "100%")
  .append("g");
var link = svg.append("g")  // 'link' needs to be declared before 'node'
  .attr("class", "links");  // so that link is below node in graph
var node = svg.append("g")
  .attr("class", "nodes");

svg.append("g")
  .attr("class", "legend")
  .attr("transform", "translate(20,20)");

var t = svg.transition().duration(500);

var bbox = d3.select("svg.canvas").node().getBoundingClientRect();

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(link => link.id).distance(90))
  .force("charge", d3.forceManyBody().strength(-125*5))
  .force("center", d3.forceCenter(bbox.width/2, bbox.height/2))
  .force("collision", d3.forceCollide(radius*2));

// intialize the boolean value
var first_run = true;
var normal_bool = true;
var sosc_bool = false;
var custseg_bool = false;
var slider_change = false;
var pre_sosc = "#reset";
var pre_custseg = "#reset";

// *****
// MAIN FUNCTION
// *****
function draw(data) {
  // INITIALIZE SIMULATION
  simulation.alpha(1).stop();

  simulation.nodes(data.nodes).force("link").links(data.links);
  // OVERWRITE NEW DATA with FILTERED NODE AND EDGE

  var link_data = data.links.filter(link => link.weight >= min_strength && link.group <= max_degree); // get the link data which fulfill the requirements in Degree Slider and Weight Slider
  var valid_id_set = d3.set(link_data.map(link => link.source.id).concat(link_data.map(link => link.target.id))); // get the unique customer id in link data
  var node_data = data.nodes.filter(node => valid_id_set.has(node.id) && node.group <= max_degree); // get the link data which fulfill the requirements in Degree Slider and unique customers
  var current_customer_info = data.nodes.filter(node => node.group == 0)[0]; // get the information of current selected customer -- for initialize the table information
  var valid_key = d3.set(node_data.map(node => d3.keys(node)).flat()).values().slice(0, -5);  // slice away index, x, y, fx, fy

  var valid_key = valid_key.filter(key => key != "latitude" && key != "longitude" && key != "link"); // remove two key that using in customer-segmentation

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
      enter => enter.append("g").attr("id", d => d.source.id + '-' + d.target.id) // the id of link data is customerid1-customerid2
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
          .attr("opacity", 1.0))
        .on("click", d => window.open(url="http://".concat(d.link)));
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
  showInfo(); //intialize the website first
  if (normal_bool){
    if (!first_run){
      svg.select(".legend").selectAll("g").remove();
    }

    var sequentialScale = d3.scaleSequential(d3.interpolateSpectral)
      .domain([0,6]);

    var logLegend = d3.legendColor()
      .title("Color Index")
      .titleWidth(100)
      .cells(7)
      .scale(sequentialScale);

    svg.select(".legend").append('g')
      .call(logLegend);
    }

  if (sosc_bool){
    btntog(pre_sosc, link_data);
  }

  if (custseg_bool){
    custseg(pre_custseg, node_data);
  }

  d3.select("#showWeight").on("change", showWeight); // show weight if checked (call this func when checkbox changes)
  d3.selectAll("#degreeslider, #strengthslider").on("change", sliderChange); // changes in slider would change the network displayed
  d3.selectAll(".TableFilter").on("change", changeCheckboxInfo); // changes in table filter will affect the table information

  d3.select("svg.canvas").call(d3.zoom().on("zoom", zoomed)).on("dblclick.zoom", null); //zooming function, avoid zooming when double-click
  // hover, click, and double-click on a node
  d3.selectAll("g.nodes g").on("mouseover", mouseover).on("mousedown", mousedown).on("dblclick", dblclicked).on("mouseout", mouseout);

  function showWeight() {
    if (d3.select("#showWeight").property("checked")) {
      link.selectAll("g").append("text")
        .text(d => d.weight)
        .attr("transform", d => "translate(" + (d.source.x+d.target.x)/2 + "," + (d.source.y+d.target.y)/2 + ")")
        .call(enter => enter.transition(t).attr('opacity', 1)); // opacity = 1 is visible / normal case
    } else {
      d3.selectAll("g.links").selectAll("text")
        .call(exit => exit.transition(t).attr('opacity', 0).remove()); // opacity = 0 is invisible
    }
  }

  function sliderChange() {
    // get the two new slider values and call draw function again.
    max_degree = document.getElementById("degreeslider").value;
    min_strength = document.getElementById("strengthslider").value;
    slider_change = true;
    draw(data);
    slider_change = false;
  }

  function showInfo() { // initialize
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
    // create a checkout box for table filter
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
    // update table information when there is any changes in checkbox
    var choices = d3.selectAll(".TableFilter").nodes().filter(x => x.checked).map(x => x.id);
    var data = [];
    // no clicked node
    if (d3.select(".clicked").node() == null) {
      for (var i = 0; i < choices.length; i++) {
        // push the current selected customer information as intializing
          data.push([choices[i],current_customer_info[choices[i]]]);
      }
    } else {
      // based on the seleted box, update the table information
      var selected_node = d3.select(".clicked").data()[0];
      for (var key in selected_node) {
        if (choices.includes(key)){
          data.push([key,selected_node[key]]);
        }
      }
    }

    // remove the past table content
    d3.select("#customerInfo").selectAll("table").remove();
    // append the new table content
    table = d3.select("#customerInfo").append("table")
    thead = table.append('tr')
    trow = table.append('tr')
    for (var i = 0; i < data.length; i++) {
      //display += str[i][0] + ":" + str[i][1] + "\t";
      thead.append('th').text(data[i][0]);
      trow.append('td').text(data[i][1]);
    }
  }

  function showTooltipInfo(d) {
    var choices = d3.selectAll(".TableFilter").nodes().filter(x => x.checked).map(x => x.id);
    var tooltip_string = "";
    for (var i in choices) {
      tooltip_string += choices[i] + ": " + d[choices[i]] + "<br/>";
    }
    tooltip.html(tooltip_string);
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
    // update the table information
    changeCheckboxInfo();
  }

  function mouseover(d) {
    d3.select(this).raise();  // put the hovered element as first element
    // show tooltip
    showTooltipInfo(d);
    tooltip.style("opacity", 1);
    // highlight nearest neighbour
    var current_id = d.id;
    var opacity_link_data = link.selectAll("g").data().filter(link => link.source.id == current_id || link.target.id == current_id); // get the link data which contains of current id

    var opacity_link = [];
    for (var i in opacity_link_data){
      opacity_link.push([opacity_link_data[i].source.id, opacity_link_data[i].target.id]);
    }

    var adjlist = [];
    // to get the id of link data
    for (var row = 0; row < opacity_link.length; row ++){
      if (opacity_link[row][0] <= opacity_link[row][1]){
        adjlist.push([opacity_link[row][1] + '-' + opacity_link[row][0]]);
      } else {
        adjlist.push([opacity_link[row][0] + '-' + opacity_link[row][1]]);
      }
    }

    // lower the opacity of whole graph to 0.1
    link.selectAll("g").select("line").style("stroke-width", 0.1);
    link.selectAll("g").select("text").style("opacity", 0.1);
    node.selectAll("g").select("circle").style("opacity", 0.1);
    node.selectAll("g").select("text").style("opacity", 0.1);

    // for current links, change their opacity values to original value
    for (var num in adjlist){
      d3.select("g[id='" + adjlist[num] + "']").select("line").style("stroke-width", 1);
      d3.select("g[id='" + adjlist[num] + "']").select("text").style("opacity", 1);
    }
    // for current nodes and related first degree node, change their opacity values to original value
    for (var num in opacity_link.flat()){
      d3.select("g[id='" + opacity_link.flat()[num] + "']").select("circle").style("opacity", 1);
      d3.select("g[id='" + opacity_link.flat()[num] + "']").select("text").style("opacity", 1);
    }
  }

  function mouseout(d){
    // change all opacity values to original value
    node.selectAll("circle").style("opacity", 1);
    link.selectAll("line").style("stroke-width", 1);
    d3.selectAll('text').style("opacity", 1);
    tooltip.style("opacity", 0);
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


function btntog(d,link_data){
  // function for social network analysis
  // we use a javascript package jsnetworkx

  // create a jsnx graph by our data
  sosc_bool = true;
  normal_bool = false;
  custseg_bool = false;

  svg.select(".legend").selectAll("g").remove();

  var log = d3.scaleLinear()
      .domain([ 0,0.5, 1])
      .range(["rgb(11, 102, 35)","rgb(255, 255, 255)", "rgb(17, 30, 108)"]);

  var logLegend = d3.legendColor()
    .title("Centrality Score")
    .titleWidth(100)
    .cells([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6,0.7,0.8,0.9,1])
    .scale(log);

  svg.select(".legend").append('g')
    .call(logLegend);

	var G = new jsnx.Graph();
  if (link_data == "current"){
    var raw_link = d3.select("g.links").selectAll("g").data();
  } else {
    var raw_link = link_data;
  }

	var link = [];
	for (var i in raw_link){
		if (raw_link[i].source.id > raw_link[i].target.id){
			link.push([raw_link[i].source.id, raw_link[i].target.id]);
		} else {
			link.push([raw_link[i].target.id,raw_link[i].source.id]);
		}
	}
  // add all our link data into the graph, the graph will automatically create the corresponding nodes
	G.addEdgesFrom(link);

  // for degree centrality
  if (d == "#deg" && (pre_sosc != d || (slider_change && pre_sosc == "#deg"))){
    pre_sosc = "#deg";

    var link = [];
    for (var i in raw_link){
      if (raw_link[i].source.id > raw_link[i].target.id){
        link.push([raw_link[i].source.id, raw_link[i].target.id]);
      } else {
        link.push([raw_link[i].target.id,raw_link[i].source.id]);
      }
    }

    for (var i = 0; i < link.length; i++) { //remove duplicates
      var listI = link[i];
      loopJ: for (var j = 0; j < link.length; j++) {
        var listJ = link[j]; //listJ and listI point at different arrays within the link array
        if (listI === listJ) continue; //Ignore itself
        for (var k = listJ.length; k >= 0; k--) { //checks whether the values are different, if they are continue with the loop
          if (listJ[k] !== listI[k]) continue loopJ;
        }
        // At this point, their values are equal so we remove from the link array
        link.splice(j, 1);
      }
    }

    var unique_node = new Set(link.flat());
    unique_node = Array.from(unique_node);

    var counts = {};

    for (var i = 0; i < link.flat().length; i++) {
      var num = link.flat()[i];
      counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    // counting the number of first degree nodes for all nodes in the network
    var count_list = [];

    for (var row in unique_node){
      count_list.push([unique_node[row], counts[unique_node[row]]]);
    }

    var new_color = color_convertor(count_list);
    visualization(new_color);

  // for closeness centrality
  // the function in that package is not define
  } else if (d == "#clo") {
		alert("Function Not Define");
		// TODO
    // var temp_value = jsnx.closenessCentrality(G)._numberValues;
    // var count_list = [];
    // for (i in temp_value){
    //   count_list.push([i,temp_value[i]]);
    // }
		//
    // var new_color = color_convertor(count_list);
    // visualization(new_color);

  // for betweenness centrality
  }else if (d == "#bet" && (pre_sosc != d || (slider_change && pre_sosc == "#bet"))){
    // the package helps calculate the value
    pre_sosc = "#bet";
    var temp_value = jsnx.betweennessCentrality(G)._numberValues;

    // change to the required nested list for function
    var count_list = [];
    for (i in temp_value){
      count_list.push([i,temp_value[i]]);
    }

    var new_color = color_convertor(count_list);
    visualization(new_color);

  // for eigenvector centrality
  } else if (d == "#eig" &&  (pre_sosc != d || (slider_change && pre_sosc == "#eig"))){
    pre_sosc = "#eig";

    // the package helps calculate the value
    // max iter = 100000, ensure it can coverage
    var temp_value = jsnx.eigenvectorCentrality(G,{maxIter: 100000})._numberValues;

    // change to the required nested list for function
    var count_list = [];
    for (i in temp_value){
      count_list.push([i,temp_value[i]]);
    }

    var new_color = color_convertor(count_list);
    visualization(new_color);


  } else if (d == '#reset' && pre_sosc != d){
    pre_sosc = d;
    sosc_bool = false;
    normal_bool = true;
    svg.select(".legend").selectAll("g").remove();

    var sequentialScale = d3.scaleSequential(d3.interpolateSpectral)
      .domain([0,6]);

    var logLegend = d3.legendColor()
      .title("Color Index")
      .titleWidth(100)
      .cells(7)
      .scale(sequentialScale);

    svg.select(".legend").append('g')
      .call(logLegend);

    var raw_link = d3.select("g.nodes").selectAll("g").data();

    // get back the original rgb value of the nodes
    var origin_color = [];
    for (i in raw_link){
      origin_color.push([raw_link[i].id,color_degree(raw_link[i].group)]);
    }
    visualization(origin_color);
  }
}



function color_convertor(count_list){
  // Input
  // [[81230, 1],
  // [81216, 4],
  // [1, 1],
  // [95808, 1,
  // [95202, 1]]


  // normalization for the nested list
  var max = 0;
  for (i in count_list){
    if (max < count_list[i][1]){
      max = count_list[i][1];
    }
  }

  for (i in count_list){
      count_list[i][1] = count_list[i][1] / max;
  }

  // change it to rgb value
  var new_color = [];
  for (i in count_list){
    new_color.push([count_list[i][0],d3.interpolateYlGnBu(count_list[i][1])]);
  }
  return new_color;
}

function visualization(new_color){

  // Input
  // [[81230, "rgb(254, 214, 118)"],
  // [81216, "rgb(128, 0, 38)"],
  // [1, "rgb(254, 214, 118)"],
  // [95808, "rgb(254, 214, 118)"],
  // [95202, "rgb(254, 214, 118)"]]

  // by identifying the node id (customer id), change the circle into the required rgb valye
  for (i in new_color){
    d3.select("g[id='" + new_color[i][0] + "']").select("circle").style("fill", new_color[i][1]);
  }

}


function custseg(d, node_data){

  normal_bool = false;
  custseg_bool = true;
  sosc_bool = false;

  svg.select(".legend").selectAll("g").remove();
  if (node_data == "current"){
    var raw_node = d3.select("g.nodes").selectAll("g").data();
  } else {
    var raw_node = node_data;
  }

  if (d == "#age" && (pre_custseg != d || (slider_change && pre_custseg == "#age"))) {
    // 0 - 10, 11 - 20
    pre_custseg = d;
    var age = [];
    for (var i in raw_node){
      if (raw_node[i].age.toString().length == 1){
      age.push([raw_node[i].id, d3.interpolateReds(0)]);
      } else {
      age.push([raw_node[i].id, d3.interpolateReds(parseInt(raw_node[i].age.toString()[0])/10)]);
    }
  }

    var sequentialScale = d3.scaleSequential(d3.interpolateReds)
      .domain([0,10]);

    var logLegend = d3.legendColor()
      .title("Age Index")
      .titleWidth(100)
      .cells(11)
      .scale(sequentialScale);

    svg.select(".legend").append('g')
      .call(logLegend);

    visualization(age);

  } else if (d == "#gend" && (pre_custseg != d || (slider_change && pre_custseg == "#gend"))){
    // M & F
    pre_custseg = d;
    var gender = [];
    for (var i in raw_node){
      if (raw_node[i].gender == "M") {
      gender.push([raw_node[i].id, 'rgb(155, 212, 245)']);
    } else {
      gender.push([raw_node[i].id, "rgb(254, 127, 156)"]);
    }
  }

    var sequentialScale = d3.scaleOrdinal()
      .domain(["Male", "Female"])
      .range(["rgb(155, 212, 245)", "rgb(254, 127, 156)"]);

    var logLegend = d3.legendColor()
      .title("Gender Color")
      .titleWidth(100)
      .cells(2)
      .scale(sequentialScale);

    svg.select(".legend").append('g')
      .call(logLegend);

    visualization(gender);

  } else if (d == "#addr" && (pre_custseg != d || (slider_change && pre_custseg == "#addr"))){
    // 'Yuen Long','Sha Tin','Tai Po','Sham Shui Po','Sai Kung','Southern',
    // 'Yau Tsim Mong','Wan Chai','Eastern','Wong Tai Sin','Kwun Tong',
    // 'Kwai Tsing','North','Kowloon City','Tuen Mun','Tsuen Wan','Islands'
    pre_custseg = d;
    var address = [];
    for (var i in raw_node){
      if (raw_node[i].address == "Yuen Long") {
      address.push([raw_node[i].id, 'rgb(189, 213, 225)']);
    } else if (raw_node[i].address == "Sha Tin") {
      address.push([raw_node[i].id, "rgb(73, 100, 65)"]);
    } else if (raw_node[i].address == "Tai Po") {
      address.push([raw_node[i].id, "rgb(120, 158, 99)"]);
    } else if (raw_node[i].address == "Sham Shui Po") {
      address.push([raw_node[i].id, "rgb(184, 174, 184)"]);
    } else if (raw_node[i].address == "Sai Kung") {
      address.push([raw_node[i].id, "rgb(198, 162, 91)"]);
    } else if (raw_node[i].address == "Southern") {
      address.push([raw_node[i].id, "rgb(239, 122, 90)"]);
    } else if (raw_node[i].address == "Yau Tsim Mong") {
      address.push([raw_node[i].id, "rgb(163, 132, 113)"]);
    } else if (raw_node[i].address == "Wan Chai") {
      address.push([raw_node[i].id, "rgb(168, 37, 7)"]);
    } else if (raw_node[i].address == "Eastern") {
      address.push([raw_node[i].id, "rgb(246, 177, 149)"]);
    } else if (raw_node[i].address == "Wong Tai Sin") {
      address.push([raw_node[i].id, "rgb(218, 181, 123)"]);
    } else if (raw_node[i].address == "Kwun Tong") {
      address.push([raw_node[i].id, "rgb(195, 189, 127)"]);
    } else if (raw_node[i].address == "Kwai Tsing") {
      address.push([raw_node[i].id, "rgb(122, 114, 147)"]);
    } else if (raw_node[i].address == "North") {
      address.push([raw_node[i].id, "rgb(172, 188, 162)"]);
    } else if (raw_node[i].address == "Kowloon City") {
      address.push([raw_node[i].id, "rgb(199, 161, 124)"]);
    } else if (raw_node[i].address == "Tuen Mun") {
      address.push([raw_node[i].id, "rgb(114, 142, 154)"]);
    } else if (raw_node[i].address == "Tsuen Wan") {
      address.push([raw_node[i].id, "rgb(141, 161, 168)"]);
    } else if (raw_node[i].address == "Islands") {
      address.push([raw_node[i].id, "rgb(222, 205, 126)"]);
    }
  }

    var sequentialScale = d3.scaleOrdinal()
      .domain(["Yuen Long","Sha Tin", 'Tai Po','Sham Shui Po','Sai Kung','Southern','Yau Tsim Mong','Wan Chai','Eastern','Wong Tai Sin','Kwun Tong','Kwai Tsing','North','Kowloon City','Tuen Mun','Tsuen Wan','Islands'])
      .range(['rgb(189, 213, 225)', "rgb(73, 100, 65)", "rgb(120, 158, 99)", "rgb(184, 174, 184)", "rgb(198, 162, 91)", "rgb(239, 122, 90)", "rgb(163, 132, 113)", "rgb(168, 37, 7)", "rgb(246, 177, 149)", "rgb(218, 181, 123)", "rgb(195, 189, 127)", "rgb(122, 114, 147)", "rgb(172, 188, 162)", "rgb(199, 161, 124)", "rgb(114, 142, 154)", "rgb(141, 161, 168)", "rgb(222, 205, 126)"]);

    var logLegend = d3.legendColor()
      .title("Address Color")
      .titleWidth(100)
      .cells(17)
      .scale(sequentialScale);

    svg.select(".legend").append('g')
      .call(logLegend);

    visualization(address);

  } else if (d == "#smok"  && (pre_custseg != d || (slider_change && pre_custseg == "#smok"))) {
    // Smoker & Non-somker
    pre_custseg = d;
    var smoker = [];
    for (var i in raw_node){
      if (raw_node[i].gender == "Smoker"){
      smoker.push([raw_node[i].id, 'rgb(30, 20, 19)']);
    } else {
      smoker.push([raw_node[i].id, "rgb(57, 255, 20)"]);
    }
  }

    var sequentialScale = d3.scaleOrdinal()
      .domain(["Smoker","Non-Smoker"])
      .range(['rgb(30, 20, 19)', "rgb(57, 255, 20)"]);

    var logLegend = d3.legendColor()
      .title("Smoker Color")
      .titleWidth(100)
      .cells(2)
      .scale(sequentialScale);

    svg.select(".legend").append('g')
      .call(logLegend);

    visualization(smoker);

  } else if (d == "#edu"  && (pre_custseg != d || (slider_change && pre_custseg == "#edu"))) {
    // Primary,Secondary,Tertiary
    pre_custseg = d;
    var education = [];
    for (var i in raw_node){
      if (raw_node[i].education == "Primary") {
      education.push([raw_node[i].id, 'rgb(177, 156, 217)']);
    } else if (raw_node[i].education == "Secondary") {
      education.push([raw_node[i].id, "rgb(178, 0, 255)"]);
    } else if (raw_node[i].education == "Tertiary") {
      education.push([raw_node[i].id, "rgb(69, 38, 77)"]);
    }
  }

    var sequentialScale = d3.scaleOrdinal()
      .domain(["Primary","Secondary", 'Tertiary'])
      .range(['rgb(177, 156, 217)', "rgb(178, 0, 255)", "rgb(69, 38, 77)"]);

    var logLegend = d3.legendColor()
      .title("Education Color")
      .titleWidth(100)
      .cells(3)
      .scale(sequentialScale);

    svg.select(".legend").append('g')
      .call(logLegend);

    visualization(education);

  } else if (d == "#heal"  && (pre_custseg != d || (slider_change && pre_custseg == "#heal"))) {
    // Normal, Hypertension, Cancer, Diabetes
    pre_custseg = d;
    var health = [];
    for (var i in raw_node){
      if (raw_node[i].health == "Normal") {
      health.push([raw_node[i].id, 'rgb(57, 255, 20)']);
    } else if (raw_node[i].health == "Hypertension") {
      health.push([raw_node[i].id, "rgb(139, 0, 0)"]);
    } else if (raw_node[i].health == "Cancer") {
      health.push([raw_node[i].id, "rgb(92, 64, 51)"]);
    } else if (raw_node[i].health == "Diabetes") {
      health.push([raw_node[i].id, "rgb(255, 255, 224)"]);
    }
  }

    var sequentialScale = d3.scaleOrdinal()
      .domain(["Normal","Hypertension", 'Cancer', 'Diabetes'])
      .range(['rgb(57, 255, 20)', "rgb(139, 0, 0)", 'rgb(92, 64, 51)','rgb(255, 255, 224)']);

    var logLegend = d3.legendColor()
      .title("Health Color")
      .titleWidth(100)
      .cells(4)
      .scale(sequentialScale);

    svg.select(".legend").append('g')
      .call(logLegend);

    visualization(health);

  } else if (d == "#reset" && pre_custseg != d) {
    pre_custseg = d;
    normal_bool = true;
    custseg_bool = false;
    svg.select(".legend").selectAll("g").remove();

    var sequentialScale = d3.scaleSequential(d3.interpolateSpectral)
      .domain([0,6]);

    var logLegend = d3.legendColor()
      .title("Color Index")
      .titleWidth(100)
      .cells(7)
      .scale(sequentialScale);

    svg.select(".legend").append('g')
      .call(logLegend);

    var raw_link = d3.select("g.nodes").selectAll("g").data();

    // get back the original rgb value of the nodes
    var origin_color = [];
    for (i in raw_link){
      origin_color.push([raw_link[i].id,color_degree(raw_link[i].group)]);
    }
    visualization(origin_color);
  }
}
