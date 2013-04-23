var app = app || {};

(function() {
  'use strict';

  app.utils = app.utils || {};

  app.utils.addTestData = function() {
  	var data = [
  		{name: 'movie1.mp4', size: 123, progress: 3.5},
  		{name: 'movie2.mp4', size: 456, progress: 32.1},
  		{name: 'file1.mp4', size: 789, progress: 97.2},
  		{name: 'file2.mp4', size: 101122, progress: 98.1},
  	];

  	for (var i in data) {
  		app.files.add(new app.models.File(data[i]))
  	}
  }

  app.utils.addInstallButton = function() {
  	if (window.navigator.mozApps || true) {
  		var btn = $('<a href="#" id="install-button">Install</a>');
      var header = $('header');
      var toolbar = header.find('menu[type="toolbar"]');
      if (toolbar.length > 0 && toolbar.find('#install-button').length === 0) {
        toolbar.append(btn);
      }
	  	$(btn).click(function(e) {
	  		e.preventDefault();
	  		window.navigator.mozApps.install(app.config.manifestUrl);
	  	});
	  }
  }

  app.utils.enableSocketio = function() {
  	app.socket = io.connect(app.config.tracker);
  	Backbone.trigger('tracker:connection', app.socket);
  }

  // converts byte count (e.g. file size) to human-friendly format for displaying
  // http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
  app.utils.byteCountToDisplay = function(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(bytes < thresh) return bytes + ' B';
    var units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(bytes >= thresh);
    return bytes.toFixed(1)+' '+units[u];
  }

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