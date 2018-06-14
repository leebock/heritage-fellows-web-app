function ArtistRecord(obj)
{
	this._obj = obj;
}

ArtistRecord.FIELDNAME$ID = "ID";
ArtistRecord.FIELDNAME$FIRSTNAME = "first_middle_name";
ArtistRecord.FIELDNAME$LASTNAME = "last_name";
ArtistRecord.FIELDNAME$FULLNAME = "full_name";
ArtistRecord.FIELDNAME$TRADITION = "tradition";
ArtistRecord.FIELDNAME$AWARD_YEAR = "award_year";
ArtistRecord.FIELDNAME$X = "x";
ArtistRecord.FIELDNAME$Y = "y";
ArtistRecord.FIELDNAME$STANDARDIZED_LOCATION = "Standardized-Location";
ArtistRecord.FIELDNAME$DISPLAY_NAME = "Location";
ArtistRecord.FIELDNAME$QUOTATION = "quotation";
ArtistRecord.FIELDNAME$BIO = "bio";

ArtistRecord.prototype.getAwardYear = function()
{
	return this._obj[ArtistRecord.FIELDNAME$AWARD_YEAR];
};

ArtistRecord.prototype.getBio = function()
{
	return this._obj[ArtistRecord.FIELDNAME$BIO];
};

ArtistRecord.prototype.getFirstName = function()
{
	return this._obj[ArtistRecord.FIELDNAME$FIRSTNAME];
};

ArtistRecord.prototype.getFullName = function()
{
	return this._obj[ArtistRecord.FIELDNAME$FULLNAME];
};

ArtistRecord.prototype.getID = function()
{
	return parseInt(this._obj[ArtistRecord.FIELDNAME$ID]);
};

ArtistRecord.prototype.getLastName = function()
{
	return this._obj[ArtistRecord.FIELDNAME$LASTNAME];
};

ArtistRecord.prototype.getLatLng = function()
{
	return L.latLng(this._obj[ArtistRecord.FIELDNAME$Y], this._obj[ArtistRecord.FIELDNAME$X]);
};

ArtistRecord.prototype.getLocationDisplayName = function()
{
	return this._obj[ArtistRecord.FIELDNAME$DISPLAY_NAME];
};

ArtistRecord.prototype.getQuotation = function()
{
	return this._obj[ArtistRecord.FIELDNAME$QUOTATION];
};

ArtistRecord.prototype.getStandardizedLocation = function()
{
	return this._obj[ArtistRecord.FIELDNAME$STANDARDIZED_LOCATION];
};

ArtistRecord.prototype.getTradition = function()
{
	return this._obj[ArtistRecord.FIELDNAME$TRADITION];
};