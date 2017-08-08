const express = require("express");
const router = express.Router();

router.get('/download/uploads/document/:path', function(req, res){
	const path = 'uploads/document/'+req.params.path;
	return res.download(path);
});


module.exports = {
	addRouter(app){
		app.use('/', router);
	}
}