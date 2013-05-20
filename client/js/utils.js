var app = app || {};

(function() {
  'use strict';

  app.utils = app.utils || {};

  app.utils.mockLogin = function() {

    var field = 'EventEngine-login';

    var login = localStorage[field]
    if (login) {
      app.login = login;
    } else {
      // from http://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
      app.login = Math.random().toString(36).substr(2,16);
      localStorage[field] = app.login;
    }


  };

  app.utils.registerCustomTags = function() {

  }

  app.utils.initFbLogin = function() {
      // init the FB JS SDK
      FB.init({
        appId      : '379499668834068',                        // App ID from the app dashboard
        //channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel file for x-domain comms
        status     : true,                                 // Check Facebook Login status
        cookie     : true
      });

    FB.login(function(response) {
      if (response.authResponse) {
        FB.api('/me', function(response) {
          console.log('User info', response);
          app.user = new app.models.User({
            'name': response.username,
            'realName': response.name
          });
          Backbone.trigger('user:login');
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, {scope: 'email'});
    // Additional initialization code such as adding Event Listeners goes here
    };

    app.utils.absoluteUrl = function(relative) {
      var a = document.createElement('a');
      a.href = relative;
      return a.href;
    }
	
})();