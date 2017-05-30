function samiul {
	console.log("hello");
	return 2;
}

const calculation = function(x, studentNo, req, asyncCB ){
	let len = x.length, fieldName, mark;
	async.eachOf(x,function(value,index,cb){
		if ( index == 0 ) return cb(null);
		Exam.findOne({
			_id: value._id
		})
		.exec(function(err, exam){
			if (err) return cb(err);
			for(let j=0; j<studentNo; j++){
				fieldName = x[i].name+'_'+j;
				mark = req.body[fieldName];
				exam.marks[j] = mark;
			}
			exam.save(function(err){
				if(err) return cb(err);
				cb(null);
			});
		});
	}, function(err){
		if ( err ) return asyncCB(err);
		return asyncCB(null);
	})
	
};

async.parallel([
	function(cb){
		calculation(a,b,c,cb);		
	}
],function(err,result){
	if ( err ) return res.send('some error occured');
})
