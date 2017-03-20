var express = require('express');
var router = express.Router();
var path=require("path")
var media=path.join(__dirname,"../public/media");
/* GET home page. */
router.get('/', function(req, res) {
	var fs=require("fs");
	fs.readdir(media,function(err,names){    //readdir,读取目录里的文件
		if(err){
			console.log(err);
		}else{
			res.render("index",{title:"Passion Music", music:names})
		}
	})
});

module.exports = router;
