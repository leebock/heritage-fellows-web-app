function Table(ul, portraitFunc)
{

	const LISTITEM_CLASS_ACTIVE = "active";

	var _self = this;

	this.load = function(recs, highlightText)
	{
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
					firstName = firstName.replace(RegExp(highlightText,"ig"), function(str) {return "<mark>"+str+"</mark>";});
					lastName = lastName.replace(RegExp(highlightText,"ig"), function(str) {return "<mark>"+str+"</mark>";});
					tradition = tradition.replace(RegExp(highlightText,"ig"), function(str) {return "<mark>"+str+"</mark>";});
					location = location.replace(RegExp(highlightText,"ig"), function(str) {return "<mark>"+str+"</mark>";});
					year = year.replace(RegExp(highlightText,"ig"), function(str) {return "<mark>"+str+"</mark>";});
				}
				$(ul).append(
					$("<li>")
						.append($("<div>").addClass("thumb").css("background-image", "url('"+portraitFunc(value.getFullName(), true)+"')"))
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

		$(ul).scrollTop(0);
		
	};

	this.activateItem = function(id)
	{
		$(
			$.grep(
				$(ul).find("li"), 
				function(value){return parseInt($(value).attr("storymaps-id")) === id;}
			).shift()
		)
		.addClass(LISTITEM_CLASS_ACTIVE);
	};

	this.clearActive = function()
	{
		$(ul).find("li").removeClass(LISTITEM_CLASS_ACTIVE);	 			
	};

}

Table.prototype.foo = "foo";