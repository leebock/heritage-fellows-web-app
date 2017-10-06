(function () {

	"use strict";

	var GLOBAL_CLASS_MOBILE = "mobile";	
	var GLOBAL_CLASS_HOVER = "hover-capable";

	var GLOBAL_CLASS_MOBILE$TABLE_UP = "mobile-table-up";

	var GLOBAL_CLASS_FILTER$LOCATION = "state-filter-location";
	var GLOBAL_CLASS_FILTER$TEXT = "state-filter-text";

	var GLOBAL_CLASS_BIO = "state-bio";

	var LISTITEM_CLASS_ACTIVE = "active";

	var SPREADSHEET_URL =  "/proxy/proxy.ashx?https://docs.google.com/spreadsheets/d/e/2PACX-1vSwnVGKYBCzY1rwpuT1dkhudKG2MRVgs9NUWgFw6KPGpIwilqSo1RUkF9f-Mv521lkRwhhpOZKaFISe/pub?gid=1974679186&single=true&output=csv";

	var FIELDNAME$ID = "artist_id";
	var FIELDNAME$FIRSTNAME = "first_middle_name";
	var FIELDNAME$LASTNAME	= "last_name";
	var FIELDNAME$X = "x";
	var FIELDNAME$Y = "y";
	var FIELDNAME$STANDARDIZED_LOCATION = "Standardized-Location";
	var FIELDNAME$DISPLAY_NAME = "Display-Name";

	var _filterLocation;
	var _filterDisplayName;

	var _map;
	var _layerDots;

	var _records;				
	var _selection; /* record set that appears in the table */

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
		$(".filter-display-location .x-button").click(clearLocationFilter);
		$("#search .x-button").click(clearTextFilter);			
		$("#bio .x-button").click(function(){
			clearBio();
			if (_selection && _selection.length === 1 && _filterLocation) {
				clearLocationFilter();
			} else {
				clearActive();
			}
		});

		$("#button-show").click(
			function(){
				$("html body").toggleClass(GLOBAL_CLASS_MOBILE$TABLE_UP);
			}
		);

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

	/***************************************************************************
	********************** EVENTS that affect selection ************************
	***************************************************************************/

	function onInputKeyUp(e)
	{
		clearActive();
		updateFilter();
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

		_filterLocation = e.layer.properties[SummaryTable.FIELDNAME$STANDARDIZED_LOCATION];
		_filterDisplayName = e.layer.properties[SummaryTable.FIELDNAME$DISPLAY_NAME];
		updateFilter();
		setTimeout(function(){panTo(e.layer.getLatLng());}, 1500);
		_map.openPopup(
			_filterDisplayName,
			e.layer.getLatLng(),
			{closeButton: false, autoPanPaddingTopLeft: L.Browser.mobile ? L.point(10,10) : L.point(50,10)}
		);			

		if (_selection.length === 1) {
			setBio(_selection[0]);
			$("#list li:nth-child(1)").addClass(LISTITEM_CLASS_ACTIVE);
		}

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


	/***************************************************************************
	**************************** EVENTS (other) ********************************
	***************************************************************************/

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

	function handleWindowResize() {
		if ($(window).width() <= 700) {
			$("html body").addClass(GLOBAL_CLASS_MOBILE);
		} else {
			$("html body").removeClass(GLOBAL_CLASS_MOBILE);
		}
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
		setTimeout(function(){panTo(ll);}, 1500);

		_map.openPopup(
			rec[FIELDNAME$DISPLAY_NAME],
			ll,
			{closeButton: false}
		);			

		$(e.currentTarget).addClass(LISTITEM_CLASS_ACTIVE);

	}

	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/

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
			pixels = pixels.add([$("#list-container").outerWidth()/2, 0]);  // horizontal offset
			_map.panTo(_map.containerPointToLatLng(pixels), {animate: true, duration: 1});
		}	
	}	

	function updateFilter()
	{

		clearBio();
		_selection = _records;

		if ($.trim($("#search input").val()).length > 0) {
			$("html body").addClass(GLOBAL_CLASS_FILTER$TEXT);
			_selection = filterByText(_selection);
		} else {
			$("html body").removeClass(GLOBAL_CLASS_FILTER$TEXT);
		}

		createMarkers(_selection);

		if (_filterLocation) {
			_selection = filterByLocation(_selection);
			$("html body").addClass(GLOBAL_CLASS_FILTER$LOCATION);	
			$(".filter-display-location .filter-text").text(_filterDisplayName);		
		} else {
			$("html body").removeClass(GLOBAL_CLASS_FILTER$LOCATION);
			$(".filter-display-location .filter-text").text("Showing All Locations");					
		}		

		loadList(_selection);
		$("#list").scrollTop(0);


		function createMarkers(recs)
		{

			_layerDots.clearLayers();

			var sumTable = new SummaryTable().createSummaryTable(
				recs, 
				FIELDNAME$X, 
				FIELDNAME$Y, 
				FIELDNAME$STANDARDIZED_LOCATION, 
				FIELDNAME$DISPLAY_NAME
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

		function filterByText(recs)
		{
			return $.grep(
				recs, 
				function(value) {
					return value[FIELDNAME$FIRSTNAME].toLowerCase().indexOf($("#search input").val().toLowerCase()) > -1 ||
							value[FIELDNAME$LASTNAME].toLowerCase().indexOf($("#search input").val().toLowerCase()) > -1;
				}
			);
		}

		function filterByLocation(recs)
		{
			return $.grep(
				recs, 
				function(value, index) {
					return value[FIELDNAME$STANDARDIZED_LOCATION] === _filterLocation;
				}
			);
		}

		function loadList(recs)
		{
			$("#list").empty();
			$.each(
				recs, 
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

	}

	function setBio(rec) {

		$("html body").addClass(GLOBAL_CLASS_BIO);
		$("#bio #fellow-name").text(rec[FIELDNAME$FIRSTNAME]+" "+rec[FIELDNAME$LASTNAME]);
		$("#bio #bio-placename").text(rec[FIELDNAME$DISPLAY_NAME]);

		var s;// = rec[FIELDNAME$SHORT_BIO];
		/*if (s.trim() === "") {*/
			s = "Lorem ipsum dolor sit amet consectetur adipiscing elit cursus, felis quis porttitor risus mattis curae ullamcorper pellentesque, malesuada ridiculus tortor vulputate porta id justo. Maecenas metus rhoncus lacinia pretium vulputate dis primis sociosqu commodo sapien, dapibus dignissim mi mus penatibus ornare nisi fringilla laoreet venenatis, senectus sed ad tempor facilisis viverra vitae habitant rutrum. Suscipit velit libero est fermentum augue iaculis rhoncus himenaeos odio nullam parturient dignissim inceptos, a risus commodo curae turpis eleifend quam neque montes fringilla primis etiam.";
		/*}*/


		$("#bio #scrollable").empty();

		var textarea = $("<div>").attr("id", "textarea");

		var img = $("<img>");
		if (parseInt(rec[FIELDNAME$ID]) === 1) {
			$(img).attr("src", "resources/images/sheila-kay-thumb.jpg");
		} else if (parseInt(rec[FIELDNAME$ID]) === 346) {
			$(img).attr("src", "resources/images/theresa-secord-thumb.jpg");
		} else {
			$(img).attr("src", "resources/no-portrait.jpg");
		}
		$(textarea).append(img);
		$(textarea).append($("<p>").html(s));

		$("#bio #scrollable").append(textarea);
		var gallery = $("<div>").attr("id", "gallery");
		$("#bio #scrollable").append(gallery);

		if (parseInt(rec[FIELDNAME$ID]) === 1) {

			var source =$("<source>");
			$(source).attr("src", "resources/audio/sheila-kay.wav");

			var audio = $("<audio>");
			$(audio).append(source);
			$(audio).attr("id", "player");


			$(gallery).append(audio);

			setTimeout(
				function(){
					document.getElementById("player").controls = true;			
					document.getElementById("player").load();
				}, 
				1000
			);

		}

		if (parseInt(rec[FIELDNAME$ID]) === 346) {
			$(gallery).append($("<img>").attr("src", "resources/images/secord-basket-thumb.jpg"));
			$(gallery).append($("<img>").attr("src", "resources/images/secord-four-baskets-thumb.jpg"));
		}

		$("#bio #scrollable").animate({scrollTop: 0}, 'slow', function(){$("html body").addClass(GLOBAL_CLASS_MOBILE$TABLE_UP);});

	}

})();