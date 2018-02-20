function SummaryTable()
{

	this.createSummaryTable = function(recs)
	{

		var uniques = Helper.unique(
			$.map(
				recs, 
				function(value, index){return Record.getStandardizedLocation(value);}
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
						return Record.getStandardizedLocation(rec) === value;
					}
				);

				sumItem = {};
				sumItem[SummaryTable.FIELDNAME$STANDARDIZED_LOCATION] = value;
				sumItem[SummaryTable.FIELDNAME$FREQUENCY] = selected.length;
				sumItem[SummaryTable.FIELDNAME$DISPLAY_NAME] = Record.getLocationDisplayName(selected[0]);
				sumItem[SummaryTable.FIELDNAME$X] = Record.getX(selected[0]);
				sumItem[SummaryTable.FIELDNAME$Y] = Record.getY(selected[0]);
				sumItem[SummaryTable.FIELDNAME$ARTIST] = Record.getLastName(selected[0]);

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
