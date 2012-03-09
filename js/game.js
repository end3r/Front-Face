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
				GAME.Form(item);

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

GAME.Form = function(item) {
	var questions = ['website','topic of the talk','trade'],
		questionNames = ['site','topic','trade'],
		question = Math.floor(Math.random()*3);

	var randomTable = [];
	function oc(a)
	{
	  var o = {};
	  for(var i=0;i<a.length;i++)
	  {
	    o[a[i]]='';
	  }
	  return o;
	}

	// get 3 different values - the proper one and two random
	for(var i=0; i<3; i++) {
		do {
			var random = Math.floor(Math.random()*(GAME._board.length/2));
			console.log('Random: '+random+' from all '+(GAME._board.length/2)+' elements.');
		} while(random in oc(randomTable));
		randomTable.push(random);
	}

	console.log('Random table:');
	console.dir(randomTable);

	var formHTML = ""+
	"<div>"+
		"<p>Let's see how well You know <strong>"+item.name+"</strong>!</p>"+
		"<p>What's the "+questions[question]+" of this person?</p>"+
		"<p><form>"+
			"<input type='radio' name='q' value='one' id='radio1' /> <label for='radio1'>"+item[questionNames[question]]+"</label> "+
			"<input type='radio' name='q' value='two' id='radio2' /> <label for='radio2'>"+GAME._board[Math.floor(Math.random()*5)][questionNames[question]]+"</label> "+
			"<input type='radio' name='q' value='three' id='radio3' /> <label for='radio3'>"+GAME._board[Math.floor(Math.random()*5)][questionNames[question]]+"</label> "+
		"</form></p>"+
	"</div>";

	GAME.$id('formBg').style.display = 'block';
	GAME.$id('modalBg').style.display = 'block';
	GAME.$id('formBg').innerHTML = formHTML;

//	GAME.$id('radio1').onclick = function() { GAME.CheckAnswer(this); };
//	GAME.$id('radio2').onclick = function() { GAME.CheckAnswer(this); };
//	GAME.$id('radio3').onclick = function() { GAME.CheckAnswer(this); };
	document.getElementsByTagName('input').onclick = function() { GAME.CheckAnswer(this); };

	console.dir(item);
};

GAME.CheckAnswer = function(tabs) {
	//
//	for (var i = 0; i < tabs.length; i++) {
//		tabs[i]
//	};
	console.dir(tabs);
//	alert('wybrales '+ID.id+'!');
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