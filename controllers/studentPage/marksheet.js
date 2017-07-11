const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Marksheet = require('mongoose').model('Marksheet');
const requireLoginMW = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');

router.get('/:index/marksheet', function(req, res) {
  const username = req.session.username; // session username is same as ligin username
  const index = req.params.index;
  let row;

  User.findOne({
    username,
  })
  .populate({path: 'courses', 
    populate:{path: 'marksheet', 
      populate:{path: 'quiz mid assignment project presentation fieldWork final'}}})
  .exec(function(err, student) {
    if (err || !student) {
      return res.render('error', { title: '500', message: 'ReferenceError: error is not defined' });
    } else {
       for (let i=0; i<student.courses[index].marksheet.email.length; i++) {
         if (student.courses[index].marksheet.email[i] == student.email) {
          row = i;
          break;
         }
       }
       return res.render("studentMarksheet", {name: student.name, username: username, index: index, marksheet: student.courses[index].marksheet, no: row});
    }
  });
});

router.get('/:index/marksheet/:exam-:no', function(req, res){
  const username = req.session.username; // session username is same as ligin username
  const index = req.params.index;
  const exam = req.params.exam;
  const no = req.params.no;

  User.findOne({
    username
  })
  .populate({path: 'courses', 
    populate:{path: 'marksheet', 
      populate:{path: 'quiz mid assignment project presentation fieldWork final'}}})
  .exec(function(err, student){
    if (err || !student) {
      return res.render('error', { title: '500', message: 'ReferenceError: error is not defined' });
    } else{
      if(no == 'total')
        return res.render("exam", {name: student.name, username: username, index: index, status: student.status, type: 'total', exam: student.courses[index].marksheet[exam][0]});
      else
        return res.render("exam", {name: student.name, username: username, index: index, status: student.status, type: 'single', exam: student.courses[index].marksheet[exam][no]});
    }
  });
});

module.exports = {
  addRouter(app) {
    app.use('/student/:username/course', [requireLoginMW, matchUsername], router);
  },
};
