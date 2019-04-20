var width = 700,
    height = 900;


var projection = d3.geoMercator()
    .center([-73.98,40.78])
    .scale(105000)
    .translate([width / 2, height / 2]);

var geoGenerator = d3.geoPath()
  .projection(projection);

function init() {
  d3.json('data/boroughs.geojson').then(function(map) {

    let g = svg.append('g')
               .attr('class','g-boroughs')

    g.selectAll('path')
               .data(map.features)
               .enter()
               .append('path')
               .attr('d',geoGenerator)
               .attr("stroke-width",3)
               .attr("stroke","grey")
               .attr("fill","none")
  })

  // d3.json('data/CensusTracts.json').then(function(map) {
  // // d3.json('data/Map of NYCHA Developments.geojson').then(function(map) {
  //   console.log(map.features);
  //
  //   let g = svg.append('g')
  //              .attr('class','g-housingdev')
  //
  //   g.selectAll('path')
  //              .data(map.features)
  //              .enter()
  //              .append('path')
  //              .attr('d',geoGenerator)
  //              .attr("stroke-width",1)
  //              .attr("stroke",function(d) {
  //                // let val = d.properties.pctWhite;
  //                let val = d.properties.pctPoverty;
  //                let comp = 20;
  //
  //                if (d.properties.pctWhite < 0 || d.properties.pctPoverty < 0) {
  //                  return 'none';
  //                } else if (d.properties.pctWhite < 50) {
  //                  if (d.properties.pctPoverty > 20) {
  //                    return "#1b9e77";
  //                  } else {
  //                    return('#d95f02');
  //                  }
  //                } else if (d.properties.pctPoverty > 20) {
  //                  return "#7570b3"
  //                } else {
  //                  return '#d3d3d3'
  //                }
  //              })
  //              .attr("fill",function(d) {
  //                // let val = d.properties.pctWhite;
  //                let val = d.properties.pctPoverty;
  //                let comp = 20;
  //
  //                if (d.properties.pctWhite < 0 || d.properties.pctPoverty < 0) {
  //                  return 'none';
  //                } else if (d.properties.pctWhite < 50) {
  //                  if (d.properties.pctPoverty > 20) {
  //                    return "#1b9e77";
  //                  } else {
  //                    return('#d95f02');
  //                  }
  //                } else if (d.properties.pctPoverty > 20) {
  //                  return "#7570b3"
  //                } else {
  //                  return '#d3d3d3'
  //                }
  //              })
  //              .attr("id",function(d) { return d.properties.TRACT})
  // })
}

init();
