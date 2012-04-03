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
	if(GAME.$id('close')) {
		GAME.$id('close').onclick = function() { GAME.$hideModal(); }
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
	'halfway': "<h2>Nice, You're half way through!</h2><div>You've managed to solve the first 10 pairs of photos, let's see how You'll handle the second part of the game!</div><p class='modal-img'></p>",
	'gameover': "<h2>You've finished the game, congratulations!</h2><div>You've scored <strong>[0P]</strong> points out of possible 200, that's <strong>[0%]%</strong>!</div><div>You did it in <strong>[0M] minutes</strong> and <strong>[0S] seconds</strong>!</div><p class='modal-img'></p><div class='tweet'><a  href='[TWEET]'>Tweet Your score!</a></div><div class='remember'><strong>REMEMBER: </strong>Leave a <strong><a href=''>comment</a></strong> (with a link to the tweet with Your score) to have a chance of winning the ticket for the Front-Trends 2012 conference.</div><div class='continue'><span class='again'><a href='/'>Play again</a></span><span id='close'>Close</span></div>",
	'winticket': "<h2>How to win a ticket</h2><ol><li>Play the game and finish it.</li><li>Tweet Your score.</li><li>Leave a <a target='_blank' href=''>comment on the blog</a> with a link to the tweet with Your score.</li><li>Keep Your fingers crossed!</li><li>The lucky winner will be picked at random.</li></ol>",
	'showscore': "<h2>Your best score</h2><div>Your best score: <strong>[0P] points</strong> out of possible 200.</div><div>This gives You <strong>[0%]%</strong> overall points!</div><div>You finished the game in <strong>[0M] minutes</strong> and <strong>[0S] seconds</strong>!</div><div>In the given time You compared the photos [0C] times.</div><div>Congratulations!</div>",
	'continue': "<div class='continue'><span id='newLevel'>Continue</span></div>",
	'correct': "Congratulations, your answer is correct!",
	'wrong': "Wrong answer, maybe next time...",
	'tweet': "https://twitter.com/intent/tweet?original_referer=http%3A%2F%2Fend3r.com%2Fgames%2Ffrontface%2F&text=I’ve played Front-Face and scored [0P] points in [0T], can you beat that? Play to win 1 ticket for @fronttrends conf!&url=http%3A%2F%2Fend3r.com%2Fgames%2Ffrontface%2F",
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
				secHTML = (sec < 10) ? '0'+sec : sec,
				trials = localStorage.getItem('frontface_trials') || 0;
		}
		else if(action == 'saveScore') {
			if(GAME._points > bestPoints) { // congrats, you beat the score - new personal best
				bestPoints = GAME._points;
				localStorage.setItem('frontface_points', GAME._points);
				localStorage.setItem('frontface_trials', GAME._trials);
				localStorage.setItem('frontface_time', GAME._time);
			}
			var minHTML = ~~(GAME._time/60),
				sec = (GAME._time%60),
				secHTML = (sec < 10) ? '0'+sec : sec;
		}
		GAME.$id('score').innerHTML = 'Best score: <span>'+bestPoints+'</span> points in <span>'+minHTML+':'+secHTML+'</span>.';
		return {
			'points': bestPoints,
			'minutes': minHTML,
			'seconds': secHTML,
			'trials': trials
		}
	}
};

//GAME.API.offline = function() {};

GAME.API.geolocation = function() {
	// Demo by Robert Nyman taken from:
	// http://robertnyman.com/html5/geolocation/current-location-and-directions.html

	GAME.$showModal('<div id="map-container"><div id="map">Loading...</div><div id="map-directions"></div></div>'+GAME.$txt.close,'modalBig');

	var directionsService = new google.maps.DirectionsService(),
		directionsDisplay = new google.maps.DirectionsRenderer(),
		createMap = function (start) {
			var travel = {
					origin : (start.coords)? new google.maps.LatLng(start.lat, start.lng) : start.address,
					destination : "Mińska 25, Warszawa",
					travelMode : google.maps.DirectionsTravelMode.DRIVING
				},
				mapOptions = {
					zoom: 10,
					// Default view: Warsaw
					center : new google.maps.LatLng(52.025459, 19.204102),
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};

			var map = new google.maps.Map(document.getElementById("map"), mapOptions);
			directionsDisplay.setMap(map);
			directionsDisplay.setPanel(document.getElementById("map-directions"));
			directionsService.route(travel, function(result, status) {
				if (status === google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(result);
					
					//console.log('DISTANCE: '+result.routes[0].legs[0].distance.text);
					GAME.$id('geo').innerHTML = "You're "+result.routes[0].legs[0].distance.text+" from the venue!";
				}
			});
		};

		// Check for geolocation support	
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
					// Success!
					createMap({
						coords : true,
						lat : position.coords.latitude,
						lng : position.coords.longitude
					});
				}, 
				function () {
					// Gelocation fallback: Defaults to Warsaw
					createMap({
						coords : false,
						address : "Warszawa"
					});
				}
			);
		}
		else {
			// No geolocation fallback: Defaults to Warsaw
			createMap({
				coords : false,
				address : "Warszawa"
			});
		}
};

GAME.ThreeD = function() {
	// Demo by Chris Heilmann taken from:
	// http://hacks.mozilla.org/2012/03/getting-you-started-for-the-css-3d-transform-dev-derby-15-minute-screencast/

	GAME.TimerStop();
	GAME.$id('')

	var threeHTML = ''+
	'<div class="cubecontainer">'+
		'<ul class="cube left">'+
			'<li class="front" id="side_0" data-label="Front">Front</li>'+
			'<li class="left" id="side_1" data-label="Left">Left</li>'+
			'<li class="back" id="side_2" data-label="Back">Back</li>'+
			'<li class="right" id="side_3" data-label="Right">Right</li>'+
			'<li class="bottom" id="side_4" data-label="Bottom">Bottom</li>'+
		//	'<li class="top" id="side_5" data-label="Top">Top</li>'+
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
	    nav = null, out = null, side = null, all = null, t = null;

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





