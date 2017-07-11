const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
//const requireLoginMW = require('middlewares/requireLogin');
//const matchUsername = require('middlewares/matchUsername');

router.get('/faculty/:username', function(req, res) {
  const username = req.params.username; // session username is same as login username
  User.findOne({
    username,
  })
  .populate('courses')
  .exec(function(err, faculty) {
    if (err || !faculty) {
      return res.render('error', { title: '500', message: 'ReferenceError: error is not defined' });
    } else {
      if ( req.session && req.session.login && req.session.username === req.params.username)
        return res.render('faculty', {faculty: faculty, whoIsLooking: 'faculty'}); // sending the whole faculty document
      else {
        return res.render('faculty', {faculty: faculty, whoIsLooking: 'other'});
      }
    }
  });
});

module.exports = {
  addRouter(app) {
    //app.use('/faculty/:username', [requireLoginMW, matchUsername], router);
    app.use('/', router);
  },
};
