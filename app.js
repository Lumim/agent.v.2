const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const rootPath = __dirname;
const flash = require('express-flash');

app.set('port', 3000);
app.set('view engine', 'pug');
app.set('views', path.join(rootPath, './views')); // It renders html from views folder

app.use('/public', express.static(path.join(rootPath, '/public')));

/* Configuration */
require('./configuration/bodyParser.js').addBodyParser(app);
require('./configuration/database.js');
require('./configuration/session.js').addSession(app);
app.use(flash());

/* Model */
require('./models/examModel.js');
require('./models/marksheetModel.js');
require('./models/courseModel.js');
require('./models/userModel.js');
require('./models/groupModel.js');
require('./models/submissionModel.js');
require('./models/fileModel.js');


/* Route */
require('./controllers/landingPage/index.js').addRouter(app);
require('./controllers/general/password.js').addRouter(app);
require('./controllers/general/post.js').addRouter(app);
require('./controllers/general/group.js').addRouter(app);
require('./controllers/general/attachment.js').addRouter(app);
require('./controllers/general/discussion.js').addRouter(app);

require('./controllers/facultyPage/faculty.js').addRouter(app);
require('./controllers/facultyPage/profile.js').addRouter(app);
require('./controllers/facultyPage/officeHour.js').addRouter(app);
require('./controllers/facultyPage/course.js').addRouter(app);
require('./controllers/facultyPage/marksheet.js').addRouter(app);
require('./controllers/facultyPage/marksheetCSV.js').addRouter(app);
require('./controllers/facultyPage/marksheetExam.js').addRouter(app);
require('./controllers/facultyPage/marksheetExamEdit.js').addRouter(app);
require('./controllers/facultyPage/marksheetStudent.js').addRouter(app);
require('./controllers/facultyPage/resource.js').addRouter(app);
require('./controllers/facultyPage/group.js').addRouter(app);
require('./controllers/facultyPage/submission.js').addRouter(app);

require('./controllers/studentPage/student.js').addRouter(app);
require('./controllers/studentPage/course.js').addRouter(app);
require('./controllers/studentPage/marksheet.js').addRouter(app);
require('./controllers/studentPage/profile.js').addRouter(app);
require('./controllers/studentPage/resource.js').addRouter(app);
require('./controllers/studentPage/submission.js').addRouter(app);

//Express error handling middleware
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).render('error', { title: '500', message: 'ReferenceError: error is not defined.' });
  next();
});

// If no route match, shows 404 error
app.get('*', function(req, res) {
	return res.status(404).render('error', { title: '404', message: 'Page not found.' });
});


server.listen(app.get('port'), function() {
	console.log(`Server running at port ${app.get('port')}`);
});
