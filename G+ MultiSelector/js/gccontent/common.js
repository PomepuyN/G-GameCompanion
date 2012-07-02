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
* Common functions for the Game strean and the notifications	
*/


var waiting4Circle = false;
var contactsInDiv = new Array();
function openAddPeopleToCircle() {
	waiting4Circle = true;
	getGplusToken(function() { 
		importCircle(myId);
	});

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
function look4Loader(type, mode) {

	if (type == "n") {

		if ($("." + d_plusloaderClass).is(":visible")) {
			loaderTimer = setTimeout(function() {
				look4Loader(type, mode);
			}, 50);
		} else {
			n_arrange();
			clearTimeout(loaderTimer);
			if (mode == 1 && $("." + dn_plusDivClass).is(":visible")) {
				n_launchMoreAction(mode);
			}
			if (!$("." + dn_plusDivClass).is(":visible")) {
				$('#n_gtb_more_all').button({disabled:true});
				$('#n_gtb_more').button({disabled:true});
			}
		}
	} else {
		if ($("." + d_plusloaderClass).is(":visible")) {
			loaderTimer = setTimeout(function() {
				look4Loader(type, mode);
			}, 50);
		} else {
			gs_arrange();
			clearTimeout(loaderTimer);
			if (mode == 1 && $("." + dn_plusDivClass).is(":visible")) {
				gs_launchMoreAction(mode);
			}
			if (!$("." + dn_plusDivClass).is(":visible")) {
				$('#gs_gtb_more_all').button({disabled:true});
				$('#gs_gtb_more').button({disabled:true});
			}
		}
	}
}

/**
 * Are we on a game stream page or a notification one ?
 * @returns {String}
 */
function whatPage() {
	var reg = new RegExp("/*\/games", "g");
	var regNotif = new RegExp("/*\/games/notifications/{0}", "g");
	if (window.location.href.match(regNotif)) {
		return "notifs";
	} else if (window.location.href.match(reg)) {
		return "stream";
	}
	
	return "";
}

