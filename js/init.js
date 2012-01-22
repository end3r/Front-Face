"use strict";
var GAME = {};
GAME.$id = function(id) { return document.getElementById(id); };

GAME.shuffleArray = function(array) {
 	var len = array.length;
	var i = len;
	 while (i--) {
	 	var p = parseInt(Math.random()*len);
		var t = array[i];
  		array[i] = array[p];
	  	array[p] = t;
 	}
};