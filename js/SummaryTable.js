function SummaryTable()
{

	this.createSummaryTable = function(recs, fieldX, fieldY, fieldStandardizedLocation, fieldDisplayName)
	{

		var uniques = Helper.unique(
			$.map(
				recs, 
				function(value, index){return value[fieldStandardizedLocation];}
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
						return rec[fieldStandardizedLocation] === value;
					}
				);

				sumItem = {};
				sumItem[SummaryTable.FIELDNAME$STANDARDIZED_LOCATION] = value;
				sumItem[SummaryTable.FIELDNAME$FREQUENCY] = selected.length;
				sumItem[SummaryTable.FIELDNAME$DISPLAY_NAME] = selected[0][fieldDisplayName];
				sumItem[SummaryTable.FIELDNAME$X] = selected[0][fieldX];
				sumItem[SummaryTable.FIELDNAME$Y] = selected[0][fieldY];

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
