var circleRadii = [40, 20, 10];
var jsonCircles = [ //circles definition
	{ "x" : 30, "y" : 30, "r" : circleRadii[0], "color" : "green"},
	{ "x" : 100, "y" : 100, "r" : circleRadii[1], "color" : "yellow"},
	{ "x" : 400, "y" : 200, "r" : circleRadii[2], "color" : "red"}];

var bodySelection = d3.select("body");

var svgSelection = bodySelection.append("svg") //scalable vector graphics
	.attr("width", 600)
	.attr("height", 600)
	.style("border", "1px solid black"); //SVG container (a coordinate space)

var circleSelection = svgSelection.selectAll("circle") //draw circles here
	.data(jsonCircles)
	.enter()
	.append("circle");

var circleAttributes = circleSelection
	.attr("cx", function (d) {return d.x;}) //x coordinate
	.attr("cy", function (d) {return d.y;}) //y coordinate
	.attr("r", function (d) {return d.r;}) //radius
	.style("fill", function (d) {return d.color;}); //this is optional

var rectangle = svgSelection.append("rect") //make a rectangle
	.attr("x", 500)
	.attr("y", 500)
	.attr("width", 50)
	.attr("height", 100);

var line = svgSelection.append("line") //draw a line
	.attr("x1", 50)
	.attr("y1", 400)
	.attr("x2", 55)
	.attr("y2", 450)
	.attr("stroke-width", 5)
	.attr("stroke", "grey")



var data = [1, 2, 3]

var p = d3.select("body").selectAll("p") //document object model
	.data(data)
	.enter()
	.append("p")
	// d is data array, i is index
	.text(function (d, i) {
		return "i = " + i + " d = " + d;
	});
