const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Marksheet = require('mongoose').model('Marksheet');
const requireLoginMW = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');

router.post('/:index/:action', function(req, res) {
  const username = req.session.username; // session username is same as ligin username
  const index = req.params.index;
  const action = req.params.action;
  if(action.toString() !== 'accept' && action.toString() !== 'reject'){
    return res.send('Route no found');
  }
  User.findOne({
    username,
  })
  .populate({path: 'courses', 
    populate:{path: 'marksheet'}})
  .exec(function(err, student) {
    if (err || !student) {
      return res.render('error', { title: '500', message: 'ReferenceError: error is not defined' });
    } else {
      //Have to check RACE condition
      const temp = [];
      for(let i=0; i<student.courses[index].marksheet.email.length; i++) {
        if(student.courses[index].marksheet.email[i].toString() === student.email.toString())
           temp.push(action.toString());
        else
           temp.push(student.courses[index].marksheet.courseStatus[i]);
      }
      Marksheet.update({_id: student.courses[index].marksheet._id}, {$set: {courseStatus: temp}}, function(err){
        if(err) return res.render('error', { title: '500', message: 'ReferenceError: error is not defined' });
            return res.redirect('/student/'+username);
      });
    }
  });
});

router.get('/:index', function(req, res) {
  const username = req.session.username; // session username is same as ligin username
  const index = req.params.index;

  User.findOne({
    username,
  })
  .populate({path: 'courses'})
  .exec(function(err, student) {
    if (err || !student) {
      return res.render('error', { title: '500', message: 'ReferenceError: error is not defined' });
    } else {
       return res.render("courseShow", {name: student.name, course: student.courses[index]});
    }
  });
});

module.exports = {
  addRouter(app) {
    app.use('/student/:username/course', [requireLoginMW, matchUsername], router);
  },
};
