function TextSearch()
{

	this._lastValue = "";
	var _self = this;

	$("#search input").on("keyup", onInputKeyUp);	
	$("#search .x-button").click(onClear);	

	function onInputKeyUp()
	{
		var value = $("#search input").val();
		if (value === _self._lastValue) {
			return;
		}
		if ($.trim(value).length) {
			$("#search .x-button").css("visibility", "visible");
		} else {
			$("#search .x-button").css("visibility", "hidden");
		}
		_self._lastValue = value;
		$(_self).trigger("change", [value]);
	}

	function onClear()
	{
		$("#search .x-button").css("visibility", "hidden");
		$("#search input").val("");
		_self._lastValue = "";	
		$(_self).trigger("clear");
	}

}

TextSearch.prototype.clear = function() {
	$("#search .x-button").css("visibility", "hidden");
	$("#search input").val("");	
	this._lastValue = "";	
};