(function () {

	"use strict";

	var GLOBAL_CLASS_MOBILE = "mobile";	
	var GLOBAL_CLASS_HOVER = "hover-capable";

	var GLOBAL_CLASS_FILTER$LOCATION = "state-filter-location";
	var GLOBAL_CLASS_FILTER$TEXT = "state-filter-text";

	var GLOBAL_CLASS_BIO = "state-bio";

	var LISTITEM_CLASS_ACTIVE = "active";

	var SPREADSHEET_URL =  "resources/data/artists_geocoded.csv";

	var FIELDNAME$ID = "artist_id";
	var FIELDNAME$FIRSTNAME = "first_middle_name";
	var FIELDNAME$LASTNAME	= "last_name";
	var FIELDNAME$SHORT_BIO = "short_bio";
	var FIELDNAME$X = "x";
	var FIELDNAME$Y = "y";
	var FIELDNAME$STANDARDIZED_LOCATION = "Standardized-Location";
	var FIELDNAME$DISPLAY_NAME = "Display-Name";

	var _filterLocation;
	var _filterDisplayName;

	var _map;
	var _layerDots;

	var _records;				
	var _selection;

	$(document).ready(function() {

		if (!L.Browser.mobile) {
			$("html body").addClass(GLOBAL_CLASS_HOVER);
		}	

		$("html body").keydown(function(event){
			if ($("html body").hasClass(GLOBAL_CLASS_BIO))
			{
				if (event.which === 27) {
					$("html body").removeClass(GLOBAL_CLASS_BIO);
				}
				return;
			}
		});

		new Banner($(".banner").eq(0));
		new SocialButtonBar();

		_map = L.map("map", {zoomControl: !L.Browser.mobile})
			.addLayer(L.esri.basemapLayer("DarkGray"))
			.addLayer(L.esri.basemapLayer("DarkGrayLabels"))
			.on("click", onMapClick);

		if (!L.Browser.mobile) {
			L.easyButton(
				"fa fa-home", 
				function(btn, map){fitBounds(_layerDots.getBounds().pad(0.1));}
			).addTo(_map);
		}

		$("#search input").on("keyup", onInputKeyUp);	
		$(".filter-display-location .clear-filter").click(clearLocationFilter);
		$("#search .clear-filter").click(clearTextFilter);			
		$("#bio .clear-filter").click(clearBio);

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

		$(window).resize(handleWindowResize);
		handleWindowResize();

		function finish(data)
		{

			_records = data;
			fitBounds([[15, -160],[64, -59]]);
			updateFilter();

		}

	});

	function handleWindowResize() {
		if ($(window).width() <= 700) {
			$("html body").addClass(GLOBAL_CLASS_MOBILE);
		} else {
			$("html body").removeClass(GLOBAL_CLASS_MOBILE);
		}
	}

	function onInputKeyUp(e)
	{
		updateFilter();
	}


	function onListEntryClick(e)
	{

		clearActive();

		var rec = $.grep(
			_records,
			function(value) {
				return value[FIELDNAME$ID] === $(e.currentTarget).attr("storymaps-id");
			}
		)[0];

		setBio(rec);

		var ll = L.latLng(rec[FIELDNAME$Y], rec[FIELDNAME$X]); 
		panTo(ll);

		_map.openPopup(
			rec[FIELDNAME$DISPLAY_NAME],
			ll,
			{closeButton: false}
		);			

		$(e.currentTarget).addClass(LISTITEM_CLASS_ACTIVE);

	}

	function onMapClick(e)
	{
		_filterLocation = null;
		updateFilter();
	}

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

		_filterLocation = e.layer.properties[SummaryTable.FIELDNAME$STANDARDIZED_LOCATION];
		_filterDisplayName = e.layer.properties[SummaryTable.FIELDNAME$DISPLAY_NAME];
		updateFilter();
		panTo(e.layer.getLatLng());
		_map.openPopup(
			_filterDisplayName,
			e.layer.getLatLng(),
			{closeButton: false, autoPanPaddingTopLeft: L.Browser.mobile ? L.point(10,10) : L.point(50,10)}
		);			

		if (_selection.length === 1) {
			setBio(_selection[0]);
			$("#list li:nth-child(1)").addClass(LISTITEM_CLASS_ACTIVE);
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

	function createMarkers()
	{

		_layerDots.clearLayers();

		var sumTable = new SummaryTable().createSummaryTable(
			_selection, FIELDNAME$X, FIELDNAME$Y, FIELDNAME$STANDARDIZED_LOCATION, FIELDNAME$DISPLAY_NAME
		);

		var marker, frequency;
		$.each(
			sumTable, 
			function(index, rec) {
				frequency = rec[SummaryTable.FIELDNAME$FREQUENCY];
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

	}


	function clearActive()
	{
		$("#list li").removeClass(LISTITEM_CLASS_ACTIVE);	 	
		if (!_filterLocation) {
			_map.closePopup();	
		}
	}

	function clearBio()
	{
		$("html body").removeClass(GLOBAL_CLASS_BIO);
	}

	function clearLocationFilter()
	{
		_filterLocation = null;
    	updateFilter();
		_map.closePopup();
	}


	function clearTextFilter()
	{
		$("#search input").val("");
		updateFilter();	
		if (!_filterLocation) {
			_map.closePopup();	
		}
	}	


	function fitBounds(bnds)
	{
		if (!bnds) {
			bnds = _layerDots.getBounds().pad(0.1);
		}
		if ($("html body").hasClass(GLOBAL_CLASS_MOBILE)) {
			_map.fitBounds(
				bnds,
				{
					paddingBottomRight:[0, $("#list-container").outerHeight()],
					paddingTopLeft: [0, $(".banner").outerHeight()]
				}
			);
		} else {
			_map.fitBounds(
				bnds,
				{
					paddingBottomRight:[$("#list-container").outerWidth()+20, 0]
				}
			);
		}		
	}

	function panTo(latLng)
	{
		var pixels = _map.latLngToContainerPoint(latLng);

		if ($("html body").hasClass(GLOBAL_CLASS_MOBILE)) {
			pixels = pixels.add([0, ($("#list-container").outerHeight()-$(".banner").outerHeight())/2]);  // vertical offset
			_map.panTo(_map.containerPointToLatLng(pixels), {animate: true, duration: 1});					
		} else {
			pixels = pixels.add([$("#list-container").outerWidth()/2, 0]);  // vertical offset
			_map.panTo(_map.containerPointToLatLng(pixels),{animate: true, duration: 1});
		}	
	}	

	function updateFilter()
	{

		clearBio();
		_selection = _records;

		if ($.trim($("#search input").val()).length > 0) {
			$("html body").addClass(GLOBAL_CLASS_FILTER$TEXT);
			_selection = $.grep(
				_selection, 
				function(value) {
					return value[FIELDNAME$FIRSTNAME].toLowerCase().indexOf($("#search input").val().toLowerCase()) > -1 ||
							value[FIELDNAME$LASTNAME].toLowerCase().indexOf($("#search input").val().toLowerCase()) > -1;
				}
			);
		} else {
			$("html body").removeClass(GLOBAL_CLASS_FILTER$TEXT);
		}

		createMarkers();

		if (_filterLocation) {
			_selection = $.grep(
				_selection, 
				function(value, index) {
					return value[FIELDNAME$STANDARDIZED_LOCATION] === _filterLocation;
				}
			);
			$("html body").addClass(GLOBAL_CLASS_FILTER$LOCATION);	
			$(".filter-display-location .filter-text").text(_filterDisplayName);		
		} else {
			$("html body").removeClass(GLOBAL_CLASS_FILTER$LOCATION);
			$(".filter-display-location .filter-text").text("Showing All Locations");					
		}		

		loadList();
		$("#list").scrollTop(0);

	}

	function setBio(rec) {
		$("html body").addClass(GLOBAL_CLASS_BIO);
		$("#bio #fellow-name").text(rec[FIELDNAME$FIRSTNAME]+" "+rec[FIELDNAME$LASTNAME]);
		$("#bio #bio-placename").text(rec[FIELDNAME$DISPLAY_NAME]);
		$("#bio #textarea").text(rec[FIELDNAME$SHORT_BIO]);
		if ($("#bio #textarea").text().trim() === "") {
			$("#bio #textarea").text("Lorem ipsum dolor sit amet consectetur adipiscing elit cursus, felis quis porttitor risus mattis curae ullamcorper pellentesque, malesuada ridiculus tortor vulputate porta id justo. Maecenas metus rhoncus lacinia pretium vulputate dis primis sociosqu commodo sapien, dapibus dignissim mi mus penatibus ornare nisi fringilla laoreet venenatis, senectus sed ad tempor facilisis viverra vitae habitant rutrum. Suscipit velit libero est fermentum augue iaculis rhoncus himenaeos odio nullam parturient dignissim inceptos, a risus commodo curae turpis eleifend quam neque montes fringilla primis etiam.");
		}
	}

	function loadList()
	{
		$("#list").empty();
		$.each(
			_selection, 
			function(index, value) {
				$("#list").append(
					$("<li>")
						.append($("<div>").text(value[FIELDNAME$LASTNAME]+", "+value[FIELDNAME$FIRSTNAME]))
						.append($("<div>").text(value[FIELDNAME$DISPLAY_NAME]))
						.attr("storymaps-id", value[FIELDNAME$ID])
				);
			}
		);

		$("#list li").click(onListEntryClick);

	}

})();