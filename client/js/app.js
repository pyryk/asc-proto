var app = app || {};

(function() {
  'use strict';

  $(function() {
  	app.router = new app.Router();
		Backbone.history.start();

		app.utils.mockLogin();

		app.utils.registerCustomTags();
		app.utils.initFbLogin();

		app.events.fetch();
  });
})();