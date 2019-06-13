function ProfileDisplay(div) 
{
	this._div = div;	
}

ProfileDisplay.prototype.update = function(rec, portrait, objectPhotos, audioSamples, videos)
{
	// accepts an instance of ArtistRecord

	$(this._div).find("h3#fellow-name").text(rec.getFirstName()+" "+rec.getLastName());
	$(this._div).find("h4#bio-tradition").text(rec.getTradition() ? rec.getTradition() : "Lorem Ipsum");
	$(this._div).find("h4#bio-awardyear").text(rec.getAwardYear()+" NEA National Heritage Fellow");
	$(this._div).find("h4#bio-placename").text(rec.getLocationDisplayName());

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

	objectPhotos.forEach(
		function(recMedia) {
			$(gallery).append(
				$("<section>")
					.append($("<img>").attr("src", recMedia.getLink()))
					.append($("<p>").html(recMedia.getTitle()))
			);
		}
	);

	audioSamples.forEach(
		function(recMedia) {
			$(gallery).append(
				$("<section>")
					.append(
						$("<audio>").addClass("player")
						.append($("<source>").attr("src", recMedia.getLink()))
						.on("play", onMediaPlay)
					)
					.append($("<p>").html("Audio Sample: "+recMedia.getTitle()))
			);
		}
	);

	videos.forEach(
		function(recMedia, idx) {
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

	setTimeout(
		function(){
			var players = document.getElementsByClassName("player");
			for (var i = 0; i < players.length; i++) {
				players[i].controls = true;
				players[i].load();
			}
		}, 
		1000
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