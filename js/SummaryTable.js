function SummaryTable()
{

	this.createSummaryTable = function(recs)
	{

		var uniques = Helper.unique(
			$.map(
				recs, 
				function(value, index){return value.getStandardizedLocation();}
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
						return rec.getStandardizedLocation() === value;
					}
				);

				sumItem = {};
				sumItem[SummaryTable.FIELDNAME$STANDARDIZED_LOCATION] = value;
				sumItem[SummaryTable.FIELDNAME$FREQUENCY] = selected.length;
				sumItem[SummaryTable.FIELDNAME$DISPLAY_NAME] = selected[0].getLocationDisplayName();
				sumItem[SummaryTable.FIELDNAME$X] = selected[0].getX();
				sumItem[SummaryTable.FIELDNAME$Y] = selected[0].getY();
				sumItem[SummaryTable.FIELDNAME$ARTIST] = selected[0].getLastName();

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
