function RecordParser()
{
	
	this.getRecs = function(lines)
	{
		return parseRecs(lines);
	};
		
	function parseRecs(lines) 
	{
				
		var fields = lines[0];
		
		var values;
		var rec;
		var recs = [];

		for (var i = 1; i < lines.length; i++) {
			
			values = lines[i];
			if (values.length == 1) {
				break;
			}

			recs.push(createRec(fields, values));
	
		}	
		
		return recs;
	}

	function createRec(fields, values) 
	{
		rec = {};
		$.each(
			fields, 
			function(index, value) {
				rec[value.toLowerCase()] = values[getFieldIndex(value, fields)];
			}
		);
		return rec;
	}	
	
	function checkValue(value) 
	{
		return $.trim(value) === "" ? null : value;		
	}
	
	function getFieldIndex(name,fields) 
	{
		var idx = -1;
		$.each(fields,function(index,value){
			if (value.toUpperCase() == name.toUpperCase()) {
				idx = index;
				return false;
			}
		});
		return idx;
	}	
	
}