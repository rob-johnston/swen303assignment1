var express = require('express');
var router = express();
var bodyParser = require('body-parser');

var cheerio = require('cheerio');
//var basex = require('basex');
var basex = require('simple-basex');
//var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
var client = new basex.Session();
var url = require('url');
var text;




/* GET home page. */
router.get('/', function(req, res, next) {
    text="";

  res.render('index', {title: 'Colenso Project', image: "images/museum.png", xmlstuff: text});
});

/* GET home page. */
router.get('/searchpage', function(req, res, next) {
    text="";

    res.render('searchpage', {title: 'Colenso Project'});
});




router.get('/search', function(req, res, next) {

    //router.use(bodyParser.text());
    client = new basex.Session();
    var url_parts = url.parse(req.url, true)
    var query = url_parts.query;




    client.execute('open Colenso_TEIs');

    var myquery = ' /descendant-or-self::*[text() contains text "' + query.search + '\"]';

    client.query(myquery, function (err, result) {
        if (err) throw err;


        var parseString = require('xml2js').parseString;
        parseString(result, {trim: true}, function (err, result) {
            console.log(result);
        });

        res.render('searchpage', {xmlstuff: result, title: 'Colenso Project'});

        client.execute('exit', function () {
            console.log('session exited');
        });
    });


});







module.exports = router;

