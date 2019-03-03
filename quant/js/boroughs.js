function loadMap(svg) {
  d3.json('data/boroughs.geojson').then(function(json) {
    d3.select('#'+svg)
    .append('g')
    .attr('class','g-boroughs')
    .selectAll('path')
        .data(json.features)
        .enter()
        .append('path')
        .attr('d',geoGenerator)
        .attr("stroke-width",1)
        .attr("stroke","black")
        .attr("fill","none")
        .attr("class","borough-boundaries")
  })
}

function init() {
  loadMap('svg-nonwhite');
  loadMap('svg-homeownership');
  loadMap('svg-poverty');
}

setTimeout(function() {
  init();
},200);
