const express = require("express");
const router = express.Router();

router.get('/download/uploads/document/:path', function(req, res){
	const path = 'uploads/document/'+req.params.path;
	return res.download(path);
});

router.get('/download/uploads/resource/:path', function(req, res){
	const path = 'uploads/resource/'+req.params.path;
	return res.download(path);
});

router.get('/download/uploads/submission/:path', function(req, res){
	const path = 'uploads/submission/'+req.params.path;
	return res.download(path);
});

module.exports = {
	addRouter(app){
		app.use('/', router);
	}
}