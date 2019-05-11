function loadMap(map,name) {
  d3.json(map).then(function(json) {
    numberOfZones = json.features.length-1;
    console.log(numberOfZones);
    let g = svg.append('g')
               .attr('class','g-' + name)

    let lines = g.selectAll('path')
                 .data(json.features)
                 .enter()
                 .append('path')
                 .attr('d',geoGenerator)
                 .attr("stroke-width",0)
                 .attr('class',(d)=>'path class-'+d.properties.holc_grade)

    lines.each(function (d,i) {d.totalLength = this.getTotalLength();})
         .attr('stroke-dasharray',(d) => d.totalLength + " " + d.totalLength)
         .attr('stroke-dashoffset',(d) => d.totalLength)
         .attr('z-index',(d,i)=>numberOfZones-i)
         .transition()
          .duration((d)=>2000 )
          .ease(d3.easeCubic)
          .delay((d,i)=>0 + (30*i))
          .attr("stroke-dashoffset", 0)
  })
}

function init() {
  let maps = ['Manhattan'];
  maps.forEach(function(m,i) {
    loadMap('data/HOLC_' + m + '.geojson',m);
  })

}

init();
