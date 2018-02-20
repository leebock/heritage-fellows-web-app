function SummaryTable()
{

	this.createSummaryTable = function(recs)
	{

		var uniques = Helper.unique(
			$.map(
				recs, 
				function(value, index){return value[Record.FIELDNAME$STANDARDIZED_LOCATION];}
			)
		);

		var table = [];
		var selected;
		var sumItem;

		$.each(
			uniques, 
			function(index, value) {

				selected = $.grep(
					recs, 
					function(rec, idx) {
						return rec[Record.FIELDNAME$STANDARDIZED_LOCATION] === value;
					}
				);

				sumItem = {};
				sumItem[SummaryTable.FIELDNAME$STANDARDIZED_LOCATION] = value;
				sumItem[SummaryTable.FIELDNAME$FREQUENCY] = selected.length;
				sumItem[SummaryTable.FIELDNAME$DISPLAY_NAME] = selected[0][Record.FIELDNAME$DISPLAY_NAME];
				sumItem[SummaryTable.FIELDNAME$X] = selected[0][Record.FIELDNAME$X];
				sumItem[SummaryTable.FIELDNAME$Y] = selected[0][Record.FIELDNAME$Y];
				sumItem[SummaryTable.FIELDNAME$ARTIST] = selected[0][Record.FIELDNAME$LASTNAME];

				table.push(sumItem);

			}
		);

		table.sort(function(a, b){return b[SummaryTable.FIELDNAME$FREQUENCY]-a[SummaryTable.FIELDNAME$FREQUENCY];});

		return table;

	};


}

SummaryTable.FIELDNAME$FREQUENCY = "frequency";
SummaryTable.FIELDNAME$STANDARDIZED_LOCATION = "standardized-location";
SummaryTable.FIELDNAME$DISPLAY_NAME = "display-name";
SummaryTable.FIELDNAME$X = "x";
SummaryTable.FIELDNAME$Y = "y";
SummaryTable.FIELDNAME$ARTIST = "artist";
