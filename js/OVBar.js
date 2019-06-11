function OVBar(div, objBounds)
{
	
	this._div = div;
	this._objBounds = objBounds;
	
	var _this = this;

	$.each(
		_this._objBounds, 
		function(key) {
			$(_this._div).append(
				$("<div>")
				.attr("id", key)
				.addClass("ov")
				.append($("<div>").addClass("veil"))
			);
		}
	);

	$($(_this._div).find("div.ov")).click(
		function(event) {
			$(_this).trigger(
				"tileClick", 
				[_this._objBounds[$(event.currentTarget).attr("id")]]
			);
		}
	);

}


OVBar.prototype.update = function(visibleBounds)
{
	
	var self = this;

	$($(this._div).find("div.ov")).removeClass("selected");
	
	var keys = Object.keys(this._objBounds);

	var overlaps = $.grep(
		keys,
		function(key){return L.latLngBounds(self._objBounds[key]).overlaps(visibleBounds);}
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
				return L.latLngBounds(self._objBounds[key]).getCenter().distanceTo(visibleBounds.getCenter());
			}
		}
	);

	var contains = $.grep(
		overlaps, 
		function(key){
			return L.latLngBounds(self._objBounds[key]).contains(visibleBounds.getCenter());
		}
	);

	var active = contains.length ? contains.shift() : overlaps.shift();

	if (active) {
		$($(this._div).find("div.ov#"+active)).addClass("selected");
	}

};
