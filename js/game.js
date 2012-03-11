GAME.Init = function() {
	var board = GAME.$id('board'),
		els = board.getElementsByTagName('p');
	for(var i=els.length-1; i>=0; i--) {
		els[i].onclick = function() { GAME.CardClick(this); };
	}
	//GAME.$id('start').onclick = function() { if(!GAME._active) GAME.Start(); };
	GAME.Start();
};

GAME.Start = function() {
	GAME.Timer(0);
	GAME.$id('start').innerHTML = 'Pause the game';
	GAME._active = true;

	// add elements twice
	GAME._board = GAME.data;
	GAME._board.push.apply(GAME._board, GAME.data);

	// shuffle array 10 times - just to be sure it's more or less random
	for (var i = 10; i >= 0; i--) {
		GAME.shuffleArray(GAME._board);
	};

	GAME._visible = [];
	GAME._points = 0;
};

GAME.HideCards = function() {
	//document.querySelectorAll('.visible').className = '';
	var item1 = GAME._visible.pop(),
		item2 = GAME._visible.pop();

	var myItem1 = GAME.$id('card_'+item1.card_id);
	myItem1.className = '';
	myItem1.style.backgroundPosition = '';
	var myItem2 = GAME.$id('card_'+item2.card_id);
	myItem2.className = '';
	myItem2.style.backgroundPosition = '';

	//console.log('HIDE CARDS!');
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

	//console.log('DISABLE CARDS!');
	GAME._active = true;
};

GAME.CardClick = function(card) {
	if(GAME._active) {
		var card_id = card.id.split('_')[1],
			item = GAME._board[card_id];

		//console.log('CLICKED card number '+card_id+' with ID = '+item.id+', and name: '+item.name);

		card.onclick = function() {};

		card.className = 'visible';
		card.style.backgroundPosition = '-'+(item.id*100)+'px 0';
		GAME._visible.push({'item_id':item.id,'card_id':card_id});

		if(GAME._visible.length == 2) { // two visible cards

			if(GAME._visible[0].item_id == GAME._visible[1].item_id) { // the same card ID
				// ask question - if answered correct, add points, if not - don't
				GAME.Form(item);

				//console.log('CORRECT!');
				//GAME._points+=2;
				if(GAME._points == GAME._board.length) {
					//
					setTimeout(GAME.DisableCards,1);
					alert('FULL of WIN!');
				}
				else {
					setTimeout(GAME.DisableCards,10);
				}
			}
			else {
				//console.log('MISSED!');
				setTimeout(GAME.HideCards,1000);
			}

			GAME._active = false;
		}
	}
};

GAME.Form = function(item) {
	var question = {
		txt: ['website','topic of the talk','trade'],
		id: ['site','topic','trade'],
		nr: Math.floor(Math.random()*3),
		tab: []
	};

	// get 3 different values - the proper one and two random
	var subject = question.id[question.nr],
		answerTable = [];

	console.log('item[subject]: '+item[subject]);

	// proper
	answerTable.push(item[subject]);

	// random
	for(var i=0; i<2; i++) {
		do {
			var random = Math.floor(Math.random()*(GAME._board.length/2));
			console.log('Random: '+random+' from all '+(GAME._board.length/2)+' elements.');
			// if random nie ma w tabeli, to dodaj
			var newR = false;
			console.log('GAME.data[random][subject]: '+GAME.data[random][subject]);
			for (var j = 0; j < answerTable.length; j++) {
				if(GAME.data[random][subject] != answerTable[j]) {
					console.log('answerTable[j]: '+answerTable[j]);
					newR = true;
				}
			};
		} while(newR == false);
		answerTable.push(GAME.data[random][subject]);
	}

	console.log('-----');
	console.dir(answerTable);
	console.log('-----');

//	var answerTable = [
//		item[questionNames[question]],
//		GAME._board[Math.floor(Math.random()*5)][questionNames[question]],
//		GAME._board[Math.floor(Math.random()*5)][questionNames[question]]
//	];

	var formHTML = ""+
	"<div>"+
		"<p>Let's see how well You know <strong>"+item.name+"</strong>!</p>"+
		"<p id='message'>What's the "+question.txt[question.nr]+" of this person?</p>"+
		"<p><form>"+
			"<input type='radio' name='q' value='"+answerTable[0]+"' id='radio1' /> <label for='radio1'>"+answerTable[0]+"</label> "+
			"<input type='radio' name='q' value='"+answerTable[1]+"' id='radio2' /> <label for='radio2'>"+answerTable[1]+"</label> "+
			"<input type='radio' name='q' value='"+answerTable[2]+"' id='radio3' /> <label for='radio3'>"+answerTable[2]+"</label> "+
		"</form></p>"+
	"</div>";

	GAME.$id('formBg').style.display = 'block';
	GAME.$id('modalBg').style.display = 'block';
	GAME.$id('formBg').innerHTML = formHTML;

	GAME.$id('radio1').onclick = function() { GAME.CheckAnswer(this,item[subject]); };
	GAME.$id('radio2').onclick = function() { GAME.CheckAnswer(this,item[subject]); };
	GAME.$id('radio3').onclick = function() { GAME.CheckAnswer(this,item[subject]); };
	//document.getElementsByTagName('input').onclick = function() { GAME.CheckAnswer(this); };

	console.dir(item);
};

GAME.CheckAnswer = function(chosen,correct) {
	//console.log('radio checked: '+radio.value);
	if(chosen.value == correct) {
		GAME.$id('message').innerHTML = '<span style="color: green;">Congrats, +1 point!</span> <b id="continue">Click to continue!</b>';
		chosen.style.background = 'green';
		GAME._points += 10;
		GAME.$id('points').innerHTML = GAME._points;
	}
	else {
		GAME.$id('message').innerHTML = '<span style="color: red;">Wrong, no points this time, try again...</span> <b id="continue">Click to continue!</b>';
		chosen.style.background = 'red';
	}
	GAME.$id('continue').onclick = function() {
		GAME.$id('formBg').style.display = 'none';
		GAME.$id('modalBg').style.display = 'none';
		console.log('points/10: '+(GAME._points/10)+', board/2: '+(GAME._board.length/2));
		if((GAME._points/10) == (GAME._board.length/2)) {
			alert('FULL of WIN!');
		}
	}
};

GAME.Timer = function(time) {
	var sec = ~~(time%60),
		min = ~~(time/60),
		secHTML = (sec < 10) ? '0'+sec : sec,
		minHTML = (min < 10) ? '0'+min : min;
	GAME.$id('time').innerHTML = minHTML+':'+secHTML;
	time++;
	setTimeout('GAME.Timer('+time+')',1000);
};