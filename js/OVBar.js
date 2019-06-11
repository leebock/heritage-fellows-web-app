function OVBar(div, config)
{
	
	this._div = div;
	this._lookUp = config.reduce(
		function(accumulator, value) {
			accumulator[value.name] = value.bnds;
			return accumulator;
		},
		{}
	);
	
	var self = this;

	$.each(
		config, 
		function(idx, val) {
			$(self._div).append(
				$("<div>")
				.attr("name", val.name)
				.css("background-image", "url('"+val.imageURL+"')")
				.addClass("ov")
				.append($("<div>").addClass("veil"))
			);
		}
	);

	$($(div).find("div.ov")).click(
		function(event) {
			$(self).trigger(
				"tileClick", 
				[
					self._lookUp[$(event.currentTarget).attr("name")]
				]
			);
		}
	);

}


OVBar.prototype.update = function(visibleBounds)
{
	
	var lookUp = this._lookUp;
	var ovs = $(this._div).find("div.ov");
	
	$(ovs).removeClass("selected");
	
	var overlaps = $.grep(
		Object.keys(lookUp),
		function(key){return L.latLngBounds(lookUp[key]).overlaps(visibleBounds);}
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
				return L.latLngBounds(lookUp[key]).getCenter().distanceTo(visibleBounds.getCenter());
			}
		}
	);

	var contains = $.grep(
		overlaps, 
		function(key){
			return L.latLngBounds(lookUp[key]).contains(visibleBounds.getCenter());
		}
	);

	var active = contains.length ? contains.shift() : overlaps.shift();
	
	$(
		$.grep(
			ovs,
			function(value, index) {
				return $(value).attr("name") === active;
			}
		)
	).addClass("selected");
};
