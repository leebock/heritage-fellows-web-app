function ProfileDisplay(div) 
{
	this._div = div;
	var self = this;	
	$(this._div).find("a#arrow-left").click(
		function() {
			$(self).trigger("goPrevious");
		}
	);
	$(this._div).find("a#arrow-right").click(
		function() {
			$(self).trigger("goNext");
		}
	);
}

ProfileDisplay.prototype.update = function(rec, portrait, objectPhotos, audioSamples, videos)
{
	// accepts an instance of ArtistRecord

	$(this._div).find("h3#fellow-name").html(rec.getFirstName()+" "+rec.getLastName());
	$(this._div).find("h4#bio-tradition").html(rec.getTradition() ? rec.getTradition() : "Lorem Ipsum");
	$(this._div).find("h4#bio-awardyear").html(rec.getAwardYear()+" NEA National Heritage Fellow");
	$(this._div).find("h4#bio-placename").html(rec.getLocationDisplayName());

	var s = rec.getBio();
	if (s.trim() === "") {
		s = "Lorem ipsum dolor sit amet consectetur adipiscing elit cursus, felis quis porttitor risus mattis curae ullamcorper pellentesque, malesuada ridiculus tortor vulputate porta id justo. Maecenas metus rhoncus lacinia pretium vulputate dis primis sociosqu commodo sapien, dapibus dignissim mi mus penatibus ornare nisi fringilla laoreet venenatis, senectus sed ad tempor facilisis viverra vitae habitant rutrum. Suscipit velit libero est fermentum augue iaculis rhoncus himenaeos odio nullam parturient dignissim inceptos, a risus commodo curae turpis eleifend quam neque montes fringilla primis etiam.";
	}

	$(this._div).find("#scrollable").empty();

	var textarea = $("<div>").attr("id", "textarea")
		.append($("<img>").attr("id", "portrait").attr("src", portrait))
		.append($("<h5>").attr("id", "quotation").html(rec.getQuotation() ? rec.getQuotation() : "Gaudeamus igitur Iuvenes dum sumus. Post iucundam iuventutem. Post molestam senectutem. Nos habebit humus."))
		.append($("<p>").html(s));

	$(this._div).find("#scrollable").append(textarea);

	var gallery = $("<div>").attr("id", "gallery");
	$(this._div).find("#scrollable").append(gallery);

	$.each(
		objectPhotos, 
		function(index, recMedia) {
			$(gallery).append(
				$("<section>")
					.append($("<img>").attr("src", recMedia.getLink()))
					.append($("<p>").html(recMedia.getTitle()))
			);
		}
	);
	
	$.each(
		audioSamples,
		function(index, recMedia) {
			var audio = $("<audio>").addClass("player")
				.append($("<source>").attr("src", recMedia.getLink()))
				.on("play", onMediaPlay);
			audio.get(0).controls = true;
			audio.get(0).load();
			$(gallery).append(
				$("<section>")
					.append(audio)
					.append($("<p>").html("Audio Sample: "+recMedia.getTitle()))
			);
		}
	);
	
	$.each(
		videos,
		function(index, recMedia) {
			var div = $("<div>")
				.addClass("video-container")
				.attr("data-vimeo-id", recMedia.getLink());
			$(gallery).append(
				$("<section>")
					.append(div)
					.append($("<p>").html("Video Sample: "+recMedia.getTitle()))
			);
			new Vimeo.Player(div).on("play", onMediaPlay);
		}
	);
	
	var self = this;
		
	function onMediaPlay()
	{
		if (self._lastPlayed && self._lastPlayed !== this) {
			self._lastPlayed.pause();
		}
		self._lastPlayed = this;
	}

};

ProfileDisplay.prototype.empty = function() {
	$(this._div).find("#scrollable #gallery").empty();
};