"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = "mongodb://127.0.0.1:27017/url_shortener";

console.log(`Connecting to MongoDB running at: ${MONGODB_URI}`);


var app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.use(bodyParser.urlencoded(
{
  extended: true
}));

var urlDatabase = {
  urls: {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
};

function generateRandomString() {
  let initialString = Math.random().toString(36).substr(2,6);
  let splitString = initialString.split("");
  let returnString = "";
  let lowerCaseRE = new RegExp("[a-z]");
  for( let characterIndex in splitString ){
    //console.log( splitString[characterIndex] );
     //do regex to find lower case letters
    if( splitString[characterIndex].search( lowerCaseRE ) !== -1 ){
    //randomly flip a coin to determine whether to upper case it
      if( Math.random() >= 0.5 ){
        splitString[characterIndex] = splitString[characterIndex].toUpperCase();
      }
    }
    returnString += splitString[characterIndex];
  }
  return returnString;
}

app.use(methodOverride('_method'));

app.delete("/urls/:urlToDelete", (req, res) => {
  console.log( "Deleting:", req.params.urlToDelete );
  delete urlDatabase.urls[req.params.urlToDelete];
  //res.end( "Deleting OK" );
  res.redirect("/urls");
});

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render( "pages/index" );
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  res.render("urls_index", urlDatabase );
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/*", (req, res) =>{
  console.log( req.url );
  let splitURL  = req.url.split("/");
  let shortURL  = splitURL[splitURL.length - 1];
  let longURL   = urlDatabase.urls[shortURL];
  console.log(  longURL );
  res.redirect( longURL );
});

function getLongURLfromShort( shortURL, cb ){
  MongoClient.connect(MONGODB_URI, (err, db) => {

    if (err) {
      console.log('Could not connect! Unexpected error. Details below.');
      throw err;
    }

    console.log('Connected to the database!');
    let collection = db.collection("urls");

    console.log('Retreiving document from the "test" collection...');
    collection.findOne({shortURL: shortURL} ).then( (value) =>
      {
        console.log("db value:", value);
        var longURL = value.longURL;
        console.log( "Calling cb with longURL", longURL );
        cb( longURL );
      });
    db.close();
  });
}


app.get("/urls/:shortURL", (req,res) =>{
  let shortURL = req.params.shortURL;
  let longURL = "";//urlDatabase.urls[req.params.shortURL];
  let templateURLs = {
                        url:  {  myShortUrl:  shortURL,
                                 myLongUrl:   longURL
                              }
                      };

  function respondToGetLongURL( longURL ){
    console.log( "response called" );
    templateURLs.url.myLongUrl = longURL;
    res.render( "urls_show", templateURLs );
  }
  getLongURLfromShort( shortURL, respondToGetLongURL );
});

app.put ("/urls/:shortURL", (req, res) =>{
  console.log( req.body.shortURL );
  console.log( req.body.longURL );
  urlDatabase.urls[ req.body.shortURL ] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  var longUrl = req.body;
  var newShortUrl = generateRandomString();
  console.log( "new URL: ", newShortUrl, longUrl.longURL );  // debug statement to see POST parameters

  while( urlDatabase.urls.hasOwnProperty( newShortUrl ) ){
    newShortUrl = generateRandomString();
    console.log( newShortUrl, longUrl.longURL );
  }
  urlDatabase.urls[newShortUrl] = longUrl.longURL;

  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

