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

  app.utils.login = function() {

    var opts = {scope: 'email'};
    var ua = navigator.userAgent;

    if (ua.indexOf('iPhone') == -1 && ua.indexOf('iPad') == -1 && ua.indexOf('iPod') == -1) {
      
    } else if (ua.indexOf('Safari') > -1) {
      // ua contains safari => not homescreen app => no redirect URI
      
    } else { // ios but not safari => add redirect URI
      opts.redirect_uri = document.location.href;
    }

    FB.login(function(response) {
      if (response.authResponse) {
        app.utils.setUserInfo();
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, opts);
  }

  app.utils.setUserInfo = function() {
    FB.api('/me', function(response) {
      console.log('User info', response);
      app.user = new app.models.User({
        'name': response.name  + ' (' + response.username + ')',
        'realName': response.name,
        'username': response.username
      });
      Backbone.trigger('user:login');
    });
  };

  app.utils.checkLogin = function() {
    FB.getLoginStatus(function(resp) {
      if (resp.authResponse) {
        app.utils.setUserInfo();
      }
    })
  };

  app.utils.initFbLogin = function() {
      // init the FB JS SDK
      FB.init({
        appId      : '379499668834068',                        // App ID from the app dashboard
        //channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel file for x-domain comms
        status     : true,                                 // Check Facebook Login status
        cookie     : true
      });

      app.utils.checkLogin();
    };

    app.utils.absoluteUrl = function(relative) {
      var a = document.createElement('a');
      a.href = relative;
      return a.href;
    }
	
})();