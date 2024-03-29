function OVBar(div, config)
{

	/* create a picture for each overview in the config */

	$.each(
		config, 
		function(idx, val) {
			$(div).append(
				$("<a>")
				.attr("name", val.name)
				.attr("href", "#")
				.css("background-image", "url('"+val.imageURL+"')")
				.addClass("ov")
				.append($("<div>").addClass("veil"))
			);
		}
	);
	
	/* keep this info around for further use.  now that assigning images
	   is out of the way, _lookUp is a more usable version of the extent 
	   info going forward. */
	
	this._ovs = $(div).children("a.ov");
	this._lookUp = config.reduce(
		function(accumulator, value) {
			accumulator[value.name] = value.bnds;
			return accumulator;
		},
		{}
	);
	
	var self = this;
	
	$(this._ovs).click(
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
	var ovs = this._ovs;
	
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
