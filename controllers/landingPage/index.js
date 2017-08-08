const express = require('express');
const User = require('mongoose').model('User'); // get
const Course = require('mongoose').model('Course');
const Marksheet = require('mongoose').model('Marksheet');
const File = require('mongoose').model('File');
const bcrypt = require('bcryptjs');
const router = express.Router();
const flash = require('middlewares/flash');

router.get('/', function(req, res, next) {
  if (req.session && req.session.login) { // Already logged in
    return res.redirect('/user/'+req.session.username);
  } else {
    return res.render('index');
  }
});

router.post('/login', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  User
    .findOne({
      username,
    })
    .exec(function(err, user) {
      if (err) {
        return next(err);  //passing to 500 error
      }
      if (!user) {
        req.flash('error', 'Wrong password or username');
        return res.redirect('/');
      } else {
        bcrypt.compare(password, user.password, function(err, result) {
          if (err) {
            return next(err);
          }
          if (result === true) {
            req.session.login = true;
            req.session.email = user.email;
            req.session.name = user.name;
            req.session.username = username;
            req.session.status = user.status;
            return res.redirect('/user/' + username);
          } else {
            req.flash('error', 'Wrong password or username');
            return res.redirect('/');
          }
        });
      }
    });
});

function validateEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

router.post('/signup', function(req, res, next) {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const repassword = req.body.repassword;
  const status = req.body.portal;
  const data = {};
  data.valid = true;

  // Form validation
  if (name.length === 0) {
    data.name = false;
    data.valid = false;
  } else {
    data.name = true;
  }
  if (validateEmail(email) === false) {
    data.email = false;
    data.emailType = 1;
    data.valid = false;
  }
  if (password.length < 6 || password.lenghth > 30) {
    data.password = false;
    data.valid = false;
  } else {
    data.password = true;
  }
  if (password !== repassword) {
    data.repassword = false;
    data.valid = false;
  } else {
    data.repassword = true;
  }
  if (username.length === 0) {
    data.username = false;
    data.usernameType = 1;
    data.valid = false;
    return res.send(data);
  } else {
    User.findOne({
      $or: [
        {'username': username},
        {'email': email},
      ],
    })
    .exec(function(err, user) {
      if (err) return next(err);
      if (user === null) {
        data.usename = true;
        // Create a new user if everything is valid.
        if (data.valid === true) {
          // Autogen salt and hash
          bcrypt.hash(password, require('../../secret.js').round, function(err, hash) {
            if (err) {
              return next(err);
            } else {
              const file = new File({
                path: 'public/image/avatar.jpeg',
                name: 'avatar.jpeg',
                username: username,
              });
              file.save(function(err) {
                if (err) return next(err);
                const user = new User({
                  image: file._id,
                  name,
                  email,
                  username,
                  password: hash,
                  status,
                });
                user.save(function(err) {
                  if (err) {
                    return next(err);
                  } else if (status.toString() === 'student') {
                    // Find out all the marksheets which has the email in their email array.
                    Marksheet.find({
                      email,
                    }, function(err, docs) {
                      if (err) return next(err);
                      // Find out all the courses whose marksheets find in docs.
                      Course.find({
                        marksheet: docs,
                      }, function(err, courses) {
                        if (err) return next(err);
                        User.update({_id: user._id},
                          // Push one by one course into courses
                          {$pushAll: {courses: courses}}, function(err) {
                            if (err) return next(err);
                            else return res.send(data);
                          });
                      });
                    });
                  } else {
                    return res.send(data);
                  }
                });
              });
            }
          });
        } else {
          res.send(data);
        }
      } else {
        if (user.username === username) {
          data.username = false;
          data.usernameType = 2;
          data.valid = false;
        }
        if (user.email === email) {
          data.email = false;
          data.emailType = 2;
          data.valid = false;
        }
        return res.send(data);
      }
    });
  }
});

router.get('/logout', function(req, res) {
  req.session.destroy();
  return res.redirect('/');
});

module.exports = {
  addRouter(app) {
    app.use('/', [flash], router);
  },
};
