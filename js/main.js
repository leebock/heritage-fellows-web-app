(function () {

	"use strict";

	var SPREADSHEET_URL =  "/proxy/proxy.ashx?"+
							"https://docs.google.com/spreadsheets/d/18MqEBMFITG5Ar3J1coFEJam0mCls-X5d0ROGfDZfyvY/pub?gid=2064089691&single=true&output=csv";

	$(document).ready(function(){

		new Social().addClickEvents();
		$("body").append($("<h1>").html("Hello World!"));

		$.ajax({
			type: 'GET',
			url: SPREADSHEET_URL,
			cache: true,
			success: function(text) {

				var csv = new CSVService();
				csv.process(text);

				var recs = new RecordParser().getRecs(csv.getLines());
				$.each(
					recs, 
					function(index, value) {
						$("body").append($("<p>").html(value[Record.FIELDNAME_LOCATION]));
					}
				);

			}
		});

	});

})();