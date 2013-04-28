var config = {
	db: process.env.MONGOHQ_URL || "event-engine",
	port: process.env.PORT || 5000
}

module.exports = config;