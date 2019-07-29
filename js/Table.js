function Table(ul)
{

	var _self = this;
		
	$(ul).focus(
		function() {
			var current = $(ul).children("li[tabindex='0']");
			if (!current.length) {
				current = $(ul).children("li:nth-of-type(1)").attr("tabindex", "0");
			}
			// removed call current.focus() because it was interfering with 
			// scrollbar mechanics.
			$(ul).attr("tabindex", "-1");
		}
	);

	$(ul).keydown(
		function(e) {
			if (e.keyCode === 40 || e.keyCode === 38) {
				e.preventDefault();
				// look for an li element with focus
				var current = $(ul).children("li:focus").attr("tabindex", "-1").get(0);
				var rows = $(ul).children("li");
				var idx = $.inArray(current, rows);
				idx = e.keyCode === 40 ? 
					(idx < rows.length - 1 ? idx+1 : idx) : 
					(idx > 0 ? idx-1 : idx);
				$(ul).children("li:nth-of-type("+(idx+1)+")")
					.attr("tabindex", "0")
					.focus();
			}
		}
	);

	this.load = function(recs, highlightText)
	{
		$(ul).attr("tabindex", "0");
		$(ul).empty();
		$.each(
			recs, 
			function(index, value) {
				var firstName = value.getFirstName();
				var lastName = value.getLastName();
				var tradition = value.getTradition() ? value.getTradition() : "Lorem ipsum";
				var location = value.getLocationDisplayName();
				var year = value.getAwardYear();
				if (highlightText) {
					firstName = firstName.replace(
						RegExp(highlightText,"ig"), 
						function(str) {return "<mark>"+str+"</mark>";}
					);
					lastName = lastName.replace(
						RegExp(highlightText,"ig"), 
						function(str) {return "<mark>"+str+"</mark>";}
					);
					tradition = tradition.replace(
						RegExp(highlightText,"ig"), 
						function(str) {return "<mark>"+str+"</mark>";}
					);
					location = location.replace(
						RegExp(highlightText,"ig"), 
						function(str) {return "<mark>"+str+"</mark>";}
					);
					year = year.replace(
						RegExp(highlightText,"ig"), 
						function(str) {return "<mark>"+str+"</mark>";}
					);
				}
				$(ul).append(
					$("<li>")
						.attr("tabindex", "-1")
						.append($("<div>").addClass("thumb").css(
							"background-image", 
							"url('"+value.getPortrait().getThumbnail()+"')")
						)
						.append($("<div>").addClass("info")
							.append(
								$("<div>").html(
									firstName+" "+
									lastName+
									(value.getLivingStatus() ? "" : " *")
								)
							)
							.append($("<div>").html(tradition))								
							.append($("<div>").html(year+" | "+location))
						)
						.attr("storymaps-id", value.getID())
				);
			}
		);

		$(ul).find("li").click(
			function(e) {
				$(ul).children("li").attr("tabindex", "-1");
				$(e.currentTarget).attr("tabindex", "0");
				$(_self).trigger(
					"itemActivate", 
					[parseInt($(e.currentTarget).attr("storymaps-id"))]
				);
			}
		);

		$(ul).find("li").keydown(
			function(e) {
				if (e.keyCode === 13) {
					$(ul).children("li").attr("tabindex", "-1");
					$(e.currentTarget).attr("tabindex", "0");
					$(_self).trigger(
						"itemActivate", 
						[parseInt($(e.currentTarget).attr("storymaps-id"))]
					);
				}
			}
		);

		$(ul).scrollTop(0);
		
	};

	this.activateItem = function(id)
	{
		$(ul).children("li").attr("tabindex", "-1");
		$(
			$.grep(
				$(ul).find("li"), 
				function(value){return parseInt($(value).attr("storymaps-id")) === id;}
			).shift()
		).attr("tabindex", "0");
	};


}

Table.prototype.foo = "foo";