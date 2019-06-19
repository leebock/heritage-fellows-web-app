function Table(ul, portraitFunc)
{

	const LISTITEM_CLASS_ACTIVE = "active";

	var _self = this;
		
	$(ul).focus(
		function() {
			$(ul).find("li").get(0).focus();
			$(ul).attr("tabindex", "-1");
		}
	);

	$(ul).keydown(
		function(e) {
			if (e.keyCode === 40 || e.keyCode === 38) {
				e.preventDefault();
				// look for an li element with focus
				var current = $(e.currentTarget).find("li:focus").get(0);
				$(current).attr("tabindex", "-1");
				var rows = $(e.currentTarget).find("li");
				var idx = $.inArray(current, rows);
				if (e.keyCode === 40) {
					if (idx < (rows.length - 1)) {
						idx++;
					}
				} else if (e.keyCode === 38) {
					if (idx > 0) {
						idx--;
					}
				}
				$(ul).find("li").get(idx).focus();
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
							"url('"+portraitFunc(value.getFullName(), true)+"')")
						)
						.append($("<div>").addClass("info")
							.append($("<div>").html(firstName+" "+lastName))
							.append($("<div>").html(tradition))								
							.append($("<div>").html(year+" | "+location))
						)
						.attr("storymaps-id", value.getID())
				);
			}
		);

		$(ul).find("li").click(
			function(e) {
				_self.clearActive();
				$(e.currentTarget).addClass(LISTITEM_CLASS_ACTIVE);
				$(_self).trigger(
					"itemActivate", 
					[parseInt($(e.currentTarget).attr("storymaps-id"))]
				);
			}
		);

		$(ul).find("li").keydown(
			function(e) {
				if (e.keyCode === 13) {
					_self.clearActive();
					$(e.currentTarget).addClass(LISTITEM_CLASS_ACTIVE);
					$(_self).trigger(
						"itemActivate", 
						[parseInt($(e.currentTarget).attr("storymaps-id"))]
					);
				}
			}
		);
		
		$(ul).find("li").focus(
			function(e) {
				$(e.currentTarget).attr("tabindex", "0");
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
		)
		.addClass(LISTITEM_CLASS_ACTIVE)
		.attr("tabindex", "0");
	};

	this.clearActive = function()
	{
		$(ul).find("li").removeClass(LISTITEM_CLASS_ACTIVE);	 			
	};

}

Table.prototype.foo = "foo";