ohm = {
  init: function() {
    ohm.config.mapzenSearchEndPoint = 'https://search.mapzen.com/v1/search';
    ohm.config.mapzenSearchAPIKey = 'search-9RwfKG4';
    ohm.config.overpassEndPoint = 'http://overpass.openhistoricalmap.org/api/';

    ohm.app.map.init();
  }
};

ohm.config = {};
ohm.app = {};

ohm.app.map = {
  init: function() {
    window.leaflet = L.map('map', {
      zoomControl: false
    }).setView([51.5230, -0.1348], 14);
    
    window.leaflet.attributionControl.setPrefix(false);
    window.leaflet.attributionControl.addAttribution('Map data &copy; <a href="http://www.openhistoricalmap.org/">OpenHistoricalMap</a> contributors. & Search &copy; <a href="https://search.mapzen.com/v1/attribution">various sources</a>');

    L.tileLayer('http://www.openhistoricalmap.org/ohm_tiles/{z}/{x}/{y}.png').addTo(window.leaflet);
    var hash = new L.Hash(window.leaflet);
  }
};

ohm.app.ui = {
  error: function(message) {
    var newError = document.createElement('p');
    var newErrorMessage = document.createTextNode(message);
    newError.appendChild(newErrorMessage);

    var errorContainer = document.getElementById('error-group');
    errorContainer.appendChild(newError);

    setTimeout(function() {
      errorContainer.innerHTML = '';
    }, 3000);
  }
};

ohm.app.search = {
  basicSearch: function() {
    var httpRequest = new XMLHttpRequest();
    var text = document.getElementById('search').value;

    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        var searchResult = JSON.parse(httpRequest.responseText);
        var coord = searchResult.features[0].geometry.coordinates;
        var name = searchResult.features[0].properties.name;

        window.leaflet.setView([coord[1], coord[0]], 14);
        document.getElementById('search').value = name;
        ohm.app.overpass.dataExistsInView();
      }
      // #TODO errors?
    }

    httpRequest.open('GET', ohm.config.mapzenSearchEndPoint + '?api_key=' + ohm.config.mapzenSearchAPIKey + '&size=1&text=' + text);
    httpRequest.send();
  }
};

ohm.app.overpass = {
  dataExistsInView: function() {
    var bbbox = window.leaflet.getBounds();
    var bbboxString = bbbox._southWest.lat + ',' + bbbox._southWest.lng + ',' + bbbox._northEast.lat + ',' + bbbox._northEast.lng;
    var overpassQuery = 'node(' + bbboxString + ');out;way(' + bbboxString + ');out;';

    var httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        var result = JSON.parse(httpRequest.responseText);
        console.log(result);
        if (result.elements.length == 0) {
          ohm.app.ui.error('No data exists');
        }
      }
    }

    httpRequest.open('GET', ohm.config.overpassEndPoint + 'interpreter?data=[out:json];' + overpassQuery);
    httpRequest.send();
  }
};
