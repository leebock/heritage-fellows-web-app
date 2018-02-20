function Record()
{
	
}

Record.getID = function(obj)
{
	return parseInt(obj[Record.FIELDNAME$ID]);
};

Record.getStandardizedLocation = function(obj)
{
	return obj[Record.FIELDNAME$STANDARDIZED_LOCATION];
};

Record.getX = function(obj)
{
	return obj[Record.FIELDNAME$X];
};

Record.getY = function(obj)
{
	return obj[Record.FIELDNAME$Y];
};

Record.getLocationDisplayName = function(obj)
{
	return obj[Record.FIELDNAME$DISPLAY_NAME];
};

Record.getFirstName = function(obj)
{
	return obj[Record.FIELDNAME$FIRSTNAME];
};

Record.getLastName = function(obj)
{
	return obj[Record.FIELDNAME$LASTNAME];
};

Record.getAwardYear = function(obj)
{
	return obj[Record.FIELDNAME$AWARD_YEAR];
};

Record.FIELDNAME$ID = "artist_id";
Record.FIELDNAME$FIRSTNAME = "first_middle_name";
Record.FIELDNAME$LASTNAME	= "last_name";
/*var FIELDNAME$TRADITION = "tradition";*/
Record.FIELDNAME$AWARD_YEAR = "award_year";
Record.FIELDNAME$X = "x";
Record.FIELDNAME$Y = "y";
Record.FIELDNAME$STANDARDIZED_LOCATION = "Standardized-Location";
Record.FIELDNAME$DISPLAY_NAME = "Display-Name";