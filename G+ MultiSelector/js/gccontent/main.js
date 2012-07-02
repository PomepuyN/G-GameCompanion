/**
 * 
	This file is part of G+ Game companion.

    G+ Game companion is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    G+ Game companion is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with G+ Game companion.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * This script is injected in the page to perform stream / notification actions
 * @author Nicolas POMEPUY
 */

/**
 * These variables represent the node used in Google Plus pages.
 * When Google make changes into its code, this part has to be modified.
 */
/**
 * TODO : make a map to make changes more convenient.
 */
//Parent div of a stream post

//var d_mainTitle = "xjR3uc";
var d_mainCarousel = "hna"; 
var d_yourGames = "CLb"; 
var d_moreGames = "lA9Tlb"; 
var d_streamPostContainer = "dSb"; 
var d_streamPostGameTextClass = "AL";
var d_streamPostGameTextClass2 = "RiLh2d"; 
var d_streamPostTitleClass = "Imb"; //??
var d_insertAfterNode = "Fub"; //ok //Obsolete
var d_streamPostNodeClass = "Tg"; 
var d_streamPostContentClass = "ci"; 
var d_streamPostMutedClass = "cI"; //ok ??
var d_gameChooserClass = "aGb"; 
var d_rightInformation = "hxa"; //ok

var d_streamPostLinkContainer = "DL"; //ok
var d_hideStreamPostClass = "ot"; 
var d_cancelHideClass = "Ql"; 
var d_hideArrowClass = "Ph"; 
var d_plusoneClass = "esw";
var d_plusloaderClass = "qD";
//var d_myNameClass = "JUa"; //ok

//Add contacts from the people having played to a game
var peoplePlayedDivClass = "U-L"; //ok
var peoplePlayedOkButtonClass = "U-L-Ba"; //ok
var peoplePlayedContactDivClass = "g-Ajb-mjb";

//Parent div of a notification
var dn_notificationContainer = "QEb";
var dn_notificationGameTextClass = "s9b"; 
var dn_plusDivClass = "Op";
//var dn_notificationTitleClass = "PqQN6b"; DEPRECATED
var dn_insertAfterNode = "QEb"; 
var dn_notificationNodeClass = "E7a";
var dn_notificationLinkContainer = "LFb";
var dn_hideNotificationClass = "MFb";
var dn_cancelHideClass = "rH";
var dn_textNotificationContainer = "IFb"; 

var currentUrlBase = "";
var settings = null;
var gsettings = null;
var streamPostToProcess = new Array();

var gpmeUser = false;
var gpmeUnfoldedClass = "gpme-unfolded";
var gpmeFoldedClass = "gpme-folded";

var myId;

var gs_games = new Array();
var gs_selectedTab = 0;

var notifgames = new Array();
var selectedNotifTab = 0;
var selectedGame = null;
var selectedPresets = new Array();
var scrollTop = 0;

var peoplePlayedListener = false;
var peoplePlayedAddedButton = false;

//Selected game
var selectedId = null;
var lastPlayedGames = null;

/**
 * Ask for the settings
 */
$(document).ready(function() {

	chrome.extension.sendRequest({
		action : 'getSettings'
	});

	injectStylesheet(document);
	
	//findMyId();
	
});


//DEPRECATED : Performed in getGplusToken

//function findMyId() {
//	$('.' + d_myNameClass).each(
//			function(){
//				var reg=new RegExp("[\/]+", "g");
//				var splittedLink=$(this).attr("href").split(reg);
//				var reg2=new RegExp("[0-9]", "i");
//				var link = splittedLink[splittedLink.length -2];
//				if ( reg2.test(link) ) {
//					myId = link;
//				}
//			}
//	);
//	if (myId == undefined) {
//		setTimeout(function() {
//			findMyId();
//		}, 1000);
//	}
//}

/**
 * Communication with the extension
 */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	/**
	 * The game stream page has been updated
	 */
	if (request.action == "streamUpdated") {
		
		//Delete the main title and carousel
		//$("."+d_mainTitle).remove();
		//$("."+d_yourGames).remove();
		$("."+d_moreGames).remove();
		
		
		
		gs_init();
		var url = window.location.href;
		var index = url.indexOf("games");
		currentUrlBase = url.substring(0, index);
		$('#n_plusFake').remove();
		
	}

	if (request.action == "streamUpdated" || request.action == "gdUpdated") {
		//Launching the people played listener
		if (!peoplePlayedListener) {
			peoplePlayedListener = true;
			$("body").bind('DOMNodeInserted', function(e) {
				if ($("." + peoplePlayedDivClass).length > 0) {

					$($("button[name='ok']"), '.' + peoplePlayedOkButtonClass).html("Close");
					if (!peoplePlayedAddedButton) {
						peoplePlayedAddedButton = true;
						$("." + peoplePlayedOkButtonClass).append('<button id="gcc-addPeopleToCircle" name="addCircle" class="a-wc-na">Add all to a circle</button>');
						$("#gcc-addPeopleToCircle").click(function(e) {
							openAddPeopleToCircle($("." + peoplePlayedDivClass));
							e.stopPropagation();
						});
						$("." + peoplePlayedOkButtonClass).click(function() {
							peoplePlayedAddedButton = false;
						});
					}
				}
			});
		}

	}
	/**
	 * The notifications page has been updated
	 */
	if (request.action == "notificationsUpdated") {
		n_init();
		var url = window.location.href;
		var index = url.indexOf("games");
		currentUrlBase = url.substring(0, index);
		$('#gs_plusFake').remove();
		majSettings(selectedGame);
	}

	/**
	 * The page has been updated but is neither notifications nor game stream
	 */
	if (request.action == "otherUpdated") {
		$('#n_plusFake').remove();
		$('#gs_plusFake').remove();
	}
	/**
	 * The settings have been sent
	 */
	if (request.action == "sendSettings") {
		settings = JSON.parse(request.settings);
		gsettings = JSON.parse(request.gsettings);

		if (request.games) {
			openAlert("Settings saved", "Your settings have been saved.");
		}

		if (request.selectedGame != undefined) {
			selectedGame = request.selectedGame;
		}
		majSettings(selectedGame);
		
	}
});

function getGameModel (callback){
//	if (lastPlayedGames != null){
//		callback();
//		return;
//	}
	$.ajax({
		type: "POST",
		url: "/_/games/getGamesModel",
		dataType: "text",
		data: {
			numNotificationsToFetch: 0,
			sp: [9, 2, null, null, null, 20, null, null, [], null, null, null, null, null, null, []],
			hl: "en",
			at: gplustoken
		},
		timeout: function() {
			console.log("TIMEOUT !!!!");
		},
		success: function(data) {
			gameData = eval(data.substring(6));
			
			
			lastPlayedGames = gameData[0][4];
			
			for ( var i = 0; i < settings.games_settings.length; i++) {
				var gInSet = settings.games_settings[i];
				for ( var j = 0; j < gameData[0][3].length; j++) {
					var gInAj = gameData[0][3][j];
					if (gInAj[3] == gInSet.name){
						gInSet.image = gInAj[23];
						gInSet.gId = gInAj[12];
					}
				}
			}
			
			
			if (settings != null) {
				chrome.extension.sendRequest({
					action : 'saveGamesSettings',
					games : settings.games_settings
				});
			}
			callback();			
			
		}
	});
	
};
