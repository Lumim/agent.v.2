const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const rootPath = __dirname;

app.set('port', 3000);
app.set('view engine', 'pug');
app.set('views', path.join(rootPath, './views')); //It will front end files from this folder

app.use('/public', express.static(path.join(rootPath, '/public')));

/*Configuration*/
require('./configuration/bodyParser.js').addBodyParser(app);
require('./configuration/database.js');
require('./configuration/session.js').addSession(app);

/*Model*/
require('./models/userModel.js');


/*Route*/
require('./controllers/landingPage/index.js').addRouter(app);
require('./controllers/facultyPage/faculty.js').addRouter(app);
require('./controllers/facultyPage/profile.js').addRouter(app);
require('./controllers/general/password.js').addRouter(app);
require('./controllers/facultyPage/officeHour.js').addRouter(app);

app.get('*', function(req, res){
	return res.status(404).send('Page not found\n');
});

server.listen(app.get('port'), function(){
	console.log(`Server running at port ${app.get('port')}`);
});