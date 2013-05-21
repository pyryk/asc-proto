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
          user: app.user.get('name'),
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
    // in case of change, syncs it to backend
    attending: function(flag) {
      if (flag) {
        if (!this.attending() && !this.isFull()) {
          this.get('attendees').push(app.user.get('name'));

          this.syncAttending();
        }
        return true;
      } else if (flag === false) {
        if (this.attending()) {
          while (app.user && this.get('attendees').indexOf(app.user.get('name')) >= 0) {
            this.get('attendees').splice(this.get('attendees').indexOf(app.user.get('name')), 1);
          }

          console.log(this.get('attendees'), this.attending());

          this.syncAttending();
        }
        return false;
      } else {
        return app.user && this.get('attendees').indexOf(app.user.get('name')) !== -1;
      }
    },
    share: function(media, opts) {
      if (media == 'facebook') {

        var obj = {
          method: opts && opts.type === "send" ? 'send' : 'feed',
          link: document.location.toString(),
          name: this.get('name') + ' @ ' + this.getDateDisplay() + ' - Event Engine',
        };

        if (!opts || opts.type !== "send") {
          obj.picture = app.utils.absoluteUrl(this.get('photo'));
          obj.caption = '';
          obj.description = this.get('description');
        }

        FB.ui(obj, function(resp) {
          if (resp && resp.post_id) {
            console.log('Post successful.', resp);
          } else {
            console.log('User canceled the share');
          }
        });
      } else if (media === 'email') {
        return $.post(this.url() + '/invite', {emails: opts.emails})
          .done(function() {console.log('invite ok');})
          .fail(function() {console.log('invite failed');})
      } else {
        console.log('Sharing via', media, 'is not supported.');
        alert('Sharing via ' + media + ' is not yet supported.');
      }
      
    },
    isFull: function() {
      return this.get('maxAttendees') > 0 && this.get('attendees').length >= this.get('maxAttendees');
    },
    getDateDisplay: function() {
      var sixDaysFromNow = moment().date(moment().date()+6);
        var date = moment(this.get('date'));
        if (date.isBefore(sixDaysFromNow) && date.isAfter(moment())) {
          return date.calendar();
        } else {
          return date.format('D.M.YYYY HH:mm');
        }
    },
    isOwn: function() {
      if (!app.user) {
        return false;
      }

      return this.get('owner') === app.user.get('name');
    },
    toJSON: function() {
      var data = Backbone.Model.prototype.toJSON.apply(this,arguments);
      data.date_display = this.getDateDisplay();
      //data.date_display = moment(this.get('date')).calendar();
      data.attending = this.attending();
      data.full = this.isFull();
      data.url = this.getUrl();
      data.isOwn = this.isOwn();

      return data;
    }
  });

  app.models.User = Backbone.Model.extend({
  });

})();