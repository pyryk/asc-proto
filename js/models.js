var app = app || {};

(function() {
  'use strict';

  app.models = app.models || {};

  app.models.Event = Backbone.Model.extend({
  	defaults: {
      description: 'no description',
      attendees: 0,
      attending: false,
      photo: 'images/event.jpg' // http://www.flickr.com/photos/hinkelstone/994941366/
  	},
    initialize: function() {
      Backbone.Model.prototype.initialize.apply(this, arguments);

      this.on('change', function() { this.save(); }, this);
    },
    getUrl: function() {
      return '#details/' + this.cid;
    },
    toJSON: function() {
      var data = Backbone.Model.prototype.toJSON.apply(this,arguments);
      data.date_display = moment(this.get('date')).calendar();
      data.url = this.getUrl();

      return data;
    }
  });

})();