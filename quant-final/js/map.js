var width = 784*2,
    height = 2112,
    legendSize = 35,
    legendBlocks = 10,
    projection = d3.geoMercator()
        .center([-73.98, 40.75])
        .scale(160000)
        // .scale(900000)
        .translate([width / 2, height / 2])
        ,
    geoGenerator = d3.geoPath()
      .projection(projection);

size();
loadBoroughs('svg-homeownership');
setTimeout(function() {
  loadHOLC('svg-homeownership');
},300);

// loadWestchester('svg-homeownership');
setTimeout(function() {
  // loadMap('svg-homeownership');
  tractCircles('svg-homeownership');
},1000);


function size() {
  d3.select('#svg-homeownership')
    .attr('width',width)
    .attr('height',height)
}


function tractCircles(svg) {
  let circleScale = d3.scaleLinear().range([1,11]).domain([0,1])
  d3.json('data/censusHolcOverlap.json').then(function(json) {
    let adHolc = [];
    json.features.forEach((f) => {
      if (f.properties.holcGrade == 'A' || f.properties.holcGrade == 'D') {
        let avgLat = 0;
        let avgLon = 0;
        f.geometry.coordinates[0].forEach((c) => {
          avgLat += c[0];
          avgLon += c[1]
        })
        avgLat /= f.geometry.coordinates[0].length
        avgLon /= f.geometry.coordinates[0].length
        f.properties.avgLatLon = [avgLat,avgLon]
        // console.log(f.properties.avgLatLon);
        adHolc.push(f);
      }
    });
    d3.select('#'+svg)
      .append('g')
      .attr('id','circles')
      .selectAll(".circle")
      .data(adHolc)
      .enter().append("circle",".circle")
      .attr("opacity",0.7)
      .attr("r",(d) => {
        return circleScale(d.properties.pctHomeownership);
      })
      .attr("transform",(d) => {
        return "translate("+
        projection([d.properties.avgLatLon[0],d.properties.avgLatLon[1]])
        +")"
      })
      .attr("fill",(d) => {
        if (d.properties.holcGrade === 'A') {
          return d3.interpolateRdYlGn(1)
        } else if (d.properties.holcGrade === 'D') {
          return d3.interpolateRdYlGn(0)
        } else {
          return '#FFF'
        }
      })
  });

  for (let i=0;i<10;i++) {
    d3.select('#'+svg)
      .append('circle')
      .attr('r',circleScale(i/10))
      .attr('transform','translate(100,'+20*(i+1)+')')
      .attr('fill',d3.interpolateRdYlGn(0))
      .attr('opacity','0.7');

      d3.select('#'+svg)
        .append('circle')
        .attr('r',circleScale(i/10))
        .attr('transform','translate(130,'+20*(i+1)+')')
        .attr('fill',d3.interpolateRdYlGn(1))
        .attr('opacity','0.7');
  }

}

function loadBoroughs(svg) {
  d3.json('data/boroughs.geojson').then(function(json) {
    d3.select('#'+svg)
    .append('g')
    .attr('class','g-boroughs')
    .selectAll('path')
        .data(json.features)
        .enter()
        .append('path')
        .attr('d',geoGenerator)
        .attr("stroke-width",6)
        .attr("stroke","#d9d9db")
        .attr("fill","#ECEDE5")
        // .attr("fill","#000")
        .attr("class","borough-boundaries")
        .attr("opacity",0.8)
  })
}

function loadHOLC(svg) {
  d3.json('data/HOLC/HOLC_All.geojson').then(function(json) {
    console.log(json);
    d3.select('#'+svg)
    .append('g')
    .attr('class','g-boroughs')
    .selectAll('path')
        .data(json.features)
        .enter()
        .append('path')
        .attr('d',geoGenerator)
        .attr("stroke-width",1)
        .attr("stroke",(d) => {
          return "none"
          // if (d.properties.holc_grade == 'A') {
          //   return 'green'
          // } else if (d.properties.holc_grade == 'D') {
          //   return 'red'
          // } else {
          //   return "none"
          // }
        })
        .attr("fill",(d) => {
          if (d.properties.holc_grade == 'A') {
            return 'green'
          } else if (d.properties.holc_grade == 'D') {
            return 'red'
          } else {
            return "none"
          }
        })
        // .attr("fill","#000")
        .attr("class","borough-boundaries")
        .attr("opacity",0.1)
  })
}
