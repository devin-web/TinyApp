"use strict";

const randString = require("./randomString");
const MongoClient = require("mongodb").MongoClient;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/url_shortener";

module.exports = {
  connectToDB: function( cb ){
    console.log(`Connecting to MongoDB running at: ${MONGODB_URI}`);
    MongoClient.connect(MONGODB_URI, (err, db) => {

      if (err) {
        console.log('Could not connect! Unexpected error. Details below.');
        cb( err );
      }

      console.log('Connected to the database!');

      cb( null, db );
    });
  },

  setLongURL: function( db, cb, shortURL, longURL ){
    let collection = db.collection("urls");

    collection.update(
      { "shortURL":
        {
          $eq: shortURL
        }
      },
      { $set:
        {
          "longURL": longURL
        }
      });
    cb( null );
  },

  getAllURLs: function( db, cb ){
    let collection = db.collection("urls");

    collection.find().toArray((err, resultsArray) => {
      let results = { urls:{} };
      for( let resultIndex in resultsArray ){
        results.urls[resultsArray[resultIndex].shortURL]
                   = resultsArray[resultIndex].longURL;
      }
      cb( err, results );
    });
  },

  getLongURLfromShort: function( db, shortURL, cb ){
    let collection = db.collection("urls");

    collection.findOne( { "shortURL": shortURL} ).then( (value) =>
    {
      var longURL = value.longURL;
      cb( null, longURL );
    });
  },

  addNewURL: function( db, longURL, cb ){
    let collection = db.collection("urls");

    function findNewShortURL() {
      let newShortURL = randString.generateRandomString();

      collection.findOne( { "shortURL": newShortURL } ).then( (value) => {
        if ( value !== null ){
          findNewShortURL();
        }
        else {
          collection.insert( {
              "shortURL": newShortURL,
              "longURL": longURL
          });
          cb( null, newShortURL );
        }
      });
    }
    findNewShortURL();
  },

  deleteRecord: function( db, shortURL, cb ){
    let collection = db.collection("urls");

    collection.remove({  "shortURL": shortURL }).then( (value) => {
      cb( null );
    });
  }
}