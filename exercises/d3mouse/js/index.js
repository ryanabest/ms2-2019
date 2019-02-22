init();

function init() {
  let svg = d3.select("body")
              .append("svg")
              .attr("id","d3mouse-svg");

  let g = svg.append("g")
             .attr("id","d3mouse-g");

  // g.append("circle")
  //  .attr("id","d3mouse-circle");;
  //
  // g.append("rect")
  //  .attr("id","d3mouse-rect");

  size();

  window.addEventListener("resize", function() { size(); });
}

function size() {
  let height = window.innerHeight,
      width = window.innerWidth,
      margin = {l: 10, r: 10, t: 10, b: 10},
      heightSvg = height-margin.t-margin.b,
      widthSvg = width-margin.l-margin.r;


  setSvg();
  // drawCircle();
  // drawRect();

  function setSvg() {
    d3.select("#d3mouse-svg")
      .attr("height",heightSvg)
      .attr("width",widthSvg)
      .on('mousemove',ripple);
  }

  function drawCircle() {
    d3.select("#d3mouse-circle")
      .attr("cx",widthSvg * 0.1)
      .attr("cy",heightSvg * 0.1)
      .attr("r",widthSvg * 0.03)
  }

  function drawRect() {
    d3.select("#d3mouse-rect")
      .attr("x", widthSvg * 0.2)
      .attr("y", heightSvg * 0.2)
      .attr("width", widthSvg * 0.1)
      .attr("height", heightSvg * 0.1)
      .attr("fill", "red")
  }

  function ripple() {
    let m = d3.mouse(this);

    d3.select("#d3mouse-svg")
      .insert('circle')
        .attr('r',0)
        .attr('cx',m[0])
        .attr('cy',m[1])
        .style('fill','transparent')
        .style('stroke','black')
        .style('stroke-opacity',1)
      .transition()
        .ease(Math.sqrt)
        .attr('r',100)
        .style('stroke-opacity',0)
        // .delay(100)
        .duration(2000)
        .remove();
    // .transititon()
    //   .ease(Math.sqrt)
    //   .attr('r',100)
    //   .style('stroke-opacity',0)
    //   .delay(1000)
    //   .duration(2000)
    //   .remove();
  }
}
