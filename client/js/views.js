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

      Backbone.on('user:login', function() {
        this.render();
      }, this);

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
    events: {
      'click .login': 'login'
    },
    login: function() {
      app.utils.login();
    },
  	initialize: function() {
  		app.views.Page.prototype.initialize.apply(this, arguments);

  		app.events.on('add remove reset change sort', function() {
  			if (this.visible) {
  				this.render();
  			}
  		}, this);
  	},
  	getData: function() {
  		return {
        files: new app.collections.Events(app.events.filter(function(it) {
          return moment(it.get('date')).isAfter(moment());
        })).toJSON(),
        user: app.user ? app.user.toJSON(): undefined
      };
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
            return it.get('id') === id;
          });
          
          if (event) {
            this.setId(event.get('id'));
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
      alert('This prototype does not support selecting a photo.');
    },
    addEvent: function(e) {
      console.log('creating event', e);
      e.preventDefault();
      var form = $(e.target);
      var data = _.object(_.map(form.serializeArray(), function(it) { return [it.name, it.value] }));
      data.owner = app.user.get('name');
      
      var event = new app.models.Event(data);
      app.events.add(event);

      event.save(undefined, {
        wait: true,
        success: function() {
          app.router.navigate(event.getUrl(), {trigger: true});
        }
      });
    },
    initialize: function() {
      app.views.Page.prototype.initialize.apply(this, arguments);
    },
    getData: function() {
      return {};
    },
    render: function() {
      app.views.Page.prototype.render.apply(this, arguments);


      if (!Modernizr.inputtypes['datetime-local']) {
        $("#date").mobiscroll().datetime({
          theme: 'android-ics',
          display: 'bottom',
          dateOrder: 'ddMMyy',
          timeWheels: 'HHii',
          dateFormat: 'yyyy-mm-dd',
          timeFormat: 'HH:ii'
        });
      }

      $('#date').val(moment().add('hours', 1).startOf('hour').format('YYYY-MM-DDTHH:mm'));
    }
  });

  app.views.details = app.views.PageWithId.extend({
  	type: 'details',
  	events: {
  		'click .attend': 'attend',
      'click .cancel': 'cancel',
      'click .share.fb': 'shareFb',
      'click .share.email.start': 'shareEmail',
      'click .share.email.confirm': 'shareEmailConfirm',
      'click .share.email.close': 'shareEmailClose',
      'click .login': 'login'
  	},
  	attend: function(e) {
  		e.preventDefault();
      this.model.attending(true);
  	},
  	cancel: function(e) {
  		e.preventDefault();
  		this.model.attending(false);
  	},
    shareFb: function(e) {
      e.preventDefault();
      this.model.share('facebook');
    },
    shareEmail: function(e) {
      e.preventDefault();
      this.$('.share-dialog-canvas').show();
    },
    shareEmailClose: function(e) {
      e.preventDefault();
      this.$('.share-dialog-canvas').hide();
    },
    shareEmailConfirm: function(e) {
      e.preventDefault();
      var field = $(e.target).parents('.share-dialog').find('textarea');
      var emails = field.val().split(/[,\n]/);

      this.model.share('email', {emails: emails}).done(_.bind(function() {
        field.val('');
        this.shareEmailClose(e);
      }, this)).fail(_.bind(function() {
        alert('Could not send the emails. Please try again later.');
      }, this));
    },
    login: function() {
      app.utils.login();
    },
  	initialize: function() {
  		app.views.Page.prototype.initialize.apply(this, arguments);

  	},
  	getData: function() {
  		if (this.model) {
  			return 	{event: this.model.toJSON(true), user: app.user ? app.user.toJSON(): undefined};
  		} else {
  			return {message: 'Loading...'}
  		}
  	}
  });

})();