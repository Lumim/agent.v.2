// A popular session store uses MongoDB for storing the data and is called MongoStore
// Install MongoStore in the application directory by `npm install connect-mongo`

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const secret = require('../secret.js').secretKey;
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

module.exports = {
  addSession(app) {
    app.use(cookieParser(secret)); // Session built on cookie-parser

    app.use(session({
      secret,
      resave: false, // don't create session until something stored
      saveUninitialized: false, // don't save session if unmodified
      // With that, session data will now be stored in MongoDB,
      // but the session interface remains the same – the req.session object
      store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 2 * 60 * 60 * 60, // time to live
        touchAfter: 2 * 3600, // time period in seconds
      }),
    }));
  },
};
