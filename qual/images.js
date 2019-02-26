const fs = require('fs'),
      request = require('request');

let files = [],
    eachTime = 1000;

init();

function init() {
  // fs.readdirSync('data').forEach((file,index) => {
  //   setTimeout(function() {
  //     readMapFile('data/'+file);
  //   },index*160*eachTime);
  // })

  readMapFile('data/HOLC_Brooklyn.geojson','print','D13');

  // let missing = JSON.parse(fs.readFileSync('missing.json'));
  // missing.forEach((elem,i) => {
  //   setTimeout(function() {
  //     let borough = elem.borough,
  //         tracts = elem.missing;
  //
  //     tracts.forEach((tract,index) => {
  //       setTimeout(function() {
  //         readMapFile('data/HOLC_'+borough+'.geojson','fill',tract);
  //       },index*eachTime)
  //     })
  //   },i*eachTime*8)
  // })
}

function readMapFile(map,param,holcId) {
  let file = fs.readFileSync(map),
      data = JSON.parse(file),
      features = data.features,
      borough = map.match(/HOLC_(.*).geojson/)[1];

  console.log('-------'+borough+' START-------')

  if (param === 'all') {
    saveAllImages();
  } else if (param === 'print') {
    printOneImage(holcId);
  } else if (param === 'fill') {
    fillMissingImage(holcId);
  }


  function printOneImage(holcId) {
    features.forEach((feature) => {
      if (holcId === feature.properties.holc_id) {
        let featureUrl = feature.geometry.coordinates[0][0],
            centerLatLng = getCenterLatLng(featureUrl);

        printImage(centerLatLng,holcId);
      }
    });
  }

  function fillMissingImage(holcId) {
    features.forEach((feature) => {
      if (holcId === feature.properties.holc_id) {
        let featureUrl = feature.geometry.coordinates[0][0],
            latLng = [featureUrl[0][1],featureUrl[0][0]];
            // latLng = [featureUrl[1][1],featureUrl[1][0]];

        printImage(latLng,holcId);
        // getImage(latLng,holcId,borough);
      }
    });
  }

  function saveAllImages() {
    features.forEach((feature,index,collection) => {
      let featureUrl = feature.geometry.coordinates[0][0],
          featureHolcId = feature.properties.holc_id,
          centerLatLng = getCenterLatLng(featureUrl);

      setTimeout(function() {
        getImage(centerLatLng,featureHolcId,borough);
        if (index+1 === collection.length) { console.log('-------'+borough+' END-------'); }
      }, index*eachTime)
    });
  }

  function printImage(latLng,holcId) {
    // Max size is 2048 x 2048:
    // fov (field of view, like zoom) max level is 120
    let streetAPI = 'https://maps.googleapis.com/maps/api/streetview?size=2048x2048&location='+latLng[0]+','+latLng[1]+'&fov=120&key=' + process.env.GOOGLE_KEY,
        dir = 'images/'+borough;

    console.log(streetAPI);
  }

  function getImage(latLng,holcId,borough) {
    // Max size is 2048 x 2048:
    // fov (field of view, like zoom) max level is 120
    let streetAPI = 'https://maps.googleapis.com/maps/api/streetview?size=2048x2048&location='+latLng[0]+','+latLng[1]+'&fov=120&key=' + process.env.GOOGLE_KEY,
        outsideAPI = 'https://maps.googleapis.com/maps/api/streetview?size=2048x2048&location='+latLng[0]+','+latLng[1]+'&source=outdoor&fov=120&key=' + process.env.GOOGLE_KEY,
        dir = 'images/'+borough,
        outsideDir = 'outside/'+borough,
        imageName = borough+'_'+holcId+'.jpg';

    if (!fs.existsSync(dir)){ fs.mkdirSync(dir);}
    // if (!fs.existsSync(outsideDir)){ fs.mkdirSync(outsideDir);}

    // Save image to borough folder
    request(streetAPI, {encoding: 'binary'}, function(error, response, body) {
      fs.writeFile(dir+'/'+imageName, body, 'binary', function (err) {});
    });
    // request(outsideAPI, {encoding: 'binary'}, function(error, response, body) {
    //   fs.writeFile(outsideDir+'/'+imageName, body, 'binary', function (err) {});
    // });
    console.log('saved '+dir+'/'+imageName);
  }

  function getCenterLatLng(L) {
    function getAverage(list) {
      let average = 0;
      list.forEach(elem => {
        average += elem;
      })
      return average/list.length;
    }

    let latL = [],
        lngL = [];

    L.forEach(l => {
      latL.push(l[1]);
      lngL.push(l[0]);
    });

    return [getAverage(latL),getAverage(lngL)];
  }
}
