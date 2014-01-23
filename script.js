$(document).ready(function(){
	$('#sim').click(function(){
		Blackjack.simulate(1);
	});
	$('#sim-100').click(function(){
		Blackjack.simulate(10);
	});
});