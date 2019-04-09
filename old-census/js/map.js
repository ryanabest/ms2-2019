function loadMap(map,name) {
  d3.json(map).then(function(json) {
    let g = svg.append('g')
               .attr('class','g-' + name)

    console.log(json);
    g.selectAll('path')
               .data(json.features)
               .enter()
               .append('path')
               .attr('d',geoGenerator)
               .attr("stroke-width",2)
               .attr('opacity',(d)=>{
                 return d.properties['Percent White']
               })
               .on('mouseenter',(d) => {console.log(d.properties)})
  })
}

function init() {
  // loadMap('HOLC/HOLC_All_Years.geojson','1');
  // loadMap('HOLC/HOLC_All.geojson','1');
  loadMap('IPUMS/Data/1940/1940.json','1');
  // loadMap('IPUMS/Data/1930/NY_tract_1930.json','1');
}

init();
