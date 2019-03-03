function loadMap(svg) {
  let map = svg.split('-')[1],
      jsonFp = '',
      column = 'pct' + map.charAt(0).toUpperCase() + map.slice(1),
      multp = 1;

  console.log(column);

  if (map === 'homeownership') {
    jsonFp = 'data/housing/housingHomeownership.json';
  } else if (map === 'poverty') {
    jsonFp = 'data/povertyrace/censusPoverty.json';
    multp = 2
  } else if (map === 'nonwhite') {
    jsonFp = 'data/povertyrace/censusNonwhite.json';
  }

  d3.json(jsonFp).then(function(json) {
    function drawMap() {
      let map = svg.split('-')[1],
          g = d3.select('#'+map+'-maps')
                 .append('svg')
                 .attr('id',svg)
                 .attr("width", width)
                 .attr("height", height)
                 .append('g')
                   // .attr('id',svg + '-' + grade)
                   .attr('class','g-tracts')

      g.selectAll('path')
                 .data(json.features)
                 .enter()
                 .append('path')
                 .attr('d',geoGenerator)
                 .attr('fill',colors[map])
                 .attr('stroke','none')
                 .attr('class','tract-path')
                 .attr('opacity',(d) => {return d.properties[column] * multp})
                 .attr('clip-path','url("#redline-a")')
                 // .attr("class",function(d) { return "class-" + d.properties.holc_grade});
    }

    drawLegend(svg);

    drawMap();
  })
}

function init() {
  loadMap('svg-homeownership');
  loadMap('svg-poverty');
  loadMap('svg-nonwhite');
  setTimeout(function() {
    loadClips('svg-homeownership');
  },500);
}

init();
