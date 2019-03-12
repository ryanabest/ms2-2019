
init();

function init() {
  d3.json("museums.json").then((data) => {
    let svg = d3.select("body")
                .append("svg")
                .attr("id","d3graph-svg");

    let g = svg.append("g")
               .attr("id","d3graph-g");

     // g.append('rect')
     //    .attr('id','d3graph-rect')

     g.append("text")
      .attr("id","sample-heading")
      .text("Non-Profit Organization")

     svgPlot(data);
     size();
  })

  let svgPlot = (data) => {
    let max = (() => {
      let tmp = [];
      for (let i in data) {
        tmp.push(data[i].operatingExpenses);
      }
      // console.log(tmp);
      return d3.max(tmp);
    })();

    // console.log(max);

    let height = d3.scaleLinear().domain([0,max]).range([0,50])

    // console.log()

    let bars = d3.select("#d3graph-svg")
                  .selectAll('.rect')
                  .data(data)
                  .enter()
                  .append('rect')
                  .attr('id','bars')
                  .attr('x',500)
                  .attr('y',100)
                  .attr('width',100)
                  .attr('height',(d,i) => {return height(d.operatingExpenses);})
  }


  window.addEventListener("resize", function() { size(); });
}

function size() {
  let height = window.innerHeight,
      width = window.innerWidth,
      margin = {l: 10, r: 10, t: 10, b: 10},
      heightSvg = height-margin.t-margin.b,
      widthSvg = width-margin.l-margin.r;

  setSvg();

  // d3.select('#d3graph-rect')
  //   .attr('x',widthSvg*0.25)
  //   .attr('y',heightSvg*0.25)
  //   .attr('width',widthSvg*0.25)
  //   .attr('height',heightSvg*0.25)

  d3.select("#sample-heading")
    .attr('x',widthSvg * 0.05)
    .attr('y',heightSvg * 0.1);

  function setSvg() {
    d3.select("#d3graph-svg")
      .attr("height",heightSvg)
      .attr("width",widthSvg)
  }
}
