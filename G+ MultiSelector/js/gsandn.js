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
var d_streamPostContainer = "ORWD7d"; // ok
var d_streamPostGameTextClass = "Lr"; // ok RiLh2d
var d_streamPostGameTextClass2 = "RiLh2d"; // ok RiLh2d
var d_streamPostTitleClass = "oCTSmc"; // ok
var d_insertAfterNode = "ORWD7d"; // ok
var d_streamPostNodeClass = "Te"; // ok
var d_streamPostContentClass = "Ks"; // ok

var d_streamPostLinkContainer = "Ye"; // ok
var d_hideStreamPostClass = "t0psmc"; // ok
var d_cancelHideClass = "dSEkJe"; // ok
var d_hideArrowClass = "Hf"; // ok
var d_plusoneClass = "BRowJd"; // ok
var d_plusloaderClass = "yG12ye"; // ok
var d_myNameClass = "k-Qf-pu-LS"; // ok

//Add contacts from the people having played to a game
var peoplePlayedDivClass = "Y-S";
var peoplePlayedOkButtonClass = "Y-S-qa";
var peoplePlayedContactDivClass = "AkM0qf";

//Parent div of a notification
var dn_notificationContainer = "ZuC1te";
var dn_notificationGameTextClass = "aocudf";
var dn_plusDivClass = "E4V1D";
var dn_notificationTitleClass = "PqQN6b";
var dn_insertAfterNode = "TCaCG";
var dn_notificationNodeClass = "PThiGe";
var dn_notificationLinkContainer = "xIkaOe";
var dn_hideNotificationClass = "If9X9b";
var dn_cancelHideClass = "Fb1xdb";
var dn_textNotificationContainer = "h6CsWb";

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

/**
 * Ask for the settings
 */
$(document).ready(function() {

	chrome.extension.sendRequest({
		action : 'getSettings'
	});

	injectStylesheet(document);
});

/**
 * Communication with the extension
 */
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	/**
	 * The game stream page has been updated
	 */
	if (request.action == "streamUpdated") {
		init();
		gs_movePlusDiv();
		var url = window.location.href;
		var index = url.indexOf("games");
		currentUrlBase = url.substring(0, index);
		$('#n_plusFake').remove();
		myId = $('.' + d_myNameClass);
		if (myId.length < 1) {
			console.log("Unable to find my ID :(");
		} else {
			myId = myId.attr("href").substr(2);
		}
		if (myId == undefined || myId == "") {
			console.log("Unable to find my ID :(");
		}
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
		n_movePlusDiv();
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

/**
 * 
 * COMMON FUNCTIONS (stream and notifications)
 * 
 */
var waiting4Circle = false;
var contactsInDiv = new Array();
function openAddPeopleToCircle() {
	waiting4Circle = true;
	importCircle(myId);

	contactsInDiv = new Array();
	scrollDiv = $("." + classScrollDiv)[0];

	scrollTheDiv($("." + classScrollDiv)[0]);
	addVisibleContacts2ContactsInDiv();
	$("." + classScrollDiv).scroll(function() {
		addVisibleContacts2ContactsInDiv();
	});

}

function addVisibleContacts2ContactsInDiv() {
	$("." + peoplePlayedContactDivClass, $("." + peoplePlayedDivClass)).each(function() {
		if ($(this).attr("oid") != undefined) {
			var alreadyAdded = false;
			for ( var i = 0; i < contactsInDiv.length; i++) {
				if (contactsInDiv[i] == $(this).attr("oid")) {
					alreadyAdded = true;
					break;
				}
			}
			if (!alreadyAdded)
				contactsInDiv.push($(this).attr("oid"));
		}
	});
}

function populateCirclesToAddPeople() {
	html = '<div class="circleContainer">';
	for ( var i = 0; i < circles.length; i++) {
		html += '<div id="circleButtonDiv" class="circleButtonDiv">' + '<div class="circleButton" id="addPeopleButton-' + i + '" type="checkbox" oid="' + circles[i].code + '" >'
				+ '<div class="stt" oid="' + circles[i].code + '"></div>' + circles[i].name + '</div>' + '</div>';
	}
	html += "</div>";
	$(".stt").each(function() {
		$(this).click(function(e) {
			comparePPACircle($(this).attr("oid"));
			e.stopPropagation();
		});
	});
	$("." + peoplePlayedDivClass).append(html);
	$("div[id*='addPeopleButton']").click(function() {
		if (confirm('This will add ' + contactsInDiv.length + ' contacts in the ' + $(this).text() + ' circle. Are you sure ?')) {
			circleCode = $(this).attr("oid");
			addContactsToCircle(contactsInDiv, circleCode, $(this).text());
			dispatchMouseEvent($($("button[name='ok']"), '.' + peoplePlayedOkButtonClass)[0], 'mouseover', true, true);
			dispatchMouseEvent($($("button[name='ok']"), '.' + peoplePlayedOkButtonClass)[0], 'mousedown', true, true);
			dispatchMouseEvent($($("button[name='ok']"), '.' + peoplePlayedOkButtonClass)[0], 'mouseup', true, true);
			dispatchMouseEvent($($("button[name='ok']"), '.' + peoplePlayedOkButtonClass)[0], 'click', true, true);
			peoplePlayedAddedButton = false;
		}
	});
	waiting4Circle = false;
}

var settingsAsBeenSet = false;
/**
 * Update the settings in the page from the retrieved one
 * @param selectedGame
 */
function majSettings(selectedGame) {

	var gsNode = $("div[id*='gncGST']");
	var notifNode = $("div[id*='gncT']");

	$('input[id*="autoHide"]', $(gsNode)).each(function() {
		if (gsettings.gs_hide != undefined && gsettings.gs_hide) {
			$(this).attr('checked', 'checked');
		} else {
			$(this).removeAttr('checked');
		}
	});

	$('input[id*="autoHide"]', $(notifNode)).each(function() {
		if (gsettings.notif_hide != undefined && gsettings.notif_hide) {
			$(this).attr('checked', 'checked');
		} else {
			$(this).removeAttr('checked');
		}
	});

	$('input[id*="reverse"]', $(gsNode)).each(function() {
		if (gsettings.gs_reverse != undefined && gsettings.gs_reverse) {
			$(this).attr('checked', 'checked');
		} else {
			$(this).removeAttr('checked');
		}
	});

	$('input[id*="reverse"]', $(notifNode)).each(function() {
		if (gsettings.notif_reverse != undefined && gsettings.notif_reverse) {
			$(this).attr('checked', 'checked');
		} else {
			$(this).removeAttr('checked');
		}
	});

	$('input[id*="openLimit"]', $(gsNode)).each(function() {
		if (gsettings.gs_limit != undefined) {
			$(this).val(gsettings.gs_limit);
		}
	});
	$('input[id*="openLimit"]', $(notifNode)).each(function() {
		if (gsettings.notif_limit != undefined) {
			$(this).val(gsettings.notif_limit);
		}
	});

	$('input[id*="openDelay"]', $(gsNode)).each(function() {
		if (gsettings.gs_delay != undefined) {
			$(this).val(gsettings.gs_delay / 1000);
		}
	});
	$('input[id*="openDelay"]', $(notifNode)).each(function() {
		if (gsettings.notif_delay != undefined) {
			$(this).val(gsettings.notif_delay / 1000);
		}
	});

	var games = gsettings.games;
	if (games == undefined)
		games = new Array();
	for ( var i = 0; i < games.length; i++) {
		var htmlN = '<option value="" selected="selected">New</option>';
		var htmlGS = '<option value="" selected="selected">New</option>';

		for ( var j = 0; j < games[i].filters.length; j++) {
			var filter = games[i].filters[j];
			if (filter.type == "gs") {
				htmlGS += '<option value="' + filter.name + '"';
				if (games[i].lastFilterGS != undefined && games[i].lastFilterGS.name == filter.name) {
					htmlGS += ' selected="selected"';
					$("#gs-name" + games[i].slugName).val(filter.name);
					$("#gs-filterIn" + games[i].slugName).val(filter.filterIn);
					$("#gs-filterOut" + games[i].slugName).val(filter.filterOut);
					if ($("#plusOne" + games[i].slugName)[0] != undefined) {
						$("#plusOne" + games[i].slugName)[0].checked = filter.plusOne;
					}
					if ($("#gs-fold" + games[i].slugName)[0] != undefined) {
						$("#gs-fold" + games[i].slugName)[0].checked = filter.fold;
					}
				}
				htmlGS += '>' + filter.name + '</option>';
			} else {
				htmlN += '<option value="' + filter.name + '"';
				if (games[i].lastFilterN != undefined && games[i].lastFilterN.name == filter.name) {
					htmlN += ' selected="selected"';
					$("#n-name" + games[i].slugName).val(filter.name);
					$("#n-filterIn" + games[i].slugName).val(filter.filterIn);
					$("#n-filterOut" + games[i].slugName).val(filter.filterOut);
				}
				htmlN += '>' + filter.name + '</option>';
			}
		}
		$("#gs-preset" + games[i].slugName).html(htmlGS);
		$("#n-preset" + games[i].slugName).html(htmlN);
	}
}

/**
 * Open an alert modal popup
 * @param title
 * @param text
 * @param width
 * @param height
 */
function openAlert(title, text, width, height) {
	$("#ggc_alert").html(text);
	$("#ggc_alert").dialog({
		modal : true,
		title : title,
		autoOpen : false,
		buttons : {
			Close : function() {
				$(this).dialog("close");
			}
		}
	});
	if (width != undefined) {
		$("#ggc_alert").dialog("option", "width", width);
	}
	if (height != undefined) {
		$("#ggc_alert").dialog("option", "height", height);
	}
	$("#ggc_alert").dialog("open");
}

/**
 * Split an array
 * @param arr
 * @param sep
 * @returns {Array}
 */
function splitArray(arr, sep) {
	var result = new Array();
	for ( var i = 0; i < arr.length; i++) {
		var tempSplitted = arr[i].split(sep);
		result = result.concat(tempSplitted);
	}
	return result;
}

/**
 * Send the result of a filter *containing*
 * @param text
 * @param compare
 * @returns {Boolean}
 */
function computeFilterContaining(text, compare) {
	text = text.toLowerCase();
	if (text == "")
		return true;
	compare = compare.toLowerCase();

	var splittedByOr = text.split("$");
	splittedByOr = splitArray(splittedByOr, "|");
	for ( var i = 0; i < splittedByOr.length; i++) {
		var orClause = splittedByOr[i];
		var splittedByAnd = orClause.split("&");
		splittedByAnd = splitArray(splittedByAnd, "*");
		var containingAll = true;
		for ( var j = 0; j < splittedByAnd.length; j++) {
			if (compare.indexOf(splittedByAnd[j]) == -1) {
				containingAll = false;
			}
		}

		if (containingAll)
			return true;
	}
	return false;
}

/**
 * Send the result of a filter *not containing*
 * @param text
 * @param compare
 * @returns {Boolean}
 */
function computeFilterNotContaining(text, compare) {
	text = text.toLowerCase();
	if (text == "")
		return true;
	compare = compare.toLowerCase();

	var splittedByOr = text.split("&");
	splittedByOr = splitArray(splittedByOr, "*");
	for ( var i = 0; i < splittedByOr.length; i++) {
		var orClause = splittedByOr[i];
		var splittedByAnd = orClause.split("$");
		splittedByAnd = splitArray(splittedByAnd, "|");
		var containingAll = true;
		for ( var j = 0; j < splittedByAnd.length; j++) {
			if (compare.indexOf(splittedByAnd[j]) != -1) {
				containingAll = false;
			}
		}

		if (containingAll)
			return true;
	}
	return false;
}

/**
 * Restrict a text value
 * @param o
 */
function textInputRestriction(o) {
	o.target.value = o.target.value.replace(/([^0-9])/g, "");
}

/**
 * Injects styles in current document.
 */
function injectStylesheet(doc) {
	doc = doc || document;

	var linkNode = doc.createElement('link');
	linkNode.rel = 'stylesheet';
	linkNode.type = 'text/css';
	linkNode.href = chrome.extension.getURL('css/gnotifications.css') + '?' + new Date().getTime();
	doc.getElementsByTagName('head')[0].appendChild(linkNode);
	var linkNode = doc.createElement('link');
	linkNode.rel = 'stylesheet';
	linkNode.type = 'text/css';
	linkNode.href = chrome.extension.getURL('css/jquery-ui.css') + '?' + new Date().getTime();
	doc.getElementsByTagName('head')[0].appendChild(linkNode);
}

/**
 * Slugify a text
 * @param text
 * @returns
 */
function slugify(text) {
	text = text.replace(/[^-a-zA-Z0-9,&\s]+/ig, '');
	text = text.replace(/-/gi, "_");
	text = text.replace(/\s/gi, "-");
	return text;
}

var loaderTimer;
/**
 * Wait for the "more" button end
 * @param type = n or gs
 */
function look4Loader(type) {

	if (type == "n") {

		if ($("." + d_plusloaderClass).is(":visible")) {
			loaderTimer = setTimeout(function() {
				look4Loader(type);
			}, 50);
		} else {
			$("#n_plusFake_img").hide();
			$("#n_plusFake_text").show();
			$('#n_plusFake').addClass("button");
			$('#n_plusFake').removeClass("buttonClear");
			n_arrange();
			clearTimeout(loaderTimer);
		}
	} else {
		if ($("." + d_plusloaderClass).is(":visible")) {
			loaderTimer = setTimeout(function() {
				look4Loader(type);
			}, 50);
		} else {
			$("#gs_plusFake_img").hide();
			$("#gs_plusFake_text").show();
			$('#gs_plusFake').addClass("button");
			$('#gs_plusFake').removeClass("buttonClear");
			gs_arrange();
			clearTimeout(loaderTimer);
		}
	}
}

/**
 * 
 * GAME STREAM FUNCTIONS !
 * 
 */

/**
 * Add the more button to the page
 */
function gs_movePlusDiv() {
	var img_url = chrome.extension.getURL('imgs/loader.gif');
	html = '<div id="gs_plusFakeContainer"><div id="gs_plusFake" class="button plusDiv">' + '<div id="gs_plusFake_img" class="hidden"><img src="' + img_url + '"/><p>Loading more posts...</p></div>'
			+ '<span id="gs_plusFake_text">More</span></div></div>';

	$('#gs_plusFakeContainer').each(function() {
		$(this).remove();
	});

	$(html).appendTo($("body"));

	$('#gs_plusFake').unbind("click");
	$('#gs_plusFake').click(function() {
		dispatchMouseEvent($("." + dn_plusDivClass)[0], 'mouseover', true, true);
		dispatchMouseEvent($("." + dn_plusDivClass)[0], 'mousedown', true, true);
		dispatchMouseEvent($("." + dn_plusDivClass)[0], 'mouseup', true, true);
		dispatchMouseEvent($("." + dn_plusDivClass)[0], 'click', true, true);
		$("#gs_plusFake_img").show();
		$("#gs_plusFake_text").hide();
		$('#gs_plusFake').removeClass("button");
		$('#gs_plusFake').addClass("buttonClear");
		look4Loader("g");
	});
}

/**
 * Are we on a game stream page ?
 * @returns {Boolean}
 */
function onGS() {
	var reg = new RegExp("/*\/games/{0}", "g");
	if (window.location.href.match(reg)) {
		return true;
	}
	return false;
}

/**
 * Initialization of the dom modification
 */
function init() {
	if (onGS()) {
		// Is this a real initialization ?
		if ($("#gncGSCP").length == 0) {
			gs_games = new Array();
			$("." + d_streamPostContainer).bind('DOMNodeInserted', function(e) {
				gs_bindCallback(e);
			});
			var html = '<div id="ggc_alert" class="hidden"></div><div id="gncGSCP"><ul oid="gncGSTabs"></ul></div>';

			$("." + d_streamPostTitleClass).after(html);
		}
		gs_arrange();
		$("." + d_streamPostTitleClass).addClass("notifTitle");
	}
}

var totalArr = 0;
var hideListenerInterval;
function gs_arrange() {
	var cont = $("." + d_streamPostContainer);
	$("div", cont).each(function() {
		if ($(this).hasClass(d_streamPostNodeClass)) {
			if ($(this).hasClass(gpmeFoldedClass) || $(this).hasClass(gpmeUnfoldedClass)) {
				gpmeUser = true;
				$(".gs_gpmefold").show();
			}
			var game = "";
			game = $('span[class*="' + d_streamPostGameTextClass + '"]', $(this)).html();
			var hide = false;
			if (game == undefined) {
				game = $('span[class*="' + d_streamPostGameTextClass2 + '"]', $(this)).html();
			}
			if (game != undefined && game != "") {
				hide = gs_addGame(game);
			} else {
				setTimeout('gs_arrange()', 200);
				return false;
			}
			$(this).addClass("gsEntry");
			totalArr++;
			$(this).removeClass("xi");
			
			if (!hide) {
				$('div[id="cgncGST-' + slugify(game) + '"]').append($(this));
			} else {
				$(this).parent().after($(this));
				$(this).hide();
			}
		}

	});
	resetGS();

}

var gsArrangeTimeout;
function gs_bindCallback(e) {
	clearTimeout(gsArrangeTimeout);
	gsArrangeTimeout = setTimeout('gs_arrange()', 200);
}

/**
 * Add a game tab to the page
 * @param g
 * @returns {Boolean}
 */
function gs_addGame(g) {
	var hide = false;
	if (settings != undefined) {
		hide = computeGameSettings(g);
	}
	
	if (hide){
		return true;
	}
	var img_url = chrome.extension.getURL('imgs/infog.png');
	var lis = '';
	for ( var i = 0; i < gs_games.length; i++) {
		if (gs_games[i] == g) {
			return false;
		}
		lis += '<li><a class="tabHeader" oid="' + gs_games[i] + '" href="#gncGST-' + slugify(gs_games[i]) + '">' + gs_games[i] + '</li></a>';
	}
	lis += '<li><a class="tabHeader" oid="' + g + '" href="#gncGST-' + slugify(g) + '">' + g + '</li></a>';
	$("[oid=gncGSTabs]").html(lis);
	html = '<div class="aNDiv" id="gncGST-'
			+ slugify(g)
			+ '">'
			+ '<div class="gncGStopbar">'
			+ '<div id="gncGS_go_btn_'
			+ slugify(g)
			+ '" class="button">Launch</div>'
			+ '<div id="gncGS_stop_btn_'
			+ slugify(g)
			+ '" class="button buttonDisabled">Stop</div>'
			+ '<div class="button right" id="gncGS_hide_all_btn_'
			+ slugify(g)
			+ '">Hide all</div>'
			+ '<div class="button right" id="gncGS_hide_preset_btn_'
			+ slugify(g)
			+ '">Hide posts matching preset</div>'
			+ '<div class="button right" id="gncGS_hide_auto_'
			+ slugify(g)
			+ '">Always hide this game</div>'
			+ '<div class="hidden moreoptions" id="gncGSmoreoptions-'
			+ slugify(g)
			+ '">'
			+

			'<div class="optionsDiv">'
			+ '<h3>Global settings</h3>'
			+ '<table align="center">'
			+

			'<tr><td align="right"><label for="openLimit'
			+ slugify(g)
			+ '">Opened posts at a time </label></td><td><input id="openLimit'
			+ slugify(g)
			+ '" type="text" value="5" style="width:25px;"/></td></tr>'
			+ '<tr><td align="right"><label for="openDelay'
			+ slugify(g)
			+ '">Delay between two posts opening </label></td><td><span class="numeric-stepper"><input id="openDelay'
			+ slugify(g)
			+ '" value="delay" type="text" name="ns_textbox_0" size="2" autocomplete="off"><button type="submit" name="ns_button_1_0" value="1" class="plus">A</button><button type="submit" name="ns_button_2_0" value="-1" class="minus">Å</button></span></td>'
			+ '<tr><td align="right"><label for="autoHide' + slugify(g) + '">Automatically hide the posts </label></td><td><input id="autoHide' + slugify(g) + '" type="checkbox" checked/></td></tr>'
			+ '<tr><td align="right"><label for="reverse' + slugify(g) + '">Start from the oldest posts </label></td><td><input id="reverse' + slugify(g) + '" type="checkbox" checked/></td></tr>'
			+ '<tr><td align="right"><div class="button" id="gncGS_save' + slugify(g) + '">Make default</div></td><td></td></tr>' +

			'</table>' + '</div>' + '<div class="optionsDiv">' + '<img id="gs_info_img' + slugify(g) + '" class="infoImg" src="' + img_url + '"/>' + '<h3>Game settings</h3>' +

			'<table align="center">' +

			'<tr><td align="right"><label for="gs-preset' + slugify(g) + '">Presets </label></td><td align="left"><select style="max-width:172px;width:172px;" id="gs-preset' + slugify(g)
			+ '"><option value="" selected="selected">New</option></select></td></tr>' + '<tr><td align="right"><label for="gs-name' + slugify(g)
			+ '">Preset name </label></td><td align="left"><input id="gs-name' + slugify(g) + '" type="text" value=""/></td></tr>' + '<tr><td align="right"><label for="gs-filterIn' + slugify(g)
			+ '">Open only posts containing </label></td><td align="left"><input id="gs-filterIn' + slugify(g) + '" type="text" value=""/></td></tr>'
			+ '<tr><td align="right"><label for="gs-filterOut' + slugify(g) + '">Open posts not containing </label></td><td align="left"><input id="gs-filterOut' + slugify(g)
			+ '" type="text" value=""/></td></tr>' + '<tr><td align="right"><label for="plusOne' + slugify(g) + '">Automatically +1 the posts </label></td><td align="left"><input id="plusOne'
			+ slugify(g) + '" type="checkbox"/></td></tr>' + '<tr style="display:none" class="gs_gpmefold"><td align="right"><label for="fold' + slugify(g)
			+ '">G+Me fold the posts instead of hidding </label></td><td align="left"><input id="fold' + slugify(g) + '" type="checkbox" checked/></td></tr>'
			+ '<tr><td align="center" colspan="2"><div class="button" id="gncGS_preview_' + slugify(g) + '">Preview</div><div class="button" id="gncGS_add_preset' + slugify(g)
			+ '">Add</div><div class="button" id="gncGS_del_preset' + slugify(g) + '">Delete</div></td></tr>' +

			'</table>' +

			'</div>' +

			'</div>' + '<div class="spacer" id="toggleGSmoreoptions-' + slugify(g) + '">Ï</div>' + '</div>' + '<div class="gncGShiddenbar hidden" id="gncGShiddenbar-' + slugify(g) + '">'
			+ '<div class="title">Hidden posts</div>' + '<div class="hidden moreoptions" id="gncGSmorehidden-' + slugify(g) + '">' + '</div>' + '<div class="spacer" id="toggleGSmorehidden-'
			+ slugify(g) + '">Ï</div>' + '</div>' + '<div id="cgncGST-' + slugify(g) + '" class="topList"></div>' + '</div>';
	$("#gncGSCP").append(html);
	initNumericStepper();
	$("#openLimit" + slugify(g)).keyup(function(e) {
		textInputRestriction(e);
	});
	$("#openLimit" + slugify(g)).blur(function(e) {
		textInputRestriction(e);
	});

	if (settings != undefined)
		majSettings();

	$('#gncGS_hide_auto_' + slugify(g)).click(function() {
		if (confirm("You are about to hide all notifications / posts for this game in the future. This will take effect after having reloaded the page. You can undo this action in the options"))
		computeGameHide(g);
	});
	$('#gncGS_go_btn_' + slugify(g)).click(function() {
		$("." + d_streamPostContentClass, 'div[id="cgncGST-' + slugify(g) + '"]').each(function() {
			if (!$(this).is(":visible") && !$(this).parent().parent().hasClass(gpmeFoldedClass)) {
				var n = parseStreamPostNode($(this).closest(".gsEntry"));
				$('#gncGSmorehidden-' + slugify(n.game)).append(n.mainnode);
				$('#gncGShiddenbar-' + slugify(n.game)).slideDown("slow");
				$("." + d_cancelHideClass, $(n.mainnode)).click(function() {
					$("#cgncGST-" + slugify(n.game)).append(n.mainnode);
					$(n.mainnode).removeClass("done");
					if ($("#gncGSmorehidden-" + slugify(n.game)).children().length == 0) {
						toggleGSMoreHidden(slugify(n.game));
						$('#gncGShiddenbar-' + slugify(n.game)).slideUp("slow");
					}
					resetGSCounts();
				});
			}
		});
		gs_pickupPosts(slugify(g));
	});
	$("#toggleGSmoreoptions-" + slugify(g)).unbind("click");
	$("#toggleGSmoreoptions-" + slugify(g)).click(function() {
		toggleGSMoreOptions(slugify(g));
	});
	$("#toggleGSmorehidden-" + slugify(g)).unbind("click");
	$("#toggleGSmorehidden-" + slugify(g)).click(function() {
		toggleGSMoreHidden(slugify(g));
	});
	$("#gncGS_hide_all_btn_" + slugify(g)).unbind("click");
	$("#gncGS_hide_all_btn_" + slugify(g)).click(function() {
		gs_hideAll(slugify(g));
	});
	$("#gncGS_hide_preset_btn_" + slugify(g)).unbind("click");
	$("#gncGS_hide_preset_btn_" + slugify(g)).click(function() {
		gs_hidePreset(slugify(g));
	});
	$("#gncGS_save" + slugify(g)).unbind("click");
	$("#gncGS_save" + slugify(g)).click(function() {
		gs_saveToOptions(slugify(g));
	});

	$("#gncGS_add_preset" + slugify(g)).unbind("click");
	$("#gncGS_add_preset" + slugify(g)).click(function() {
		gs_addPresetSettings(slugify(g));
	});
	$("#gncGS_del_preset" + slugify(g)).unbind("click");
	$("#gncGS_del_preset" + slugify(g)).click(function() {
		gs_delPresetSettings(slugify(g));
	});
	$("#gncGS_preview_" + slugify(g)).unbind("click");
	$("#gncGS_preview_" + slugify(g)).click(function() {
		gs_previewFilters(slugify(g));
	});
	$("#gs-preset" + slugify(g)).unbind("change");
	$("#gs-preset" + slugify(g)).change(function() {
		gs_select_preset(slugify(g));
	});

	$("#gs_info_img" + slugify(g)).unbind("click");
	$("#gs_info_img" + slugify(g)).click(function() {
		chrome.extension.sendRequest({
			action : 'openFiltersPage',
			type : "gs"
		});
	});
	gs_games.push(g);
	return false;
}

/**
 * Hide auto a game
 */

function computeGameHide(g) {
	var games = settings.games_settings;
	var found = false;
	game = new Game();
	for ( var i = 0; i < games.length; i++) {
		if (games[i].slugName == slugify(g)) {
			games[i].name = g;
			found = true;
			game = games[i];
			game.hide = true;
			games[i] = game;
		}
	}
	if (!found) {
		game.name = g;
		game.slugName = slugify(g);
		game.hide = true;
		games.push(game);
	}
	chrome.extension.sendRequest({
		action : 'saveGamesSettings',
		games : games
	});
}

/**
 * Add a game entry to the settings
 * @param g
 */
function computeGameSettings(g) {
	var games = settings.games_settings;
	var found = false;
	game = new Game();
	for ( var i = 0; i < games.length; i++) {
		if (games[i].slugName == slugify(g)) {
			games[i].name = g;
			found = true;
			game = games[i];
		}
	}
	if (!found) {
		game.name = g;
		game.slugName = slugify(g);
		games.push(game);
		chrome.extension.sendRequest({
			action : 'saveGamesSettings',
			games : games
		});
	}
	return game.hide;
}

/**
 * Save global game stream settings
 * @param slugGame
 */
function gs_saveToOptions(slugGame) {
	settingsAsBeenSet = false;
	var limit = $("#openLimit" + slugGame)[0].value;
	var delay = $("#openDelay" + slugGame)[0].value * 1000;
	var autoHide = $("#autoHide" + slugGame)[0].checked;
	var plusOne = $("#plusOne" + slugGame)[0].checked;
	var reverse = $("#reverse" + slugGame)[0].checked;
	chrome.extension.sendRequest({
		action : 'openOptions',
		type : "gs",
		limit : limit,
		delay : delay,
		autoHide : autoHide,
		plusOne : plusOne,
		reverse : reverse
	});
}

/**
 * Add a preset to the filters
 * @param slugGame
 */
function gs_addPresetSettings(slugGame) {

	if ($("#gs-name" + slugGame).val() == "") {
		openAlert("Error", "You have to give a name to your preset.");
	} else {
		// Verify if this name already exists
		var exists = false;
		for ( var i = 0; i < gsettings.games.length; i++) {
			if (gsettings.games[i].slugName == slugGame) {
				for ( var j = 0; j < gsettings.games[i].filters.length; j++) {
					if (gsettings.games[i].filters[j].name == $("#gs-name" + slugGame).val() && gsettings.games[i].filters[j].type == "gs") {
						exists = true;
					}
				}
			}
		}
		var filter = new Object();
		filter.name = $("#gs-name" + slugGame).val();
		filter.type = "gs";
		filter.filterIn = $("#gs-filterIn" + slugGame).val();
		filter.filterOut = $("#gs-filterOut" + slugGame).val();
		filter.fold = $("#fold" + slugGame)[0].checked;
		filter.plusOne = $("#plusOne" + slugGame)[0].checked;
		if (exists) {
			if (confirm("This preset already exists. Would you like to overwrite it ?")) {
				chrome.extension.sendRequest({
					action : 'addPresetSettings',
					type : "gs",
					filter : filter,
					game : slugGame
				});
			}
		} else {
			chrome.extension.sendRequest({
				action : 'addPresetSettings',
				type : "gs",
				filter : filter,
				game : slugGame
			});
		}
	}
}

/**
 * Delete a preset from the filters
 * @param slugGame
 */
function gs_delPresetSettings(slugGame) {
	name = $("#gs-name" + slugGame).val();
	type = "gs";
	chrome.extension.sendRequest({
		action : 'delPresetSettings',
		game : slugGame,
		filter : name,
		type : type
	});
	$("#gs-name" + slugGame).val("");
	$("#gs-filterIn" + slugGame).val("");
	$("#gs-filterOut" + slugGame).val("");
	$("#plusOne" + slugGame)[0].checked = false;
}

/**
 * Select a preset in the filters.
 * @param slugGame
 * @returns {Boolean}
 */
function gs_select_preset(slugGame) {
	var selected = $("#gs-preset" + slugGame).val();

	for ( var i = 0; i < gsettings.games.length; i++) {
		if (gsettings.games[i].slugName == slugGame) {
			for ( var j = 0; j < gsettings.games[i].filters.length; j++) {
				var filter = gsettings.games[i].filters[j];
				if (filter.name == selected) {
					$("#gs-name" + slugGame).val(filter.name);
					$("#gs-filterIn" + slugGame).val(filter.filterIn);
					$("#gs-filterOut" + slugGame).val(filter.filterOut);
					$("#plusOne" + slugGame)[0].checked = filter.plusOne;
					$("#fold" + slugGame)[0].checked = filter.fold;
					chrome.extension.sendRequest({
						action : 'changeLastFilter',
						type : "gs",
						game : slugGame,
						filter : filter.name
					});
					return false;
				}
			}
		}
	}
	$("#gs-name" + slugGame).val("");
	$("#gs-filterIn" + slugGame).val("");
	$("#gs-filterOut" + slugGame).val("");
	$("#plusOne" + slugGame)[0].checked = false;
	$("#fold" + slugGame)[0].checked = false;
}

/**
 * Hide all the posts !
 * @param g
 */
function gs_hideAll(g) {
	var gameContainer = $("#cgncGST-" + g);
	var toHide = $("." + d_streamPostNodeClass, gameContainer);
	if (toHide.length > 0) {
		var notif = parseStreamPostNode(toHide.get(0));
		hideStreamPost(notif);
		setTimeout(function() {
			gs_hideAll(g);
		}, 200);
	}
	resetGSCounts();
}

/**
 * Hide the posts matching preset
 * @param g
 */
function gs_hidePreset(g) {
	var gameContainer = $("#cgncGST-" + g);
	var posts = $("." + d_streamPostNodeClass, gameContainer);

	var toHide = new Array();

	posts.each(function() {
		var skip = false;
		// Is it filtered ?
		var notifText = $("div[class*='" + d_streamPostLinkContainer + "']", $(this)).text();
		if (!computeFilterContaining($("#gs-filterIn" + g).val(), notifText) || !computeFilterNotContaining($("#gs-filterOut" + g).val(), notifText)) {
			skip = true;
		}
		if (!skip) {
			toHide.push($(this));
		}
	});

	if (toHide.length > 0) {
		var notif = parseStreamPostNode(toHide[0]);
		hideStreamPost(notif);
		setTimeout(function() {
			gs_hidePreset(g);
		}, 200);
	}
	resetGSCounts();
}

/**
 * Collapse a post in the G+me way
 * @param n
 */
function gpmeCollapse(n) {

	dispatchMouseEvent($(".gpme-bar", $(n.mainnode))[0], 'mousedown', true, true);
	dispatchMouseEvent($(".gpme-bar", $(n.mainnode))[0], 'mouseup', true, true);
	dispatchMouseEvent($(".gpme-bar", $(n.mainnode))[0], 'click', true, true);
	$("body").scrollTop(scrollTop);
}

/**
 * Hide a post from the stream
 * @param n
 */
function hideStreamPost(n) {
	dispatchMouseEvent(n.hideArrowNode[0], 'mousedown', true, true);
	dispatchMouseEvent(n.hideArrowNode[0], 'mouseup', true, true);
	dispatchMouseEvent(n.hideArrowNode[0], 'click', true, true);

	var hideNode = $("." + d_hideStreamPostClass, n.mainnode);
	dispatchMouseEvent(hideNode[0], 'mousedown', true, true);
	dispatchMouseEvent(hideNode[0], 'mouseup', true, true);
	dispatchMouseEvent(hideNode[0], 'click', true, true);
	$("body").scrollTop(scrollTop);

	$('#gncGSmorehidden-' + slugify(n.game)).append(n.mainnode);
	$(n.mainnode).addClass("done");
	// Add a listener to undo
	$("." + d_cancelHideClass, $(n.mainnode)).click(function() {
		$("#cgncGST-" + slugify(n.game)).append(n.mainnode);
		$(n.mainnode).removeClass("done");
		if ($("#gncGSmorehidden-" + slugify(n.game)).children().length == 0) {
			toggleGSMoreHidden(slugify(n.game));
			$('#gncGShiddenbar-' + slugify(n.game)).slideUp("slow");
		}
		resetGSCounts();
	});

	$('#gncGShiddenbar-' + slugify(n.game)).slideDown("slow");
}
/**
 * +1 one post
 * @param n
 */
function plusOne(n) {
	dispatchMouseEvent(n.plusOneNode[0], 'mousedown', true, true);
	dispatchMouseEvent(n.plusOneNode[0], 'mouseup', true, true);
	dispatchMouseEvent(n.plusOneNode[0], 'click', true, true);

}

/** 
 * Toggle the more options panel (down arraw)
 * @param g
 */
function toggleGSMoreOptions(g) {
	if ($("#toggleGSmoreoptions-" + g).html() == 'Ï') {
		$("#toggleGSmoreoptions-" + g).html('F');
		$("#gncGSmoreoptions-" + g).slideDown("slow");
	} else {
		$("#toggleGSmoreoptions-" + g).html('Ï');
		$("#gncGSmoreoptions-" + g).slideUp("slow");
	}
}
function toggleGSMoreHidden(g) {
	if ($("#toggleGSmorehidden-" + g).html() == 'Ï') {
		$("#toggleGSmorehidden-" + g).html('F');
		$("#gncGSmorehidden-" + g).slideDown("slow");
	} else {
		$("#toggleGSmorehidden-" + g).html('Ï');
		$("#gncGSmorehidden-" + g).slideUp("slow");
	}
}

/**
 * Launch the post pickup
 * @param slugGame
 */
function gs_pickupPosts(slugGame) {
	scrollTop = $("body").scrollTop();
	var limit = $("#openLimit" + slugGame)[0].value;
	var delay = $("#openDelay" + slugGame)[0].value * 1000;
	var autoHide = $("#autoHide" + slugGame)[0].checked;
	var plusOne = $("#plusOne" + slugGame)[0].checked;
	var reverse = $("#reverse" + slugGame)[0].checked;
	var fold = $("#fold" + slugGame)[0].checked && gpmeUser;

	var gameContainer = $("#cgncGST-" + slugGame);

	var jqSel;
	if (reverse) {
		jqSel = $($("." + d_streamPostNodeClass, gameContainer).get().reverse());
	} else {
		jqSel = $("." + d_streamPostNodeClass, gameContainer);
	}

	jqSel.each(function() {
		var skip = false;
		// Have to open ?
		// Is it mine ?
		if (myId != undefined) {
			$("a", $(this)).each(function() {

				if ($(this).attr("oid") == myId) {
					skip = true;
				}
			});
		}

		if (gpmeUser) {
			if ($(this).hasClass(gpmeFoldedClass)) {
				skip = true;
			}
		}
		// Is it filtered ?
		var notifText = $("div[class*='" + d_streamPostLinkContainer + "']", $(this)).text();
		if (!computeFilterContaining($("#gs-filterIn" + slugGame).val(), notifText) || !computeFilterNotContaining($("#gs-filterOut" + slugGame).val(), notifText)) {
			skip = true;
		}

		if (!$(this).hasClass("done") && !skip) {
			var notif = parseStreamPostNode($(this));
			notif.delay = delay;
			notif.autoHide = autoHide;
			notif.plusOne = plusOne;
			notif.fold = fold;
			if (streamPostToProcess.length < limit || limit == 0) {
				streamPostToProcess.push(notif);
			}
		}
	});
	$("#gncGS_stop_btn_" + slugGame).removeClass("buttonDisabled");
	$("#gncGS_stop_btn_" + slugGame).click(function() {
		streamPostToProcess = new Array();
		$("#gncGS_stop_btn_" + slugGame).addClass("buttonDisabled");
	});
	gs_pickupAGSP();
}

/**
 * Preview the current filter
 * @param slugGame
 */
function gs_previewFilters(slugGame) {
	var gameContainer = $("#cgncGST-" + slugGame);

	$("." + d_streamPostNodeClass, gameContainer).each(function() {

		var notifText = $("div[class*='" + d_streamPostLinkContainer + "']", $(this)).text();
		if (computeFilterContaining($("#gs-filterIn" + slugGame).val(), notifText) && computeFilterNotContaining($("#gs-filterOut" + slugGame).val(), notifText)) {
			$(this).css("background", "#c2d9fe");
		} else {
			$(this).css("background", "#fff");
		}
	});
}

/**
 * Pickup *a* post
 */
function gs_pickupAGSP() {
	if (streamPostToProcess.length > 0) {
		var notifToPick = streamPostToProcess[0];

		scrollTop = $("body").scrollTop();

		// Fake the hide procedure to see if the post is hidable
		dispatchMouseEvent(notifToPick.hideArrowNode[0], 'mousedown', true, true);
		dispatchMouseEvent(notifToPick.hideArrowNode[0], 'mouseup', true, true);
		dispatchMouseEvent(notifToPick.hideArrowNode[0], 'click', true, true);

		var hideNode = $("." + d_hideStreamPostClass, notifToPick.mainnode);
		dispatchMouseEvent(notifToPick.hideArrowNode[0], 'mousedown', true, true);
		dispatchMouseEvent(notifToPick.hideArrowNode[0], 'mouseup', true, true);
		dispatchMouseEvent(notifToPick.hideArrowNode[0], 'click', true, true);

		streamPostToProcess.shift();

		if (hideNode.length == 0) {
			console.log("It seems the extension tried to open a non-hidable post. Escaping it !");
		} else {

			if (notifToPick.fold) {
				gpmeCollapse(notifToPick);
			} else {
				if (notifToPick.autoHide) {
					hideStreamPost(notifToPick);
				}
			}

			$(notifToPick.mainnode).addClass("done");
			if (notifToPick.plusOne) {
				plusOne(notifToPick);
			}

			var urlToOpen = "";
			if (notifToPick.link.indexOf("http://") > -1) {
				urlToOpen = notifToPick.link;
			} else {
				urlToOpen = currentUrlBase + notifToPick.link;
			}
			chrome.extension.sendRequest({
				action : 'openNotifTab',
				url : urlToOpen
			});
		}

		// launch next
		if (streamPostToProcess.length > 0) {
			var nextNotifToPick = streamPostToProcess[0];
			setTimeout('gs_pickupAGSP()', nextNotifToPick.delay);
		} else {
			$("div[id*=gncGS_stop_btn_]").addClass("buttonDisabled");
		}
	} else {
		$("div[id*=gncGS_stop_btn_]").addClass("buttonDisabled");
	}
	resetGSCounts();
}

/**
 * Return an Object with convenient infos about a post.
 * @param node
 * @returns {___result1}
 */
function parseStreamPostNode(node) {
	var result = new Object();
	result.mainnode = node;
	result.game = $('span[class*="' + d_streamPostGameTextClass + '"]', node).html();
	result.link = $("a[href*='games']", node).attr("href");
	result.hideArrowNode = $("." + d_hideArrowClass, node);
	result.plusOneNode = $("." + d_plusoneClass, node);

	return result;
}

/**
 * Update the number displayed in the tabs' text
 */
function resetGSCounts() {
	var totalReset = 0;
	$("a[href*=gncGST]").each(function() {

		var target = $(this).attr("href").substring(1);
		var cont = $("#c" + target);

		var nb = 0;
		cont.children().each(function() {
			if (!$(this).hasClass("done")) {
				nb++;
			}
		});
		$(this).html($(this).attr("oid") + ' (' + nb + ')');
		totalReset += nb;
	});

}

function resetGS() {
	resetGSCounts();

	gs_selectedTab = $("#gncGSCP").tabs("option", "selected");
	$("#gncGSCP").tabs("destroy");
	if ($("[oid=gncGSTabs]").children().length > 0) {
		$("#gncGSCP").tabs().find(".ui-tabs-nav").sortable({
			axis : "x"
		});
		$("#gncGSCP").tabs("option", "selected", gs_selectedTab);
	}

	// Hack to manage posts going directly in tabs' divs
	$("div[id*='gncGST-']").unbind('DOMNodeInserted');
	$("div[id*='gncGST-']").bind('DOMNodeInserted', function(e) {
		$("div", $(this)).each(function() {
			if (!$(this).hasClass("gsEntry") && $(this).hasClass(d_streamPostNodeClass)) {
				if ($(this).hasClass(d_streamPostNodeClass)) {
					var game = "";
					var hide = false;
					game = $('span[class*="' + d_streamPostGameTextClass + '"]', $(this)).html();
					if (game != undefined && game != "") {
						hide = gs_addGame(game);
					} else {
						setTimeout('gs_arrange()', 200);
						return false;
					}
					$(this).addClass("gsEntry");
					totalArr++;
					if (!hide) {
						$('div[id="cgncGST-' + slugify(game) + '"]').append($(this));
					} else {
						$(this).parent().after($(this));
						$(this).hide();
					}
				}
				resetGSCounts();
			}
		});
	});
}

/**
 * 
 * NOTIFICATIONS FUNCTIONS !
 * 
 */

n_plusDivLeft = 0;
/**
 * Generate the More button
 */
function n_movePlusDiv() {
	var img_url = chrome.extension.getURL('imgs/loader.gif');
	html = '<div id="n_plusFakeContainer"><div id="n_plusFake" class="button plusDiv">' + '<div id="n_plusFake_img" class="hidden"><img src="' + img_url
			+ '"/><p>Loading more notifications...</p></div>' + '<span id="n_plusFake_text">More</span></div></div>';
	// $("."+dn_plusDivClass).addClass("plusDiv");
	$('#n_plusFakeContainer').each(function() {
		$(this).remove();
	});

	$(html).appendTo($("body"));

	$('#n_plusFake').unbind("click");
	$('#n_plusFake').click(function() {
		dispatchMouseEvent($("." + dn_plusDivClass)[0], 'mouseover', true, true);
		dispatchMouseEvent($("." + dn_plusDivClass)[0], 'mousedown', true, true);
		dispatchMouseEvent($("." + dn_plusDivClass)[0], 'mouseup', true, true);
		dispatchMouseEvent($("." + dn_plusDivClass)[0], 'click', true, true);
		$("#n_plusFake_img").show();
		$("#n_plusFake_text").hide();
		$('#n_plusFake').removeClass("button");
		$('#n_plusFake').addClass("buttonClear");
		look4Loader("n");
	});
}

/**
 * Initialization of the notification page
 */
function n_init() {
	// Is this a real initialization ?
	if ($("#gncCP").length == 0) {
		notifgames = new Array();
		$("." + dn_notificationContainer).unbind('DOMNodeInserted');
		$("." + dn_notificationContainer).bind('DOMNodeInserted', function(e) {
			n_bindCallback(e);
		});
		var html = '<div id="ggc_alert" class="hidden"></div><div id="gncCP"><ul oid="gncTabs"></ul></div>';

		$("." + dn_insertAfterNode).before(html);
	}
	n_arrange();
	$("." + dn_notificationTitleClass).addClass("notifTitle");
}

/**
 * Sort the notification posts in their tabs
 */
function n_arrange() {
	var cont = $("." + dn_notificationContainer);
	$("div", cont).each(function() {
		if ($(this).hasClass(dn_notificationNodeClass)) {
			var game = "";
			var hide = false;
			$('span[class*="' + dn_notificationGameTextClass + '"]', $(this)).each(function() {
				game = $(this).html();
				if (game != undefined) {
					hide = n_addGame(game);
				} else {
					setTimeout('n_arrange()', 200);
					return false;
				}
			});
			$(this).addClass("notifEntry");
			
			if (!hide) {
				$('div[id="cgncT-' + slugify(game) + '"]').append($(this));
			} else {
				$(this).parent().after($(this));
				$(this).hide();
			}
		}

	});
	n_reset();
}

function n_bindCallback(e) {
	setTimeout('n_arrange()', 200);
}

/**
 * Add a game to tabs
 * @param g
 * @returns {Boolean}
 */
function n_addGame(g) {
	var hide = false;
	if (settings != undefined) {
		hide = computeGameSettings(g);
	}
	
	if (hide){
		return true;
	}
	
	var img_url = chrome.extension.getURL('imgs/infog.png');
	var lis = '';
	for ( var i = 0; i < notifgames.length; i++) {
		if (notifgames[i] == g) {
			return false;
		}
		lis += '<li><a class="tabHeader" oid="' + notifgames[i] + '" href="#gncT-' + slugify(notifgames[i]) + '">' + notifgames[i] + '</li></a>';
	}
	lis += '<li><a class="tabHeader" oid="' + g + '" href="#gncT-' + slugify(g) + '">' + g + '</li></a>';
	$("[oid=gncTabs]").html(lis);
	html = '<div class="aNDiv" id="gncT-'
			+ slugify(g)
			+ '">'
			+ '<div class="gnctopbar">'
			+ '<div id="gnc_go_btn_'
			+ slugify(g)
			+ '" class="button">Launch</div>'
			+ '<div id="gnc_stop_btn_'
			+ slugify(g)
			+ '" class="button buttonDisabled">Stop</div>'
			+ '<div class="button right" id="gnc_hide_all_btn_'
			+ slugify(g)
			+ '">Hide all</div>'
			+ '<div class="button right" id="gnc_hide_preset_btn_'
			+ slugify(g)
			+ '">Hide posts matching preset</div>'
			+ '<div class="button right" id="gnc_hide_auto_'
			+ slugify(g)
			+ '">Always hide this game</div>'
			+ '<div class="hidden moreoptions" id="gncmoreoptions-'
			+ slugify(g)
			+ '">'
			+

			'<div class="optionsDiv">'
			+ '<h3>Global settings</h3>'
			+ '<table align="center">'
			+

			'<table align="center">'
			+

			'<tr><td align="right"><label for="openLimit'
			+ slugify(g)
			+ '">Opened notification at a time </label></td><td><input id="openLimit'
			+ slugify(g)
			+ '" type="text" value="5" style="width:25px;"/></td>'
			+ '<tr><td align="right"><label for="openDelay'
			+ slugify(g)
			+ '">Delay between two notifications opening </label></td><td><span class="numeric-stepper"><input id="openDelay'
			+ slugify(g)
			+ '" value="delay" type="text" name="ns_textbox_0" size="2" autocomplete="off"><button type="submit" name="ns_button_1_0" value="1" class="plus">A</button><button type="submit" name="ns_button_2_0" value="-1" class="minus">Å</button></span></td>'
			+ '<tr><td align="right"><label for="autoHide' + slugify(g) + '">Automatically hide the notifications </label></td><td><input id="autoHide' + slugify(g)
			+ '" type="checkbox" checked/></td>' + '<tr><td align="right"><label for="reverse' + slugify(g) + '">Start from the oldest notifications </label></td><td><input id="reverse' + slugify(g)
			+ '" type="checkbox" checked/></td>' + '<tr><td align="right"><div class="button" id="gncN_save' + slugify(g) + '">Make default</div></td><td></td>' +

			'</table>' +

			'</table>' + '</div>' +

			'<div class="optionsDiv">' + '<img id="n_info_img' + slugify(g) + '" class="infoImg" src="' + img_url + '"/>' + '<h3>Game settings</h3>' +

			'<table align="center">' +

			'<tr><td align="right"><label for="n-preset' + slugify(g) + '">Presets </label></td><td align="left"><select style="max-width:172px;width:172px;" id="n-preset' + slugify(g)
			+ '"><option value="" selected="selected">New</option></select></td></tr>' + '<tr><td align="right"><label for="n-name' + slugify(g)
			+ '">Preset name </label></td><td align="left"><input id="n-name' + slugify(g) + '" type="text" value=""/></td></tr>' + '<tr><td align="right"><label for="n-filterIn' + slugify(g)
			+ '">Open only posts containing </label></td><td><input id="n-filterIn' + slugify(g) + '" type="text" value=""/></td></tr>' + '<tr><td align="right"><label for="n-filterOut' + slugify(g)
			+ '">Open posts not containing </label></td><td><input id="n-filterOut' + slugify(g) + '" type="text" value=""/></td></tr>'
			+ '<tr><td align="center" colspan="2"><div class="button" id="gncN_preview_' + slugify(g) + '">Preview</div><div class="button" id="gncN_add_preset' + slugify(g)
			+ '">Add</div><div class="button" id="gncN_del_preset' + slugify(g) + '">Delete</div></td></tr>' +

			'</table>' +

			'</div>' +

			'</div>' + '<div class="spacer" id="togglemoreoptions-' + slugify(g) + '">Ï</div>' + '</div>' + '<div class="gnchiddenbar hidden" id="gnchiddenbar-' + slugify(g) + '">'
			+ '<div class="title">Hidden notifications</div>' + '<div class="hidden moreoptions" id="gncmorehidden-' + slugify(g) + '">' + '</div>' + '<div class="spacer" id="togglemorehidden-'
			+ slugify(g) + '">Ï</div>' + '</div>' + '<div id="cgncT-' + slugify(g) + '" class="topList"></div>' + '</div>';
	$("#gncCP").append(html);

	initNumericStepper();
	$("#openLimit" + slugify(g)).keyup(function(e) {
		textInputRestriction(e);
	});
	$("#openLimit" + slugify(g)).blur(function(e) {
		textInputRestriction(e);
	});
	$('#gnc_go_btn_' + slugify(g)).click(function() {
		$("." + dn_textNotificationContainer, 'div[id="cgncT-' + slugify(g) + '"]').each(function() {
			if (!$(this).is(":visible")) {
				var n = n_parseNotificationNode($(this).closest(".notifEntry"));
				$('#gncmorehidden-' + slugify(n.game)).append(n.mainnode);
				$('#gnchiddenbar-' + slugify(n.game)).slideDown("slow");
				$("." + dn_cancelHideClass, $(n.mainnode)).click(function() {
					$("#cgncT-" + slugify(n.game)).append(n.mainnode);
					$(n.mainnode).removeClass("done");
					if ($("#gncmorehidden-" + slugify(n.game)).children().length == 0) {
						toggleGSMoreHidden(slugify(n.game));
						$('#gnchiddenbar-' + slugify(n.game)).slideUp("slow");
					}
				});
			}
		});
		n_pickupNotifications(slugify(g));
	});
	
	$('#gnc_hide_auto_' + slugify(g)).click(function() {
		if (confirm("You are about to hide all notifications / posts for this game in the future. This will take effect after having reloaded the page. You can undo this action in the options"))
		computeGameHide(g);
	});

	if (settings != undefined)
		majSettings();

	$("#n_info_img" + slugify(g)).unbind("click");
	$("#n_info_img" + slugify(g)).click(function() {
		chrome.extension.sendRequest({
			action : 'openFiltersPage',
			type : "n"
		});
	});

	$("#togglemoreoptions-" + slugify(g)).unbind("click");
	$("#togglemoreoptions-" + slugify(g)).click(function() {
		n_toggleMoreOptions(slugify(g));
	});
	$("#togglemorehidden-" + slugify(g)).unbind("click");
	$("#togglemorehidden-" + slugify(g)).click(function() {
		n_toggleMoreHidden(slugify(g));
	});
	$("#gnc_hide_all_btn_" + slugify(g)).unbind("click");
	$("#gnc_hide_all_btn_" + slugify(g)).click(function() {
		n_hideAll(slugify(g));
	});
	$("#gnc_hide_preset_btn_" + slugify(g)).unbind("click");
	$("#gnc_hide_preset_btn_" + slugify(g)).click(function() {
		n_hidePreset(slugify(g));
	});
	$("#gncN_save" + slugify(g)).unbind("click");
	$("#gncN_save" + slugify(g)).click(function() {
		n_saveToOptions(slugify(g));
	});

	$("#gncN_preview_" + slugify(g)).unbind("click");
	$("#gncN_preview_" + slugify(g)).click(function() {
		n_previewFilters(slugify(g));
	});
	$("#gncN_add_preset" + slugify(g)).unbind("click");
	$("#gncN_add_preset" + slugify(g)).click(function() {
		n_addPresetSettings(slugify(g));
	});
	$("#gncN_del_preset" + slugify(g)).unbind("click");
	$("#gncN_del_preset" + slugify(g)).click(function() {
		n_delPresetSettings(slugify(g));
	});
	$("#n-preset" + slugify(g)).unbind("change");
	$("#n-preset" + slugify(g)).change(function() {
		n_select_preset(slugify(g));
	});

	notifgames.push(g);
	return true;
}

/**
 * Hide all the notifications !
 * @param g
 */
function n_hideAll(g) {
	var gameContainer = $("#cgncT-" + g);
	var toHide = $("." + dn_notificationNodeClass, gameContainer);
	if (toHide.length > 0) {
		var notif = n_parseNotificationNode(toHide.get(0));
		n_hideNotification(notif);
		setTimeout(function() {
			n_hideAll(g);
		}, 200);
	}
	n_resetCounts();
}

/**
 * Hide the posts matching preset
 * @param g
 */
function n_hidePreset(g) {
	var gameContainer = $("#cgncT-" + g);
	var posts = $("." + dn_notificationNodeClass, gameContainer);

	var toHide = new Array();

	posts.each(function() {
		var skip = false;
		// Is it filtered ?
		var notifText = $("div[class*='" + dn_textNotificationContainer + "']", $(this)).text();
		if (!computeFilterContaining($("#n-filterIn" + g).val(), notifText) || !computeFilterNotContaining($("#n-filterOut" + g).val(), notifText)) {
			skip = true;
		}
		if (!skip) {
			toHide.push($(this));
		}
	});

	if (toHide.length > 0) {
		var notif = n_parseNotificationNode(toHide[0]);
		n_hideNotification(notif);
		setTimeout(function() {
			n_hidePreset(g);
		}, 200);
	}
	n_resetCounts();
}

/**
 * Hide a notification
 * @param n
 */
function n_hideNotification(n) {
	dispatchMouseEvent(n.hidenode[0], 'mousedown', true, true);
	dispatchMouseEvent(n.hidenode[0], 'mouseup', true, true);
	dispatchMouseEvent(n.hidenode[0], 'click', true, true);

	$("body").scrollTop(scrollTop);
	$('#gncmorehidden-' + slugify(n.game)).append(n.mainnode);
	// Add a listener to undo
	$("." + dn_cancelHideClass, $(n.mainnode)).click(function() {
		$("#cgncT-" + slugify(n.game)).append(n.mainnode);
		$(n.mainnode).removeClass("done");
		if ($("#gncmorehidden-" + slugify(n.game)).children().length == 0) {
			n_toggleMoreHidden(slugify(n.game));
			$('#gnchiddenbar-' + slugify(n.game)).slideUp("slow");
		}
		n_resetCounts();
	});

	$('#gnchiddenbar-' + slugify(n.game)).slideDown("slow");
}

/**
 * Toggle the more options panel (down arrow)
 * @param g
 */
function n_toggleMoreOptions(g) {
	if ($("#togglemoreoptions-" + g).html() == 'Ï') {
		$("#togglemoreoptions-" + g).html('F');
		$("#gncmoreoptions-" + g).slideDown("slow");
	} else {
		$("#togglemoreoptions-" + g).html('Ï');
		$("#gncmoreoptions-" + g).slideUp("slow");
	}
}
function n_toggleMoreHidden(g) {
	if ($("#togglemorehidden-" + g).html() == 'Ï') {
		$("#togglemorehidden-" + g).html('F');
		$("#gncmorehidden-" + g).slideDown("slow");
	} else {
		$("#togglemorehidden-" + g).html('Ï');
		$("#gncmorehidden-" + g).slideUp("slow");
	}
}

var notifToProcess = new Array();
/**
 * Launch the notifications process
 * @param slugGame
 */
function n_pickupNotifications(slugGame) {
	scrollTop = $("body").scrollTop();
	var limit = $("#openLimit" + slugGame)[0].value;
	var delay = $("#openDelay" + slugGame)[0].value * 1000;
	var autoHide = $("#autoHide" + slugGame)[0].checked;
	var reverse = $("#reverse" + slugGame)[0].checked;

	var gameContainer = $("#cgncT-" + slugGame);

	var jqSel;
	if (reverse) {
		jqSel = $($("." + dn_notificationNodeClass, gameContainer).get().reverse());
	} else {
		jqSel = $("." + dn_notificationNodeClass, gameContainer);
	}

	jqSel.each(function() {

		var skip = false;
		// Have to open ?
		// Is it filtered ?
		var notifText = $("div[class*='" + dn_textNotificationContainer + "']", $(this)).text();
		if (!computeFilterContaining($("#n-filterIn" + slugGame).val(), notifText) || !computeFilterNotContaining($("#n-filterOut" + slugGame).val(), notifText)) {
			skip = true;
		}

		if (!$(this).hasClass("done") && !skip) {
			var notif = n_parseNotificationNode($(this));
			notif.delay = delay;
			notif.autoHide = autoHide;
			if (notifToProcess.length < limit || limit == 0) {
				notifToProcess.push(notif);
			}
		}
	});
	$("#gnc_stop_btn_" + slugGame).removeClass("buttonDisabled");
	$("#gnc_stop_btn_" + slugGame).click(function() {
		notifToProcess = new Array();
		$("#gnc_stop_btn_" + slugGame).addClass("buttonDisabled");
	});
	n_pickupANotif();
}

/**
 * Preview a notification preset
 * @param slugGame
 */
function n_previewFilters(slugGame) {

	var gameContainer = $("#cgncT-" + slugGame);

	$("." + dn_notificationNodeClass, gameContainer).each(function() {

		// Have to open ?
		// Is it filtered ?
		var notifText = $("div[class*='" + dn_textNotificationContainer + "']", $(this)).text();
		if (computeFilterContaining($("#n-filterIn" + slugGame).val(), notifText) && computeFilterNotContaining($("#n-filterOut" + slugGame).val(), notifText)) {
			$(this).css("background", "#c2d9fe");
		} else {
			$(this).css("background", "#fff");
		}
	});
}

/**
 * Process *a* notification
 */
function n_pickupANotif() {
	if (notifToProcess.length > 0) {
		var notifToPick = notifToProcess[0];
		notifToProcess.shift();
		if (notifToPick.autoHide) {
			n_hideNotification(notifToPick);
		}
		$(notifToPick.mainnode).addClass("done");

		var urlToOpen = "";
		if (notifToPick.link.indexOf("http://") > -1) {
			urlToOpen = notifToPick.link;
		} else {
			urlToOpen = currentUrlBase + notifToPick.link;
		}
		chrome.extension.sendRequest({
			action : 'openNotifTab',
			url : urlToOpen
		});
		// launch next
		if (notifToProcess.length > 0) {
			var nextNotifToPick = notifToProcess[0];
			setTimeout('n_pickupANotif()', nextNotifToPick.delay);
		} else {
			$("div[id*=gnc_stop_btn_]").addClass("buttonDisabled");
		}
	} else {
		$("div[id*=gnc_stop_btn_]").addClass("buttonDisabled");
	}
	n_resetCounts();
}

/**
 * Return an object with convenient infos about a notification node
 * @param node
 * @returns {___result2}
 */
function n_parseNotificationNode(node) {
	var result = new Object();
	result.mainnode = node;
	result.game = $('span[class*="' + dn_notificationGameTextClass + '"]', node).html();
	result.link = $("a", $('.' + dn_notificationLinkContainer, node)).attr("href");
	result.hidenode = $("." + dn_hideNotificationClass, node);

	return result;
}

/**
 * Reset all the numbers displayed in game tabs
 */
function n_resetCounts() {
	$("a[href*=gncT]").each(function() {

		var target = $(this).attr("href").substring(1);
		var cont = $("#c" + target);

		var nb = 0;
		cont.children().each(function() {
			if (!$(this).hasClass("done")) {
				nb++;
			}
		});
		$(this).html($(this).attr("oid") + ' (' + nb + ')');
	});
}

function n_reset() {
	n_resetCounts();
	selectedNotifTab = $("#gncCP").tabs("option", "selected");
	$("#gncCP").tabs("destroy");
	if ($("[oid=gncTabs]").children().length > 0) {
		$("#gncCP").tabs().find(".ui-tabs-nav").sortable({
			axis : "x"
		});
		$("#gncCP").tabs("option", "selected", selectedNotifTab);
	}
	// if (settings != undefined) majSettings();
}

/**
 * Save a game settings
 * @param slugGame
 */
function n_saveToOptions(slugGame) {
	settingsAsBeenSet = false;
	var limit = $("#openLimit" + slugGame)[0].value;
	var delay = $("#openDelay" + slugGame)[0].value * 1000;
	var autoHide = $("#autoHide" + slugGame)[0].checked;
	var reverse = $("#reverse" + slugGame)[0].checked;
	chrome.extension.sendRequest({
		action : 'openOptions',
		type : "n",
		limit : limit,
		delay : delay,
		autoHide : autoHide,
		reverse : reverse
	});
}

/**
 * Add a preset setting
 * @param slugGame
 */
function n_addPresetSettings(slugGame) {

	if ($("#n-name" + slugGame).val() == "") {
		openAlert("Error", "You have to give a name to your preset.");
	} else {
		// Verify if this name already exists
		var exists = false;
		for ( var i = 0; i < gsettings.games.length; i++) {
			if (gsettings.games[i].slugName == slugGame) {
				for ( var j = 0; j < gsettings.games[i].filters.length; j++) {
					if (gsettings.games[i].filters[j].name == $("#n-name" + slugGame).val() && gsettings.games[i].filters[j].type == "n") {
						exists = true;
					}
				}
			}
		}
		var filter = new Object();
		filter.name = $("#n-name" + slugGame).val();
		filter.type = "n";
		filter.filterIn = $("#n-filterIn" + slugGame).val();
		filter.filterOut = $("#n-filterOut" + slugGame).val();
		if (exists) {
			if (confirm("This preset already exists. Would you like to overwrite it ?")) {
				chrome.extension.sendRequest({
					action : 'addPresetSettings',
					type : "n",
					filter : filter,
					game : slugGame
				});
			}
		} else {
			chrome.extension.sendRequest({
				action : 'addPresetSettings',
				type : "n",
				filter : filter,
				game : slugGame
			});
		}
	}
}

/**
 * Delete a preset setting
 * @param slugGame
 */
function n_delPresetSettings(slugGame) {
	name = $("#n-name" + slugGame).val();
	type = "n";
	chrome.extension.sendRequest({
		action : 'delPresetSettings',
		game : slugGame,
		filter : name,
		type : type
	});
	$("#n-name" + slugGame).val("");
	$("#n-filterIn" + slugGame).val("");
	$("#n-filterOut" + slugGame).val("");
}

/**
 * Get a preset setting which has been selected
 * @param slugGame
 * @returns {Boolean}
 */
function n_select_preset(slugGame) {
	var selected = $("#n-preset" + slugGame).val();

	for ( var i = 0; i < gsettings.games.length; i++) {
		if (gsettings.games[i].slugName == slugGame) {
			for ( var j = 0; j < gsettings.games[i].filters.length; j++) {
				var filter = gsettings.games[i].filters[j];
				if (filter.name == selected) {
					$("#n-name" + slugGame).val(filter.name);
					$("#n-filterIn" + slugGame).val(filter.filterIn);
					$("#n-filterOut" + slugGame).val(filter.filterOut);
					chrome.extension.sendRequest({
						action : 'changeLastFilter',
						type : "n",
						game : slugGame,
						filter : filter.name
					});
					return false;
				}
			}
		}
	}
	$("#n-name" + slugGame).val("");
	$("#n-filterIn" + slugGame).val("");
	$("#n-filterOut" + slugGame).val("");
}

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