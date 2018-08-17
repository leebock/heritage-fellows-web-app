function OVBar(_div, BNDS)
{

	var _this = this;

	$.each(
		BNDS, 
		function(key) {
			$(_div).append(
				$("<div>")
				.attr("id", key)
				.addClass("ov")
				.append($("<div>").addClass("veil"))
			);
		}
	);

	$($(_div).find("div.ov")).click(
		function(event) {
			$(_this).trigger(
				"tileClick", 
				[BNDS[$(event.currentTarget).attr("id")]]
			);
		}
	);

	this.update = function(visibleBounds)
	{

		$($(_div).find("div.ov")).removeClass("selected");
		
		var keys = Object.keys(BNDS);

		var overlaps = $.grep(
			keys,
			function(key){return L.latLngBounds(BNDS[key]).overlaps(visibleBounds);}
		).sort(
			function(a, b) {
				var distanceA = calcDist(a);
				var distanceB = calcDist(b);
				if (distanceA < distanceB) {
					return -1;
				}
				if (distanceA > distanceB) {
					return 1;
				}
				return 0;
				function calcDist(key) {
					return L.latLngBounds(BNDS[key]).getCenter().distanceTo(visibleBounds.getCenter());
				}
			}
		);

		var contains = $.grep(
			overlaps, 
			function(key){
				return L.latLngBounds(BNDS[key]).contains(visibleBounds.getCenter());
			}
		);

		var active = contains.length ? contains.shift() : overlaps.shift();

		if (active) {
			$($(_div).find("div.ov#"+active)).addClass("selected");
		}

	};

}

OVBar.foo = "foo";