Promise.all([
  d3.json('data/boroughs.geojson'),
  d3.json('data/HOLC_All_Years.geojson'),
]).then((json) => {
  ////////////// LOAD DATA ////////////////
  var boroughs = json[0];
  var holc = json[1];
  /////////////////////////////////////////

  //// GET MAX VALUES FOR KEY COLUMNS /////
  let max = (() => {
    // console.log(holc);
    let pctWhiteMax = [],
        pctHomeownershipMax = [],
        medianHomeValueMax = [],
        medianHomeValue2010Max = [];
    holc.features.forEach((holcZone) => { // for each holc zone
      holcZone.properties.census_match_data.forEach((censusYear) => { // for every year I have data
        let coverageThreshold = 0.6 // set the minimum threshold for coverage % to include
        if (censusYear.metric_coverage_pct.pct_white >= coverageThreshold) {
          pctWhiteMax.push(censusYear.pct_white);
        };
        if (censusYear.metric_coverage_pct.pct_homeownership >= coverageThreshold) {
          pctHomeownershipMax.push(censusYear.pct_homeownership);
        };
        if (censusYear.metric_coverage_pct.median_home_value >= coverageThreshold) {
          medianHomeValueMax.push(censusYear.median_home_value);
          medianHomeValue2010Max.push(censusYear.median_home_value_2010);
        };
      })
    });
    return {
      "pctWhite":d3.max(d3.values(pctWhiteMax)),
      "pctHomeownership":d3.max(d3.values(pctHomeownershipMax)),
      "medianHomeValue":d3.max(d3.values(medianHomeValueMax)),
      "medianHomeValue2010":d3.max(d3.values(medianHomeValue2010Max))
    }
  })(); // invoke immediately
  /////////////////////////////////////////

  ////////////// SCROLLAMA ////////////////
  // initialize the scrollama
  var scroller = scrollama();
  init();


  function init() {
    // i. DRAW THE MAPS
    drawHolc();
    drawBoroughs();

    // ii. DRAW SPARK LINES FOR COMPARISONS
    drawSparkLinesComparisons('upperEastSide-harlem',upperEastSide,harlem);
    drawSparkLinesComparisons('littleNeck-stAlbans',littleNeck,stAlbans);
    drawSparkLinesComparisons('todtHill-newBrighton',todtHill,newBrighton);
    drawSparkLinesComparisons('brooklyn',brooklynHeights,brightonBeach);

  	// 1. force a resize on load to ensure proper dimensions are sent to scrollama
  	handleResize();

  	// 2. setup the scroller passing options
  	// 		this will also initialize trigger observations
  	scroller.setup({
  		step: '#scrolly article .step',
  		offset: 0.8,
  		debug: true,
  	})
  	// 3. bind scrollama event handlers
  	.onStepEnter(handleStepEnter)

  	// setup resize event
  	window.addEventListener('resize', handleResize);
  }
  /////////////////////////////////////////

  ////// SCROLLAMA EVENT HANDLERS /////////
  function handleStepEnter(response) {
  	// response = { element, direction, index }

  	// add color to scrolly rext for current step only
    // THIS SHOULD ONLY BE USED DURING DEBUG MODE
  	step.classed('is-active', function (d, i) {
  		return i === response.index;
  	})

  	// update graphic based on step
  	if (response.index === 0) {
      // SHOW BOROUGHS ONLY
  		opacityHolcGrade('A','hide');
  		opacityHolcGrade('B','hide');
  		opacityHolcGrade('C','hide');
  		opacityHolcGrade('D','hide');
  	} else if (response.index === 1) {
      // REDLINING EXPLAINER STEP I: REDLINED ZONES
  		opacityHolcGrade('A','hide');
  		opacityHolcGrade('B','hide');
  		opacityHolcGrade('C','hide');
  		opacityHolcGrade('D','show');
  	} else if (response.index === 2) {
      // REDLINING EXPLAINER STEP II: GREENLINED ZONES
  		opacityHolcGrade('A','show');
  		opacityHolcGrade('B','hide');
  		opacityHolcGrade('C','hide');
  		opacityHolcGrade('D','fade');
  	} else if (response.index === 3) {
      // REDLINING EXPLAINER STEP III: BLUE AND YELLOW ZONES
  		opacityHolcGrade('A','fade');
  		opacityHolcGrade('B','show');
  		opacityHolcGrade('C','show');
  		opacityHolcGrade('D','fade');
  	} else if (response.index === 4) {
      // REDLINING EXPLAINER STEP IV: TRANSITION TO COMPARISONS
  		opacityHolcGrade('A','show');
  		opacityHolcGrade('B','show');
  		opacityHolcGrade('C','show');
  		opacityHolcGrade('D','show');
      resizeMapAllZones(750);
  	} else if (response.index === 5) {
      // COMPARISON I: UES <> HARLEM (MANHATTAN)
      resizeMapComparisons(upperEastSide,harlem);
  	} else if (response.index === 6) {
      // COMPARISON I: UES <> HARLEM (MANHATTAN)
  	} else if (response.index === 7) {
      // COMPARISON II: LITTLE NECK <> ST ALBANS (QUEENS)
      resizeMapComparisons(littleNeck,stAlbans)
  	} else if (response.index === 8) {
      // COMPARISON II: LITTLE NECK <> ST ALBANS (QUEENS)
    } else if (response.index === 9) {
      // COMPARISON III: TODT HILL <> NEW BRIGHTON (STATEN ISLAND)
      resizeMapComparisons(todtHill,newBrighton);
    } else if (response.index === 10) {
      // COMPARISON III: TODT HILL <> NEW BRIGHTON (STATEN ISLAND)
    } else if (response.index === 11) {
      // COMPARISON IV: (BROOKLYN)
      resizeMapComparisons(brooklynHeights,brightonBeach);
    } else if (response.index === 12) {
      // COMPARISON IV: (BROOKLYN)
    }
  }
  /////////////////////////////////////////

  /////////// SHOW/HIDE ZONES /////////////
  function opacityHolcGrade(grade,show) {
    d3.selectAll('.holc-'+grade).attr('class',show+' holc holc-'+grade)
  }
  function opacityHolcID(id,show) {
    let grade = id.split('_')[1].substring(0,1)
    d3.select('#'+id).attr('class',show+' holc holc-'+grade)
  }
  /////////////////////////////////////////

  //////////// SHOW/HIDE MAP //////////////
  function hideMap() {
    d3.select('figure').style('display','none');
    d3.select('article').style('width','100%');
  }
  function showMap() {
    d3.select('figure').style('display','block');
    d3.select('article').style('width','35%');
  }
  /////////////////////////////////////////

  ////////////// RESIZING /////////////////
  function handleResize() {
  	// update height of step elements
  	// var stepH = Math.floor(window.innerHeight * 0.95);
  	// step.style('height', stepH + 'px');

  	// update height of map container
  	var figureHeight = window.innerHeight * 0.95
  	var figureMarginTop = (window.innerHeight - figureHeight) / 2

  	figure
  		.style('height', figureHeight + 'px')
  		.style('top', figureMarginTop + 'px');

    // fit map to bounding box of all holc zones
  	resizeMapAllZones(0);

    // spark lines
    let sparkMargin = {top:10,right:10,bottom:10,left:10},
        sparkWidth  = parseInt(d3.select('.sparkSVG').style('width')) - sparkMargin.right - sparkMargin.left,
        sparkHeight = parseInt(d3.select('.sparkSVG').style('height')) - sparkMargin.top - sparkMargin.bottom,
        sparkX      = d3.scaleLinear().domain([1940,2010]).range([sparkMargin.left,sparkWidth]), // x scale for year
        sparkYpctWhite = d3.scaleLinear().domain([max.pctWhite,0]).range([sparkMargin.bottom,sparkHeight]), // Y scale for pctWhite
        sparkYpctHomeownership = d3.scaleLinear().domain([max.pctHomeownership,0]).range([sparkMargin.bottom,sparkHeight]), // Y scale for homeownership
        sparkYmedianHomeValue2010 = d3.scaleLinear().domain([max.medianHomeValue2010,0]).range([sparkMargin.bottom,sparkHeight]), // Y scale for median home value
        linePctWhite = d3.line()
                         .x((d) => {return sparkX(parseInt(d.year))})
                         .y((d) => {return sparkYpctWhite(d.pctWhite)})
                         .curve(d3.curveMonotoneX),
        linePctHomeownership = d3.line()
                       .x((d) => {return sparkX(parseInt(d.year))})
                       .y((d) => {return sparkYpctHomeownership(d.pctHomeownership)})
                       .curve(d3.curveMonotoneX),
        lineMedianHomeValue2010 = d3.line()
                       .x((d) => {return sparkX(parseInt(d.year))})
                       .y((d) => {
                         let sparkYmedianHomeValue2010Zone = d3.scaleLinear().domain([d.maxMedianHomeValue2010,0]).range([sparkMargin.bottom,sparkHeight]);
                         // return sparkYmedianHomeValue2010(d.medianHomeValue2010); // USE THIS IF WE WANT TO SIZE AXIS BASED ON OVERALL MAX
                         return sparkYmedianHomeValue2010Zone(d.medianHomeValue2010); // USE THIS IF WE WANT TO SIZE AXIS BASED ON ZONE COMPARISON
                       })
                       .curve(d3.curveMonotoneX);

    d3.selectAll('.sparkLine')
      .filter('.pctWhite')
      .attr('d',linePctWhite);

    d3.selectAll('.sparkLine')
      .filter('.pctHomeownership')
      .attr('d',linePctHomeownership);

    d3.selectAll('.sparkLine')
      .filter('.medianHomeValue2010')
      .attr('d',lineMedianHomeValue2010);
  	// tell scrollama to update new element dimensions
  	scroller.resize();
  }

  function resizeMapAllZones(time) {
    // SCALE THE MAP BASED ON BOUNDING BOX OF MY HOLC ZONES https://bl.ocks.org/mbostock/4707858
    figureSvgWidth  = parseInt(figureSvg.style('width'));
    figureSvgHeight = parseInt(figureSvg.style('height'));
    projection.scale(1).translate([0,0]); // Dummy data into scale so the bounding box returns coordinates

    let b = geoGenerator.bounds(holc), // bounding box of all holc zones
        s = .9 / Math.max((b[1][0] - b[0][0]) / figureSvgWidth, (b[1][1] - b[0][1]) / figureSvgHeight), // scale formula taken from bl.ocks
        t = [((figureSvgWidth - s * (b[1][0] + b[0][0])) / 2)+(figureSvgWidth*0.15), (figureSvgHeight - s * (b[1][1] + b[0][1])) / 2]; // translate formula taken from bl.ocks

    projection.scale(s).translate(t); // feed bounding fox scale and translate functions into my formula
    figureSvg.selectAll('path').transition().duration(time).attr('d',geoGenerator); // update all drawn paths to the new projection – geoGenerator is defined in index.html and takes projection as an argument
  }
  /////////////////////////////////////////

  /////////// COMPARISONS /////////////////
  function resizeMapComparisons(list1,list2) {

    let  time = 1100
        ,screenSpace = 0.2;

    opacityHolcGrade('A','fade');
    opacityHolcGrade('B','fade');
    opacityHolcGrade('C','fade');
    opacityHolcGrade('D','fade');

    // create subset of holc zones only for those in comparison lists
    let bounding = []
    holc.features.forEach((holcZone) => {
      let holcZoneId = holcZone.properties.borough + '_' + holcZone.properties.holc_id
      if (list1.includes(holcZoneId) || list2.includes(holcZoneId)) {
        bounding.push(holcZone);
        opacityHolcID(holcZoneId,'show');
      }
    });


    bounding = {"type":"FeatureCollection","features":bounding}

    figureSvgWidth  = parseInt(figureSvg.style('width'));
    figureSvgHeight = parseInt(figureSvg.style('height'));
    projection.scale(1).translate([0,0]); // Dummy data into scale so the bounding box returns coordinates

    let  b = geoGenerator.bounds(bounding) // bounding box of all holc zones
        ,w = b[1][0] - b[0][0] // width of box
        ,h = b[1][1] - b[0][1] // height of box
        ,x = (b[0][0] + b[1][0]) / 2 // horizontal center point
        ,y = (b[0][1] + b[1][1]) / 2 // vertical center point
        ,s = (screenSpace-0.05) / (w / figureSvgWidth) // SCALE: this ensuures that the bounding box for the selected zones takes up the specified portion of horizontal screen space provided (plus a slight buffer))
         // this scale function could cause selected zone(s) to not show up if there is not much difference in their horizontal placement, but there is a big difference in their vertical placement
        ,t = [(figureSvgWidth*(screenSpace/2)) - (s * x), (figureSvgHeight*0.5) - (s * y)] // TRANSLATE: this puts the horizontal center of the bounding box at the center mark of the screen space provided, making sure they fit into a left-hand column the size of the provided parameter
        ;

    projection.scale(s).translate(t); // feed bounding fox scale and translate functions into my formula
    figureSvg.selectAll('path').transition().duration(time).attr('d',geoGenerator); // update all drawn paths to the new projection – geoGenerator is defined in index.html and takes projection as an argument
    // figureSvg;
  }

  function drawSparkLinesComparisons(div,list1,list2) {
    // THIS FUNCTION SHOULD SHOULD CREATE THE SPARK LINES FOR MY COMPARISONS
    // FOR RESPONSIVENESS, THE SIZE AND POSITION OF THESE LINES SHOULD BE HANDLED INSIDE handleResize()

    let compDiv          = d3.select('#'+div),
        stroke           = {"A":"#8C9F5B","B":"#8AA1AB","C":"#D6B64C","D":"#CC6D7B"},
        stroke1          = stroke[list1[0].split('_')[1].substring(0,1)], // takes the grade from the first zone passed in list1 and returns the storke color for that grade
        stroke2          = stroke[list2[0].split('_')[1].substring(0,1)], // takes the grade from the second zone passed in list1 and returns the storke color for that grade
        sparkLineSVGs    = [{'metric':'pctWhite','svg':compDiv.select('.sparkSVG.pctWhite')},
                            {'metric':'pctHomeownership','svg':compDiv.select('.sparkSVG.pctHomeownership')},
                            {'metric':'medianHomeValue2010','svg':compDiv.select('.sparkSVG.medianHomeValue2010')}];


    // create subset of holc zones only for those in comparison lists
    let list1holc = [];
    let list2holc = [];
    holc.features.forEach((holcZone) => {
      let holcZoneId = holcZone.properties.borough + '_' + holcZone.properties.holc_id
      if (list1.includes(holcZoneId)) {
        console.log(holcZone.properties)
        list1holc.push(holcZone.properties);
      } else if (list2.includes(holcZoneId)) {
        list2holc.push(holcZone.properties);
      }
    });



    // get averages for each metric per year for each zone group
    let maxMedian = getMaxMedianHomeValue2010(list1holc,list2holc),
        avg1 = getAvg(list1holc,maxMedian),
        avg2 = getAvg(list2holc,maxMedian);
    sparkLineSVGs.forEach((sparkLineSVG) => { // THIS DRAWS TWO PATHS PER SPARK LINE SVG, ONE FOR EACH ZONE
      sparkLineSVG.svg.append('path').datum(avg1).attr('class','sparkLine '+sparkLineSVG.metric).attr('stroke',stroke1);
      sparkLineSVG.svg.append('path').datum(avg2).attr('class','sparkLine '+sparkLineSVG.metric).attr('stroke',stroke2);
    })

    function getMaxMedianHomeValue2010(list1,list2) {
      let medianValues = [];
      list1.forEach((holcZone) => { // for each holc zone
        holcZone.census_match_data.forEach((censusYear) => { // for each census year
          let coverageThreshold = 0.6 // set the minimum threshold for coverage % to include
          if (censusYear.metric_coverage_pct.median_home_value >= coverageThreshold) {
            medianValues.push(censusYear.median_home_value_2010);
          }
        })
      });

      list2.forEach((holcZone) => { // for each holc zone
        holcZone.census_match_data.forEach((censusYear) => { // for each census year
          let coverageThreshold = 0.6 // set the minimum threshold for coverage % to include
          if (censusYear.metric_coverage_pct.median_home_value >= coverageThreshold) {
            medianValues.push(censusYear.median_home_value_2010);
          }
        })
      });

      return d3.max(d3.values(medianValues));
    }

    function getAvg(list,maxMedian) { // including maxMedian here to just retain the max Median Home Value 2010 since I want to draw spark lines compares to the max within that zone comparison
      let averages = [];
      for (let y=1940;y<=2010;y+=10) { // for every decade 1940 - 2010
        let pctWhiteAvg = [],
            pctHomeownershipAvg = [],
            medianHomeValueAvg = [],
            medianHomeValue2010Avg = [];

        list.forEach((holcZone) => { // for each holc zone
          holcZone.census_match_data.forEach((censusYear) => { // for each census year
            if (parseInt(censusYear.year) === y) {
              let coverageThreshold = 0.6 // set the minimum threshold for coverage % to include
              if (censusYear.metric_coverage_pct.pct_white >= coverageThreshold) {
                    pctWhiteAvg.push(censusYear.pct_white);
                  };
                  if (censusYear.metric_coverage_pct.pct_homeownership >= coverageThreshold) {
                    pctHomeownershipAvg.push(censusYear.pct_homeownership);
                  };
                  if (censusYear.metric_coverage_pct.median_home_value >= coverageThreshold) {
                    medianHomeValueAvg.push(censusYear.median_home_value);
                    medianHomeValue2010Avg.push(censusYear.median_home_value_2010);
                  };
            }
          }); // closes for each census year within each zone
        }); // closes each zone
        averages.push({
          "year":y,
          "pctWhite":d3.mean(d3.values(pctWhiteAvg)),
          "pctHomeownership":d3.mean(d3.values(pctHomeownershipAvg)),
          "medianHomeValue":d3.mean(d3.values(medianHomeValueAvg)),
          "medianHomeValue2010":d3.mean(d3.values(medianHomeValue2010Avg)),
          "maxMedianHomeValue2010": maxMedian
        })
      } // closes year loop
      return averages;
    }
  }
  /////////////////////////////////////////


  ///////// DRAW INITIAL MAP //////////////
  function drawBoroughs() {
    let g = figureSvg.append('g')
               .attr('class','g-boroughs')

    g.selectAll('path')
               .data(boroughs.features)
               .enter()
               .append('path')
               .attr('d',geoGenerator)
               .attr('class','borough')
  }

  function drawHolc() {
    let holcG = figureSvg.append('g')
               .attr('class','g-' + name)

    holcG.selectAll('path')
               .data(holc.features)
               .enter()
               .append('path')
               .attr('d',geoGenerator)
               .attr("class",(d) => { return "hide holc holc-" + d.properties.holc_grade })
               .attr("id",(d) => {return d.properties.borough + '_' + d.properties.holc_id});
  }
  /////////////////////////////////////////
});
