init();

function init() {
  let svg = d3.select("body")
              .append("svg")
              .attr("id","d3mouse-svg");

  let g = svg.append("g")
             .attr("id","d3mouse-g");

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

  function setSvg() {
    d3.select("#d3mouse-svg")
      .attr("height",heightSvg)
      .attr("width",widthSvg);
  }
}
