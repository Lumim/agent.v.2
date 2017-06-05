const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const requireLoginMW = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');

router.get('/', function(req, res) {
  const username = req.session.username; // session username is same as ligin username
  User.findOne({
    username,
  })
  .populate('courses')
  .exec(function(err, faculty) {
    if (err || !faculty) {
      return res.render('error', { title: '500', message: 'ReferenceError: error is not defined' });
    } else {
      return res.render('faculty', faculty); // sending the whole faculty document
    }
  });
});

router.get('/logout', function(req, res) {
  req.session.destroy();
  return res.redirect('/');
});

module.exports = {
  addRouter(app) {
    app.use('/faculty/:username', [requireLoginMW, matchUsername], router);
  },
};
