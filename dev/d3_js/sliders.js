var data = [0, 0.005, 0.01, 0.015, 0.02, 0.025];

// Step
var sliderStep = d3
  .sliderBottom()
  .min(d3.min(data))
  .max(d3.max(data))
  .width(300)
  .tickFormat(d3.format('.2%'))
  .ticks(5)
  .step(0.005)
  .default(0.015)
  .on('onchange', val => {
    d3.select('p#value-step').text(d3.format('.2%')(val));
  });

var gStep = d3
  .select("div#slider-step")
  .append('svg')
  .attr('width', 500)
  .attr('height', 100)
  .append('g')
  .attr('transform', 'translate(30,30)');

gStep.call(sliderStep);

d3.select('p#value-step').text(d3.format('.2%')(sliderStep.value()));
