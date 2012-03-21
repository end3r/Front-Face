GAME.Init = function() {
	// shuffle the input data so it looks kinda random
	for (var i = 10; i >= 0; i--) {
		GAME.shuffleArray(GAME.data);
	}
	GAME.$id('start').onclick = function() { if(!GAME._active) GAME.Start(); };
	GAME.$id('howto').onclick = function() { GAME.Page('howto'); };
	GAME.$id('about').onclick = function() { GAME.Page('about'); };
	GAME._counter = 10;
};

GAME.Start = function() {
	GAME.NewLevel(1);
	GAME._time = 0;
	GAME.Timer();
	GAME._active = true;
	GAME._visible = [];
	GAME._points = 0;
	GAME._trials = 0;
	GAME._questions = 0;
};

GAME.NewLevel = function(lvl) {
	GAME._board = [];
	// take the items from the data table and add them twice
	for(var i = 0; i < GAME._counter; i++) {
		var data = GAME.data[((lvl-1)*GAME._counter)+i];
		GAME._board.push(data, data);
	}

	// generate HTML structure of the game board
	var board = GAME.$id('board');
	for (var i = 0, elements = ''; i < GAME._counter*2; i++) {
		elements += '<p id="card_'+i+'"></p>';
	}

	// bind clicks to the cards
	board.innerHTML = elements;
	var els = board.getElementsByTagName('p');
	for(var i=els.length-1; i>=0; i--) {
		els[i].onclick = function() { GAME.CardClick(this); };
	}

	// shuffle array 10 times - just to be sure it's more or less random
	for (var i = 10; i >= 0; i--) {
		GAME.shuffleArray(GAME._board);
	}
};

GAME.HideCards = function() {
	var item1 = GAME._visible.pop(),
		item2 = GAME._visible.pop();

	var myItem1 = GAME.$id('card_'+item1.card_id);
	myItem1.className = '';
	myItem1.style.backgroundPosition = '';
	var myItem2 = GAME.$id('card_'+item2.card_id);
	myItem2.className = '';
	myItem2.style.backgroundPosition = '';

	GAME._active = true;
	myItem1.onclick = function() { GAME.CardClick(this); };
	myItem2.onclick = function() { GAME.CardClick(this); };
};

GAME.DisableCards = function() {
	var item1 = GAME._visible.pop(),
		item2 = GAME._visible.pop();

	var myItem1 = GAME.$id('card_'+item1.card_id);
	myItem1.className = 'disabled';
	myItem1.onclick = function() {};

	var myItem2 = GAME.$id('card_'+item2.card_id);
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
				// ask question - if answered correct, add points, if not - don't
				GAME.Form(item);
				setTimeout(GAME.DisableCards,1);
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
		nr: Math.floor(Math.random()*4),
		tab: []
	};

	// get 3 different values - the proper one and two random
	do {
		var subject = question.id[question.nr]; // fuk
		//console.log('SUBJECT: '+subject);
	} while(item[subject] == '');
	
	var answerTable = [];

	//console.log('item[subject]: '+item[subject]);

	// proper
	answerTable.push(item[subject]);

	// random
	for(var i=0; i<2; i++) {
		var newRandom = false;
		do {
			var random = Math.floor(Math.random()*(GAME._board.length/2));
			for (var j = 0; j < answerTable.length; j++) {
				if(GAME.data[random][subject] != '' && GAME.data[random][subject] != answerTable[j]) {
					newRandom = true;
					//console.log('newRandom: '+GAME.data[random][subject]);
				}
				else {
					;//console.log('newRandom... NOT: '+GAME.data[random][subject]);
				}
			}
		} while(newRandom == false);
		answerTable.push(GAME.data[random][subject]);
	}
	GAME.shuffleArray(answerTable);

	var formHTML = ""+
	"<div class='modal'>"+
		"<div class='header'>"+
			"<span class='photo' style='background-position: -"+(item.id*100)+"px 0;'></span>"+
			"<span id='message'>What's the <strong>"+question.txt[question.nr]+"</strong> of this person?</span>"+
		"</div>"+
		"<form id='form'>"+
			"<p><input type='radio' name='q' value='"+answerTable[0]+"' id='radio1' /> <label id='radio1label' for='radio1'>"+answerTable[0]+"</label></p>"+
			"<p><input type='radio' name='q' value='"+answerTable[1]+"' id='radio2' /> <label id='radio2label' for='radio2'>"+answerTable[1]+"</label></p>"+
			"<p><input type='radio' name='q' value='"+answerTable[2]+"' id='radio3' /> <label id='radio3label' for='radio3'>"+answerTable[2]+"</label></p>"+
		"</form>"+
		"<div class='continue'><span id='continue'>Continue</span></div>"+
	"</div>";

	GAME.$showModal(formHTML);
	GAME.$id('radio1').onclick = function() { GAME.CheckAnswer(this,item[subject]); };
	GAME.$id('radio2').onclick = function() { GAME.CheckAnswer(this,item[subject]); };
	GAME.$id('radio3').onclick = function() { GAME.CheckAnswer(this,item[subject]); };
	//document.getElementsByTagName('input').onclick = function() { GAME.CheckAnswer(this); };
};

GAME.CheckAnswer = function(chosen,correct) {
	if(chosen.value == correct) {
		GAME.$id('message').innerHTML = 'Congratulations, your answer is correct!';
		chosen.style.background = 'green';
		GAME._points += 10;
		GAME.$id('points').innerHTML = GAME._points;
		GAME.$id(chosen.id+'label').style.color = 'green';
		GAME.$id(chosen.id+'label').innerHTML;// += ' ✓';
	}
	else {
		GAME.$id('message').innerHTML = 'Oh no, wrong answer, no points this time...';
		GAME.$id(chosen.id+'label').style.color = 'red';
		GAME.$id(chosen.id+'label').innerHTML;// += ' ✗';
	}
	
	GAME._questions += 1;
	GAME.$id('questions').innerHTML = GAME._questions;
	GAME.$id('continue').style.visibility = 'visible';

	GAME.$id('radio1').disabled = true;
	GAME.$id('radio2').disabled = true;
	GAME.$id('radio3').disabled = true;

//	GAME.$id('radio1label').style.color = 'red';
//	GAME.$id('radio2label').style.color = 'red';
//	GAME.$id('radio3label').style.color = 'red';

	GAME.$id('form').className = 'disabled';

//	GAME.$id(correct.id+'label').style.color = 'green';

	GAME.$id('continue').onclick = function() {
		GAME.$hideModal();

		if(GAME._questions == 10) {
			setTimeout(function(){
				GAME.$showModal("<div class='modal'>"+
					"<div>Nice, You're half way thru! You've managed to solve the first 10 pairs of photos, let's see how You'll handle the second part of the game.</div>"+
					"<div class='continue'><span id='newLevel'>Continue</span></div>"+
				"</div>");
				GAME.$id('newLevel').style.visibility = 'visible';
				GAME.$id('newLevel').onclick = function() {
					GAME.$hideModal();
					GAME.NewLevel(2);
				};
			},200);
		}
		else if(GAME._questions == 20) {
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
		var str = GAME.$id('page-gameover').innerHTML;
		str = str.replace('[0P]',GAME._points);
		str = str.replace('[0%]',(GAME._points*5)); // *5, because /20 and *100 to have percents
		str = str.replace('[0M]',~~(GAME._time/60));
		str = str.replace('[0S]',(GAME._time%60));
		GAME.$showModal('<div class="modal page">'+str+'</div>');
	}
	else {
		GAME.$showModal('<div class="modal page" id="page-'+page+'">'+GAME.$id('page-'+page).innerHTML+' <div class="continue"><span id="close">Close</span></div></div>');
		GAME.$id('close').onclick = function() {
			GAME.$hideModal();
		}
	}
};