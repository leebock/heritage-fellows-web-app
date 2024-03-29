function MediaRecord(obj)
{
	this._obj = obj;	
}

MediaRecord.FIELDNAME_WORKS$ARTIST_ID = "Artist-id";
MediaRecord.FIELDNAME_WORKS$MEDIA_TYPE = "Media-type";
MediaRecord.FIELDNAME_WORKS$TITLE = "Title";
MediaRecord.FIELDNAME_WORKS$LINK = "Link";
MediaRecord.FIELDNAME_WORKS$THUMBNAIL = "Thumbnail";
MediaRecord.FIELDNAME_WORKS$DISPLAY_ORDER = "Display Order";

MediaRecord.prototype.getArtistID = function()
{
	return this._obj[MediaRecord.FIELDNAME_WORKS$ARTIST_ID];
};

MediaRecord.prototype.getThumbnail = function()
{
	return this._obj[MediaRecord.FIELDNAME_WORKS$THUMBNAIL];	
};

MediaRecord.prototype.getLink = function()
{
	return this._obj[MediaRecord.FIELDNAME_WORKS$LINK];
};

MediaRecord.prototype.getDisplayOrder = function()
{
	return this._obj[MediaRecord.FIELDNAME_WORKS$DISPLAY_ORDER];	
};

MediaRecord.prototype.getTitle = function()
{
	return this._obj[MediaRecord.FIELDNAME_WORKS$TITLE];
};

MediaRecord.prototype.isAudio = function()
{
	return this._obj[MediaRecord.FIELDNAME_WORKS$MEDIA_TYPE] === "Audio";
};

MediaRecord.prototype.isObjectPhoto = function()
{
	return this._obj[MediaRecord.FIELDNAME_WORKS$MEDIA_TYPE] === "Object";
};

MediaRecord.prototype.isPortrait = function()
{
	return this._obj[MediaRecord.FIELDNAME_WORKS$MEDIA_TYPE] === "Portrait";
};

MediaRecord.prototype.isVideo = function()
{
	return this._obj[MediaRecord.FIELDNAME_WORKS$MEDIA_TYPE] === "Video";	
};

MediaRecord.prototype.isSupplementalPhoto = function()
{
	return this._obj[MediaRecord.FIELDNAME_WORKS$MEDIA_TYPE] === "Supplemental";
};