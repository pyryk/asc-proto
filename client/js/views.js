var app = app || {};

(function() {
  'use strict';

  app.views = app.views || {};

  app.views.Page = Backbone.View.extend({
  	type: undefined,
  	el: '#main',
  	visible: false,
    events: {
      'click .login.library': 'loginLib',
      'click .login.ee': 'loginEe',
      'click .login.fb': 'loginFb'
    },
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
    loginFb: function() {
      if (this)
      app.utils.login();
    },
    loginLib: function() {
      if (this.isActive()) {
        alert('Library card login is not yet supported.');
      }
    },
    loginEe: function() {
      if (this.isActive()) {
        alert('Event engine login is not yet supported.');
      }
    },
  	setId: function() {
  		// do nothing by default
  	},
  	setVisibility: function(flag) {
  		this.visible = flag;
  	},
    isActive: function() {
      return app.router.currentPage === this;
    },
  	render: function() {
  		var data = this.getData();
  		var html = this.template(data);
  		this.$el.html(html);
  	}
  });

  app.views.landing = app.views.Page.extend({
    type: 'landing',
    events: _.extend(_.clone(app.views.Page.prototype.events), {
      
    }),
    
    getData: function() {
      return {user: app.user ? app.user.toJSON() : undefined};
    }
  });

  app.views.index = app.views.Page.extend({
  	type: 'index',
    events: _.extend(_.clone(app.views.Page.prototype.events), {
      
    }),
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
    events: _.extend(_.clone(app.views.Page.prototype.events), {
      'submit .create-form': 'addEvent',
      'change #photo': 'addPhoto'
    }),
    createOnEnter: function(e) {
      if (e.which === 13) {
        this.addFile(e);
      }
    },
    addPhoto: function(e) {
      console.log('photo changed');

      var fileObj = e.target;
      var file = fileObj.files[0];
      var fr = new FileReader;
      fr.onloadend = _.bind(function(e) {
        var image = e.target.result;
        this.$('#photo-preview').attr('src', image);
      }, this);
      fr.readAsDataURL(file);
    },
    addEvent: function(e) {
      console.log('creating event', e);
      e.preventDefault();
      var form = $(e.target);
      var data = _.object(_.map(form.serializeArray(), function(it) { return [it.name, it.value] }));
      data.owner = app.user.get('name');
      
      if (this.$('#photo-preview').attr('src') !== "images/photo-placeholder.png") {
        data.photo = this.$('#photo-preview').attr('src');
      }
      
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
  	events: _.extend(_.clone(app.views.Page.prototype.events), {
  		'click .attend': 'attend',
      'click .cancel': 'cancel',
      'click .share.fb': 'shareFb',
      'click .share.fbmsg': 'shareFbMessage',
      'click .share.email.start': 'shareEmail',
      'click .share.email.confirm': 'shareEmailConfirm',
      'click .share.email.close': 'shareEmailClose'
  	}),
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
    shareFbMessage: function(e) {
      e.preventDefault();
      this.model.share('facebook', {type: 'send'});
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