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
  .populate({path: 'courses', 
    populate:{path: 'marksheet'}})
  .exec(function(err, student) {
    if (err || !student) {
      return res.render('error', { title: '500', message: 'ReferenceError: error is not defined' });
    } else {
      return res.render('student', student); // sending the whole faculty document
    }
  });
});

module.exports = {
  addRouter(app) {
    app.use('/student/:username', [requireLoginMW, matchUsername], router);
  },
};
