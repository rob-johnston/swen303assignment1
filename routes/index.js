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

/* GET search page. */
router.get('/searchpage', function(req, res, next) {
    text="";
    var url_parts = url.parse(req.url, true)
    var query = url_parts.query;

    res.render('searchpage', {title: 'Colenso Project', test: "active", queryType: query.queryType});
});

/* GET submit page. */
router.get('/submit', function(req, res, next) {
    text="";

    res.render('submit', {title: 'Colenso Project', test:"active"});
});

/* GET edit page. */
router.get('/edit', function(req, res, next) {
    text="";

    res.render('edit', {title: 'Colenso Project'});
});






router.get('/search', function(req, res, next) {

    //router.use(bodyParser.text());
    client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
    var url_parts = url.parse(req.url, true)
    var query = url_parts.query;
    console.log(query.query)

    //if query type is standard do a normal style database search
    if(query.query==="standard"){

        //figure out proper query for string with multiple words
        var arrayOfWords = query.search.split(" ");

        var altquery = '';
        client.execute('open Colenso_TEIs');
        //loop through to construct string query
        for(var i = 0; i<arrayOfWords.length; i++){
            altquery = altquery + ' /descendant-or-self::*[text() contains text "' + arrayOfWords[i] + '\"] | ';
        }
        //s
        altquery = altquery.substring(0,altquery.length-3);

        var myquery = ' /descendant-or-self::*[text() contains text "' + query.search + '\"]';
        var result = client.query(altquery);

            result.execute( function(error, result){
                if(error) {
                    console.error(error);
                } else{
                    //result.result=result.result.replace(/<\/p>/g,"\n");
                    res.render('searchpage', { xmlstuff: result.result, title: 'Colenso Project', queryType: query.query});
                }
            });
            client.execute('exit', function () {
                console.log('session exited');
            });


        //otherwise run a specific jquery search
    } else if (query.query==='jquery') {

        client.execute('open Colenso_TEIs');

        var myquery = "XQUERY declare namespace tei= 'http://www.tei-c.org/ns/1.0'; " ;
        //var myquery = "XQUERY " ;
        myquery = myquery + query.search;
        console.log(myquery);

        //var result = client.query(myquery);

        client.execute( myquery, function(error, result){
            if(error) {
                console.error(error);
            } else{
                //result.result=result.result.replace(/<\/p>/g,"\n");
                res.render('searchpage', { xmlstuff: result.result, title: 'Colenso Project', queryType: query.query});
            }
        });
        client.execute('exit', function () {
            console.log('session exited');
        });

    }

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
            res.render('searchpage', { title: 'Colenso Project', submissionMessage: "file submited to database", message:"Problem while uploading, document no submitted!"});
        }
        else {
            console.log("file submitted");
            res.render('searchpage', { title: 'Colenso Project', submissionMessage: "file submited to database", message:"Document Submitted!"});
        }
    });
            client.execute('exit', function () {
            console.log('session exited');
    });

});


module.exports = router;

