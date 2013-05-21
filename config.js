var config = {
	db: process.env.MONGOHQ_URL || "event-engine",
	port: process.env.PORT || 5000,
	mailuser: process.env.MAILUSER || "event.engine.hki@gmail.com",
	mailpass: process.env.MAILPW
}

module.exports = config;