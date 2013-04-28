(function() {
	'use strict';

	app.Router = Backbone.Router.extend({
		pages: {},
		currentPage: undefined,
		defaultPage: 'index',
		routes: {
			"":      "showPage",
			":page(/)(:id)": "showPage",
			"*anything": "catchall"
		},
		catchall: function(path) {
			console.warn('Unrecognized path: ', path);
		},
		showPage: function(page, id) {
			var view;
			if (!this.pages[page]) {
				if (!page) {
					page = this.defaultPage;
				}

				if (!app.views[page]) {
					console.warn('No page', page, 'found.');
					return;
				}

				view = new app.views[page]();
				this.pages[page] = view;
			} else {
				view = this.pages[page];
			}

			view.setId(id);

			this.currentPage = view;

			view.render();

			// update pages visibility
			for (var i in this.pages) {
				this.pages[i].setVisibility(i === page);
			}
		}

	});

})();
