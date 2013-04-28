var app = app || {};

(function() {
  'use strict';

  var data = [
  	{name: 'Tarinalanka', date: Date.parse('2013-04-26T19:00'), attendees: 3, maxAttendees: 5, location: 'Oulunkylän kirjasto', description: 'Tule tekemään käsitöitä ja kuuntelemaan lyhyitä juttuja. Ota mukaan keskeneräinen työsi tai aloita vaikka uusi. Myös vasta-alkajat tervetulleita!'},
  	{name: 'Kirjastomummin satutunti', date: Date.parse('2013-04-28T17:00'), attendees: 2, maxAttendees: 5, location: 'Rikhardinkadun kirjasto', description: 'Kirjastomummin suomenkielinen satutunti Rikhardinkadun kirjastossa joka toinen lauantai klo 11:00-11:45. Ikäsuositus: 3-vuotiaasta ylöspäin. Tervetuloa!'},
  	{name: 'Seniorinetti', date: Date.parse('2013-04-29T14:00'), attendees: 5, maxAttendees: 8, location: 'Kauniaisten kirjasto', description: 'Matti Kivinen opastaa ja vastaa senioreiden kysymyksiin tietokoneesta ja internetistä kirjastossa torstai-iltapäivisin. Osallistua voi kerran tai vaikka joka kerta. Tervetuloa!'},
  	{name: 'Pakistani Kids Gathering', date: Date.parse('2013-05-01T11:00'), attendees: 9, maxAttendees: 15, location: 'Sellon kirjasto', description: 'Pakistani kids gather once a week on Wednesdays in the Story Room in Children\'s Land at 11-13. Welcome!'},
  	{name: 'Knitting club', date: Date.parse('2013-05-01T16:00'), attendees: 6, maxAttendees: 10, location: 'Sellon kirjasto', description: 'We gather every Sunday to knit and socialize.'}
  ];

  setTimeout(function() {
  	if (app.events.length === 0) {
	  	_.each(data, function(it) {
		  	//app.events.create(it);
		  });
	  }
  }, 1000);
})();