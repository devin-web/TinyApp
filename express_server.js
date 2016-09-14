var express = require("express");
const bodyParser = require("body-parser");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.use(bodyParser.urlencoded());

var urlDatabase = {
  urls: {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
};

function generateRandomString() {
  var initialString = Math.random().toString(36).substr(2,6);
  var splitString = initialString.split("");
  var returnString = "";
  var lowerCaseRE = new RegExp("[a-z]");
  for( var characterIndex in splitString ){
    console.log( splitString[characterIndex] );
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

app.get("/urls/*", (req, res) =>{
  console.log( req.url );
  var splitURL  = req.url.split("/");
  var shortURL  = splitURL[splitURL.length - 1];
  var longURL   = urlDatabase.urls[shortURL];
  console.log(  longURL );
  res.redirect( longURL );
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

