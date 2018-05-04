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
				complete: function(data){_recordsArtists = data.data;finish();}
			}
		);

		Papa.parse(
			SPREADSHEET_URL_WORKS,
			{
				header: true,
				download: true,
				complete: function(data){_recordsWorks = data.data;finish();}
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

			var recs = $.grep(
				_recordsArtists,
				function(value) {
					return Record.getID(value) === parseArtist();
				}
			);

			if (recs.length > 0) {

				_active = recs[0];

				setBio(_active);
				showLocation(Record.getLocationDisplayName(_active), L.latLng(Record.getY(_active), Record.getX(_active)));

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

		_filterLocation = e.layer.properties[SummaryTable.FIELDNAME$STANDARDIZED_LOCATION];
		_filterDisplayName = e.layer.properties[SummaryTable.FIELDNAME$DISPLAY_NAME];
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
				return Record.getID(value) === parseInt($(e.currentTarget).attr("storymaps-id"));
			}
		)[0];

		setBio(_active);

		if ($("html body").hasClass(GLOBAL_CLASS_SMALL)) {
			if (!_filterLocation || isListRetracted()) {
				// todo: pass keepZoom if current zoom is less than flyTo zoom?
				showLocation(Record.getLocationDisplayName(_active), L.latLng(Record.getY(_active), Record.getX(_active)));
			} else {
				// do nothing
			}
		} else {
			showLocation(Record.getLocationDisplayName(_active), L.latLng(Record.getY(_active), Record.getX(_active)));
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
					return Record.getFirstName(value).toLowerCase().indexOf($("#search input").val().toLowerCase()) > -1 ||
							Record.getLastName(value).toLowerCase().indexOf($("#search input").val().toLowerCase()) > -1;
				}
			);
		}

		function filterByLocation(recs)
		{
			return $.grep(
				recs, 
				function(value, index) {
					return Record.getStandardizedLocation(value) === _filterLocation;
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
							.append($("<div>").addClass("thumb").css("background-image", "url('"+getPortrait(Record.getFullName(value), true)+"')"))
							.append($("<div>").addClass("info")
								.append($("<div>").text(Record.getFirstName(value)+" "+Record.getLastName(value)))
								.append($("<div>").text(Record.getTradition(value) ? Record.getTradition(value) : "Lorem ipsum"))								
								.append($("<div>").text(Record.getAwardYear(value)+" | "+Record.getLocationDisplayName(value)))
							)
							.attr("storymaps-id", Record.getID(value))
					);
				}
			);

			$("#list li").click(onListEntryClick);

		}

	}

	function setBio(rec) {

		$("html body").addClass(GLOBAL_CLASS_BIO);
		$("#bio h3#fellow-name").text(Record.getFirstName(rec)+" "+Record.getLastName(rec));
		$("#bio h4#bio-tradition").text(Record.getTradition(rec) ? Record.getTradition(rec) : "Lorem Ipsum");
		$("#bio h4#bio-awardyear").text(Record.getAwardYear(rec)+" NEA National Heritage Fellow");
		$("#bio h4#bio-placename").text(Record.getLocationDisplayName(rec));

		var s = Record.getBio(rec);
		if (s.trim() === "") {
			s = "Lorem ipsum dolor sit amet consectetur adipiscing elit cursus, felis quis porttitor risus mattis curae ullamcorper pellentesque, malesuada ridiculus tortor vulputate porta id justo. Maecenas metus rhoncus lacinia pretium vulputate dis primis sociosqu commodo sapien, dapibus dignissim mi mus penatibus ornare nisi fringilla laoreet venenatis, senectus sed ad tempor facilisis viverra vitae habitant rutrum. Suscipit velit libero est fermentum augue iaculis rhoncus himenaeos odio nullam parturient dignissim inceptos, a risus commodo curae turpis eleifend quam neque montes fringilla primis etiam.";
		}

		$("#bio #scrollable").empty();

		var textarea = $("<div>").attr("id", "textarea")
			.append($("<div>").attr("id", "portrait").css("background-image", "url('"+getPortrait(Record.getFullName(rec))+"')"))
			.append($("<h5>").attr("id", "quotation").html(Record.getQuotation(rec) ? Record.getQuotation(rec) : "Gaudeamus igitur Iuvenes dum sumus. Post iucundam iuventutem. Post molestam senectutem. Nos habebit humus."))
			.append($("<p>").html(s));

		$("#bio #scrollable").append(textarea);
		var gallery = $("<div>").attr("id", "gallery");
		$("#bio #scrollable").append(gallery);

		if (Record.getID(rec) === 1) {

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

		if (Record.getID(rec) === 346) {
			$(gallery).append($("<img>").attr("src", "resources/images/secord-basket-thumb.jpg"));
			$(gallery).append($("<img>").attr("src", "resources/images/secord-four-baskets-thumb.jpg"));
		}
		
		$("#bio #scrollable").animate({scrollTop: 0}, 'slow');
		$("#list-container").addClass(LISTCONTAINER_CLASS_UP);

	}

	function getPortrait(artistName, thumbNail)
	{

		const PLACEHOLDER_PORTRAIT = "resources/no-image.gif";	

		const FIELDNAME_WORKS$ARTIST = "Artist-id";
		const FIELDNAME_WORKS$MEDIA_TYPE = "Media-type";
		const FIELDNAME_WORKS$LINK = "Link";
		const FIELDNAME_WORKS$THUMBNAIL = "Thumbnail";

		var portrait = PLACEHOLDER_PORTRAIT;

		var works = $.grep(
			_recordsWorks, 
			function(value) {
				return value[FIELDNAME_WORKS$ARTIST] === artistName;
			}
		);

		if (works.length) {
			var portraits = $.grep(
				works, 
				function(value) {
					return value[FIELDNAME_WORKS$MEDIA_TYPE].toLowerCase() === "portrait";
				}
			);

			if (portraits.length) {
				portrait = thumbNail ? 
						   portraits[0][FIELDNAME_WORKS$THUMBNAIL] : 
						   portraits[0][FIELDNAME_WORKS$LINK];
			}
		}

		return portrait;

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
					Record.getFirstName(_active)+" "+Record.getLastName(_active)+
					" and all of our other amazing NEA National Heritage Fellows.";

		var url = window.location.href.split("?")[0]+"?id="+Record.getID(_active).toString();

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