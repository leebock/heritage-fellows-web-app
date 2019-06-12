(function () {

	"use strict";

	const WIDTH_THRESHOLD = 750;

	const GLOBAL_CLASS_HOVER = "hover-capable";

	const LISTCONTAINER_CLASS_UP = "table-up";

	const GLOBAL_CLASS_FILTER$LOCATION = "state-filter-location";

	const GLOBAL_CLASS_BIO = "state-bio";

	const SPREADSHEET_URL_ARTISTS = 
		window.location.href.toLowerCase().indexOf("storymaps.esri.com") >= 0 ? 
		"resources/data/artists.csv" :
		"https://arcgis.github.io/storymaps-heritage-fellows-data/artists.csv";
		
	const SPREADSHEET_URL_WORKS = 
		window.location.href.toLowerCase().indexOf("storymaps.esri.com") >= 0 ? 
		"resources/data/works.csv" :	
		"https://arcgis.github.io/storymaps-heritage-fellows-data/works.csv";
	
	const BNDS_48 = [[25, -126],[49,-65]];
	const OV_MAPS = [
		{
			"name": "48",
			"imageURL": "resources/images/ov-48.png",
			"bnds": BNDS_48
		},
		{
			"name": "AK",
			"imageURL": "resources/images/ov-ak.png",
			"bnds": [[54, -168],[72, -127]] 
		},
		{
			"name": "HI",
			"imageURL": "resources/images/ov-hi.png",
			"bnds": [[19,-160],[22.5,-154]]
		},
		{
			"name": "PR",
			"imageURL": "resources/images/ov-pr.png",
			"bnds": [[17.5,-67.5],[19,-64.5]]
		}
	];

	var _filterText;
	var _filterLocation;
	var _filterDisplayName;

	var _map;
	var _ovBar;
	var _profileDisplay;
	var _table;
	var _textSearchWidget;

	var _recordsArtists;			
	var _recordsWorks;	
	var _selection; /* record set that appears in the table */
	var _active;

	$(document).ready(function() {

		_profileDisplay = new ProfileDisplay($("div#bio"));

		if (!L.Browser.mobile) {
			$("html body").addClass(GLOBAL_CLASS_HOVER);
		}	

		$("html body").keydown(function(event){
			if ($("html body").hasClass(GLOBAL_CLASS_BIO))
			{
				if (event.which === 27) {
					clearBio();
					if (_selection && _selection.length === 1 && _filterLocation) {
						clearLocationFilter();
					} else {
						clearActive();
					}
				}
				return;
			}
		});

		new SocialButtonBar();

		_map = new L.HFMap(
			"map", 
			{zoomControl: !L.Browser.mobile, maxZoom: 12, minZoom: 2, worldCopyJump: true},
			zoomHandler
		)
			.addLayer(L.esri.Vector.basemap("ModernAntique"))
			.on("click", onMapClick)
			.on("markerClick", onMarkerClick)
			.on("moveend", onExtentChange);

		if (!L.Browser.mobile) {
			L.easyButton(
				"fa fa-home", 
				function(btn, map){fitBounds(BNDS_48, true);}
			).addTo(_map);
		}

		_textSearchWidget = $(new TextSearch())
		.on("change", onTextSearchChange)
		.on("clear", onTextSearchClear).get(0);

 		_table = $(new Table($("ul#list").get(0), getPortrait)).on("itemActivate", table_onItemActivate).get(0);

		$(".filter-display-location .x-button").click(clearLocationFilter);
		$("#bio .x-button").click(function(){
			clearBio();
			if (_selection && _selection.length === 1 && _filterLocation) {
				clearLocationFilter();
			} else {
				clearActive();
			}
		});

		$("#bio a.fa.fa-twitter").click(tweetBio);

		$("#button-show").click(
			function(){
				$("#list-container").toggleClass(LISTCONTAINER_CLASS_UP);
			}
		);

		_ovBar = new OVBar($("div#ovBar"), OV_MAPS);
		$(_ovBar).on(
			"tileClick", 
			function(event, bnds){
				fitBounds(bnds, true);
			}
		);

		Papa.parse(
			SPREADSHEET_URL_ARTISTS, 
			{
				header: true,
				download: true,
				error: function(error) {
					console.log("Error reaching ", SPREADSHEET_URL_ARTISTS);
				},
				complete: function(data){
					_recordsArtists = $.grep(
						$.map(
							data.data, 
							function(value){return new ArtistRecord(value);}
						),
						function(artist){return artist.getTradition().trim() !== "";}
					);
					finish();
				}
			}
		);

		Papa.parse(
			SPREADSHEET_URL_WORKS,
			{
				header: true,
				download: true,
				error: function(error) {
					console.log("Error reaching ", SPREADSHEET_URL_WORKS);
				},
				complete: function(data){
					_recordsWorks = $.map(
						data.data,
						function(value){return new MediaRecord(value);}
					);
					finish();
				}
			}
		);

		function finish()
		{

			/* wait for both CSV downloads to complete */

			if (!_recordsArtists || !_recordsWorks) {
				return;
			}

			fitBounds(BNDS_48);
			_map.loadMarkers(_recordsArtists);
			updateFilter();

			/*  if there's an id in the url parameter, then initialize
				with that record active. */

			_active = $.grep(
				_recordsArtists,
				function(value) {
					return value.getID() === parseArtist();
				}
			).shift();

			if (_active) {
				setBio(_active);
				showLocation(_active.getLocationDisplayName(), _active.getLatLng());
			}

		}

	});

	/***************************************************************************
	********************** EVENTS that affect selection ************************
	***************************************************************************/

	function onTextSearchChange(event, value)
	{
		_filterText = value;
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

		_filterLocation = e.record.getStandardizedLocation();
		_filterDisplayName = e.record.getDisplayName();
		if (e.ghost) {
			_textSearchWidget.clear();
			_filterText = null;
		}
		updateFilter();

		if (_selection.length === 1) {
			_active = _selection[0];
			setBio(_active);
			_table.activateItem(_active.getID());
		}

		showLocation(_filterDisplayName, e.record.getLatLng(), true);

	}

	function clearLocationFilter()
	{
		_filterLocation = null;
    	updateFilter();
		_map.closePopup();
	}


	function onTextSearchClear()
	{
		_filterText = null;
		updateFilter();	
		if (!_filterLocation) {
			_map.closePopup();	
		}
	}	

	/***************************************************************************
	********************** selection controller FUNCTION ***********************
	***************************************************************************/

	function updateFilter()
	{

		clearBio();
		_selection = _recordsArtists;

		if (_filterText) {
			_selection = filterByText(_selection, _filterText);
		}

		_map.addSpotlight(_selection);

		if (_filterLocation) {
			_selection = filterByLocation(_selection);
			$("html body").addClass(GLOBAL_CLASS_FILTER$LOCATION);	
			$(".filter-display-location .filter-text").text(_filterDisplayName);		
		} else {
			$("html body").removeClass(GLOBAL_CLASS_FILTER$LOCATION);
			$(".filter-display-location .filter-text").text("Showing All Locations");					
		}		

		_table.load(_selection, _filterText);

		function filterByText(recs, filterText)
		{
			return $.grep(
				recs, 
				function(value) {
					return [
						value.getFirstName(), 
						value.getLastName(), 
						value.getTradition(), 
						value.getLocationDisplayName(), 
						value.getAwardYear()
					].join().search(RegExp(filterText, "ig")) > -1;
				}
			);
		}

		function filterByLocation(recs)
		{
			return $.grep(
				recs, 
				function(value, index) {
					return value.getStandardizedLocation() === _filterLocation;
				}
			);
		}

	}

	/***************************************************************************
	**************************** EVENTS (other) ********************************
	***************************************************************************/

	function onExtentChange(event)
	{

		var ll = _map.containerPointToLatLng(
			L.point({
				x: 0,
				y: $("div#map").height() - ($("div#ovBar").height() + parseInt($("div#ovBar").css("bottom")))	
			})							
		);

		var ur = _map.containerPointToLatLng(
			L.point({
				x: $("div#map").width() - ($("div#list-container").outerWidth()+20),
				y: 0	
			})							
		);

		_ovBar.update(L.latLngBounds(ll,ur)); // pass visible bounds

	}

	function clearActive()
	{
		_table.clearActive();
		if (!_filterLocation) {
			_map.closePopup();	
		}
	}

	function clearBio()
	{
		$("html body").removeClass(GLOBAL_CLASS_BIO);
		_profileDisplay.empty();
	}

	function table_onItemActivate(event, id)
	{

		_active = $.grep(
			_recordsArtists,
			function(value) {
				return value.getID() === id;
			}
		)[0];

		setBio(_active);

		if ($(window).width() < WIDTH_THRESHOLD) {
			if (!_filterLocation || isListRetracted()) {
				// todo: pass keepZoom if current zoom is less than flyTo zoom?
				showLocation(_active.getLocationDisplayName(), _active.getLatLng());
			} else {
				// do nothing
			}
		} else {
			showLocation(_active.getLocationDisplayName(), _active.getLatLng());
		}

	}
	
	function zoomHandler(targetZoom)
	{
		var targetPoint = _map.project(_map.getCenter(), targetZoom);
		var paddingBottomRight;
		if ($(window).width() < WIDTH_THRESHOLD) {
			paddingBottomRight = [0, calcBottom()];
		} else {
			paddingBottomRight = [
				calcRight(),
				$("div#ovBar").height() + parseInt($("div#ovBar").css("bottom"))
			];
		}
		var offset;
		if (targetZoom < _map.getZoom()) {
			offset = [paddingBottomRight[0]/4, paddingBottomRight[1]/4];
		    targetPoint = targetPoint.add(offset);			
		} else {
			offset = [paddingBottomRight[0]/2, paddingBottomRight[1]/2];
		    targetPoint = targetPoint.subtract(offset);
		}
	    var targetLatLng = _map.unproject(targetPoint, targetZoom);
	    _map.setView(targetLatLng, targetZoom);      
	}

	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/

	function fitBounds(bnds, flyTo)
	{

		var options;

		if ($(window).width() < WIDTH_THRESHOLD) {
			options = {
				paddingBottomRight:[0, calcBottom()]
			};
		} else {
			options = {
				paddingBottomRight:
				[
					calcRight(),
					$("div#ovBar").height() + parseInt($("div#ovBar").css("bottom"))
				]
			};
		}

		if (flyTo) {
			_map.flyToBounds(bnds, options);
		} else {
			_map.fitBounds(bnds, options);
		}
	}

	function panTo(latLng)
	{
		var pixels = _map.latLngToContainerPoint(latLng);

		var offsetX = 0;
		var offsetY = 0;

		if ($(window).width() < WIDTH_THRESHOLD) {
			offsetY = calcBottom()/2;
		} else {
			offsetX = calcRight()/2;
			offsetY = ($("div#ovBar").height() + parseInt($("div#ovBar").css("bottom")))/2;
		}	
		_map.panTo(_map.containerPointToLatLng(pixels.add([offsetX, offsetY])), {animate: true, duration: 1});
	}	

	function calcRight()
	{
		/* note: this function provides a theoretical #list-container width 
				 calculation instead of querying the actual width.  this is 
				 because the function fires while the div is in the process
				 of growing/shrinking via css transition.  so the actual
				 width value may be in flux. */

		var maxWidth = parseInt($("div#list-container").css("max-width"));
		var pct = $("html body").hasClass(GLOBAL_CLASS_BIO) ? 0.7 : 0.4;
		var width = $("html body").width() * pct;
		width = width > maxWidth ? maxWidth : width;		
		return parseInt($("#list-container").css("right")) + width;
	}

	function calcBottom()
	{
		var pct = $("#list-container").hasClass(LISTCONTAINER_CLASS_UP) ? 0.7 : 0.4;
		return $("div#map").height() * pct;
	}

	function setBio(recArtist) {

		$("html body").addClass(GLOBAL_CLASS_BIO);

		_profileDisplay.update(
			recArtist, 
			getPortrait(recArtist.getFullName()),
			$.grep(
				_recordsWorks, 
				function(recMedia) {
					return recMedia.getArtistID() === recArtist.getFullName() && recMedia.isObjectPhoto();
				}
			).sort(sortByDisplayOrder),
			$.grep(
				_recordsWorks,
				function(recMedia) {
					return recMedia.getArtistID() === recArtist.getFullName() && recMedia.isAudio();	
				}
			).sort(sortByDisplayOrder),
			$.grep(
				_recordsWorks,
				function(recMedia) {
					return recMedia.getArtistID() === recArtist.getFullName() && recMedia.isVideo();	
				}
			).sort(sortByDisplayOrder)			
		);

		$("#bio #scrollable").animate({scrollTop: 0}, 'slow');
		$("#list-container").addClass(LISTCONTAINER_CLASS_UP);

		function sortByDisplayOrder(a,b){return a.getDisplayOrder() - b.getDisplayOrder();}
		
	}

	function getPortrait(artistName, bThumbNail)
	{

		const PLACEHOLDER_PORTRAIT = "resources/no-image.gif";	

		var match = $.grep(
			_recordsWorks, 
			function(value) {
				return value.getArtistID() === artistName && value.isPortrait();
			}
		).shift();

		return match ? (bThumbNail ? match.getThumbnail() : match.getLink()) : PLACEHOLDER_PORTRAIT;

	}

	function showLocation(label, ll, keepZoom)
	{

		if (keepZoom) {
			panTo(ll);
		} else {
			fitBounds(ll.toBounds(500000), true);
		}

		_map.openPopup(
			label,
			ll,
			{closeButton: false}
		);

	}

	function tweetBio()
	{

		var text = "Celebrating the work of "+
					_active.getFirstName()+" "+_active.getLastName()+
					" and all of our other amazing NEA National Heritage Fellows.";

		var url = window.location.href.split("?")[0]+"?id="+_active.getID().toString();

		var twitterOptions = 'text=' + encodeURIComponent(text) + 
		    '&url=' + encodeURIComponent(url)+ 
		    '&via=' + encodeURIComponent($('meta[name="twitter:site"]').attr('content').replace('@','')) + 
		    "&hashtags=storymap";

		window.open(
			'https://twitter.com/intent/tweet?' + twitterOptions,
			'Tweet',
			'toolbar=0,status=0,width=626,height=436'
		);

	}

	function parseArtist()
	{
		var parts = decodeURIComponent(document.location.href).split("?");
		if (parts.length === 1) {
			return null;
		}

		var args = parts[1].toLowerCase().split("&");
		var obj = {};
		args = $.each(
			args, 
			function(index, value){
				var temp = value.split("=");
				if (temp.length > 1) {
					obj[temp[0]] = temp[1];
				} 
			}
		);

		return obj.id === undefined ? null : parseInt(obj.id);

	}

	function isListRetracted()
	{
		return $(window).width() < WIDTH_THRESHOLD && 
			!$("#list-container").hasClass(LISTCONTAINER_CLASS_UP);
	}

})();