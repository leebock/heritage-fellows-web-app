(function () {

	"use strict";

	var SPREADSHEET_URL =  "/proxy/proxy.ashx?https://docs.google.com/spreadsheets/d/11r5aptFYMdGrTzWdTGJ-vVk14LfQPnncADAfrrtKGRc/pub?gid=1543494610&single=true&output=csv";

	var FIELDNAME$X = "X";
	var FIELDNAME$Y = "Y";
	var FIELDNAME$STANDARDIZED_LOCATION = "Country";

	var _map;
	var _layerDots;							

	$(document).ready(function(){

		new Social().addClickEvents();

		_map = L.map("map", {zoomControl: !L.Browser.mobile})
			.addLayer(L.esri.basemapLayer("DarkGray"))
			.addLayer(L.esri.basemapLayer("DarkGrayLabels"));

		if (!L.Browser.mobile) {
			L.easyButton(
				"fa fa-home", 
				function(btn, map){_map.fitBounds(_layerDots.getBounds().pad(0.1));}
			).addTo(_map);
		}

		_layerDots = L.featureGroup()
			.addTo(_map)
			.on("click", onMarkerClick);

		Papa.parse(
			SPREADSHEET_URL, 
			{
				header: true,
				download: true,
				complete: function(data){finish(data.data);}
			}
		);		

		function finish(data)
		{
			var marker;
			$.each(
				data, 
				function(index, value) {
					marker = L.marker([value[FIELDNAME$Y], value[FIELDNAME$X]],{riseOnHover: true})
						.bindPopup(
							value[FIELDNAME$STANDARDIZED_LOCATION].split(",")[0],
							{closeButton: false}
						)
						.addTo(_layerDots);
					if (!L.Browser.mobile) {
						marker.bindTooltip(value[FIELDNAME$STANDARDIZED_LOCATION].split(",")[0]);
					}
				}
			);
			_map.fitBounds(_layerDots.getBounds().pad(0.1));			
		}

	});

	function onMarkerClick(e)
	{

		// so this doesn't further tricker map::click

    	L.DomEvent.stop(e);

		/* note: 

			because of weirdness with toolTip, currently you need to manually 
			hide the toolTip so that it doesn't display concurrently with the
			popup (which looks weird).
		*/

		$(".leaflet-tooltip").remove();

		/*

			further note: in the past we have had to put the remove inside a 
			one-time movestart event AND we have also had to put the pan on a
			slight time delay (setTimeout).  just sayin'...

		    _map.once('movestart', function(e) {

		    });

		*/

		_map.panTo(e.layer.getLatLng());

		/* 	final note: 

			code for situating the map w/ offsets. using a test offset here, 
		 	but the offset would generally be the height or width of some 
		 	container.

			var pixels = _map.latLngToContainerPoint(e.layer.getLatLng());
			var offset = 0; // height or width of some container.

			if ($("html body").hasClass("mobile")) {
				pixels = pixels.add([0, offset/2]);  // vertical offset
			} else {
				pixels = pixels.add([-offset/2, 0]); // left hand offset
			}
			_map.panTo(_map.containerPointToLatLng(pixels), {animate: true, duration: 1});					

		*/

	}

})();