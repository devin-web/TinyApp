"use strict";

require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
const tinyAppDB = require( "./tinyAppDB" );

var dataBase;
var app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded(
{
  extended: true
}));

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
});


app.get("/", (req, res) => {
  res.render( "pages/index" );
});

app.get("/urls", (req, res) => {
  function dbResponse( err, data ){
    if(err){
      res.render( "500_server_error" );
    }
    else {
      res.render( "urls_index", data );
    }
  }

  tinyAppDB.getAllURLs(dataBase, dbResponse);
})

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) =>{
  //let splitURL  = req.url.split("/");
  let shortURL  = req.params.shortURL;//splitURL[splitURL.length - 1];
  function doRedirect( err, longURL ){
    if(err){
      res.render( "500_server_error" );
    }
    else {
      res.redirect( longURL );
    }
  }
  tinyAppDB.getLongURLfromShort( dataBase, shortURL, doRedirect );
});

app.get("/urls/:shortURL", (req,res) =>{
  let shortURL = req.params.shortURL;
  let longURL = "";
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
      templateURLs.url.myLongUrl = longURL;
      res.render( "urls_show", templateURLs );
    }
  }
  tinyAppDB.getLongURLfromShort( dataBase, shortURL, showLongURL );
});

app.put ("/urls/:shortURL", (req, res) =>{
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