var app = app || {};

(function() {
  'use strict';

  app.collections = app.collections || {};

  app.collections.Events = Backbone.Collection.extend({
  	model: app.models.Event,
  	url: app.config.server + '/events'
  });
	app.events = new app.collections.Events();

}());