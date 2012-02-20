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

	console.log('HIDE CARDS!');
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

	console.log('DISABLE CARDS!');
	GAME._active = true;
};

GAME.CardClick = function(card) {
	if(GAME._active) {
		var card_id = card.id.split('_')[1],
			item = GAME._board[card_id];

		console.log('CLICKED card number '+card_id+' with ID = '+item.id+', and name: '+item.name);

		card.onclick = function() {};

		card.className = 'visible';
		card.style.backgroundPosition = '-'+(item.id*100)+'px 0';
		GAME._visible.push({'item_id':item.id,'card_id':card_id});

		if(GAME._visible.length == 2) { // two visible cards

			if(GAME._visible[0].item_id == GAME._visible[1].item_id) { // the same card ID
				// ask question - if answered correct, add points, if not - don't
				//GAME.$id('board').style.display = 'none';
				GAME.$id('formBg').style.display = 'block';
				GAME.$id('formBg').innerHTML = '<div><p>[FORM with a question about the clicked person]</p></div>';
				GAME.$id('modalBg').style.display = 'block';

				console.log('CORRECT!');
				GAME._points+=2;
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
				//
				console.log('MISSED!');
				setTimeout(GAME.HideCards,1000);
			}

			GAME._active = false;
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