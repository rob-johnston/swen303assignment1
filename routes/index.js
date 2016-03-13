var express = require('express');
var router = express();
var bodyParser = require('body-parser');

var cheerio = require('cheerio');
//var basex = require('basex');
var basex = require('basex');
var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
//var client = new basex.Session();
var url = require('url');
var text;




/* GET home page. */
router.get('/', function(req, res, next) {
    text="";

  res.render('index', {title: 'Colenso Project', image: "images/museum.png", xmlstuff: text});
});

/* GET searc page. */
router.get('/searchpage', function(req, res, next) {
    text="";

    res.render('searchpage', {title: 'Colenso Project', test:"active", test: true});
});




router.get('/search', function(req, res, next) {

    //router.use(bodyParser.text());
    client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
    var url_parts = url.parse(req.url, true)
    var query = url_parts.query;

    client.execute('open Colenso_TEIs');

    var myquery = ' /descendant-or-self::*[text() contains text "' + query.search + '\"]';

    //client.query(myquery, function (err, result) {
     //   if (err) throw err;
        var result = client.query(myquery);
        result.execute( function(error, result){
            if(error) {
                console.error(error);
            } else{
                console.log(result);
                res.render('searchpage', {xmlstuff: result.result, title: 'Colenso Project', test:true});
            }
        });

        client.execute('exit', function () {
            console.log('session exited');
        });
   // });


});




router.post('/submit', function(req, res, next) {

    //router.use(bodyParser.text());
    client = new basex.Session("127.0.0.1", 1984, "admin", "admin");

    client.execute('open Colenso_TEIs', function(error, result){
        if(error){
         console.log("error opening DB");
        }
        else {
            console.log("DB opened");
        }
    });

    //get text
    console.log(req.body.Submit);
    console.log(req.body.name);
    client.add(req.body.name, req.body.Submit, function(error, result){
        if(error){
            console.log("something went wrong when adding");
            res.render('searchpage', { title: 'Colenso Project', submissionMessage: "file submited to database",test:false, message:"Problem while uploading, document no submitted!"});
        }
        else {
            console.log("file submitted");
            res.render('searchpage', { title: 'Colenso Project', submissionMessage: "file submited to database",test:false, message:"Document Submitted!"});
        }
    });


            client.execute('exit', function () {
            console.log('session exited');
    });

});






module.exports = router;

