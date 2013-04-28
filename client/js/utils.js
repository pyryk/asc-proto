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

    Handlebars.registerHelper('showBlob', function(file) {
      console.log(file);
      if (!file.blob) {
        return new Handlebars.SafeString('<p>No file found.</p>');
      }
      var blobURL = window.URL.createObjectURL(file.blob);

      var containers = {
        'image': '<img class="blob-display" src="' + blobURL + '">',
        'video': '<video class="blob-display" src="' + blobURL + '" controls></video>',
        'audio': '<audio class="blob-display" src="' + blobURL + '" controls></audio>'
      };

      if (containers[file.blob.type]) {
        return new Handlebars.SafeString(containers[file.blob.type]);
      }

      var vagueType = file.blob.type.substring(0, file.blob.type.indexOf('/'));
      if (containers[vagueType]) {
        return new Handlebars.SafeString(containers[vagueType]);
      }

      return new Handlebars.SafeString('<a href="' + blobURL + '" download="' + file.name + '">Download</a>');

    });
  }

	
})();