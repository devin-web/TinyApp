"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const tinyAppDB = require( "./tinyAppDB" );

var dataBase;
var app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.use(bodyParser.urlencoded(
{
  extended: true
}));
/*
var urlDatabase = {
  urls: {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
};
*/

app.use(methodOverride('_method'));

app.delete("/urls/:urlToDelete", (req, res) => {
  console.log( "Deleting:", req.params.urlToDelete );

  function deletionComplete( err ){
    if( err ){
      res.redirect( "500_server_error" );
    }
    else
    {
      res.redirect("/urls")
    }
  }
  tinyAppDB.deleteRecord( dataBase, req.params.urlToDelete, deletionComplete );
  // delete urlDatabase.urls[req.params.urlToDelete];
  //res.end( "Deleting OK" );
  //res.redirect("/urls");
});

app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.render( "pages/index" );
});

app.listen(PORT, () => {
  console.log(`Server app listening on port ${PORT}!`);
  function onConnectionComplete( err, db ){
    if( err ){
      console.log("Fatal Error, no DB connection");
      return;
    }
    dataBase = db;
  }
  tinyAppDB.connectToDB( onConnectionComplete );
});

app.get("/urls", (req, res) => {
  function dbResponse( err, data ){
    if(err){
      res.render( "500_server_error" );
    }
    else {
      console.log( "urls_index with data:", data );
      res.render( "urls_index", data );
    }
  }

  tinyAppDB.getAllURLs(dataBase, dbResponse);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/*", (req, res) =>{
  console.log( req.url );
  let splitURL  = req.url.split("/");
  let shortURL  = splitURL[splitURL.length - 1];
  function doRedirect( err, longURL ){
    if(err){
      res.render( "500_server_error" );
    }
    else {
      console.log(  longURL );
      res.redirect( longURL );
    }
  }
  tinyAppDB.getLongURLfromShort( dataBase, shortURL, doRedirect );
});

app.get("/urls/:shortURL", (req,res) =>{
  let shortURL = req.params.shortURL;
  let longURL = "";//urlDatabase.urls[req.params.shortURL];
  let templateURLs = {
                        url:  {  myShortUrl:  shortURL,
                                 myLongUrl:   longURL
                              }
                      };

  function showLongURL( err, longURL ){
    if(err){
      res.render( "500_server_error" );
    }
    else {
      console.log( "response called" );
      templateURLs.url.myLongUrl = longURL;
      res.render( "urls_show", templateURLs );
    }
  }
  tinyAppDB.getLongURLfromShort( dataBase, shortURL, showLongURL );
});

app.put ("/urls/:shortURL", (req, res) =>{
  console.log( req.body.shortURL );
  console.log( req.body.longURL );
  //urlDatabase.urls[ req.body.shortURL ] = req.body.longURL;
  function longURLSetDone( err ){
    if( err ){
      res.redirect( "500_server_error" );
    }
    else{
      res.redirect( "/urls" );
    }
  }
  tinyAppDB.setLongURL( dataBase, longURLSetDone, req.body.shortURL, req.body.longURL );
});

//This post comes from urls/new
app.post("/urls", (req, res) => {
  var longURL = req.body.longURL;

  function newURLaddedToDB( err, newShortUrl ){
    if( err ){
      res.redirect( "500_server_error" );
    }
    else{
      res.redirect( "/urls" );
    }
  }
  tinyAppDB.addNewURL( dataBase, longURL, newURLaddedToDB );
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

