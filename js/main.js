(function () {

	"use strict";

	const GLOBAL_CLASS_SMALL = "small";	
	const GLOBAL_CLASS_HOVER = "hover-capable";

	const LISTCONTAINER_CLASS_UP = "table-up";

	const GLOBAL_CLASS_FILTER$LOCATION = "state-filter-location";
	const GLOBAL_CLASS_FILTER$TEXT = "state-filter-text";

	const GLOBAL_CLASS_BIO = "state-bio";

	const LISTITEM_CLASS_ACTIVE = "active";

	const SPREADSHEET_URL_ARTISTS = "https://arcgis.github.io/storymaps-heritage-fellows-data/artists.csv";
	const SPREADSHEET_URL_WORKS = "https://arcgis.github.io/storymaps-heritage-fellows-data/works.csv";

	const BNDS = {
		ov48: [[25, -126],[49,-65]],
		ovAK: [[54, -168],[72, -127]],
		ovHI: [[19,-160],[22.5,-154]],
		ovPR: [[17.5,-67.5],[19,-64.5]],
		ovNM: [[13,144.5],[15.5,146]]
	};

	var _filterLocation;
	var _filterDisplayName;

	var _map;
	var _ovBar;
	var _profileDisplay = new ProfileDisplay();

	var _recordsArtists;			
	var _recordsWorks;	
	var _selection; /* record set that appears in the table */
	var _active;

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
		new SocialButtonBar({url:encodeURIComponent($('meta[property="og:url"]').attr('content'))});
		$("div.banner a#title").attr("href", ".");

		_map = new L.HFMap("map", {zoomControl: !L.Browser.mobile, maxZoom: 12, minZoom: 2, worldCopyJump: true})
			.addLayer(L.esri.Vector.basemap("ModernAntique"))
			.on("click", onMapClick)
			.on("markerClick", onMarkerClick)
			.on("moveend", onExtentChange);

		if (!L.Browser.mobile) {
			L.easyButton(
				"fa fa-home", 
				function(btn, map){fitBounds(BNDS.ov48, true);}
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

		$("#bio a.fa.fa-twitter").click(tweetBio);

		$("#button-show").click(
			function(){
				$("#list-container").toggleClass(LISTCONTAINER_CLASS_UP);
			}
		);

		_ovBar = new OVBar($("div#ovBar"), BNDS);
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
				complete: function(data){
					_recordsArtists = $.map(
						data.data, 
						function(value){return new ArtistRecord(value);}
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
				complete: function(data){
					_recordsWorks = $.map(
						data.data,
						function(value){return new MediaRecord(value);}
					);
					finish();
				}
			}
		);

		$(window).resize(handleWindowResize);
		handleWindowResize();

		function finish()
		{

			/* wait for both CSV downloads to complete */

			if (!_recordsArtists || !_recordsWorks) {
				return;
			}

			fitBounds(BNDS.ov48);
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

		_filterLocation = e.layer.properties.getStandardizedLocation();
		_filterDisplayName = e.layer.properties.getDisplayName();
		updateFilter();

		if (_selection.length === 1) {
			_active = _selection[0];
			setBio(_active);
			$("#list li:nth-child(1)").addClass(LISTITEM_CLASS_ACTIVE);
		}

		showLocation(_filterDisplayName, e.layer.getLatLng(), true);

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

	function onExtentChange(event)
	{

		var ll = _map.containerPointToLatLng(
			L.point({
				x: 0,
				y: $("div#map").height() - ($("div#ov48").height() + parseInt($("div#ovBar").css("bottom")))	
			})							
		);

		var ur = _map.containerPointToLatLng(
			L.point({
				x: $("div#map").width() - ($("div#list-container").outerWidth()+20),
				y: 0	
			})							
		);

		_ovBar.update(L.latLngBounds([ll,ur])); // pass visible bounds

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

	function handleWindowResize() {
		if ($(window).width() <= 700) {
			$("html body").addClass(GLOBAL_CLASS_SMALL);
		} else {
			$("html body").removeClass(GLOBAL_CLASS_SMALL);
		}
	}

	function onListEntryClick(e)
	{

		clearActive();

		_active = $.grep(
			_recordsArtists,
			function(value) {
				return value.getID() === parseInt($(e.currentTarget).attr("storymaps-id"));
			}
		)[0];

		setBio(_active);

		if ($("html body").hasClass(GLOBAL_CLASS_SMALL)) {
			if (!_filterLocation || isListRetracted()) {
				// todo: pass keepZoom if current zoom is less than flyTo zoom?
				showLocation(_active.getLocationDisplayName(), _active.getLatLng());
			} else {
				// do nothing
			}
		} else {
			showLocation(_active.getLocationDisplayName(), _active.getLatLng());
		}

		$(e.currentTarget).addClass(LISTITEM_CLASS_ACTIVE);

	}

	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/

	function fitBounds(bnds, flyTo)
	{

		var options;

		if ($("html body").hasClass(GLOBAL_CLASS_SMALL)) {
			options = {
				paddingBottomRight:[0, calcBottom()]
			};
		} else {
			options = {
				paddingBottomRight:
				[
					calcRight(),
					$("div#ov48").height() + parseInt($("div#ovBar").css("bottom"))
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

		if ($("html body").hasClass(GLOBAL_CLASS_SMALL)) {
			offsetY = calcBottom()/2;
		} else {
			offsetX = calcRight()/2;
			offsetY = ($("div#ov48").height() + parseInt($("div#ovBar").css("bottom")))/2;
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


	function updateFilter()
	{

		clearBio();
		_selection = _recordsArtists;

		if ($.trim($("#search input").val()).length > 0) {
			$("html body").addClass(GLOBAL_CLASS_FILTER$TEXT);
			_selection = filterByText(_selection);
		} else {
			$("html body").removeClass(GLOBAL_CLASS_FILTER$TEXT);
		}

		_map.loadMarkers(_selection);

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

		function filterByText(recs)
		{
			return $.grep(
				recs, 
				function(value) {
					return value.getFirstName().toLowerCase().indexOf($("#search input").val().toLowerCase()) > -1 ||
							value.getLastName().toLowerCase().indexOf($("#search input").val().toLowerCase()) > -1;
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

		function loadList(recs)
		{
			$("#list").empty();
			$.each(
				recs, 
				function(index, value) {
					$("#list").append(
						$("<li>")
							.append($("<div>").addClass("thumb").css("background-image", "url('"+getPortrait(value.getFullName(), true)+"')"))
							.append($("<div>").addClass("info")
								.append($("<div>").text(value.getFirstName()+" "+value.getLastName()))
								.append($("<div>").text(value.getTradition() ? value.getTradition() : "Lorem ipsum"))								
								.append($("<div>").text(value.getAwardYear()+" | "+value.getLocationDisplayName()))
							)
							.attr("storymaps-id", value.getID())
					);
				}
			);

			$("#list li").click(onListEntryClick);

		}

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
		return $("html body").hasClass(GLOBAL_CLASS_SMALL) && 
			!$("#list-container").hasClass(LISTCONTAINER_CLASS_UP);
	}


})();