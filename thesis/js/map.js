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


  function init() { // everything inside this function happens once on start-up
    ///// DATA STUFF /////

    // i. DRAW THE MAPS
    drawHolc();
    drawBoroughs();

    // ii. DRAW SPARK LINES FOR COMPARISONS
    drawSparkLinesComparisons('manhattan',upperEastSide,harlem);
    drawSparkLinesComparisons('queens',littleNeck,brookvilleRosedale);
    drawSparkLinesComparisons('staten',todtHill,newBrighton);
    drawSparkLinesComparisons('brooklyn',crownHeights,brightonBeach);
    drawSparkLinesComparisons('bronx',countryClub,fordham);

    // iii. DRAW GRID AND AXES FOR INTERACTIVITY
    // note: lines for interactivity (on hover and click) will be drawn/removed in event handlers
    drawExploreAxesAndGrid('explore');

    ///// SCROLLAMA STUFF /////
  	// 1. force a resize on load to ensure proper dimensions are sent to scrollama
  	handleResize();

  	// 2. setup the scroller passing options
  	// 		this will also initialize trigger observations
  	scroller.setup({
  		step: '#scrolly article .step',
  		offset: 0.8,
  		// debug: true,
  	})
  	// 3. bind scrollama event handlers
  	.onStepEnter(handleStepEnter)

  	// setup resize event
  	window.addEventListener('resize', handleResize);

    // showExplore(); // DELETE THIS NEPHEW
  }
  /////////////////////////////////////////

  ////// SCROLLAMA EVENT HANDLERS /////////
  function handleStepEnter(response) {
  	// response = { element, direction, index }
    let dataStep = d3.select(response.element).attr('data-step');

  	// add color to scrolly rext for current step only
    // THIS SHOULD ONLY BE USED DURING DEBUG MODE
  	step.classed('is-active', function (d, i) {
  		return i === response.index;
  	})

  	// update graphic based on step
  	if (dataStep == 1) {
      // REDLINING EXPLAINER STEP I: REDLINED ZONES
  		opacityHolcGrade('A','hide');
  		opacityHolcGrade('B','hide');
  		opacityHolcGrade('C','hide');
  		opacityHolcGrade('D','show');
  	} else if (dataStep == 2) {
      // REDLINING EXPLAINER STEP II: GREENLINED ZONES
  		opacityHolcGrade('A','show');
  		opacityHolcGrade('B','hide');
  		opacityHolcGrade('C','hide');
  		opacityHolcGrade('D','fade');
  	} else if (dataStep == 3) {
      // REDLINING EXPLAINER STEP III: BLUE AND YELLOW ZONES
  		opacityHolcGrade('A','fade');
  		opacityHolcGrade('B','show');
  		opacityHolcGrade('C','show');
  		opacityHolcGrade('D','fade');
  	} else if (dataStep == 4) {
      // REDLINING EXPLAINER STEP IV: TRANSITION TO COMPARISONS
  		opacityHolcGrade('A','show');
  		opacityHolcGrade('B','show');
  		opacityHolcGrade('C','show');
  		opacityHolcGrade('D','show');
      resizeMapAllZones(750);
  	} else if (dataStep == 5) {
      // COMPARISON I: MANHATTAN
      resizeMapComparisons(1100,upperEastSide,harlem);
  	} else if (dataStep == 6) {
      // COMPARISON II: QUEENS
      resizeMapComparisons(1100,littleNeck,brookvilleRosedale)
  	} else if (dataStep == 7) {
      // COMPARISON III: STATEN ISLAND
      resizeMapComparisons(1100,todtHill,newBrighton);
    } else if (dataStep == 8) {
      // COMPARISON IV: BROOKLYN
      resizeMapComparisons(1100,crownHeights,brightonBeach);
    } else if (dataStep == 9) {
      // COMPARISON V: BRONX
      resizeMapComparisons(1100,countryClub,fordham);
    } else if (dataStep == 10) {
      opacityHolcGrade('A','light');
  		opacityHolcGrade('B','light');
  		opacityHolcGrade('C','light');
  		opacityHolcGrade('D','light');
    } else if (dataStep == 11) {
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

  ////////////// RESIZING /////////////////
  function handleResize() {
  	// update height of step elements
  	// var stepH = Math.floor(window.innerHeight * 0.95);
  	// step.style('height', stepH + 'px');

  	// update height of map container
  	var figureHeight = window.innerHeight * 1
  	var figureMarginTop = (window.innerHeight - figureHeight) / 2

  	figure
  		.style('height', figureHeight + 'px')
  		.style('top', figureMarginTop + 'px');

  	resizeMapAllZones(0); // fit map to bounding box of all holc zones
    resizeSparkLines(); // resize spark lines
    resizeExploreSparkLines(); // resize spark lines in explore section

  	// tell scrollama to update new element dimensions
  	scroller.resize();
  }

  function resizeSparkLines() {
    // spark lines
    let  sparkMargin = {top:5,right:40,bottom:20,left:40}
        ,sparkSVGWidth = parseInt(d3.select('.sparkSVG').style('width'))
        ,sparkSVGHeight = parseInt(d3.select('.sparkSVG').style('height'))
        ,sparkX      = d3.scaleLinear().domain([1940,2010]).range([sparkMargin.left,sparkSVGWidth-sparkMargin.right]) // x scale for year
        ,sparkYpctWhite = d3.scaleLinear().domain([max.pctWhite,0]).range([sparkMargin.top,sparkSVGHeight-sparkMargin.bottom]) // Y scale for pctWhite
        ,sparkYpctHomeownership = d3.scaleLinear().domain([max.pctHomeownership,0]).range([sparkMargin.top,sparkSVGHeight-sparkMargin.bottom]) // Y scale for homeownership
        ,sparkYmedianHomeValue2010 = d3.scaleLinear().domain([max.medianHomeValue2010,0]).range([sparkMargin.top,sparkSVGHeight-sparkMargin.bottom]) // Y scale for median home value using overall max
        ,linePctWhite = d3.line()
                         .x((d) => {return sparkX(parseInt(d.year))})
                         .y((d) => {return sparkYpctWhite(d.pctWhite)})
                         .curve(d3.curveMonotoneX)
        ,linePctHomeownership = d3.line()
                       .x((d) => {return sparkX(parseInt(d.year))})
                       .y((d) => {return sparkYpctHomeownership(d.pctHomeownership)})
                       .curve(d3.curveMonotoneX)
        ,lineMedianHomeValue2010 = d3.line()
                       .x((d) => {return sparkX(parseInt(d.year))})
                       .y((d) => {
                         sparkYmedianHomeValue2010 = d3.scaleLinear().domain([d.maxMedianHomeValue2010,0]).range([sparkMargin.top,sparkSVGHeight-sparkMargin.bottom]); // Y scale for median home value using zone comparison max
                         return sparkYmedianHomeValue2010(d.medianHomeValue2010);
                       })
                       .curve(d3.curveMonotoneX)
        ;

    sparkLines();
    axes();
    grids();

    function axes() {
      d3.selectAll('.medianHomeValue2010-bottom-axis') // only add year axis on the median home value chart, which is the last one
        .attr('transform','translate(0,'+(sparkSVGHeight-sparkMargin.bottom)+')') // move the axis to the start of the bottom margin
        .call(d3.axisBottom(sparkX).ticks(8).tickFormat(d3.format("d"))) // one tick per year, remove commas from year
        .call(g => g.selectAll('.domain').remove()) // remove horizontal axis line
        .call(g => g.selectAll('.tick line').remove()) // remove tick lines

      d3.selectAll('.pctWhite-axis') // add median home value left axis
        .attr('transform','translate('+(sparkMargin.left)+',0)') // move the axis to the start of the left margin
        .call(d3.axisLeft(sparkYpctWhite).tickValues([0,1]).tickFormat(d3.format(".0%"))) // ticks at 0 and 100%, format as rounded percentage
        .call(g => g.selectAll('.domain').remove()) // remove horizontal axis line
        .call(g => g.selectAll('.tick line').remove()) // remove tick lines

      d3.selectAll('.pctHomeownership-axis') // add median home value left axis
        .attr('transform','translate('+(sparkMargin.left)+',0)') // move the axis to the start of the left margin
        .call(d3.axisLeft(sparkYpctHomeownership).tickValues([0,max.pctHomeownership]).tickFormat(d3.format(".0%"))) // ticks at 0 and 100%, format as rounded percentage
        .call(g => g.selectAll('.domain').remove()) // remove horizontal axis line
        .call(g => g.selectAll('.tick line').remove()) // remove tick lines

      // DOES EACH MEDIAN HOME VALUE AXES SEPARATELY SINCE THE SCALE OF EACH GRAPH CAN CHANGE
      d3.selectAll('svg.medianHomeValue2010').filter('.sparkSVG').select('path.medianHomeValue2010') // first homeownership spark line in each spark line svg
        .each(function (d,i) {
          sparkYmedianHomeValue2010 = d3.scaleLinear().domain([d[0].maxMedianHomeValue2010,0]).range([sparkMargin.top,sparkSVGHeight-sparkMargin.bottom]); // Y scale for median home value using zone comparison max
          let div = d3.select(this.parentNode).attr('class').split('-')[2]; // takes the borough name from the spark line's enclosing group class, which should be named 'sparkLine-g-borough'
          let axisG = d3.select('#'+div).select('.medianHomeValue2010-axis') // selects the div with an ID matching that borough (should be the step div) and then selects the median home value axis group within that div
                        .attr('transform','translate('+(sparkMargin.left)+',0)') // move the axis to the start of the left margin
                        .call(d3.axisLeft(sparkYmedianHomeValue2010).tickValues([0,d[0].maxMedianHomeValue2010]).tickFormat(d3.format('$,.2s'))) // SI-prefix with two significant digits, "42M"
                        .call(g => g.selectAll('.domain').remove()) // remove horizontal axis line
                        .call(g => g.selectAll('.tick line').remove()) // remove tick lines;
        })
    }

    function sparkLines() {
      d3.selectAll('.sparkLine')
        .filter('.pctWhite')
        .attr('d',linePctWhite);

      d3.selectAll('.sparkLine')
        .filter('.pctHomeownership')
        .attr('d',linePctHomeownership);

      // let medianHomeValueLines = d3.selectAll('.sparkLine').filter('.medianHomeValue');
      d3.selectAll('.sparkLine')
        .filter('.medianHomeValue2010')
        .attr('d',lineMedianHomeValue2010);
    }


    function grids() {
      d3.selectAll('.grid-line')
        .each(function (d,i) {
          let yPos = d3.select(this).attr('class').split('-')[3]; // this is the int for which grid # we're on
          d3.select(this)
            .attr('x1',sparkMargin.left)
            .attr('x2',sparkSVGWidth-sparkMargin.right)
            .attr('y1',sparkMargin.top + ((sparkSVGHeight-sparkMargin.top-sparkMargin.bottom)*yPos/(gridLines-1))) // this moves the y position between sparkMargin.top and sparkSVGHeight - sparkMargin.bottom
            .attr('y2',sparkMargin.top + ((sparkSVGHeight-sparkMargin.top-sparkMargin.bottom)*yPos/(gridLines-1)));
        })
    }

  }

  function resizeExploreSparkLines() {
    // spark lines
    let  sparkMargin = {top:5,right:40,bottom:20,left:40}
        ,sparkSVGWidth = parseInt(d3.select('.exploreSparkSVG').style('width')) // TO-DO: This gives an error on load (esp. when it loads on explore view)
        ,sparkSVGHeight = parseInt(d3.select('.exploreSparkSVG').style('height'))
        ,sparkX      = d3.scaleLinear().domain([1940,2010]).range([sparkMargin.left,sparkSVGWidth-sparkMargin.right]) // x scale for year
        ,sparkYpctWhite = d3.scaleLinear().domain([max.pctWhite,0]).range([sparkMargin.top,sparkSVGHeight-sparkMargin.bottom]) // Y scale for pctWhite
        ,sparkYpctHomeownership = d3.scaleLinear().domain([max.pctHomeownership,0]).range([sparkMargin.top,sparkSVGHeight-sparkMargin.bottom]) // Y scale for homeownership
        ,sparkYmedianHomeValue2010 = d3.scaleLinear().domain([max.medianHomeValue2010,0]).range([sparkMargin.top,sparkSVGHeight-sparkMargin.bottom]) // Y scale for median home value
        ,linePctWhite = d3.line()
                         .x((d) => {return sparkX(parseInt(d.year));})
                         .y((d) => {return sparkYpctWhite(d.pctWhite);})
                         .curve(d3.curveMonotoneX)
        ,linePctHomeownership = d3.line()
                       .x((d) => {return sparkX(parseInt(d.year));})
                       .y((d) => {return sparkYpctHomeownership(d.pctHomeownership);})
                       .curve(d3.curveMonotoneX)
        ,lineMedianHomeValue2010 = d3.line()
                       .defined((d) => {return typeof(d.medianHomeValue2010) !== 'undefined'})
                       .x((d) => {return sparkX(parseInt(d.year));})
                       .y((d) => {return sparkYmedianHomeValue2010(d.medianHomeValue2010);})
                       .curve(d3.curveMonotoneX)
        ;

    sparkLines();
    axes();
    grids();

    function sparkLines() {
      d3.selectAll('.exploreSparkLine')
        .filter('.pctWhite')
        .attr('d',linePctWhite);

      d3.selectAll('.exploreSparkLine')
        .filter('.pctHomeownership')
        .attr('d',linePctHomeownership);

      d3.selectAll('.exploreSparkLine')
        .filter('.medianHomeValue2010')
        .attr('d',lineMedianHomeValue2010);
    }

    function axes() {
      d3.selectAll('.explore-medianHomeValue2010-bottom-axis') // only add year axis on the median home value chart, which is the last one
        .attr('transform','translate(0,'+(sparkSVGHeight-sparkMargin.bottom)+')') // move the axis to the start of the bottom margin
        .call(d3.axisBottom(sparkX).tickValues([1940,2010]).tickFormat(d3.format("d"))) // one tick per year, remove commas from year
        .call(g => g.selectAll('.domain').remove()) // remove horizontal axis line
        .call(g => g.selectAll('.tick line').remove()) // remove tick lines

      d3.selectAll('.explore-pctWhite-axis') // add median home value left axis
        .attr('transform','translate('+(sparkMargin.left)+',0)') // move the axis to the start of the left margin
        .call(d3.axisLeft(sparkYpctWhite).tickValues([0,1]).tickFormat(d3.format(".0%"))) // ticks at 0 and 100%, format as rounded percentage
        .call(g => g.selectAll('.domain').remove()) // remove horizontal axis line
        .call(g => g.selectAll('.tick line').remove()) // remove tick lines

      d3.selectAll('.explore-pctHomeownership-axis') // add median home value left axis
        .attr('transform','translate('+(sparkMargin.left)+',0)') // move the axis to the start of the left margin
        .call(d3.axisLeft(sparkYpctHomeownership).tickValues([0,max.pctHomeownership]).tickFormat(d3.format(".0%"))) // ticks at 0 and 100%, format as rounded percentage
        .call(g => g.selectAll('.domain').remove()) // remove horizontal axis line
        .call(g => g.selectAll('.tick line').remove()) // remove tick lines

      d3.selectAll('.explore-medianHomeValue2010-axis') // add median home value left axis
        .attr('transform','translate('+(sparkMargin.left)+',0)') // move the axis to the start of the left margin
        .call(d3.axisLeft(sparkYmedianHomeValue2010).tickValues([0,max.medianHomeValue2010]).tickFormat(d3.format('$,.2s'))) // ticks at 0 and 100%, format as rounded percentage
        .call(g => g.selectAll('.domain').remove()) // remove horizontal axis line
        .call(g => g.selectAll('.tick line').remove()) // remove tick lines
    }

    function grids() {
      d3.selectAll('.explore-grid-line')
        .each(function (d,i) {
          let yPos = d3.select(this).attr('class').split('-')[5]; // this is the int for which grid # we're on
          d3.select(this)
            .attr('x1',sparkMargin.left)
            .attr('x2',sparkSVGWidth-sparkMargin.right)
            .attr('y1',sparkMargin.top + ((sparkSVGHeight-sparkMargin.top-sparkMargin.bottom)*yPos/(gridLines-1))) // this moves the y position between sparkMargin.top and sparkSVGHeight - sparkMargin.bottom
            .attr('y2',sparkMargin.top + ((sparkSVGHeight-sparkMargin.top-sparkMargin.bottom)*yPos/(gridLines-1)));
        })
    }
  }

  function resizeMapAllZones(time) {
    figureSvg.selectAll('path').attr('transform', null); // undo any zoom/pan from explore phase

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

  function resizeMapAllZonesCenter(time) {
    // SCALE THE MAP BASED ON BOUNDING BOX OF MY HOLC ZONES https://bl.ocks.org/mbostock/4707858
    figureSvgWidth  = parseInt(figureSvg.style('width'));
    figureSvgHeight = parseInt(figureSvg.style('height'));
    projection.scale(1).translate([0,0]); // Dummy data into scale so the bounding box returns coordinates

    let b = geoGenerator.bounds(holc), // bounding box of all holc zones
        s = .9 / Math.max((b[1][0] - b[0][0]) / figureSvgWidth, (b[1][1] - b[0][1]) / figureSvgHeight), // scale formula taken from bl.ocks
        t = [((figureSvgWidth - s * (b[1][0] + b[0][0])) / 2), (figureSvgHeight - s * (b[1][1] + b[0][1])) / 2]; // translate formula taken from bl.ocks

    projection.scale(s).translate(t); // feed bounding fox scale and translate functions into my formula
    figureSvg.selectAll('path').transition().duration(time).attr('d',geoGenerator); // update all drawn paths to the new projection – geoGenerator is defined in index.html and takes projection as an argument
  }

  function resizeMapComparisons(time,list1,list2) {
    let  screenSpaceHoriz = 0.3
        ,screenSpaceVert = 0.5;

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
        ,sHoriz = (screenSpaceHoriz-0.05) / (w / figureSvgWidth) // SCALE: this ensuures that the bounding box for the selected zones takes up the specified portion of horizontal screen space provided (plus a slight buffer))
        ,sVert = (screenSpaceVert-0.05) / (h / figureSvgHeight)
        ,s = Math.min(sHoriz,sVert)
        ,t = [(figureSvgWidth*(screenSpaceHoriz/2)) - (s * x), (figureSvgHeight*(screenSpaceVert/2)) - (s * y)] // TRANSLATE: this puts the horizontal center of the bounding box at the center mark of the screen space provided, making sure they fit into a left-hand column the size of the provided parameter
        ;

    projection.scale(s).translate(t); // feed bounding fox scale and translate functions into my formula
    figureSvg.selectAll('path').transition().duration(time).attr('d',geoGenerator); // update all drawn paths to the new projection – geoGenerator is defined in index.html and takes projection as an argument
    // figureSvg;
  }
  /////////////////////////////////////////

  /////////// COMPARISONS /////////////////
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
        list1holc.push(holcZone.properties);
      } else if (list2.includes(holcZoneId)) {
        list2holc.push(holcZone.properties);
      }
    });

    // get averages for each metric per year for each zone group
    let maxMedian = getMaxMedianHomeValue2010(list1holc,list2holc),
        avg1 = getAvg(list1holc,maxMedian),
        avg2 = getAvg(list2holc,maxMedian);



    sparkLineSVGs.forEach((sparkLineSVG) => { // THIS CREATES TWO AXIS GROUPS, A GROUP CONTAINING TWO PATHS (ONE FOR EACH ZONE), AND A GRID LINE GROUP WITHIN EACH SPARK LINE DIV
      // AXES
      sparkLineSVG.svg.append('g').attr('class','axis left-axis '+sparkLineSVG.metric+'-axis');
      sparkLineSVG.svg.append('g').attr('class','axis bottom-axis '+sparkLineSVG.metric+'-bottom-axis');

      // GRID
      let gridG = sparkLineSVG.svg.append('g').attr('class','grid '+sparkLineSVG.metric+'-grid '+div+'-'+sparkLineSVG.metric+'-grid');
      for (let g=0;g<gridLines;g++) {
        gridG.append('line').attr('class','grid-line grid-line-'+g);
      }

      // SPARK LINES
      let sparkLineG = sparkLineSVG.svg.append('g').attr('class','sparkLine-g-'+div);
      sparkLineG.append('path').datum(avg1).attr('class','sparkLine '+sparkLineSVG.metric+' '+sparkLineSVG.metric+'-'+div).attr('stroke',stroke1);
      sparkLineG.append('path').datum(avg2).attr('class','sparkLine '+sparkLineSVG.metric+' '+sparkLineSVG.metric+'-'+div).attr('stroke',stroke2);
    });

    // DEFINING FUNCTIONS TO GET THE AVERAGE AND MAX HOME VALUES
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

        // add averages for years that have data
        let thisAverage = {};
        if (pctWhiteAvg.length > 0) {
          thisAverage.pctWhite = d3.mean(d3.values(pctWhiteAvg))
        }
        if (pctHomeownershipAvg.length > 0) {
          thisAverage.pctHomeownership = d3.mean(d3.values(pctHomeownershipAvg))
        }
        if (medianHomeValueAvg.length > 0) {
          thisAverage.medianHomeValue = d3.mean(d3.values(medianHomeValueAvg))
          thisAverage.medianHomeValue2010 = d3.mean(d3.values(medianHomeValue2010Avg))
          thisAverage.maxMedianHomeValue2010 =  maxMedian
        }
        if (pctWhiteAvg.length + pctHomeownershipAvg.length + medianHomeValueAvg.length > 0) {
          thisAverage.year = y
          averages.push(thisAverage)
        }
      } // closes year loop
      return averages;
    }
  }

  /////////////////////////////////////////

  ///////// PAN AND ZOOM MAP //////////////
  let showExploreButton = d3.select('#show-explore'),
      hideExploreButton = d3.select('#hide-explore');

  showExploreButton.on("click",showExplore);
  hideExploreButton.on("click",hideExplore);

  function showExplore() {
    // show the explore data step
    d3.select('#intro').classed('step-display-none',true);
    d3.selectAll('.step').classed('step-display-none',true);
    d3.select('#explore').classed('step-display-none',false);

    panAndZoomMap(); // enable pan and zoom on the map
    opacityHolcGrade('A','show'); // show all zones by default
    opacityHolcGrade('B','show');
    opacityHolcGrade('C','show');
    opacityHolcGrade('D','show');
    resizeMapAllZonesCenter(0); // recenter map on first load

    // handle the click and hover interactivity
    d3.selectAll('.holc') // all my redlining neighborhood zones
      .on('mouseover',handleMouseOver)
      .on('click',handleClick);
  }

  function hideExplore() {
    // hide the explore data step
    d3.select('#intro').classed('step-display-none',false);
    d3.selectAll('.step').classed('step-display-none',false);
    d3.select('#explore').classed('step-display-none',true);

    undoPanAndZoomMap(); // disable and undo pan and zoom on the map
    opacityHolcGrade('A','show'); // show all zones by default
    opacityHolcGrade('B','show');
    opacityHolcGrade('C','show');
    opacityHolcGrade('D','show');

    // WHEN I GO FROM EXPLORE TO NON-EXPLORE, SCROLLING SEEMS TO BE MESSED UP
    // WHEN I TRY TO SCROLL ON TOP OF THE MAP, NOTHING HAPPENS - IT SEEMS LIKE ITS TRYING TO ZOOM AND PAN WHICH IS DISABLED
  }

  function panAndZoomMap() {
    d3.select('#scrolly').attr('class','scrolly-flex') // go to flex display so that the comparisons and map are side by side
    let zoom = d3.zoom().scaleExtent([1, 8]).on('zoom',zoomed); // enable zoom and pan
    figureSvg.call(zoom); // apply zoom and pan to map

    function zoomed() { // when the map is zoomed or panned
      figureSvg.selectAll('path').attr('transform', d3.event.transform); // transform all the paths on my map
    }
  }

  function undoPanAndZoomMap() {
    d3.select('#scrolly').attr('class','scrolly-block') // go to standard block display
    figureSvg.selectAll('path').attr('transform', null); // remove any transforms that came from the panning and zooming
    let zoom = d3.zoom().on('zoom',null); // configure zoom disabling
    figureSvg.call(zoom).on("wheel.zoom", null); // apply configuration to disable zoom
    resizeMapAllZones(0); // put map back to default view all zones view
  }

  function handleMouseOver(d,i) {
    d3.selectAll('path').classed('hover-path',false);
    d3.select(this).classed('hover-path',true);

    // remove all spark lines
    d3.selectAll('.hover').remove()
    let censusData = getZoneDataPastThreshold(d,0); // I am not setting any DQ threshold right now until I figure out the best way to draw my line with missing data

    drawSparkLinesHover('explore',censusData);
    resizeExploreSparkLines();

    function drawSparkLinesHover(div,censusData) {
    // THIS FUNCTION WILL DRAW A SPARK LINE FOR THE NEIGHBORHOOD YOU'RE HOVERING OVER
    // FOR RESPONSIVENESS, THE SIZE AND POSITION OF THESE LINES SHOULD BE HANDLED INSIDE handleResize()
      let exploreDiv    = d3.select('#'+div),
          stroke        = {"A":"#8C9F5B","B":"#8AA1AB","C":"#D6B64C","D":"#CC6D7B"},
          stroke1       = stroke[d.properties.holc_id.substring(0,1)],
          sparkLineSVGs = [{'metric':'pctWhite','svg':exploreDiv.select('.exploreSparkSVG.pctWhite')},
                           {'metric':'pctHomeownership','svg':exploreDiv.select('.exploreSparkSVG.pctHomeownership')},
                           {'metric':'medianHomeValue2010','svg':exploreDiv.select('.exploreSparkSVG.medianHomeValue2010')}];

      sparkLineSVGs.forEach((sparkLineSVG) => { // THIS DRAWS ONE PATHS PER SPARK LINE SVG FOR HOVERED ZONE
        sparkLineSVG.svg.append('path').datum(censusData).attr('class','hover exploreSparkLine '+sparkLineSVG.metric).attr('stroke',stroke1);
      });
    }
  }

  function handleClick(d,i) {
    // HIGHLIGHT ZONE
    opacityHolcGrade('A','light');
    opacityHolcGrade('B','light');
    opacityHolcGrade('C','light');
    opacityHolcGrade('D','light');
    d3.select(this).classed('light',false);
    d3.select(this).classed('show',true);


    d3.selectAll('.click').remove(); // REMOVE EXISTING LINE

    let censusData = getZoneDataPastThreshold(d,0); // I am not setting any DQ threshold right now until I figure out the best way to draw my line with missing data
    drawSparkLinesClick('explore',censusData);
    resizeExploreSparkLines();

    function drawSparkLinesClick(div,censusData) {
    // THIS FUNCTION WILL DRAW A SPARK LINE FOR THE NEIGHBORHOOD YOU'RE HOVERING OVER
    // FOR RESPONSIVENESS, THE SIZE AND POSITION OF THESE LINES SHOULD BE HANDLED INSIDE handleResize()
      let exploreDiv    = d3.select('#'+div),
          stroke        = {"A":"#8C9F5B","B":"#8AA1AB","C":"#D6B64C","D":"#CC6D7B"},
          stroke1       = stroke[d.properties.holc_id.substring(0,1)],
          sparkLineSVGs = [{'metric':'pctWhite','svg':exploreDiv.select('.exploreSparkSVG.pctWhite')},
                           {'metric':'pctHomeownership','svg':exploreDiv.select('.exploreSparkSVG.pctHomeownership')},
                           {'metric':'medianHomeValue2010','svg':exploreDiv.select('.exploreSparkSVG.medianHomeValue2010')}];

      sparkLineSVGs.forEach((sparkLineSVG) => { // THIS DRAWS ONE PATHS PER SPARK LINE SVG FOR HOVERED ZONE
        sparkLineSVG.svg.append('path').datum(censusData).attr('class','click exploreSparkLine '+sparkLineSVG.metric).attr('stroke',stroke1);
      });
    }
  }

  function nozoom() { // this will be used to prevent click to zoom
    d3.event.preventDefault();
  }

  function getZoneDataPastThreshold(d,coverageThreshold) { // coverageThreshold sets the minimum threshold for coverage % to include
    let hoverZoneCensusData = d.properties.census_match_data;
    let dataPastThreshold = [];

    for (let y=1940;y<=2010;y+=10) { // for every decade 1940 - 2010
      let pctWhiteAvg = [],
          pctHomeownershipAvg = [],
          medianHomeValueAvg = [],
          medianHomeValue2010Avg = [];

      hoverZoneCensusData.forEach((censusYear) => { // for each census year
        if (parseInt(censusYear.year) === y) {
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

      // add averages for years that have data
      let thisPastThreshold = {};
      if (pctWhiteAvg.length > 0) {
        thisPastThreshold.pctWhite = d3.mean(d3.values(pctWhiteAvg))
      }
      if (pctHomeownershipAvg.length > 0) {
        thisPastThreshold.pctHomeownership = d3.mean(d3.values(pctHomeownershipAvg))
      }
      if (medianHomeValueAvg.length > 0) {
        thisPastThreshold.medianHomeValue = d3.mean(d3.values(medianHomeValueAvg))
        thisPastThreshold.medianHomeValue2010 = d3.mean(d3.values(medianHomeValue2010Avg))
      }
      if (pctWhiteAvg.length + pctHomeownershipAvg.length + medianHomeValueAvg.length > 0) {
        thisPastThreshold.year = y
        dataPastThreshold.push(thisPastThreshold)
      }
    } // closes year loop
    return dataPastThreshold;
  }

  function drawExploreAxesAndGrid(div) {
    let exploreDiv    = d3.select('#'+div),
        sparkLineSVGs = [{'metric':'pctWhite','svg':exploreDiv.select('.exploreSparkSVG.pctWhite')},
                         {'metric':'pctHomeownership','svg':exploreDiv.select('.exploreSparkSVG.pctHomeownership')},
                         {'metric':'medianHomeValue2010','svg':exploreDiv.select('.exploreSparkSVG.medianHomeValue2010')}];

    sparkLineSVGs.forEach((sparkLineSVG) => { // THIS DRAWS ONE PATHS PER SPARK LINE SVG FOR HOVERED ZONE
      // AXES
      sparkLineSVG.svg.append('g').attr('class','axis left-axis explore-'+sparkLineSVG.metric+'-axis');
      sparkLineSVG.svg.append('g').attr('class','axis bottom-axis explore-'+sparkLineSVG.metric+'-bottom-axis');

      // GRID
      let gridG = sparkLineSVG.svg.append('g').attr('class','grid '+sparkLineSVG.metric+'-grid '+div+'-'+sparkLineSVG.metric+'-grid');
      for (let g=0;g<gridLines;g++) {
        gridG.append('line').attr('class','explore-grid-line explore-grid-line-'+g);
      }
    });
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
