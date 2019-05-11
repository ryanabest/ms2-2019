var width = 700,
    height = 900;


var projection = d3.geoMercator()
    .center([-73.93,40.61])
    .scale(1005000)
    .translate([width / 2, height / 2]);

var geoGenerator = d3.geoPath()
  .projection(projection);

function init() {
  Promise.all([
    d3.json('../../old-census/IPUMS/Data/2010/NY_tract_2010.json'),
    d3.json('data/HOLC_Brooklyn.geojson'),
    d3.json('../../thesis/Data/HOLC_All_Years.geojson'),
  ]).then((json) => {
    var map = json[0];
    var holc = json[1];

    console.log(json[2]);

    // json[2].features.forEach((bklyn)=> {
    //   // console.log(bklyn);
    //   if (bklyn.properties.city == 'Brooklyn' && bklyn.properties.holc_id == 'D22') {
    //     console.log(bklyn);
    //   }
    // })

    let brooklynD22Census = [];
    let brooklynD22Holc = []

    map.features.forEach((tract) => {
      if (tract.properties.GISJOIN == 'G3600470069602') {
        brooklynD22Census.push(tract);
      } else if (tract.properties.GISJOIN == 'G3600470070000') {
        brooklynD22Census.push(tract);
      } else if (tract.properties.GISJOIN == 'G3600470070600') {
        brooklynD22Census.push(tract);
      };
    });

    holc.features.forEach((zone) => {

      if (zone.properties.holc_id == 'D22') {
        brooklynD22Holc.push(zone);
        console.log(zone);
      };
    });

    let g = svg.append('g')
               .attr('class','g-boroughs')

    g.selectAll('path.census')
               .data(brooklynD22Census)
               .enter()
               .append('path')
               .attr('class','census')
               .attr('d',geoGenerator)
               .attr("stroke-width",3)
               .attr("stroke","grey")
               .attr("fill","none")
               .on('mouseover',(d) => {console.log(d);})

     g.selectAll('path.holc')
                .data(brooklynD22Holc)
                .enter()
                .append('path')
                .attr('class','holc')
                .attr('d',geoGenerator)
                .attr("stroke-width",3)
                .attr("stroke","white")
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
