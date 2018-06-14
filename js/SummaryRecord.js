function SummaryRecord(standardizedLocation, latLng, displayName, frequency, artist)
{
	this._standardizedLocation = standardizedLocation;
	this._latLng = latLng;
	this._displayName = displayName;
	this._frequency = frequency;
	this._artist = artist;
}

SummaryRecord.prototype.getArtist = function()
{
	return this._artist;
};

SummaryRecord.prototype.getDisplayName = function()
{
	return this._displayName;
};

SummaryRecord.prototype.getFrequency = function()
{
	return this._frequency;
};

SummaryRecord.prototype.getLatLng = function()
{
	return this._latLng;
};

SummaryRecord.prototype.getStandardizedLocation = function()
{
	return this._standardizedLocation;
};
