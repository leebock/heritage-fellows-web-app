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

		_layerDots = L.featureGroup().addTo(_map);

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
					marker = L.marker([value[FIELDNAME$Y], value[FIELDNAME$X]])
						.bindPopup(
							value[FIELDNAME$STANDARDIZED_LOCATION].split(",")[0],
							{closeButton: false}
						)
						.addTo(_layerDots);
					if (!L.Browser.mobile) {
						marker.bindTooltip(value[FIELDNAME$STANDARDIZED_LOCATION].split(",")[0])
					}
				}
			);
			_map.fitBounds(_layerDots.getBounds().pad(0.1));			
		}

	});

})();