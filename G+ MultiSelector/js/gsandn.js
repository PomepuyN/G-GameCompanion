

/**
 * 
 * COMMON FUNCTIONS (stream and notifications)
 * 
 */


/**
 * 
 * GAME STREAM FUNCTIONS !
 * 
 */



/**
 * 
 * NOTIFICATIONS FUNCTIONS !
 * 
 */



//DEAD CODE
function n_saveGameSettings(slugGame) {
	var game = new Object();
	// game.name = "";
	game.slugName = slugGame;
	game.n_filterIn = $("#n-filterIn" + slugGame).val();
	game.n_filterOut = $("#n-filterOut" + slugGame).val();

	chrome.extension.sendRequest({
		action : 'saveGameSettings',
		type : "n",
		game : game
	});
}