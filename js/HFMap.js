L.HFMap = L.Map.extend({


  initialize: function(div, options)
  {

    L.Map.prototype.initialize.call(this, div, options);
    
    this._layerDots = L.featureGroup()
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

      self.fire("markerClick", {layer: event.layer});

    }

  },

  /*************************************************/
  /******************* METHODS *********************/
  /*************************************************/


  loadMarkers: function(recs)
  {


    var layerDots = this._layerDots;

    layerDots.clearLayers();

    var sumTable = new SummaryTable().createSummaryTable(recs);

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
            color: "darkred",
            fillColor: "red",
            fillOpacity: 0.7
          }
        ).addTo(layerDots);

        if (!L.Browser.mobile) {
          var placename = rec.getStandardizedLocation().split(",")[0];
          var tooltip;
          if (frequency > 1) {
            tooltip = placename+": "+frequency+" Artists";
          } else {
            tooltip = placename+": "+rec.getArtist();
          }
          marker.bindTooltip(tooltip);
        }
        marker.properties = rec;
      }
    );

  }

  /*************************************************/
  /************* "PRIVATE" FUNCTIONS ***************/
  /*************************************************/

});
