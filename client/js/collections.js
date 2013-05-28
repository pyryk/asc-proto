var app = app || {};

(function() {
  'use strict';

  app.collections = app.collections || {};

  app.collections.Events = Backbone.Collection.extend({
  	model: app.models.Event,
  	url: app.config.server + '/events',
  	withName: function(name) {
  		return this.find(function(it) {
  			return it.get('name') === name;
  		});
  	}
  });
	app.events = new app.collections.Events();

}());