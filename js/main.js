(function () {

	"use strict";

	var SPREADSHEET_URL =  "resources/data/artists_geocoded.csv";

	var FIELDNAME$FIRSTNAME = "first_middle_name";
	var FIELDNAME$LASTNAME	= "last_name";
	var FIELDNAME$X = "x";
	var FIELDNAME$Y = "y";
	var FIELDNAME$STANDARDIZED_LOCATION = "Standardized-Location";
	var FIELDNAME$DISPLAY_NAME = "Display-Name";

	var _map;
	var _layerDots;			
	var _records;				

	$(document).ready(function(){

		new Banner($(".banner").eq(0));
		new SocialButtonBar();

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

			_records = data;

			var sumTable = new SummaryTable().createSummaryTable(
				data, FIELDNAME$X, FIELDNAME$Y, FIELDNAME$STANDARDIZED_LOCATION, FIELDNAME$DISPLAY_NAME
			);

			var marker;
			$.each(
				sumTable, 
				function(index, rec) {
					var frequency = rec[SummaryTable.FIELDNAME$FREQUENCY];
					marker = L.circleMarker(
						[rec[SummaryTable.FIELDNAME$Y], rec[SummaryTable.FIELDNAME$X]],
						{
							weight: 1,
							radius: 7+(frequency-1)*4,
							color: "#c0c4c8",
							fillColor: "#5ea7e6",
							fillOpacity: 0.7
						}
					).addTo(_layerDots);

					if (!L.Browser.mobile) {
						marker.bindTooltip(rec[SummaryTable.FIELDNAME$STANDARDIZED_LOCATION].split(",")[0]+": "+frequency);
					}
					marker.properties = rec;
				}
			);

			_map.fitBounds([[15, -160],[64, -59]]);

		}

	});

	function onMarkerClick(e)
	{

		// so this doesn't further trigger map::click

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

		//_map.panTo(e.layer.getLatLng());

		_map.openPopup(
			createContent(),
			e.layer.getLatLng(),
			{closeButton: false, autoPanPaddingTopLeft: L.Browser.mobile ? L.point(10,10) : L.point(50,10)}
		);			

		function createContent()
		{

			var rec = e.layer.properties;

			return $("<div>")
				.append($("<h3>").text(rec[SummaryTable.FIELDNAME$DISPLAY_NAME]))
				.append($("<ul>").append(createNamesList()))
				.html();

			function createNamesList()
			{
				return $.map(
					$.grep(
						_records,
						function(value) {
							return value[FIELDNAME$STANDARDIZED_LOCATION] === rec[SummaryTable.FIELDNAME$STANDARDIZED_LOCATION];
						}
					),
					function(value) {
						return $("<li>").text(value[FIELDNAME$LASTNAME]+", "+value[FIELDNAME$FIRSTNAME]);
					}
				);
			}

		}

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