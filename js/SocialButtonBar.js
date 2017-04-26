function SocialButtonBar()
{

	/**
	* Social Sharing
	* @class Social Sharing
	*
	* Collection of methods to share app with social media sites
	*
	* Dependencies: Jquery 1.11
	*/

	"use strict";

	$(".social-button-bar")
		.append(
			$("<a>")
				.addClass("story-map-link")
				.attr("href", "//storymaps.arcgis.com")
				.attr("target", "_blank")
				.text("A Story Map")
		)
		.append(
			$("<a>").append($("<i>").addClass("fa fa-facebook"))
		)
		.append(
			$("<a>").append($("<i>").addClass("fa fa-twitter"))
		);

	var _page = {
		title: encodeURIComponent($('meta[property="og:title"]').attr('content')),
		summary: encodeURIComponent($('meta[property="og:description"]').attr('content')),
		url: encodeURIComponent($('meta[property="og:url"]').attr('content')),
		thumbnail: encodeURIComponent($('meta[property="og:image"]').attr('content')),
		twitterText: encodeURIComponent($('meta[property="og:title"]').attr('content')),
		twitterHandle: encodeURIComponent($('meta[name="twitter:site"]').attr('content').replace('@',''))
	};

	var _shareOptions = {
		title: _page.title,
		summary: _page.summary,
		url: _page.url,
		thumbnail: _page.thumbnail,
		twitterText: _page.twitterText,
		twitterHandle: _page.twitterHandle,
		hashtags: 'storymap'
	};

	$("a i.fa.fa-facebook").click(
		function() {
			var facebookOptions = '&p[title]=' + 
			    _shareOptions.title + '&p[summary]=' + 
			    _shareOptions.summary + '&p[url]=' + 
			    _shareOptions.url + '&p[image]=' + 
			    _shareOptions.thumbnail;

			window.open(
				'http://www.facebook.com/sharer/sharer.php?s=100' + facebookOptions,
				'',
				'toolbar=0,status=0,width=626,height=436'
			);

		}
	);

	$("a i.fa.fa-twitter").click(
		function() {
			var twitterOptions = 'text=' + _shareOptions.twitterText + 
			    '&url=' + _shareOptions.url	+ 
			    '&via=' + _shareOptions.twitterHandle + 
			    '&hashtags=' + _shareOptions.hashtags;

			window.open(
				'https://twitter.com/intent/tweet?' + twitterOptions,
				'Tweet',
				'toolbar=0,status=0,width=626,height=436'
			);
		}
	);

}

SocialButtonBar.prototype = {};