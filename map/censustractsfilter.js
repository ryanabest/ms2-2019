const fs = require('fs');
// const obj = JSON('data/gz_2010_36_140_00_500k.json');
let censusTracts = JSON.parse(fs.readFileSync("data/gz_2010_36_140_00_500k.json"));
let censusData = JSON.parse(fs.readFileSync('data.json'));

// console.log(censusData);

let newFeatures = [];
censusTracts.features.forEach(function(feature,index) {
  if (feature.properties.COUNTY === '047' || feature.properties.COUNTY === '119' || feature.properties.COUNTY === '085' || feature.properties.COUNTY === '005' || feature.properties.COUNTY === '061' || feature.properties.COUNTY === '081') {
    // console.log(feature.properties.TRACT)
    censusData.forEach(function(tract) {
      if (feature.properties.TRACT === tract[5]) {
        feature.properties.pctWhite = parseFloat(tract[0]);
        feature.properties.pctPoverty = parseFloat(tract[1]);
      }
    })

    newFeatures.push(feature);
  }
});

let newcensusTracts = {
  type: 'FeatureCollection'
  ,features: newFeatures
}
fs.writeFileSync('data/CensusTracts.json',JSON.stringify(newcensusTracts));
