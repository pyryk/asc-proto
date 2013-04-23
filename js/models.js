var app = app || {};

(function() {
  'use strict';

  app.models = app.models || {};

  app.models.Event = Backbone.Model.extend({
  	defaults: {
      description: 'no description'
  	},
    initialize: function() {
      Backbone.Model.prototype.initialize.apply(this, arguments);

      this.on('change', function() { this.save(); }, this);
    },
    toJSON: function() {
      var data = Backbone.Model.prototype.toJSON.apply(this,arguments);
      data.date_display = moment(this.get('date')).calendar();
      data.url = '#details/' + this.cid;

      return data;
    }
  });

})();