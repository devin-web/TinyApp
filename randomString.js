"use strict";

module.exports = {
  generateRandomString: function() {
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
}