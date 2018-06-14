function SummaryTable()
{

	this.createSummaryTable = function(recs)
	{

		var uniques = $.map(
			recs, 
			function(value, index){return value.getStandardizedLocation();}
		)
			.sort()
			.reduce(
				function(accumulator, current) {
		    		const length = accumulator.length;
				    if (length === 0 || accumulator[length - 1] !== current) {
				        accumulator.push(current);
				    }
				    return accumulator;
				}, 
				[]
			);


		var table = [];
		var selected;

		$.each(
			uniques, 
			function(index, value) {

				selected = $.grep(
					recs, 
					function(rec, idx) {
						return rec.getStandardizedLocation() === value;
					}
				);

				table.push(
					new SummaryRecord(
						value, 
						selected[0].getLatLng(),
						selected[0].getLocationDisplayName(),
						selected.length,
						selected[0].getLastName()						
					)
				);

			}
		);

		table.sort(function(a, b){return b.getFrequency()-a.getFrequency();});

		return table;

	};

}

SummaryTable.prototype.foo = "foo";