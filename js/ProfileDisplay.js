function ProfileDisplay(div) 
{
	this.update = function(rec, portrait, objectPhotos, audioSamples, videos)
	{
		// accepts an instance of ArtistRecord

		$("#bio h3#fellow-name").text(rec.getFirstName()+" "+rec.getLastName());
		$("#bio h4#bio-tradition").text(rec.getTradition() ? rec.getTradition() : "Lorem Ipsum");
		$("#bio h4#bio-awardyear").text(rec.getAwardYear()+" NEA National Heritage Fellow");
		$("#bio h4#bio-placename").text(rec.getLocationDisplayName());

		var s = rec.getBio();
		if (s.trim() === "") {
			s = "Lorem ipsum dolor sit amet consectetur adipiscing elit cursus, felis quis porttitor risus mattis curae ullamcorper pellentesque, malesuada ridiculus tortor vulputate porta id justo. Maecenas metus rhoncus lacinia pretium vulputate dis primis sociosqu commodo sapien, dapibus dignissim mi mus penatibus ornare nisi fringilla laoreet venenatis, senectus sed ad tempor facilisis viverra vitae habitant rutrum. Suscipit velit libero est fermentum augue iaculis rhoncus himenaeos odio nullam parturient dignissim inceptos, a risus commodo curae turpis eleifend quam neque montes fringilla primis etiam.";
		}

		$("#bio #scrollable").empty();

		var textarea = $("<div>").attr("id", "textarea")
			.append($("<img>").attr("id", "portrait").attr("src", portrait))
			.append($("<h5>").attr("id", "quotation").html(rec.getQuotation() ? rec.getQuotation() : "Gaudeamus igitur Iuvenes dum sumus. Post iucundam iuventutem. Post molestam senectutem. Nos habebit humus."))
			.append($("<p>").html(s));

		$("#bio #scrollable").append(textarea);

		var gallery = $("<div>").attr("id", "gallery");
		$("#bio #scrollable").append(gallery);

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
						)
						.append($("<p>").html("Audio Sample: "+recMedia.getTitle()))
				);
			}
		);

		videos.forEach(
			function(recMedia) {
				$(gallery).append(
					$("<section>")
						.append(
							$("<div>").addClass("video-container")
								.append(
									$("<iframe>")
										.attr("src", "https://player.vimeo.com/video/"+recMedia.getLink())
										.attr("frameborder", 0)
										/*.attr("allowfullscreen", '')*/
								)
						)
						.append($("<p>").html("Video Sample: "+recMedia.getTitle()))
				);
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

	};
}

ProfileDisplay.prototype.foo = "foo";