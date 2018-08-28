

var getDefaultBackEnd = function(type) {
	var point = {
		"latitude": -37.8131, 
		"longitude": 144.9621
	};
	var backendFromServer = {
		id: type,
		displayName: 'Cafes',
		center: point,
		zoom: 12,
		type: type,
		visible: true,
		scope: 'all' ,
		maxzoom: 1
	};

	return getBackend(backendFromServer)
}

// Backend types: {popup_marker,marker,heatmap,temp}
var getBackend = function(backendFromServer) {
	var backend;
	if (backendFromServer.type == 'temp') {
		backend = {
			id: backendFromServer.id,
			displayName: backendFromServer.displayName,
			center: backendFromServer.center,
			zoom: backendFromServer.zoom,
			type: backendFromServer.type,
			visible: backendFromServer.visible,
			scope: backendFromServer.scope,
			maxzoom: backendFromServer.maxZoom,
			layer: new L.layerGroup()
		};
	} else if (backendFromServer.type == 'marker') {
		backend = {
			id: backendFromServer.id,
			displayName: backendFromServer.displayName,
			center: backendFromServer.center,
			zoom: backendFromServer.zoom,
			type: backendFromServer.type,
			visible: backendFromServer.visible,
			scope: backendFromServer.scope,
			maxzoom: backendFromServer.maxZoom,
			layer: new L.layerGroup()
		};
	} else if (backendFromServer.type == 'cluster') {
		// TODO: Get scope, type and visible from the backend
		backend = {
			id: backendFromServer.id,
			displayName: backendFromServer.displayName,
			center: backendFromServer.center,
			zoom: backendFromServer.zoom,
			type: backendFromServer.type,
			visible: backendFromServer.visible,
			scope: backendFromServer.scope,
			maxzoom: backendFromServer.maxZoom,
			layer: new L.markerClusterGroup()
		};
	} else if (backendFromServer.type == 'heatmap') {
		// TODO: Get scope, type and visible from the backend
		backend = {
			id: backendFromServer.id,
			displayName: backendFromServer.displayName,
			center: backendFromServer.center,
			zoom: backendFromServer.zoom,
			type: backendFromServer.type,
			visible: backendFromServer.visible,
			scope: backendFromServer.scope,
			maxzoom: backendFromServer.maxZoom,
			layer: L.webGLHeatmap({
				size: 30000,
				autoresize: true,
				alphaRange: 1,
				opacity: 1
			}) // opacity close to 0, less clear
		};
	}
	return backend;
}

var backends = new Map();


var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
	'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
	'Imagery © <a href="http://mapbox.com">Mapbox</a>',
	mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYmZhcnIiLCJhIjoiY2pqcWpzbGJtMGZ1eTNxbmYydHo5ZXlqeCJ9._Yxpc79C2fkwkLl2rh6hUg';



var grayscale = L.tileLayer(mbUrl, {
		id: 'mapbox.light',
		attribution: mbAttr
	}),
	streets = L.tileLayer(mbUrl, {
		id: 'mapbox.streets',
		attribution: mbAttr
	}),
	classic = L.tileLayer(mbUrl, {
		id: 'mapbox',
		attribution: mbAttr
	});;



var map = L.map('map', {
	center: [-37.8131, 144.9621],
	zoom: 12
});


L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


var baseLayers = {
	"Classic": classic,
	"Grayscale": grayscale,
	"Streets": streets
};

var overlays = {};

var controls = L.control.layers(baseLayers, overlays, {
	collapsed: false
});
controls.addTo(map);

// Add messageBox
var options = {
	timeout: 5000,
	position: 'bottomleft'
}
var msgBox = L.control.messagebox(options).addTo(map);

function addBackend(backend) {
	console.log("Adding layer for backend: " + backend.id);

	// Check that the backend (by name did not exist, in which case, we'll remove the old one)
	if (backends.has(backend.id)) {
		console.log("Removing old backend: " + backend.id);
		removeBackend(backend.id);
	}

	backends.set(backend.id, backend);

	if (backend.scope == 'all') {
		queryAll(backend);
	} else if (backend.scope == 'within') {
		queryWithin(backend);
	} else if (backend.scope == 'search') {
		searchAll(backend.searchterm, backend);
	}

	// Add layer to the map
	map.addLayer(backend.layer);
	controls.addOverlay(backend.layer, backend.displayName);

	// Focus map on the backend center and zoom
	map.setView([backend.center.latitude, backend.center.longitude], backend.zoom);
}

function searchAll(searchterm, backend) {
	// Expected dataPoint { name, latitude, longitude, details }
	
	$.get("/searchall?searchterm="+searchterm, function(data) {
		currentDataSet = data;
		console.log("Displaying " + data.length + " points from backend " + backend.id);
		var dataPoints = [];
		for (var i = 0; i < data.length; i++) {
			dataPoint = data[i];
			if (backend.type == 'cluster') {
				showCluster(backend, dataPoint);
			} else if (backend.type == 'heatmap') {
				showHeatmap(backend, dataPoint);
			} else if (backend.type == 'marker') {
				showMarker(backend, dataPoint);
			} else if (backend.type == 'temp') {
				showTemp(backend, dataPoint);
			} else {
				console.log("Backend type " + backend.type + " not supported")
			}
		}
		console.log("Done");
	}, "json");
}

function queryAll(backend) {
	// Expected dataPoint { name, latitude, longitude, details }
	
	$.get("/all", function(data) {
		currentDataSet = data;
		console.log("Displaying " + data.length + " points from backend " + backend.id);
		var dataPoints = [];
		for (var i = 0; i < data.length; i++) {
			dataPoint = data[i];
			if (backend.type == 'cluster') {
				showCluster(backend, dataPoint);
			} else if (backend.type == 'heatmap') {
				showHeatmap(backend, dataPoint);
			} else if (backend.type == 'marker') {
				showMarker(backend, dataPoint);
			} else if (backend.type == 'temp') {
				showTemp(backend, dataPoint);
			} else {
				console.log("Backend type " + backend.type + " not supported")
			}
		}
		console.log("Done");
	}, "json");
}

function queryWithin(backend) {
	if (backend.visible == true && backend.scope == 'within') {
		if (backend.maxzoom <= map.getZoom()) {
			console.log("Querying data for backend: " + backend.id);

			var bounds = map.getBounds();
			var url = "/within&lat1=" + bounds.getNorthWest().lat + "&lon1=" + bounds.getNorthWest().lng + "&lat2=" + bounds.getSouthEast().lat + "&lon2=" + bounds.getSouthEast().lng;

			// Expected dataPoint { name, latitude, longitude, details }

			$.get(url, function(data) {
				currentDataSet = data;
				// Clear previous points
				backend.layer.clearLayers();

				console.log("Displaying " + data.length + " points from backend " + backend.id);
				var dataPoints = [];
				for (var i = 0; i < data.length; i++) {
					dataPoint = data[i];
					if (backend.type == 'cluster') {
						showCluster(backend, dataPoint);
					} else if (backend.type == 'heatmap') {
						showHeatmap(backend, dataPoint);
					} else if (backend.type == 'marker') {
						showMarker(backend, dataPoint);
					} else if (backend.type == 'temp') {
						showTemp(backend, dataPoint);
					} else {
						console.log("Backend type " + backend.type + " not supported")
					}
				}
				console.log("Done");

			}, "json");
		} else {
			msgBox.show('No data querying for ' + backend.displayName + ' at this level of zoom');
		}
	}
}

function queryWithinAll() {
	backends.forEach(queryWithin);
}

function removeBackend(backendId) {
	if (backends.has(backendId)) {
		var backend = backends.get(backendId);
		controls.removeLayer(backend.layer);
		map.removeLayer(backend.layer);
		backends.delete(backend.id);
	} else {
		console.log("Trying to remove a non existant backend: " + backendId);
	}
}

function populateReview(address, id, name) {
	$('#address').val(address);
	$('#geoid').val(id);
	$('#tradingName').val(name);

}
function populateReviewModal(address, id, name) {
	$('#addressr').html(address);
	$('#geoidr').val(id);
	$('#tradingNamer').html(name);

	// ajax calls get all reviews for this geoid
	$.get( "/reviewavg?geoid="+id, function( data ) {
		data = $.parseJSON(data);
		stars = getStarsHtml(data);
		
		$('#avgReviewr').html(stars);
	});


	// ajax calls get all reviews for this geoid
	$.get( "/review?geoid="+id, function( data ) {
		data = $.parseJSON(data);
		$("#reviewcontent").html('');
		$.each(data, function(i, item) {
			var d = new Date(item.dateReviewed);
			var theyear = d.getFullYear();
			var themonth = d.getMonth() + 1;
			var thetoday = d.getDate();

    		$("#reviewcontent").append(
				"<div class='form-group' >" +
				thetoday + "/" + themonth + "/" + theyear  + ", " + item.name + "<br/>" +
				item.description + "<br/>" +
				getStarsHtml(item.rating) + "<br/>" 
				+ "</div>"
			)
		});

	  });
}

function getStarsHtml(n) {
	// returns num
	var text = '<table><tr>';
	var i;
	for (i = 1; i <= n; i++) { 
		text += '<td><a class="stars"></a></td>';
	}
	text += '</tr></table>'
	return text;
}
function showCluster(backend, dataPoint) {
	

	var popupInformation = "<b>" + dataPoint.name + "</b></br>"  + dataPoint.address + "</br>" + dataPoint.info + "</br>" +
	'<a data-toggle="modal" data-target="#myModal3" href="" onclick="javascript:populateReviewModal(' + "'" + dataPoint.address + "','" +
		dataPoint.id + "','" + dataPoint.name + "'" + ')">Reviews</a></br>' +
	'<a data-toggle="modal" data-target="#myModal" href="" onclick="javascript:populateReview(' + "'" + dataPoint.address + "','" +
		dataPoint.id + "','" + dataPoint.name + "'" + ')">Add a Review</a>';

	var marker = L.marker([dataPoint.latitude, dataPoint.longitude]).bindPopup(popupInformation);
	marker.addTo(backend.layer);
}

function showMarker(backend, dataPoint) {
	var popupInformation = "<b>" + dataPoint.name + "</b></br>"  + dataPoint.address + "</br>" + dataPoint.info + "</br>" +
	'<a data-toggle="modal" data-target="#myModal3" href="" onclick="javascript:populateReviewModal(' + "'" + dataPoint.address + "','" +
		dataPoint.id + "','" + dataPoint.name + "'" + ')">Reviews</a></br>' +
	'<a data-toggle="modal" data-target="#myModal" href="" onclick="javascript:populateReview(' + "'" + dataPoint.address + "','" +
		dataPoint.id + "','" + dataPoint.name + "'" + ')">Add a Review</a>';

	var marker = L.marker([dataPoint.latitude, dataPoint.longitude]).bindPopup(popupInformation);
	marker.addTo(backend.layer);
}

function showHeatmap(backend, dataPoint) {
	if (isNaN(dataPoint.latitude) || isNaN(dataPoint.longitude)) {
		console.log("Invalid Data Point: " + dataPoint);
	} else {
		try {
			var temp = dataPoint.info.match(/.*Avg:(.*)$/);
			if (isNaN(temp[1])) {
				console.log("No temp in this datapoint: " + dataPoint);
			} else {
				if (dataPoint.latitude != null && dataPoint.longitude != null)
					backend.layer.addDataPoint(dataPoint.latitude, dataPoint.longitude, Math.round(temp[1]) + 50);
			}
		} catch (err) {
			console.log("Error with this dataPoint [" + dataPoint + "]. Error=" + err.message);
		}
		backend.layer.draw();
	}
}

function showTemp(backend, dataPoint) {
	try {
		var temp = dataPoint.info.match(/.*Avg:(.*)$/);
		if (isNaN(temp[1])) {
			console.log("No temp in this datapoint: " + dataPoint);
		} else {
			if (dataPoint.latitude != null && dataPoint.longitude != null) {
				var iconColor;
				if (temp[1] < 0) iconColor = 'royalblue';
				if (temp[1] >= 0) iconColor = 'skyblue';
				if (temp[1] >= 10) iconColor = 'yellow';
				if (temp[1] >= 20) iconColor = 'orange';
				if (temp[1] >= 30) iconColor = 'orangered';
				if (temp[1] >= 40) iconColor = 'red';
				var iconSize = (map.getZoom() - 5) * 3;
				var options = {
					iconShape: 'circle-dot',
					borderWidth: iconSize,
					borderColor: iconColor
				};
				var marker = L.marker([dataPoint.latitude, dataPoint.longitude], {
						icon: L.BeautifyIcon.icon(options)
					})
					.bindPopup("<b>" + temp[0] + "</b>");
				marker.addTo(backend.layer);
			}
		}
	} catch (err) {
		console.log("Error with this dataPoint [" + dataPoint + "]. Error=" + err.message);
	}
}



function initialLoad() {
	var clusterBackend = getDefaultBackEnd('cluster');
	addBackend(clusterBackend);	
}

$(document).ready(function() {
	$("#searchreset").click(function(){
		$("#searchMap").val('');
		initialLoad();
	});
	$("#searchbtn").click(function(){
		var clusterBackend = getDefaultBackEnd('cluster');
		clusterBackend.scope = 'search';
		clusterBackend.searchterm = $("#searchMap").val();
		addBackend(clusterBackend);
	});
	$(document).keypress(function(event) {
		if (event.key === "Enter") {
			$("#searchbtn").click();
		}
	});
	
	$('#addreviewsave').click( function() {
		console.log($('#addreviewform').serializeJSON());
		alert(JSON.stringify($('#addreviewform').serializeJSON()));
		$.ajax({
			type: 'POST',
			cache: false,
			url: '/reviewadd',
			data: $('#addreviewform').serializeJSON(),
			datatype: 'json',
			success: function(data) {
				alert(data);
			}
		  });

		$("#addreviewcancel").click();
	});

	map.whenReady(initialLoad); 
	map.on('moveend', queryWithinAll);
	map.on('moveend', function() {
		console.log("map was panned!");
		console.log("zoom: " + map.getZoom()); // prints out zoom level
		console.log("center: " + map.getCenter()); // prints out map center
	});
	map.on('overlayadd', onOverlayAdd).on('overlayremove', onOverlayRemove);

	
	
	

});

function onOverlayAdd(e) {
	backends.forEach(function(backend, backendId, thisMap) {
		if (backend.displayName == e.name) {
			// Execute the actions
			backend.visible = true;
		}
	});
}

function onOverlayRemove(e) {
	backends.forEach(function(backend, backendId, thisMap) {
		if (backend.displayName == e.name) {
			// Execute the actions
			backend.visible = false;
		}
	});
}

