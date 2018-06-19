function TextSearch()
{

	var _self = this;

	$("#search input").on("keyup", onInputKeyUp);	
	$("#search .x-button").click(onClear);	

	function onInputKeyUp()
	{
		var value = $("#search input").val();
		if ($.trim(value).length) {
			$("#search .x-button").css("visibility", "visible");
		} else {
			$("#search .x-button").css("visibility", "hidden");
		}
		$(_self).trigger("change", [value]);
	}

	function onClear()
	{
		$("#search .x-button").css("visibility", "hidden");
		$("#search input").val("");	
		$(_self).trigger("clear");
	}

}

TextSearch.prototype.foo = "foo";