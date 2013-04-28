var app = app || {};

(function() {
  'use strict';

  var config = {
  	server: "http://localhost:5000/api"
  };

  // override this config with previously set one
  app.config = app.config || {};
  app.config = _.extend(config, app.config);
})();