(function () {

	"use strict";

	var SPREADSHEET_URL =  "/proxy/proxy.ashx?https://docs.google.com/spreadsheets/d/11r5aptFYMdGrTzWdTGJ-vVk14LfQPnncADAfrrtKGRc/pub?gid=1543494610&single=true&output=csv";

	var _map;
	var _layerDots;							

	$(document).ready(function(){

		new Social().addClickEvents();

		_map = L.map("map")			
		.setView([30, 0], 2)
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
			$.each(
				data, 
				function(index, value) {
					L.marker([value[Record.FIELDNAME$Y], value[Record.FIELDNAME$X]])
					.bindTooltip(value[Record.FIELDNAME$STANDARDIZED_LOCATION].split(",")[0])
					.bindPopup(
						value[Record.FIELDNAME$STANDARDIZED_LOCATION].split(",")[0],
						{closeButton: false}
					)
					.addTo(_layerDots);
				}
			);
			_map.fitBounds(_layerDots.getBounds());			
		}

	});

})();