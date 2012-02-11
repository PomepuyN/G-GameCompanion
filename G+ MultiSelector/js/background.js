/**
 * 
	This file is part of G+ Game companion.

    G+ Game companion is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Foobar is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Functionnal part of the background page
 * @author Nicolas POMEPUY
 */

var notifTimes = new Array();
	var settings;
	var notifications = new Array();
	var inCircles = new Array();


	/**
	 * START of new feature : delaying the opening of tabs.
	 */  
	var openedTabs = new Array();
	var pendingTabs = new Array();

	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		var newOpenedTabs = new Array();
		var hasAGPlusTabBeenClosed = false;
		for ( var i = 0; i < openedTabs.length; i++) {
			if (tabId != openedTabs[i]){
				newOpenedTabs.push(openedTabs[i]);
			} else {
				hasAGPlusTabBeenClosed = true;
			}
		}

// 		if (hasAGPlusTabBeenClosed && pendingTabs.length > 0){
// 			setTimeout(function(){ openNextPost();}, 3000);
// 		}
		
		openedTabs=newOpenedTabs;
	});

// 	function openNextPost(){
// 		chrome.tabs.create({
// 			url : pendingTabs[0],
// 			selected : false
// 		}, 
// 		function(tab){
// 			openedTabs.push(tab.id);
// 			console.log("openedTabs");
// 			console.log(openedTabs);
					
// 		});
// 		pendingTabs.shift();
// 		console.log("Pending tabs : "+pendingTabs);
// 	}
	/**
	 * END of new feature : delaying the opening of tabs.
	 */
	
	
	/**
	 * Check if the url match the G+ domain to determine if the script has to be loaded.
	 * @param tabId
	 * @param changeInfo
	 * @param tab
	 */
	function checkForValidUrl(tabId, changeInfo, tab) {
		var limiter = 'plus.google.com';
		//var limiter = '';

		//Verify the page is completely loaded and that the tab shows a G+ page 
		if (changeInfo.status == "complete") {
			if (tab.url.indexOf(limiter) > -1
					&& tab.url.indexOf(limiter + '/url?') == -1) {

				//Launch actions if the extension is launched for the first time
				var verifyFirstTime = verifyFirstTimeUse();
				if (verifyFirstTime && !isOldVersionSuperior("1.2.9")) {
					localStorage["gnc"] = "";
					historyCache = null;
					var settings = new Settings();
					settings.save();
				}
				if (verifyFirstTime) {
					var settings = new Settings();
					settings.get();
					settings.save();
				}

				var globalNotif="";

				//Used to open a page for notifying user that a new icon has been set. Now desactivated
/**				if (!verifyFirstTime
						&& localStorage["showNewIcon"] == undefined) {
					localStorage["showNewIcon"] = "true";
					globalNotif = "nicon";
					
					
					chrome.tabs.getSelected(null,function(tab) {

						var url = chrome.extension.getURL("newIcon.html");
						chrome.tabs.create({
							url : url,
							index : tab.index + 1,
							selected : true
						});
					});
				}*/

				verified = false;

				// ... show the page action (display the icon).
				chrome.pageAction.show(tabId);

				//Determine what page is loaded (Game stream and game notifications) to send properly options to gsandn.js
				var reg = new RegExp(
						"^https?:\\/\\/plus\\.google\\.com\\/[a-zA-Z0-9/]*\\/*games\/",
						"i");
				var reg2 = new RegExp(
						"^https?:\\/\\/plus\\.google\\.com\\/[a-zA-Z0-9/]*\\/*games",
						"i");
				var regMyCircles = new RegExp(
						"^https?:\\/\\/plus\\.google\\.com\\/[a-zA-Z0-9/]*\\/*circles",
				"i");
				if (tab.url.match(reg2) && !tab.url.match(reg)) {
					console.log("streamUpdated");
					chrome.tabs.sendRequest(tabId, {
						action : 'streamUpdated',
						globalNotif : globalNotif
					});
				} else if (tab.url.indexOf(limiter) > -1
						&& tab.url.indexOf("games/notifications") > -1) {
					console.log("notificationsUpdated");
					chrome.tabs.sendRequest(tabId, {
						action : 'notificationsUpdated'
					});
				} else {
					console.log("otherUpdated");
					chrome.tabs.sendRequest(tabId, {
						action : 'otherUpdated'
					});
				}
				
				var found = false;
				for ( var i = 0; i < inCircles.length; i++) {
					entry = inCircles[i];
					if (entry.tabId == tabId){
						if (tab.url.match(regMyCircles)) {
							entry.res = true;
						} else {
							entry.res = false;
						}
						found = true;
					}
				}
				if (!found){
					entry = new Object();
					entry.tabId = tabId;
					if (tab.url.match(regMyCircles)) {
						entry.res = true;
					} else {
						entry.val = false;
					}
					inCircles.push(entry);
				}
			}

			updateNotifs();

		}
	};



	
	/**
	 * Update the notifications to be sent back to user when a delay has passed
	 */
	function updateNotifs() {
		for ( var i = 0; i < notifTimes.length; i++) {
			clearTimeout(notifTimes[i]);
		}
		notifTimes = new Array();
		notifications = new Array();
		settings = new Settings();
		settings.get();
		if (settings.allow_notifications) {
			notifications = getAllNotificationTimes();
			for ( var i = 0; i < notifications.length; i++) {
				var now = new Date().getTime();
				var timeToNotif = notifications[i].notificationTime - now;
				var intTO = setTimeout('notify(notifications[' + i + '])',
						notifications[i].notificationTime - now);
				notifTimes.push(intTO);
			}
		}
	}

	/**
	 * Update the selected tab
	 */
	var selectedTab;
	chrome.tabs.onActiveChanged.addListener(function(tabId, selectInfo) {
		chrome.tabs.get(tabId, function(tab){
			var limiter = 'plus.google.com';
			if (tab.url.indexOf(limiter) > -1){
				selectedTab = tab.id;
			}
		});
	});
	
	/**
	 * Getting requests from the extensions's other parts
	 */
	var tabs = new Array();
	chrome.extension.onRequest.addListener(function(request, sender,
			sendResponse) {

		/**
		 * The user notifications should be saved
		 */
		if (request.action == "updateNotifications") {
			updateNotifs();
			for ( var i = 0; i < tabs.length; i++) {
				var settings = new Settings();
				settings.get();
				var settingsS = JSON.stringify(settings);

				var gsettings = new GameSettings();
				gsettings.get();
				var gsettingsS = JSON.stringify(gsettings);
				
				
				chrome.tabs.sendRequest(tabs[i], {
					action : 'sendSettings',
					settings : settingsS,
					gsettings : gsettingsS,
					games : false
				});
			}
		}
		
		/**
		 * Opens the options page
		 */
		if (request.action == "openOptions") {
			var url = chrome.extension.getURL("options.html");
			if (request.type == 'gs') {
				url += "?type=gs&limit=" + request.limit + "&delay="
						+ request.delay + "&autoHide=" + request.autoHide
						+ "&plusOne=" + request.plusOne
						+ "&reverse=" + request.reverse;
			} else {
				url += "?type=n&limit=" + request.limit + "&delay="
						+ request.delay + "&autoHide=" + request.autoHide
						+ "&reverse=" + request.reverse;
			}
			chrome.tabs.create({
				url : url,
				index : sender.tab.index + 1,
				selected : true
			});
		}
		
		/**
		 * Open the filters page
		 */
		if (request.action == "openFiltersPage") {
			var url = chrome.extension.getURL("filters.html");
			chrome.tabs.create({
				url : url,
				index : sender.tab.index + 1,
				selected : true
			});
		}
		
		/**
		 * Get All The Settings ! :)
		 */
		if (request.action == "getSettings") {
			var settings = new Settings();
			settings.get();
			var settingsS = JSON.stringify(settings);
			
			var gsettings = new GameSettings();
			gsettings.get();
			var gsettingsS = JSON.stringify(gsettings);
			
			tabs.push(sender.tab.id);
			chrome.tabs.sendRequest(sender.tab.id, {
				action : 'sendSettings',
				settings : settingsS,
				gsettings : gsettingsS,
				games : false
			});
		}

		/**
		 * What is the opened page ?
		 */
		if (request.action == "getOpenedPage") {
			
			console.log(selectedTab);
			//Determine if tab is in circle
			chrome.tabs.get(selectedTab, function(tab){
				console.log(tab.url);
				var regMyCircles = new RegExp(
						"^https?:\\/\\/plus\\.google\\.com\\/[a-zA-Z0-9/]*\\/*circles",
				"i");
				var res;
				if (tab.url.match(regMyCircles)) {
					res = true;
				} else {
					res = false;
				}
				chrome.extension.sendRequest({
					action : 'sendCurrentPage',
					inCircle : res
				});
			});
			
			
			
		}
		
		
		if (request.action == "changeLastFilter") {
			
			var gsettings = new GameSettings();
			gsettings.get();
			
			for ( var i = 0; i < gsettings.games.length; i++) {
				if (gsettings.games[i].slugName == request.game){
					for ( var j = 0; j < gsettings.games[i].filters.length; j++) {
						if (gsettings.games[i].filters[j].name == request.filter && gsettings.games[i].filters[j].type == request.type){
							if (gsettings.games[i].filters[j].type == "gs"){
								gsettings.games[i].lastFilterGS = gsettings.games[i].filters[j];
							} else {
								gsettings.games[i].lastFilterN = gsettings.games[i].filters[j];
							}
						}
					}
				}
			}
			gsettings.save();
			
			var settings = new Settings();
			settings.get();
			var settingsS = JSON.stringify(settings);
			
			var gsettingsS = JSON.stringify(gsettings);

			chrome.tabs.sendRequest(sender.tab.id, {
				action : 'sendSettings',
				settings : settingsS,
				gsettings : gsettingsS,
				games : false
			});
			
		}
		
		/**
		 * Saving game settings
		 * May be dead code => we should verify
		 */
		if (request.action == "saveGamesSettings") {
			var settings = new Settings();
			settings.get();
			settings.games_settings = request.games;
			settings.save();
		}
		
		/**
		 * Asynchroneous saving / overwriting of a filter from a notification / Game stream page.
		 */
		if (request.action == "addPresetSettings") {
			
			var gsettings = new GameSettings();
			gsettings.get();
			
			var filter = new Filter();
			filter.decode(JSON.stringify(request.filter));
			
			var game = new GameS();
			game.slugName = request.game;
			for ( var i = 0; i < gsettings.games.length; i++) {
				if (gsettings.games[i].slugName == request.game){
					game = gsettings.games[i];
					gsettings.games.splice(i, 1);
				}
			}
			
			for ( var i = 0; i < game.filters.length; i++) {
				if (game.filters[i].name == filter.name){
					game.filters.splice(i, 1);
				}
			}
			
			if (filter.type == "gs"){
				game.lastFilterGS = filter;
			} else {
				game.lastFilterN = filter;
			}
			
			game.filters.push(filter);
			gsettings.games.push(game);
			gsettings.save();
			var gsettingsS = JSON.stringify(gsettings);
			
			var settings = new Settings();
			settings.get();
			var settingsS = JSON.stringify(settings);
			
			chrome.tabs.sendRequest(sender.tab.id, {
				action : 'sendSettings',
				settings : settingsS,
				gsettings : gsettingsS,
				games : false,
				selectedGame: game.slugName
			});
			
		}
		
		/**
		 * Asynchroneous deleting of a filter from a notification / Game stream page.
		 */
		if (request.action == "delPresetSettings") {
			
			var gsettings = new GameSettings();
			gsettings.get();
			
			for ( var i = 0; i < gsettings.games.length; i++) {
				if (gsettings.games[i].slugName == request.game){
					for ( var j = 0; j < gsettings.games[i].filters.length; j++) {
						if (gsettings.games[i].filters[j].name == request.filter && gsettings.games[i].filters[j].type == request.type){
							gsettings.games[i].filters.splice(j,1);
						}
					}
				}
			}
			gsettings.save();
			var gsettingsS = JSON.stringify(gsettings);
			
			var settings = new Settings();
			settings.get();
			var settingsS = JSON.stringify(settings);
			
			chrome.tabs.sendRequest(sender.tab.id, {
				action : 'sendSettings',
				settings : settingsS,
				gsettings : gsettingsS,
				games : false
			});
			
		}
		
		/**
		 * Asynchroneous saving of game settings from a notification / Game stream page.
		 */
		if (request.action == "saveGameSettings") {
			var settings = new Settings();
			settings.get();
			var games = settings.games_settings;
			//games = new Array();
			game = request.game;

			var oldGame = new Game();
			var index = 0;
			var found = false;
			for ( var i = 0; i < games.length; i++) {
				if (games[i].slugName == game.slugName) {
					oldGame = games[i];
					index = i;
					found = true;
				}
			}
			if (!found) {
				var newGame = new Game();
				newGame.name = game.name;
				newGame.slugName = game.slugName;
				games.push(newGame);
				index = games.length - 1;
			}

			if (request.type == "gs") {
				games[index].s_filterOut = game.s_filterOut;
				games[index].s_filterIn = game.s_filterIn;
			}
			if (request.type == "n") {
				games[index].n_filterOut = game.n_filterOut;
				games[index].n_filterIn = game.n_filterIn;
			}

			settings.games_settings = games;
			settings.save();

			var settingsS = JSON.stringify(settings);
			chrome.tabs.sendRequest(sender.tab.id, {
				action : 'sendSettings',
				settings : settingsS,
				games : true
			});
		}
	});

	var notification;
	/**
	 * Prepare a notification to the user
	 * @param historyentry
	 */
	function notify(he) {
		var autoNotifString = " custom ";
		if (he.autoNotif) {
			autoNotifString = "n automatic ";
		}
		notification = window.webkitNotifications
				.createHTMLNotification('notification.html?msg=' + he.name
						+ '&autonotif=' + autoNotifString);
		he.notificationTime = he.time;
		saveHistoryEntry(he, false);
		showNotification();
	}

	/**
	 * Launch the notification
	 */
	function showNotification() {
		notification.show();
		setTimeout('hideNotification()', settings.notification_time * 1000);
	}
	
	/**
	 * Hide a notification
	 */
	function hideNotification() {
		notification.cancel();
	}
	
	/**
	 * START of new feature : delaying the opening of tabs.
	 */
	chrome.extension.onRequest.addListener(function(request, sender,
			sendResponse) {
		if (request.action == "openNotifTab") {
// 			console.log("OpenTabs : "+openedTabs.length);
// 			if (openedTabs.length > 4) {
// 				pendingTabs.push(request.url);
// 			} else {
				chrome.tabs.create({
					url : request.url,
					selected : false
				}
// 				, 
// 				function(tab){
// 					openedTabs.push(tab.id);
// 					console.log("openedTabs");
// 					console.log(openedTabs);
							
// 				}
				);
// 			}
		}
	});
	/**
	 * END of new feature : delaying the opening of tabs.
	 */

	// Listen for any changes to the URL of any tab.
	chrome.tabs.onUpdated.addListener(checkForValidUrl);