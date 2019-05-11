var svgAnimate = d3.select('#intro-animation')

var animateFigureSvgWidth  = parseInt(svgAnimate.style('width')),
    animateFigureSvgHeight = parseInt(svgAnimate.style('height'));

var animateProjection = d3.geoMercator().scale(1).translate([0,0]),
    animateGeoGenerator = d3.geoPath().projection(animateProjection);


function loadMap(map,name) {
  d3.animateJson(map).then(function(animateJson) {
    console.log(animateJson);
    let gAnimate = svgAnimate.append('g')
                             .attr('class','g-manhattan')

    let linesAnimate = gAnimate.selectAll('path')
                 .data(animateJson.features)
                 .enter()
                 .append('path')
                 .attr('d',animateGeoGenerator)
                 .attr("stroke-width",0)
                 .attr('class',(d)=>'path class-'+d.properties.holc_grade)

     let  b = animateGeoGenerator.bounds(animateJson) // bounding box of all holc zones
         ,w = b[1][0] - b[0][0] // width of box
         ,h = b[1][1] - b[0][1] // height of box
         ,x = (b[0][0] + b[1][0]) / 2 // horizontal center point
         ,y = (b[0][1] + b[1][1]) / 2 // vertical center point
         ,sHoriz = (0.5-0.05) / (w / figureSvgWidth) // SCALE: this ensuures that the bounding box for the selected zones takes up the specified portion of horizontal screen space provided (plus a slight buffer))
         ,sVert = (0.5-0.05) / (h / figureSvgHeight)
         // ,s = 0.99 / Math.max(w / figureSvgWidth, h / figureSvgHeight) // scale formula taken from bl.ocks
         ,s = Math.min(sHoriz,sVert)
         ,t = [(animateFigureSvgWidth*0.5) - (s * x), (animateFigureSvgHeight*0.5) - (s * y)] // translate formula taken from bl.ocks
         ;
  });
}

function init() {
  loadMap('data/HOLC_Manhattan.geoanimateJson');
}

init();
