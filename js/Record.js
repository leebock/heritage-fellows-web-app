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

Record.getFullName = function(obj)
{
	return obj[Record.FIELDNAME$FULLNAME];
};

Record.getAwardYear = function(obj)
{
	return obj[Record.FIELDNAME$AWARD_YEAR];
};

Record.getTradition = function(obj)
{
	return obj[Record.FIELDNAME$TRADITION];
};

Record.getQuotation = function(obj)
{
	return obj[Record.FIELDNAME$QUOTATION];
};

Record.getBio = function(obj)
{
	return obj[Record.FIELDNAME$BIO];
};

Record.FIELDNAME$ID = "ID";
Record.FIELDNAME$FIRSTNAME = "first_middle_name";
Record.FIELDNAME$LASTNAME = "last_name";
Record.FIELDNAME$FULLNAME = "full_name";
Record.FIELDNAME$TRADITION = "tradition";
Record.FIELDNAME$AWARD_YEAR = "award_year";
Record.FIELDNAME$X = "x";
Record.FIELDNAME$Y = "y";
Record.FIELDNAME$STANDARDIZED_LOCATION = "Standardized-Location";
Record.FIELDNAME$DISPLAY_NAME = "Location";
Record.FIELDNAME$QUOTATION = "quotation";
Record.FIELDNAME$BIO = "bio";
