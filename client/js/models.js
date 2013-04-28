var app = app || {};

(function() {
  'use strict';

  app.models = app.models || {};

  app.models.Event = Backbone.Model.extend({
  	defaults: {
      description: 'no description',
      attendees: [],
      photo: 'images/event.jpg' // http://www.flickr.com/photos/hinkelstone/994941366/
  	},
    initialize: function() {
      Backbone.Model.prototype.initialize.apply(this, arguments);

      this.on('change', function() { 
        var changedBackendAttributes = _.omit(this.changedAttributes(), 'attendees');
        console.log(changedBackendAttributes);
        if (!_.isEmpty(changedBackendAttributes)) {
          this.save();
        }
      }, this);
    },
    getServerDataModel: function() {
      return _.omit(this.attributes, 'attendees');
    },
    syncAttending: function() {
      var reqProps = {
        type: 'POST',
        url: this.url() + '/attend',
        contentType: 'application/json',
        data: JSON.stringify({
          user: app.login,
          attends: this.attending()
        })
      };

      $.ajax(reqProps).then(_.bind(function(data) {
        this.fetch();
        this.trigger('change', this);
      }, this), function() { 
        console.log("Error", arguments); 
        alert('Unexpected error occurred. Please try again later');
      });
    },
    // client-side url
    getUrl: function() {
      return '#details/' + this.get('id');
    },
    // attending(true) -> adds you to attendees
    // attending(false) -> removes you from the attendees
    // attending() -> returns true if you are attending / false if youre not
    // in case if change, syncs it to backend
    attending: function(flag) {
      if (flag) {
        if (!this.attending()) {
          this.get('attendees').push(app.login);

          this.syncAttending();
        }
        return true;
      } else if (flag === false) {
        if (this.attending()) {
          while (this.get('attendees').indexOf(app.login) >= 0) {
            this.get('attendees').splice(this.get('attendees').indexOf(app.login), 1);
          }

          console.log(this.get('attendees'), this.attending());

          this.syncAttending();
        }
        return false;
      } else {
        return this.get('attendees').indexOf(app.login) !== -1;
      }
    },
    toJSON: function() {
      var data = Backbone.Model.prototype.toJSON.apply(this,arguments);
      data.date_display = moment(this.get('date')).calendar();
      data.attending = this.attending();
      data.url = this.getUrl();

      return data;
    }
  });

})();