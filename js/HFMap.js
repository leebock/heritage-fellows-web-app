L.HFMap = L.Map.extend({


  initialize: function(div, options, paddingQueryFunction)
  {

    L.Map.prototype.initialize.call(this, div, options);

    this._paddingQueryFunction = paddingQueryFunction;
    this.MARKER_OPACITY_DEFAULT = 0.4;

    this._featureGroup = L.featureGroup()
      .addTo(this)
      .on("click", onLayerClick);

    this._featureGroupActive = L.featureGroup()
      .addTo(this)
      .on("click", onLayerClick);

    var self = this;

    function onLayerClick(event)
    {

      // so this doesn't further trigger map::click

      L.DomEvent.stop(event);

      /* note: 

        because of weirdness with toolTip, currently you need to manually 
        hide the toolTip so that it doesn't display concurrently with the
        popup (which looks weird).
      */

      $(".leaflet-tooltip").remove();

      self.fire("markerClick", {record: event.layer.properties, ghost: event.target === self._featureGroup});

    }

  },

  /*************************************************/
  /******************* METHODS *********************/
  /*************************************************/

  panTo: function(latLng, options)
  {
    var pixels = this.latLngToContainerPoint(latLng);
    var pBR = this._paddingQueryFunction();
    L.Map.prototype.panTo.call(
        this, 
        this.containerPointToLatLng(pixels.add([pBR[0]/2, pBR[1]/2])), 
        options
    );
},

  zoomIn: function(zoomDelta, options)
  {
    this.setView(
        this._calcNewCenter(
            this.getCenter(), 
            this.getZoom()+zoomDelta, 
            this._paddingQueryFunction()
        ),
        this.getZoom()+zoomDelta,
        options
    );
  }, 

  zoomOut: function(zoomDelta, options)
  {
      this.setView(
          this._calcNewCenter(
              this.getCenter(), 
              this.getZoom()-zoomDelta, 
              this._paddingQueryFunction()
          ),
          this.getZoom()-zoomDelta,
          options
      );
  },

  loadMarkers: function(recs)
  {
    this._createMarkers(recs, this._featureGroup);
  },

  addSpotlight: function(recs)
  {

    var MARKER_OPACITY_SPOTLIGHT = 0.7;
    var MARKER_OPACITY_GHOST = 0.4;

    this._featureGroup.eachLayer(
      function(layer) {
        layer.setStyle({opacity: MARKER_OPACITY_GHOST, fillOpacity: MARKER_OPACITY_GHOST});
      }
    );

    this._createMarkers(recs, this._featureGroupActive);

    this._featureGroupActive.eachLayer(
      function(layer) {
        layer.setStyle({
          opacity: MARKER_OPACITY_SPOTLIGHT, 
          fillOpacity: MARKER_OPACITY_SPOTLIGHT,
          color: "darkred",
          fillColor: "red"
        });
      }
    );

  },

  _createMarkers: function(recs, layerGroup)
  {

    var self = this;

    layerGroup.clearLayers();

    var sumTable = this._createSummary(recs);

    var marker, frequency;
    $.each(
      sumTable, 
      function(index, rec) {
        frequency = rec.getFrequency();
        marker = L.circleMarker(
          rec.getLatLng(),
          {
            weight: 1,
            radius: 5+(frequency-1)*2,
            color: "darkgray",
            fillColor: "gray",
            fillOpacity: self.MARKER_OPACITY_DEFAULT
          }
        ).addTo(layerGroup);
        // to do: turn off tool tips for touch environments.
        marker.bindTooltip(rec.getStandardizedLocation().split(",").shift());          
        marker.properties = rec;
      }
    );

  },

  /*************************************************/
  /************* "PRIVATE" FUNCTIONS ***************/
  /*************************************************/

  _calcNewCenter: function(center, targetZoom, paddingBottomRight)
  {
      var targetPoint = this.project(center, targetZoom);
      var offset;
      if (targetZoom < this.getZoom()) {
          offset = [paddingBottomRight[0]/4, paddingBottomRight[1]/4];
          targetPoint = targetPoint.add(offset);			
      } else {
          offset = [paddingBottomRight[0]/2, paddingBottomRight[1]/2];
          targetPoint = targetPoint.subtract(offset);
      }
      return this.unproject(targetPoint, targetZoom);
  },
  
  _createSummary: function(recs)
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

  }

});
