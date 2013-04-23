var app = app || {};

(function() {
  'use strict';

  app.collections = app.collections || {};

  app.collections.Events = Backbone.Collection.extend({
  	model: app.models.Event,
  	localStorage: new Backbone.LocalStorage("Events"),
  });
	app.events = new app.collections.Events();

}());