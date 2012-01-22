GAME.Init = function() {
	var board = GAME.$id('board'),
		els = board.getElementsByTagName('p');
	for(var i=els.length-1; i>=0; i--) {
		els[i].onclick = function() { GAME.CardClick(this); };
	}
	GAME.$id('start').onclick = function() { if(!GAME._active) GAME.Start(); };
};

GAME.Start = function() {
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
	//
	//document.querySelectorAll('.visible').className = '';
	var item1 = GAME._visible.pop(),
		item2 = GAME._visible.pop();

	//GAME.$id(item1[])

	GAME._active = true;
};

GAME.CardClick = function(card) {
	if(GAME._active) {
		var card_id = card.id.split('_')[1],
			item = GAME._board[card_id];

		console.log('CLICKED card number '+card_id+' with ID = '+item.id+', and name: '+item.name);

		card.className = 'visible';
		card.style.backgroundPosition = '-'+(item.id*100)+'px 0';
		GAME._visible.push([item.id,card_id]);

		if(GAME._visible.length == 2) { // two visible cards
			
			var item_1 = GAME._visible[0][0],
				item_2 = GAME._visible[1][0];

			if(item_1 == item_2) {
				//
				console.log('TRAFIONE!');
				GAME._points++;
				// hide both
			}
			else {
				//
				console.log('NIETRAFIONE!');
				// hide both
			}

			GAME._active = false;
			// sleep 1 second
			setTimeout(1000,GAME.HideCards);
			// hide visible cards

		}
	}
};