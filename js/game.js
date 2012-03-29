GAME.Init = function() {
	// shuffle the input data so it looks kinda random
	for (var i = 10; i >= 0; i--) {
		GAME.shuffleArray(GAME.data);
	}
	GAME.$id('start').onclick = function() { if(!GAME._active) GAME.Start(); };
	GAME.$id('howto').onclick = function() { GAME.Page('howto'); };
	GAME.$id('about').onclick = function() { GAME.Page('about'); };
	GAME.$id('threedee').onclick = function() { GAME.ThreeD(); };
	GAME._counter = 10;
	GAME.API.localStorage('showScore');
	GAME.$id('geo').onclick = function() { GAME.API.geolocation(); };
	GAME.$id('ticket').onclick = function() {
		GAME.$showModal('info about winning the ticket'+GAME.$txt.close);
		GAME.$id('close').onclick = function() { GAME.$hideModal(); }
	};
};

GAME.Start = function(opt) {
	GAME.$id('board').className = 'board';
	if(opt == '3d') {
		GAME.NewLevel(0);
	}
	else {
		GAME.NewLevel(1);
	}
	GAME._time = 0;
	GAME.Timer();
	GAME._active = true;
	GAME._visible = [];
	GAME._points = 0;
	GAME._trials = 0;
	GAME._questions = 0;
};

GAME.NewLevel = function(lvl) {
	// generate HTML structure of the game board
	var board = GAME.$id('board');
	for (var i = 0, elements = ''; i < GAME._counter*2; i++) {
		elements += '<p id="card_'+i+'"></p>';
	}

	// bind clicks to the cards
	if(lvl) {
		board.innerHTML = elements;
	}
	else {
		lvl = 1;
		for (var i = 0; i < 5; i++) {
			var cardHTML = '';
			for (var j = 0; j < 4; j++) {
				cardHTML += '<p id="card_'+(i*4+j)+'"></p>';
			}
			GAME.$id('side_'+i).innerHTML = cardHTML;//'<p id="card_'+(i*4)+'"></p><p id="card_'+(i*4+1)+'"></p><p id="card_'+(i*4+2)+'"></p><p id="card_'+(i*4+3)+'"></p>';
		}
	}

	var els = board.getElementsByTagName('p');
	for(var i=els.length-1; i>=0; i--) {
		els[i].onclick = function() { GAME.CardClick(this); };
	}

	GAME._board = [];
	// take the items from the data table and add them twice
	for(var i = 0; i < GAME._counter; i++) {
		var data = GAME.data[((lvl-1)*GAME._counter)+i];
		GAME._board.push(data, data);
	}

	// shuffle array 10 times - just to be sure it's more or less random
	for (var i = 10; i >= 0; i--) {
		GAME.shuffleArray(GAME._board);
	}
};

GAME.HideCards = function() {
	var item1 = GAME._visible.pop(),
		item2 = GAME._visible.pop(),
		myItem1 = GAME.$id('card_'+item1.card_id),
		myItem2 = GAME.$id('card_'+item2.card_id);
	myItem1.className = '';
	myItem1.style.backgroundPosition = '';
	myItem2.className = '';
	myItem2.style.backgroundPosition = '';
	GAME._active = true;
	myItem1.onclick = function() { GAME.CardClick(this); };
	myItem2.onclick = function() { GAME.CardClick(this); };
};

GAME.DisableCards = function() {
	var item1 = GAME._visible.pop(),
		item2 = GAME._visible.pop(),
		myItem1 = GAME.$id('card_'+item1.card_id),
		myItem2 = GAME.$id('card_'+item2.card_id);
	myItem1.className = 'disabled';
	myItem1.onclick = function() {};
	myItem2.className = 'disabled';
	myItem2.onclick = function() {};
	GAME._active = true;
};

GAME.CardClick = function(card) {
	if(GAME._active) {
		var card_id = card.id.split('_')[1],
			item = GAME._board[card_id];

		card.onclick = function() {};
		card.className = 'visible';
		card.style.backgroundPosition = '-'+(item.id*100)+'px 0';
		GAME._visible.push({'item_id':item.id,'card_id':card_id});

		if(GAME._visible.length == 2) { // two visible cards
			if(GAME._visible[0].item_id == GAME._visible[1].item_id) { // the same card ID
				// show the form with the question
				setTimeout(GAME.DisableCards,1);
				GAME.Form(item);
			}
			else {
				setTimeout(GAME.HideCards,1000);
			}
			GAME._active = false;
			GAME._trials += 1;
			GAME.$id('trials').innerHTML = GAME._trials;
		}
	}
};

GAME.Form = function(item) {
	var question = {
		txt: ['name','website','Twitter username','topic of the talk'],
		id: ['name','website','twitter','topic'],
		nr: -1,
		tab: []
	};

	do {
		question.nr = ~~(Math.random()*4);
		var subject = question.id[question.nr];
	} while(item[subject] == '');
	
	var answerTable = [];

	// push one proper answer...
	answerTable.push(item[subject]);

	// ...and get the two different random answers
	do {
		var randomAnswer = GAME.data[~~(Math.random()*GAME.data.length)][subject];
		if(randomAnswer) {
			var inUse = false;
			for(var i = 0; i < answerTable.length; i++) {
				if(answerTable[i] == randomAnswer) {
					inUse = true;
				}
			}
			if(!inUse) {
				answerTable.push(randomAnswer);
			}
		}
	} while(answerTable.length < 3);

	GAME.shuffleArray(answerTable);

	var formHTML = GAME.$form(item,question.txt[question.nr],answerTable);
	GAME.$showModal(formHTML);
	GAME.$id('radio1').onclick = function() { GAME.CheckAnswer(this,item[subject]); };
	GAME.$id('radio2').onclick = function() { GAME.CheckAnswer(this,item[subject]); };
	GAME.$id('radio3').onclick = function() { GAME.CheckAnswer(this,item[subject]); };
	GAME.$id('continue').style.visibility = 'hidden';
	//document.getElementsByTagName('input').onclick = function() { GAME.CheckAnswer(this); };
};

GAME.CheckAnswer = function(chosen,correct) {
	if(chosen.value == correct) {
		GAME.$id('message').innerHTML = GAME.$txt.correct;
		chosen.style.background = 'green';
		GAME._points += 10;
		GAME.$id('points').innerHTML = GAME._points;
		GAME.$id(chosen.id+'label').style.color = 'green';
		GAME.$id(chosen.id+'label').innerHTML;// += ' ✓';
	}
	else {
		GAME.$id('message').innerHTML = GAME.$txt.wrong;
		GAME.$id(chosen.id+'label').style.color = 'red';
		GAME.$id(chosen.id+'label').innerHTML;// += ' ✗';
	}
	
	GAME._questions += 1;
	GAME.$id('questions').innerHTML = GAME._questions;
	GAME.$id('continue').style.visibility = 'visible';
	GAME.$id('radio1').disabled = true;
	GAME.$id('radio2').disabled = true;
	GAME.$id('radio3').disabled = true;
	GAME.$id('form').className = 'disabled';
//	GAME.$id(correct.id+'label').style.color = 'green';

	GAME.$id('continue').onclick = function() {
		GAME.$hideModal();
		if(GAME._questions == 1) {
			setTimeout(function(){
				GAME.$showModal(GAME.$txt.halfway+GAME.$txt.continue,'halfway');
				GAME.$id('newLevel').style.visibility = 'visible';
				GAME.$id('newLevel').onclick = function() {
					GAME.$hideModal();
					GAME.NewLevel(2);
				};
			},200);
		}
		else if(GAME._questions == 2) {
			setTimeout(function(){
				GAME.TimerStop();
				GAME.Page('gameover');
			},200);
		}
	}
};

GAME.Timer = function() {
	var sec = ~~(GAME._time%60),
		min = ~~(GAME._time/60),
		secHTML = (sec < 10) ? '0'+sec : sec,
		minHTML = (min < 10) ? '0'+min : min;
	GAME.$id('time').innerHTML = minHTML+':'+secHTML;
	GAME._time++;
	GAME.TimerClock = setTimeout('GAME.Timer()',1000);
};

GAME.TimerStop = function() {
	clearTimeout(GAME.TimerClock);
};

GAME.Page = function(page) {
	if(page == 'gameover') {

		// HTML5 OFFLINE
		if (navigator.onLine) {
			// serve normal stuff
		} else {
			// put info that you're offline and can't tweet
		}

		// HTML5 LOCAL STORAGE
		GAME.API.localStorage('saveScore');

		//var str = GAME.$id('page-gameover').innerHTML;
		var str = GAME.$txt.gameover+GAME.$txt.continue;
		str = str.replace('[0P]',GAME._points);
		str = str.replace('[0%]',(GAME._points/2));
		str = str.replace('[0M]',~~(GAME._time/60));
		str = str.replace('[0S]',(GAME._time%60));
		GAME.$showModal(str,'gameover');
	}
	else {
		GAME.$showModal(''+
			GAME.$id('page-'+page).innerHTML+GAME.$txt.close,
			'page',
			'page-'+page);
		GAME.$id('close').onclick = function() {
			GAME.$hideModal();
		}
	}
};