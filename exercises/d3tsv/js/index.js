init();

function init() {
  let svg = d3.select("body")
              .append("svg")
              .attr("id","d3tsv-svg");

  let g = svg.append("g")
             .attr("id","d3tsv-g");

   d3.tsv("data/groceries.tsv").then((data) => {
       // loop
       data.forEach((d, i) => {
           d3.select('svg')
               .append('text')
               .text(d.amount + ' | ' + d.unit + ' | ' + d.item + ' | ' + d.source)
               // .attr("x", window.innerWidth/2)
               // .attr("y", (i+1) * 30)
               .attr("class","text")
               .style('text-anchor', 'middle')
               .style('fill', () => {
                   if (d.source == 'store')
                       return 'rgb(255, 120, 0)';
                   else
                       return 'darkgray';
               });
       });

       size();
   });

  window.addEventListener("resize", function() { size(); });
}

function size() {
  let height = window.innerHeight,
      width = window.innerWidth,
      margin = {l: 10, r: 10, t: 10, b: 10},
      heightSvg = height-margin.t-margin.b,
      widthSvg = width-margin.l-margin.r;


  setSvg();

  d3.select("#d3tsv-svg").selectAll('.text').each(function(d,i) {
    d3.select(this).attr('y',(i+1) * 30)
                   .attr('x',widthSvg/2)
  })
  //   .attr('x',function(d,i){console.log(d);})


  function setSvg() {
    d3.select("#d3tsv-svg")
      .attr("height",heightSvg)
      .attr("width",widthSvg);
  }
}
