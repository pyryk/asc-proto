var app = app || {};

(function() {
  'use strict';

  app.views = app.views || {};

  app.views.Page = Backbone.View.extend({
  	type: undefined,
  	el: '#main',
  	visible: false,
  	initialize: function() {
  		if (this.type === undefined) {
  			throw "Page must be extended and type property set";
  		}

  		var templateQuery = "#" + this.type + "-template";
  		var templateEl = $(templateQuery);
  		if (templateEl.length === 0) {
  			throw "Could not find template " + templateQuery;
  		}

  		var source = templateEl.html();
      this.template = Handlebars.compile(source);
  	},
  	setId: function() {
  		// do nothing by default
  	},
  	setVisibility: function(flag) {
  		this.visible = flag;
  	},
  	render: function() {
  		var data = this.getData();
  		var html = this.template(data);
  		this.$el.html(html);
  	}
  });

  app.views.index = app.views.Page.extend({
  	type: 'index',
  	initialize: function() {
  		app.views.Page.prototype.initialize.apply(this, arguments);

  		app.events.on('add remove reset change sort', function() {
  			if (this.visible) {
  				this.render();
  			}
  		}, this);
  	},
  	getData: function() {
  		return {files: app.events.toJSON()};
  	}
  });

  app.views.PageWithId = app.views.Page.extend({
    setId: function(id) {

      // unbind events from the old model
      if (this.model) {
        this.model.off(null, null, this);
      }
      app.events.off('add', null, this);

      // bind events for the new model
      this.model = app.events.get(id);
      if (this.model) {
        this.model.on('change', function() {
          if (this.visible) {
            this.render();
          }
        }, this);
      } else {
        // if no model found, it may be loaded in the future
        app.events.on('reset add', function() {
          var event = app.events.find(function(it) {
            return it.cid === id;
          });
          
          if (event) {
            this.setId(event.cid);
            this.render();
          } else {
            console.log('event not found');
          }
        }, this);
      }
    },
  });

  app.views.create = app.views.Page.extend({
    type: 'create',
    events: {
      'submit .create-form': 'addEvent',
      'click #photo': 'addPhoto'
    },
    createOnEnter: function(e) {
      if (e.which === 13) {
        this.addFile(e);
      }
    },
    addPhoto: function(e) {
      alert('Photo selected.');
    },
    addEvent: function(e) {
      console.log('creating event', e);
      e.preventDefault();
      var form = $(e.target);
      var data = _.object(_.map(form.serializeArray(), function(it) { return [it.name, it.value] }));

      var event = new app.models.Event(data);
      app.events.add(event);

      event.save(undefined, {
        wait: true,
        success: function() {
          console.log('success!', arguments);
        }
      });

      //app.events.create(data);
      console.log(event);

      app.router.navigate(event.getUrl(), {trigger: true});
    },
    initialize: function() {
      app.views.Page.prototype.initialize.apply(this, arguments);
    },
    getData: function() {
      return {};
    }
  });

  app.views.details = app.views.PageWithId.extend({
  	type: 'details',
  	events: {
  		'click .attend': 'attend',
      'click .cancel': 'cancel',
  	},
  	attend: function(e) {
  		e.preventDefault();
      this.model.attending(true);
  	},
  	cancel: function(e) {
  		e.preventDefault();
  		this.model.attending(false);
  	},
  	initialize: function() {
  		app.views.Page.prototype.initialize.apply(this, arguments);

  	},
  	getData: function() {
  		if (this.model) {
  			return 	{event: this.model.toJSON(true)};
  		} else {
  			return {message: 'Loading...'}
  		}
  	}
  });

  app.views.viewFile = app.views.PageWithId.extend({
    type: 'viewFile',
    getData: function() {
      if (this.model) {
        return {file: this.model.toJSON(true)}
      } else {
        return {message: 'No file found'};
      }
    }
  });

})();