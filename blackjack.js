var Chute = {
	cards: [],
	stop: 234,
	counter: 0,

	baseDeck: [
		'd02','d03','d04','d05','d06','d07','d08','d09','d10','d11','d12','d13','d14',
		'h02','h03','h04','h05','h06','h07','h08','h09','h10','h11','h12','h13','h14',
		'c02','c03','c04','c05','c06','c07','c08','c09','c10','c11','c12','c13','c14',
		's02','s03','s04','s05','s06','s07','s08','s09','s10','s11','s12','s13','s14'
	],

	deck: function(size){
		for(i=0;i<size;i++){
			this.cards = this.cards.concat(this.baseDeck);
		}
	},

	shuffle: function(){
		for(var j, x, i = this.cards.length; i; j = Math.floor(Math.random() * i), x = this.cards[--i], this.cards[i] = this.cards[j], this.cards[j] = x);
	    return this.cards;
	},

	build: function(){
		this.cards = [];
		this.deck(6);
		this.logDeck("We've created the deck");
		this.shuffle();
		this.logDeck("We've shuffled the deck");
		this.cut();
		this.logDeck("We've cut the deck");
		this.removeCards(3);
		this.logDeck("We've removed three cards");
	},

	cut: function(){
		var size = this.cards.length;
		var cut = Math.round(Math.random() * (size * .8) + (size * .2));
		var cards = this.cards.slice(1, cut);
		this.cards.splice(1, cut);
		for(var i in cards){
			this.cards.unshift(cards[i]);
		}
	},

	removeCards: function(x){
		for(i=0;i<x;i++){
			this.cards.shift();	
		}		
	},

	logDeck: function(msg){
		console.log(msg);
		console.log(this.cards);
	},

	deal: function(){
		this.counter++;
		var card = this.cards[0];
		this.cards.shift();
		return card;
	},

	reshuffle: function(){
		if(this.counter >= this.stop){
			this.build();
			this.counter = 0;
		}
	}
}

var Blackjack = {
	cardValue: function(card){
		var card = parseInt(card.substring(1));
		if(card >= 10 && card < 14){
			return 10;
		} else if(card < 10){
			return card;
		} else {
			return 11;
		}
	},

	calculate: function(hand){
		var total = 0;
		for(i in hand){
			var card = parseInt(hand[i].substring(1));
			if(card >= 10 && card < 14){
				total = total + 10;
			} else if(card < 10){
				total = total + card;
			} else {
				total = total + 11;
			}
		}
		return total;
	},

	blackjack: function(hand){
		var ace = false;
		var ten = false;
		var total = 0;
		for(i in hand){
			var card = parseInt(hand[i].substring(1));
			if(card == 14){
				ace = true;
				continue;
			}
			if(card > 9){
				ten = true;
				continue;
			}
		}
		return ace && ten;
	},

	winner: function(hand_one, hand_two){
		if(hand_one > 21){
			return 2;
		}
		if(hand_two > 21){
			return 1;
		}
		if(hand_one > hand_two){
			return 1;
		}
		return 2;
	},

	simulate: function(x){
		for(i=0;i<x;i++){
			var dealer = new Player(0, new DealerStrategy());
			var player = new Player(40, new PlayerStrategy(dealer));

			Chute.build();
			hands = 0;
			// GAME LOOP
			while(player.money > 0 && player.money < 42){
				player.resetHand();
				dealer.resetHand();

				//Bets
				player.money--;

				// Inital Deal
				player.hit();
				dealer.hit();
				player.hit();
				dealer.hit();

				// If dealer is dealt blackjack, its over
				if(Blackjack.blackjack(dealer.hand)){
					console.log('Dealer Blackjack!');
					continue;
				}
				if(Blackjack.blackjack(player.hand)){
					console.log('Player Blackjack!');
					player.money = player.money + 2.5;
					continue;
				}

				player.play();

				dealer.play();

				var winner = Blackjack.winner(player.total, dealer.total);

				if(winner == 1){
					player.money = player.money + 2;
				}

				console.log('Money: ' + player.money);
				console.log('Hands: ' + hands);

				Chute.reshuffle();
				hands++;
			}

			$('#hands').text(hands);
			
			if(player.money){
				$('#wins').text((parseInt($('#wins').text())+1));
			} else {
				$('#losses').text((parseInt($('#losses').text())+1));
			}
		}
	}
}

function Player(money, strategy){
	this.hand = [];
	this.total = 0;
	this.money = money;
	this.upCard = '';

	this.hit = function(){
		var card = Chute.deal();
		this.hand.push(card);
		if(this.upCard == ''){
			this.upCard = card;
		}
		console.log('Hit: ' + this.hand);
		this.total = Blackjack.calculate(this.hand);
	}

	this.play = function(){
		strategy.play();
	}

	this.resetHand = function(){
		this.hand = [];
		this.total = 0;
		this.upCard = '';
	}
}

function PlayerStrategy(dealer){
	this.dealer = dealer;

	this.play = function(){
		var card = Blackjack.cardValue(this.dealer.upCard);
		var val = this.dealerValue(card);
		console.log('Dealer Value Is: ' + val);
		while(this.total < val){
			this.hit();
		}
	}

	this.dealerValue = function(card){
		if(card < 11 && card > 5){
			return card + 10;
		} else {
			return 17;
		}
	}
}

function DealerStrategy(){
	this.play = function(){
		while(this.total < 17){
			console.log('TOTAL: ' + this.total);
			this.hit();
		}
	}
}