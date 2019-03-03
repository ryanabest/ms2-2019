function loadMap(svg) {
  d3.json('data/allCensus.json').then(function(json) {
    let map = svg.split('-')[1],
        // jsonFp = 'data/allCensus.json',
        columnType = '',
        multp = 1;

    if (map === 'homeownership') {
      // jsonFp = 'data/housing/housingHomeownership.json';
      columnType = 'pct'
      multp = 1;
    } else if (map === 'poverty') {
      // jsonFp = 'data/povertyrace/censusPoverty.json';
      columnType = 'pct'
      multp = 2;
    } else if (map === 'nonwhite') {
      // jsonFp = 'data/povertyrace/censusNonwhite.json';
      columnType = 'pct'
      multp = 1;
    } else if (map === 'homevalue') {
      multp = 1;
      columnType = 'median'
    } else if (map === 'mortgage') {
      columnType = 'pct'
      multp = 1;
    }

    let column = columnType + map.charAt(0).toUpperCase() + map.slice(1);

    let colMax = d3.max(json.features, (d) => {return d.properties[column]});
    // console.log(map,column);
    function drawMap() {
      let map = svg.split('-')[1],
          g = d3.select('#'+map+'-maps')
                 .append('svg')
                 .attr('id',svg)
                 .attr("width", width)
                 .attr("height", height)
                 .append('g')
                   // .attr('id',svg + '-' + grade)
                   .attr('class','g-tracts'),
          tooltip = d3.select('#'+svg)
                       .append('text')
                       .attr('id',map+'-tooltip')

      g.selectAll('path')
                 .data(json.features)
                 .enter()
                 .append('path')
                 .attr('d',geoGenerator)
                 .attr('fill',colors[map])
                 .attr('stroke','none')
                 .attr('class','tract-path')
                 .attr('opacity',(d) => {
                   if (isNaN(d.properties[column])) {
                     return 0
                   } else {
                     return (d.properties[column]/colMax) * multp
                   }
                 })
                 .attr('clip-path','url("#redline-a")')
                 .on('mouseenter',(d) => {return mousemove(d,column,columnType)})
                 .on('mouseout',mouseout)
                 // .attr("class",function(d) { return "class-" + d.properties.holc_grade});
    }

    function drawLegend(svg) {
      console.log("#" + svg + '-legend',columnType);
      let g = d3.select("#" + svg + '-legend').append('g')
                 .attr('class','g-legend'),
          boxG = g.append('g').attr('class','g-boxes'),
          textG = g.append('g').attr('class','g-text');

      for (let i=0;i<legendBlocks;i++) {
        boxG.append('rect')
         .attr('fill',colors[map])
         .attr('width',legendSize)
         .attr('height',legendSize)
         .attr('y',2*legendSize)
         .attr('x',legendSize + (legendSize*i))
         .attr('opacity',i/legendBlocks)
      }

      boxG.append('rect')
       .attr('fill','none')
       .attr('stroke','#000')
       .attr('stroke-width',1)
       .attr('width',legendSize*legendBlocks)
       .attr('height',legendSize)
       .attr('y',2*legendSize)
       .attr('x',legendSize)
       .attr('id','legend-border')

      textG.append('text')
       .text(columnType.charAt(0).toUpperCase() + columnType.slice(1) + ' ' + map.charAt(0).toUpperCase() + map.slice(1))
       .attr('text-anchor','middle')
       .attr('y',legendSize*1.5)
       .attr('x',((legendBlocks+2)*legendSize)/2)
       .attr('class','text')

      textG.append('text')
        .text(function() {
          if (columnType === 'pct') {
            return 0 + '%'
          } else if (columnType === 'median') {
            return '$'+0
          }
        })
        .attr('text-anchor','middle')
        .attr('y',legendSize*3.75)
        .attr('x',legendSize*1.55)
        .attr('class','text')

      textG.append('text')
        .text(function() {
          if (columnType === 'pct') {
            return (colMax / multp) * 100 + '%'
          } else if (columnType === 'median') {
            let num = (colMax / multp)/1000000
            return '$' + num.toFixed(1) + 'M'
          }
        })
        .attr('text-anchor','middle')
        .attr('y',legendSize*3.75)
        .attr('x',(legendSize*legendBlocks)+(legendSize*0.55))
        .attr('class','text')
    }

    function mousemove(d,column,columnType) {
      let tooltip = d3.select("#"+map+"-tooltip");
          // tooltipText;

      if (columnType === 'pct') {
        // let tooptipText = Math.round(d.properties[column] * 100) + '%';
        tooltip.text(Math.round(d.properties[column] * 100) + '%');
      } else if (columnType === 'median') {
        let num = d.properties[column]/1000000;
        // tooltipText = ;
        tooltip.html('$' + num.toFixed(1) + 'M');
      }

      let mouse = d3.mouse(d3.event.currentTarget);
      tooltip.attr("x",mouse[0] + 20);
      tooltip.attr("y",mouse[1] + 20);
      // console.log()
    }

    function mouseout() {
      let tooltip = d3.select("#"+map+"-tooltip");
      tooltip.text("")
      // tooltip.style("left","-10px")
      // tooltip.style("top","-10px")
    }

    drawLegend(svg);

    drawMap();
  })
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
        .attr("stroke-width",1)
        .attr("stroke","black")
        .attr("fill","none")
        .attr("class","borough-boundaries")
  })
}

function init() {
  let svgs = ['svg-homeownership','svg-poverty','svg-nonwhite','svg-homevalue','svg-mortgage']
  // loadMap('svg-homeownership');
  // loadMap('svg-poverty');
  // loadMap('svg-nonwhite');
  // loadMap('svg-homevalue');
  svgs.forEach((svg,i) => {
    // console.log(svg,i);
    loadMap(svg);

    setTimeout(function() {
      loadBoroughs(svg);
    },200)

    setTimeout(function() {
      loadClips(svg);
    },500);
  })

}

init();
