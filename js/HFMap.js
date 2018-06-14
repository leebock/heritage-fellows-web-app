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

  },

  /*************************************************/
  /************* "PRIVATE" FUNCTIONS ***************/
  /*************************************************/

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
