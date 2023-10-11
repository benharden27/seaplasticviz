let datemin = document.getElementById('datemin')
let datemax = document.getElementById('datemax')

// create the slider
let slidervar = document.getElementById('slider');
noUiSlider.create(slidervar, {
    connect: true,
    orientation: 'vertical',
    tooltips: [false, false],
    direction: 'rtl',
    start: [ 0, 200000 ],
    range: {
        'min': [0, 1],
        '5%': [1, 4999],
        '15%': [5000, 5000],
        '30%': [10000, 10000],
        'max': [200000]
    },
    pips: {
        mode: 'values',
        values: [0, 1, 5000, 10000, 50000, 100000, 200000],
        density: 4},
   format: wNumb({
        decimals: 0
        })
});

// add values to the input boxes 
document.getElementById('input-number-min').setAttribute("value", 0);
document.getElementById('input-number-max').setAttribute("value", 200000);

// link these inputs to the slider position
let inputNumberMin = document.getElementById('input-number-min');
let inputNumberMax = document.getElementById('input-number-max');
inputNumberMin.addEventListener('change', function(){
    slidervar.noUiSlider.set([this.value, null]);
});
inputNumberMax.addEventListener('change', function(){
    slidervar.noUiSlider.set([null, this.value]);
});

// Create the initial base map with background with tiles and zoom levels
let osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttrib = '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    osm = L.tileLayer(osmUrl, { maxZoom: 8, minZoom: 3, attribution: osmAttrib});

let map = L.map('map').setView([20, -120]).setZoom(3).addLayer(osm);
map.zoomControl.setPosition('topright')

// Create a new overlay pane and associated container to add shapes to
let svg = d3.select(map.getPanes().overlayPane).append("svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

// transformation variables
let transform = d3.geoTransform({point: projectPoint}),
    path = d3.geoPath().projection(transform);
    
// create a threshold scale for binning values into different colors
// can make this changeable based on color scale selection?
let thresholdScale = d3.scaleThreshold()
  .domain([1,5e3,10e3,20e3,50e3,100e3,200e3])
  .range(['#b3b3b3','#FFFFB2','#FED976','#FEB24C','#FD8D3C','#FC4E2A','#E31A1C','#B10026']);    

// add a color legend
let legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    let div = L.DomUtil.create('div', 'info legend'),
        grades = [1,5e3,10e3,20e3,50e3,100e3,200e3],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = grades.length-1; i > -1; i = i-1) {
        console.log(i)
        div.innerHTML +=
            '<i style="background:' + thresholdScale(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+ <br>');
    }
    
    // add on the zero and null points
    div.innerHTML +=
            '<i style="background:#b3b3b3"></i> ' + "0 <br>";
            
    div.innerHTML +=
            '<i style="background:#d0d1e6"></i> ' + "No Data";

    return div;
};

// add the legend to the map
legend.addTo(map);

let popup = d3.select(map.getPanes().popupPane)
    .append("div")
    .style("display", "none")
    .attr("class", "leaflet-popup leaflet-zoom-hide")
    .style("width","200px")




let popupcontent = popup.append("div")
  .attr("class","leaflet-popup-content-wrapper")
  .append("div")
  .attr("class","leaflet-popup-content")

   
let closebutton = popup
  .append("a")
  .attr("class","leaflet-popup-close-button")
  .style("outline","currentcolor none medium")
  .html("x")
  .on("click",function() {
    popup
      .style("display","none")
    circles
      .attr("r", 3)
      .style("stroke","none")
  })
  .on("mouseover",circleMouseover)
  .on("mouseout",circleMouseout)
   
let popuploc = [0,0]

// create empty circles instance and functions for click/hover
let circles; 
function circleMouseover(d) {
  d3.select(this).style("cursor", "pointer");
}  
function circleMouseout(d) {
  d3.select(this).style("cursor", "default"); 
}

// create the data update function
// Note, this can be achieved outside of the data request block as it doesn't rely on any knowledge of the data read in.
function updateCircles(data) {

  circles = g
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("r", 3)
    .style("fill", d => d.properties.total_density === null ? '#d0d1e6' : thresholdScale(d.properties.total_density))
    .attr("fill-opacity", 1)
    .on("click", function(i,d) {
    
      circles
        .attr("r", 3)
        .style("stroke","none")
        
      popup
        .style("display","inline")
        .style("left", +d3.select(this).attr('cx') + 3 + "px")
        .style("top", +d3.select(this).attr('cy') + 3 + "px")

      popupcontent
        .html("<p><strong>" + d.properties.full_station + "</strong><br>" +
        "Date: " + d.properties.time + "<br>" +
        "Position: " + 
        Math.abs(d.LatLng.lat) + (d.LatLng.lat<0 ? "°S" : "°N") + " x " +
        Math.abs(d.LatLng.lng) + (d.LatLng.lng<0 ? "°W" : "°E") + "<br>" +
        "Density: " + d.properties.total_density + " particles/km2</p>")
     
      popuploc = d.LatLng
      
      d3.select(this)
        .attr("r",6)
        .style("stroke","black")
        .style("stroke-width",1)
        
    })
    .on("mouseover",circleMouseover)
    .on("mouseout",circleMouseout)
  

  return circles
    
}

// Download CSV functions
function csvmaker(data) {

    // Sort the data by time
    // sort the values of total density from smallest to biggest so larger values overplot smaller
    data.sort(function(a,b) { 
      return a.properties.time - b.properties.time
    });
    
    data.forEach(function(d) {
      
    })
 
    // Empty array for storing the values
    csvRows = [];
    
    csvRows.push("lon	= Longitude [deg E]");
    csvRows.push("lat = Latitude [deg N]");
    csvRows.push("basin = Ocean Basin [pacific/atlantic]");
    csvRows.push("full_station = Station ID [cruiseID-stationnumber]");
    csvRows.push("ship = SEA Sailing School Vessel [W - SSV Westward | C - SSV Corwith Cramer | S - SSV Robert C Seamans]");
    csvRows.push("cruise = SEA cruise ID");
    csvRows.push("station = Numerical station number fr specific cruise");
    csvRows.push("time = Time of Station");
    csvRows.push("zd = Zone Description");
    csvRows.push("tow_area = Area of surface towed [m^2]");
    csvRows.push("pellets = Number of plastic pellets in tow");
    csvRows.push("pieces = Number of plastic pieces in tow");
    csvRows.push("total_plastic = Total number of pellets and pieces");
    csvRows.push("pellet_density = Plastic pellet density [particles/km^2]");
    csvRows.push("piece_density = Plastic piece density [particles/km^2]");
    csvRows.push("total_density = Total plastic particle density [particles/km^2]");

    // lon and lat headers
    let headers_lonlat = 'lon,lat,'
 
    // Other headers taken from the first entry in data
    let headers = Object.keys(data[0].properties);
    
    // Then joined together with commas in between
    csvRows.push(headers_lonlat + headers.join(','));
 
    // Then loop through the rows in the data and join with commas
    data.forEach(row => {
      let lonlat = row.geometry.coordinates.join(',');
      let values = Object.values(row.properties).join(',')
      csvRows.push(lonlat + ',' + values)
    })

    // Then combine the arrays or rows with a carriage return at the end of the line
    return csvRows.join('\n')
}

  // function to download and the save the csv file
function download(csv) {
  let hiddenElement = document.createElement('a');  
      hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv); 
      hiddenElement.target = '_blank';  
        
      //provide the name for the CSV file to be downloaded  
      hiddenElement.download = 'download.csv';  
      hiddenElement.click(); 
}


// load the data from the geoJSON file and add features to map
d3.json("data/SEA_plastics_redacted.geojson").then(function(myPoints) {
  
  // INITAL DATA PROCESSING 
  // add new lat and lon fields from coordinates
  // this also includes flipping the positive values around new zealand
  // to be negative values so as to join them all up.
  myPoints.features.forEach(function(d) {
    d.geometry.coordinates[0] = (d.geometry.coordinates[0]>50 ? d.geometry.coordinates[0]-360 : d.geometry.coordinates[0])
    d.LatLng = new L.LatLng(d.geometry.coordinates[1],
      d.geometry.coordinates[0]);
    d.properties.time = new Date(d.properties.time)
  });
  
  
  // sort the values of total density from smallest to biggest so larger values overplot smaller
  myPoints.features.sort(function(a,b) { 
    return a.properties.total_density - b.properties.total_density
  });

  // MAP FUNCTION
  // update the map function
  // this has to be done in the data request block as it needs to know the scope of the data
  function updateMap() {
    
    let bounds = path.bounds(myPoints),
        topLeft = bounds[0],
        bottomRight = bounds[1];
    
      
    //add margin to bounds to not clip points 
    // right now this just needs to be more pixels than the radius of the points
    // could set as var to avoid having to change in multiple places
    topLeft[0] = topLeft[0]-3;
    topLeft[1] = topLeft[1]-3;
    bottomRight[0] = bottomRight[0]+3;
    bottomRight[1] = bottomRight[1]+3;
  
    circles.attr("cx", function(d) {
      return map.latLngToLayerPoint(d.LatLng).x;
    });
    circles.attr("cy", function(d) {
      return map.latLngToLayerPoint(d.LatLng).y;
    });

    popup.style("left", map.latLngToLayerPoint(popuploc).x + 3 + "px")
    popup.style("top", map.latLngToLayerPoint(popuploc).y + 3 + "px")
    
    svg.attr("width", bottomRight[0] - topLeft[0])
      .attr("height", bottomRight[1] - topLeft[1])
      .style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px");

    g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")")
    //popup.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")")
  }

  // set up the listener to update the map
  map.on("viewreset", updateMap);
  
  // set up listener for the popup
  map.on("click", function(e) {popup.style("opacity",1)})

  ////////////
  // FILTERING
  ////////////
  let rangeMin = inputNumberMin.value,
      rangeMax = inputNumberMax.value,
      dateMin = new Date(datemin.value),
      dateMax = new Date(datemax.value),
      dataFilter = filterData()
  
  function filterData() {
    return myPoints.features.filter(function(d) {
      return (d.properties.total_density >= rangeMin) && (d.properties.total_density <= rangeMax) && (d.properties.time >= dateMin) && (d.properties.time <= dateMax)
    })
  }

  datemin.addEventListener('change', function(){
    dateMin = new Date(document.getElementById('datemin').value);

  });
  
  datemax.addEventListener('change', function(){
    dateMax = new Date(document.getElementById('datemax').value);
    
  });
  
    // link slider position to the input numbers
    // then find the min/max values and update the circles and the map
  slidervar.noUiSlider.on('update', function( values, handle ) {
    //handle = 0 if min-slider is moved and handle = 1 if max slider is moved
    if (handle==0){
        document.getElementById('input-number-min').value = values[0];
    } else {
        document.getElementById('input-number-max').value =  values[1];
    }
    
    // extracting the range values as variables
    rangeMin = document.getElementById('input-number-min').value;
    rangeMax = document.getElementById('input-number-max').value;
    
  
  })
  
    
  /////
  // initial map load
  ////
   dataFilter = filterData();
    updateCircles(dataFilter);
    updateMap();
    
  //////
  // Update button
  //////
  let updateButton = document.getElementById('update-button')
  updateButton.addEventListener("click", function() {
    dataFilter = filterData();
    updateCircles(dataFilter);
    updateMap();
  })
  
  //////
  // Download button
  //////
  let downloadButton = document.getElementById('download-button')
  downloadButton.addEventListener("click", function() {
    let csv = csvmaker(dataFilter)
    download(csv)
  })



})

  // Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
  // Returns the map layer point that corresponds to the given geographical coordinates
  let point = map.latLngToLayerPoint(new L.LatLng(y, x));
  this.stream.point(point.x, point.y);
}
      