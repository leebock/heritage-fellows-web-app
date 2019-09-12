function SocialButtonBar()
{
	"use strict";

	var URL = encodeURIComponent("http://bit.ly/HeritageStoryMap");

	$(".social-button-bar")
		.append(
			$("<a>")
				.addClass("esri-link")
				.attr("href", "https://www.esri.com")
				.attr("target", "_blank")
				.append($("<img>").attr("src", "resources/logo-esri.png"))
		)
		.append(
			$("<a>")
				.attr("tabindex", "0")
				.append($("<i>").addClass("fa fa-facebook"))
				.click(shareFacebook)
				.keydown(
					function(event) {
						if (event.which !== 13) {
							return;
						}
						shareFacebook();
					}
				)			
		)
		.append(
			$("<a>")
				.attr("tabindex", "0")
				.append($("<i>").addClass("fa fa-twitter"))
				.click(shareTwitter)
				.keydown(
					function(event) {
						if (event.which !== 13) {
							return;
						}
						shareTwitter();
					}
				)			
		);

	function shareFacebook()
	{
		window.open(
			'http://www.facebook.com/sharer/sharer.php?u=' + URL,
			'',
			'toolbar=0,status=0,width=626,height=436'
		);
	}

	function shareTwitter()
	{
		var text = "Masters of Tradition: #NEAHeritage Fellows #StoryMap";
		var twitterOptions = 'text=' + encodeURIComponent(text) + 
		    '&url=' + URL	+ 
		    '&via=' + encodeURIComponent("SmithsonianFolk @NEAarts");
		window.open(
			'https://twitter.com/intent/tweet?' + twitterOptions,
			'Tweet',
			'toolbar=0,status=0,width=626,height=436'
		);
	}

}

SocialButtonBar.prototype = {};