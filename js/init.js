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

GAME.$showModal = function(content,className,idName) {
	var classHTML = (className) ? ' '+className : '',
		idHTML = (idName) ? ' id="'+idName+'"' : '';
	GAME.$id('formBg').style.display = 'block';
	GAME.$id('modalBg').style.display = 'block';
	if(content) {
		GAME.$id('formBg').innerHTML = '<div class="modal'+classHTML+'"'+idHTML+'>'+content+'</div>';
	}
};

GAME.$hideModal = function() {
	GAME.$id('formBg').style.display = 'none';
	GAME.$id('modalBg').style.display = 'none';
};

GAME.$form = function(item,question,answers) {
	return "<div class='header'>"+
			"<span class='photo' style='background-position: -"+(item.id*100)+"px 0;'></span>"+
			"<span id='message'>What's the <strong>"+question+"</strong> of this person?</span>"+
		"</div>"+
		"<form id='form'>"+
			"<p><input type='radio' name='q' value='"+answers[0]+"' id='radio1' /> <label id='radio1label' for='radio1'>"+answers[0]+"</label></p>"+
			"<p><input type='radio' name='q' value='"+answers[1]+"' id='radio2' /> <label id='radio2label' for='radio2'>"+answers[1]+"</label></p>"+
			"<p><input type='radio' name='q' value='"+answers[2]+"' id='radio3' /> <label id='radio3label' for='radio3'>"+answers[2]+"</label></p>"+
		"</form>"+
		"<div class='continue'><span id='continue'>Continue</span></div>";
};

GAME.$txt = {
	'halfway': "<div>Nice, You're half way thru! You've managed to solve the first 10 pairs of photos, let's see how You'll handle the second part of the game.</div>",
	'continue': "<div class='continue'><span id='newLevel'>Continue</span></div>",
	'correct': "Congratulations, your answer is correct!",
	'wrong': "Oh no, wrong answer, no points this time...",
	'close': "<div class='continue'><span id='close'>Close</span></div>"
};

GAME.API = {};

GAME.API.localStorage = function(action) {
	try {
		var localStorageSupport = 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
	if(localStorageSupport) {
		var bestPoints = localStorage.getItem('frontface_points') || 0;
		if(action == 'showScore') {
			var storageTime = localStorage.getItem('frontface_time') || 0,
				minHTML = ~~(storageTime/60),
				sec = (storageTime%60),
				secHTML = (sec < 10) ? '0'+sec : sec;
		}
		else if(action == 'saveScore') {
			if(GAME._points > bestPoints) { // congrats, you beat the score - new personal best
				bestPoints = GAME._points;
				localStorage.setItem('frontface_points', GAME._points);
				localStorage.setItem('frontface_trials', GAME._trials);
				localStorage.setItem('frontface_time', GAME._time);
				var minHTML = ~~(GAME._time/60),
					sec = (GAME._time%60),
					secHTML = (sec < 10) ? '0'+sec : sec;
			}
		}
		GAME.$id('score').innerHTML = 'Your best score: <strong>'+bestPoints+'</strong> points in <strong>'+minHTML+':'+secHTML+'</strong>.';
	}
};

GAME.API.offline = function() {
	// offline
};

GAME.API.geolocation = function() {
	if (navigator.geolocation) {
		//console.log('Geolocation is supported!');

		var startPos;
		navigator.geolocation.getCurrentPosition(function(position) {
			startPos = position;
			GAME.$id('geo').innerHTML = '[ Lat: '+(~~startPos.coords.latitude)+' | Lon: '+(~~startPos.coords.longitude)+' ] Click 4 popup & more!';
		});
	}
	else {
		//console.log('Geolocation is not supported for this Browser/OS version yet.');
	}

	// calculat the distance between the Warsaw and the user's current location
	// http://www.html5rocks.com/en/tutorials/geolocation/trip_meter/
	// http://breakthebit.org/post/10512237123/using-html5-geolocation-api-to-get-the-distance-of-the
	// http://mobile.tutsplus.com/tutorials/mobile-web-apps/html5-geolocation/
	// http://www.ip2location.com/html5geolocationapi.aspx
	// http://www.sitepoint.com/using-the-html5-geolocation-api/
	// http://spektom.blogspot.com/2010/05/html5-geolocation-api-is-scaring-me.html
	// http://robertnyman.com/2010/03/15/geolocation-in-web-browsers-to-find-location-google-maps-examples/
	// !!! http://robertnyman.com/html5/geolocation/current-location-and-directions.html !!!
	/*
	document.getElementById('distance').innerHTML =
		calculateDistance(startPos.coords.latitude, startPos.coords.longitude,
			position.coords.latitude, position.coords.longitude);
	*/
};

GAME.ThreeD = function() {
	//console.log('3D!');

	var threeHTML = ''+
	'<div class="cubecontainer labeled">'+
		'<ul class="cube left">'+
			'<li class="front" id="side_0" data-label="Front">Front</li>'+
			'<li class="left" id="side_1" data-label="Left">Left</li>'+
			'<li class="back" id="side_2" data-label="Back">Back</li>'+
			'<li class="right" id="side_3" data-label="Right">Right</li>'+
			'<li class="bottom" id="side_4" data-label="Bottom">Bottom</li>'+
			'<li class="top" id="side_5" data-label="Top">Top</li>'+
		'</ul>'+
	'</div>';
	//GAME.$id('start').style.display = 'none';
	GAME.$id('board').innerHTML = threeHTML;

	var docelm = document.documentElement,
	    testprops = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective',  
	                 'OPerspective', 'msPerspective'],
	    i = testprops.length, 
	    canperspective = false,
	    cubes = document.querySelectorAll( '.cubecontainer' ),
	    sides = [ 'front', 'left', 'back', 'right', 'top', 'bottom' ],
	    nav = out = side = all = t = null;

	while( i-- ) {
	  if ( docelm.style[ testprops[ i ] ] !== undefined ) {
	    docelm.className += ' perspective';
	    canperspective = true;
	    break;
	  }
	}

	if( canperspective ) {
	  i = cubes.length;
	  while( i-- ) {
	    nav = document.createElement( 'nav' );
	    cubes[i].insertBefore( nav, cubes[i].firstChild );
	    all = sides.length;
	    out = '<ul>';
	    for ( var j = 0; j < all; j++ ) {
	      side = cubes[i].querySelector( '.cube .' + sides[j] );
	      if( side ) {
	        out += '<li><button data-trigger="' + side.className + '">' + 
	                side.getAttribute( 'data-label' ) +
	               '</button></li>';
	      }
	    }
	    out += '</ul>';
	    nav.innerHTML = out;
	    cubes[i].addEventListener( 'click', function(evt) {
	      t = evt.target;
	      if ( t.tagName === 'BUTTON' && t.getAttribute('data-trigger') ) {
	        t.parentNode.parentNode.parentNode.parentNode
	        .querySelector('.cube').className = 'cube '+
	        t.getAttribute('data-trigger');
	      }  
	    }, false);
	  }
	}

	GAME.Start('3d');
};





