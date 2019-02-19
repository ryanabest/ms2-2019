function loadMap(map,name) {
  d3.json(map).then(function(json) {
    let g = svg.append('g')
               .attr('class','g-' + name)

    g.selectAll('path')
               .data(json.features)
               .enter()
               .append('path')
               .attr('d',geoGenerator)
               .attr("stroke-width",2)
               .attr('fill',function(d) {
                 if (d.properties.holc_grade === 'A') {
                   return '#8C9F5B'
                 } else if (d.properties.holc_grade === 'B') {
                   return '#8AA1AB'
                 } else if (d.properties.holc_grade === 'C') {
                   return '#D6B64C'
                 } else if (d.properties.holc_grade === 'D') {
                   return '#CC6D7B'
                 } else { return 'none' }
               })
               .attr('stroke',function(d) {
                 if (d.properties.holc_grade === 'A') {
                   return '#8C9F5B'
                 } else if (d.properties.holc_grade === 'B') {
                   return '#8AA1AB'
                 } else if (d.properties.holc_grade === 'C') {
                   return '#D6B64C'
                 } else if (d.properties.holc_grade === 'D') {
                   return '#CC6D7B'
                 } else { return 'none' }
               })
               // .attr("class",function(d) { return "class-" + d.properties.holc_grade});
  })
}

function init() {
  let maps = ['Brooklyn','Queens','Manhattan','StatenIsland','Bronx','LowerWestchesterCo','BergenCo','EssexCounty'];
  maps.forEach(function(m,i) {
    loadMap('data/HOLC_' + m + '.geojson',m);
  })

}

init();
