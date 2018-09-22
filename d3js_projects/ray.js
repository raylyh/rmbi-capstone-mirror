d3.select("body")
	.append("svg") //scalable vector graphics
	.attr("width", 50)
	.attr("height", 50)
	.append("circle")
	.attr("cx", 25)
	.attr("cy", 25)
	.attr("r", 25)
	.style("fill", "purple");

var data = [1, 2, 3]

var p = d3.select("body").selectAll("p") //document object model
	.data(data)
	.enter()
	.append("p")
	.text(function (d, i) {
		return "i = " + i + " d = " + d;
	});