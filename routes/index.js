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
var searchmap = new Object();
var stringarray = [];







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

    res.render('searchpage', {title: 'Colenso Project', test: "active", queryType: query.queryType, popular1:stringarray[0], popular2:stringarray[1], popular3:stringarray[2], popular4:stringarray[3], popular5:stringarray[4] });
});

/* GET submit page. */
router.get('/submit', function(req, res, next) {
    text="";

    res.render('submit', {title: 'Colenso Project', test:"active"});
});

/* GET edit page. */
router.get('/edit', function(req, res, next) {
    text="";

    res.render('edit', {title: 'Colenso Project', content:''});

});

router.get('/submitchanges', function(req, res, next) {
    text="";

    res.render('edit', {title: 'Colenso Project', content:''});

});


/* deals with loading up an xml file to edit*/

router.get('/loadfile', function(req,res,next){


    var urlparts = url.parse(req.url, true);
    console.log(urlparts.query.name);


    var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
    //create and xquery string for getting whats in the document, also be nice and add
    //the root directory to make things a little easier for the user
    var queryString = "XQUERY doc(\'" + "Colenso_TEIs/" + urlparts.query.name + "\')";
    console.log(queryString);

    client.execute('OPEN Colenso_TEIs', function(error, result) {
        if (error) {
            console.log("error opening DB");
        }
        else {
            console.log("DB opened");
        }
    });


    client.execute(queryString, function(error, result){

        res.render('edit', {title: 'Colenso Project', content: result.result, loadedfile:urlparts.query.name});
    });

    client.execute('exit', function () {
        console.log('session exited');
    });

});

/* replaces a file in the database with a new file, the second half of the edit function basically */
router.post('/submitchanges', function(req,res,next){

    var client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
    var urlparts = url.parse(req.url, true);

    client.execute('OPEN Colenso_TEIs', function(error,result){
        if(!error){
            console.log("DB opened");
        }
    });

    console.log("replacing to path : " + req.body.file );

    var textToSubmit = req.body.text;
    var path = req.body.file;


    client.replace(path,textToSubmit, function(error, result){
        if(error){
            res.render('edit', {title: 'Colenso Project', content: req.body.text, loadedfile:req.body.file, status:"File NOT submitted, please check your xml"});
        } else {
            res.render('edit', {title: 'Colenso Project',  loadedfile:"", status:"File submitted successfuly"});
        }

    });



});




router.get('/search', function(req, res, next) {

    searchmap

    //router.use(bodyParser.text());
    client = new basex.Session("127.0.0.1", 1984, "admin", "admin");
    var url_parts = url.parse(req.url, true)
    var query = url_parts.query;


    //if query type is standard do a normal style database search
    if(query.query==="standard"){

        //a little bit of map logic to keep track of searches - complicated because js is complicated
        //add to map, search as key, value as number
            if(searchmap[query.search]===undefined){
                searchmap[query.search] = 1;
            } else {
                searchmap[query.search]=searchmap[query.search]+1;
            }
            //now we determine whats in our array of search terms
            var newObject =  JSON.parse(JSON.stringify(searchmap));
            var highcount=0;
            var highstring;
            var i=0;

            var totalsearches=0;
            for (var item in searchmap){
                totalsearches+=searchmap[item];
            }


            for(; i<5; i++ ) {
                if(i===totalsearches){ break;}

                for (var item in newObject) {
                    if (newObject[item] > highcount) {
                        highcount = newObject[item];
                        highstring = item;
                    }
                }

                stringarray[i] = highstring;
                newObject[highstring]=0;
                highcount=0;

            }

        //figure out proper query for string with multiple words
        var arrayOfWords = query.search.split(" ");

        //check for logical operators
        //if(arrayOfWords.indexOf("&")>-1){
        //    console.log("ampersand detected");
        //}

        var altquery = '';
        client.execute('open Colenso_TEIs');
        //loop through to construct string query
        for(var i = 0; i<arrayOfWords.length; i++){


            if(arrayOfWords[i]==="&") {
                altquery = altquery + ' /descendant-or-self::*[text() contains text "' + arrayOfWords[i] + '\"] ftand ';
            }
            else if (arrayOfWords[i]==="!"){
                    altquery = altquery + ' /descendant-or-self::*[text() contains text "' + arrayOfWords[i] + '\"] ftnot ';
                }
             else {

                altquery = altquery + ' /descendant-or-self::*[text() contains text "' + arrayOfWords[i] + '\"] | ';

            }


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
                    res.render('searchpage', { xmlstuff: result.result, title: 'Colenso Project', queryType: query.query, popular1:stringarray[0], popular2:stringarray[1], popular3:stringarray[2], popular4:stringarray[3], popular5:stringarray[4]});
                }
            });
            client.execute('exit', function () {
                console.log('session exited');
            });


        //otherwise run a specific jquery search
    } else if (query.query==='jquery') {

        client.execute('open Colenso_TEIs');

        var myquery = "XQUERY declare default element namespace 'http://www.tei-c.org/ns/1.0'; " ;

        myquery = myquery + query.search;
        console.log(myquery);

        //var result = client.query(myquery);
        var success;

        client.execute( myquery, function(error, result){
            if(error) {
                console.error(error);
                success=false;
            } else{
                success=true;
                //result.result=result.result.replace(/<\/p>/g,"\n");
                res.render('searchpage', { xmlstuff: result.result, title: 'Colenso Project', queryType: query.query, popular1:stringarray[0], popular2:stringarray[1], popular3:stringarray[2], popular4:stringarray[3], popular5:stringarray[4]});
            }



        });

        if(!success){
            console.log("trying alt query");
            var alternativequery = "XQUERY declare namespace tei= 'http://www.tei-c.org/ns/1.0'; " ;
            alternativequery= alternativequery+query.search;
            client.execute(alternativequery,function(error,result){
                if(error){
                    console.log("total error")
                }
                else {
                    res.render('searchpage', { xmlstuff: result.result, title: 'Colenso Project', queryType: query.query, popular1:stringarray[0], popular2:stringarray[1], popular3:stringarray[2], popular4:stringarray[3], popular5:stringarray[4]});
                }

            });
        }
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


    var thetext = req.body.text.repeat(1);
    console.log(req.body.name);

    client.add(req.body.name, req.body.text, function(error, result){
        if(error){
            console.log("something went wrong when adding");
            res.render('submit', { title: 'Colenso Project', submissionMessage: "Submission Failed", message:"Problem while uploading, document not submitted!", content:thetext, contentname:req.body.name});
        }
        else {
            console.log("file submitted");
            res.render('submit', { title: 'Colenso Project', submissionMessage: "file submitted to database", message:"Document Submitted!", content:thetext, contentname:req.body.name});
        }
    });
            client.execute('exit', function () {
            console.log('session exited');
    });

});


module.exports = router;

