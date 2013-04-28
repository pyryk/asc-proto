var app = app || {};

(function() {
  'use strict';

  var config = {
  	tracker: "http://localhost:8080/"
  }

  // override this config with previously set one
  app.config = app.config || {};
  app.config = _.extend(config, app.config);
})();