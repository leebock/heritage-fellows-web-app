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
	
	const OV_MAPS = [
		{
			"name": "48",
			"imageURL": "resources/images/ov-48.png",
			"bnds": [[25, -126],[49,-65]]
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
	var _bio;
	var _table;
	var _textSearchWidget;

	var _recordsArtists;			
	var _recordsWorks;	
	var _selection; /* record set that appears in the table */
	var _active;

	$(document).ready(function() {

		_bio = $(new Bio($("div#bio")))
			.on("goNext", function(){step();})
			.on("goPrevious", function(){step(true);})
			.get(0);

		if (!L.Browser.mobile) {
			$("html body").addClass(GLOBAL_CLASS_HOVER);
		}	

		$("html body").keydown(function(event){
			if ($("html body").hasClass(GLOBAL_CLASS_BIO))
			{
				if (event.which === 27) {
					clearBio();
					_map.flyToBounds(OV_MAPS[0].bnds);
					$("ul#list").children("li[tabindex='0']").focus();
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

		$("div.banner a#title").attr(
			"href", 
			window.location.href.toLowerCase().indexOf("storymaps.esri.com") >= 0 ?
				"../" :
				"../app-landing-2"
		); 

		_map = new L.HFMap(
			"map", 
			{zoomControl: !L.Browser.mobile, maxZoom: 12, minZoom: 2, worldCopyJump: true},
			getPaddingBottomRight
		)
			.addLayer(L.esri.basemapLayer("NationalGeographic"))
			.on("click", onMapClick)
			.on("markerClick", onMarkerClick)
			.on("moveend", onExtentChange);

		if (!L.Browser.mobile) {
			L.easyButton(
				"fa fa-home", 
				function(btn, map){_map.flyToBounds(OV_MAPS[0].bnds);}
			).addTo(_map);
		}

		_textSearchWidget = $(new TextSearch())
		.on("change", onTextSearchChange)
		.on("clear", onTextSearchClear).get(0);

 		_table = $(new Table($("ul#list").get(0))).on("itemActivate", table_onItemActivate).get(0);

		$(".filter-display-location .x-button").click(clearLocationFilter);
		$("#bio .x-button").click(function(){
			clearBio();
			_map.flyToBounds(OV_MAPS[0].bnds);
			$("ul#list").children("li[tabindex='0']").focus();
			if (_selection && _selection.length === 1 && _filterLocation) {
				clearLocationFilter();
			} else {
				clearActive();
			}
		});

		$("#bio a.fa.fa-link").click(copyLink);
		$("#bio a.fa.fa-facebook").click(facebookBio);
		$("#bio a.fa.fa-twitter").click(tweetBio);

		$("#button-show").click(
			function(){
				$("#list-container").toggleClass(LISTCONTAINER_CLASS_UP);
			}
		);

		_ovBar = new OVBar($("div#ovBar"), OV_MAPS);
		$(_ovBar).on("tileClick", function(event, bnds){_map.flyToBounds(bnds);});

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
			
			$.each(
				_recordsArtists, 
				function(index, artist) {
					artist.setMedia(
						$.grep(
							_recordsWorks, 
							function(media) {
								return media.getArtistID() === artist.getFullName();
							}
						)					
					);
				}
			);

			_map.fitBounds(OV_MAPS[0].bnds);
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
		_ovBar.update(_map.getUsableBounds()); // pass visible bounds
	}

	function clearActive()
	{
		if (!_filterLocation) {
			_map.closePopup();	
		}
	}

	function clearBio()
	{
		$("html body").removeClass(GLOBAL_CLASS_BIO);
		_bio.empty();
	}

	function step(back)
	{
		var index = $.inArray(_active, _selection);
		if (back) {
			index = index === 0 ? _selection.length - 1 : index-1;
		} else {
			index = index === _selection.length -1 ? 0 : index+1;
		}
		_active = _selection[index];
		setBio(_active);
		_table.activateItem(_active.getID());		
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

	function table_onItemActivate(event, id)
	{

		_active = $.grep(
			_recordsArtists,
			function(value) {
				return value.getID() === id;
			}
		)[0];

		setTimeout(
			function(){
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
			}, 
			L.Browser.mobile ? 300 : 1
		);

	}
	
	/***************************************************************************
	******************************** FUNCTIONS *********************************
	***************************************************************************/

	function getPaddingBottomRight()
	{
		var compact = $(window).width() < WIDTH_THRESHOLD;
		return [
			compact ? 0 : calcRight(), 
			compact ? 
			calcBottom() :
			$("div#ovBar").height() + parseInt($("div#ovBar").css("bottom"))
		];

		/* note: calcRight and calcBottom provide calculated #list-container 
				 dimensions instead of querying the actual width/height.  this is 
				 because the getPaddingBottomRight function can fire while the 
				 #list-container is in the process of growing/shrinking via css transition.  
				 so the actual dimensions may be in flux. */
				 
		function calcRight()
		{	
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

	}

	function setBio(recArtist) {
		$("html body").addClass(GLOBAL_CLASS_BIO);
		_bio.update(recArtist, _selection.length > 1);
		$("#bio #scrollable").animate({scrollTop: 0}, 'slow');
		$("#bio #scrollable").get(0).focus();		
		$("#list-container").addClass(LISTCONTAINER_CLASS_UP);
	}

	function showLocation(label, ll, keepZoom)
	{
		if (keepZoom) {
			_map.panTo(ll, {animate: true, duration: 1});
		} else {
			_map.flyToBounds(ll.toBounds(500000));
		}
		_map.openPopup(label, ll, {closeButton: false});
	}

	function copyLink()
	{
		var url = window.location.href.split("?")[0]+"?id="+_active.getID().toString();
		navigator.clipboard.writeText(url);
		alert("Copied to clipboard!");
	}
	
	function facebookBio()
	{

		var text = "Celebrating the work of "+
					_active.getFirstName()+" "+_active.getLastName()+
					" and other amazing NEA Heritage Fellows:";
		FB.ui(
            {
                method: "share",
                href: window.location.href.split("?")[0]+"?id="+_active.getID().toString(),
                quote: text
            }, 
            function(response) {
                console.log(response);
            }
        );
		
	}

	function tweetBio()
	{

		var text = "Celebrating the work of "+
					_active.getFirstName()+" "+_active.getLastName()+
					" and other amazing #NEAHeritage Fellows:";

		var url = window.location.href.split("?")[0]+"?id="+_active.getID().toString();

		var twitterOptions = 'text=' + encodeURIComponent(text) + 
		    '&url=' + encodeURIComponent(url)+ 
		    '&via=' + encodeURIComponent("SmithsonianFolk @NEAarts") + 
		    "&hashtags=StoryMap";

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