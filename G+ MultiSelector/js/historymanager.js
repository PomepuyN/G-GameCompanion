function saveHistory(history){
	
	// Is there an History limit ?
	var settings = new Settings();
	settings.get();
	var start = 0;
	if (settings.max_history_limit != 0){
		start = history.hes.length - settings.max_history_limit;
		if (start < 0) start = 0;
	}
	
	newHes= new Array();
	for ( var i = start; i < history.hes.length; i++) {
		newHes.push(history.hes[i]);
	}
	
	history.hes= newHes;
	
	
	localStorage["gnc"] = history.encode();
	historyCache = history;
	chrome.extension.sendRequest(
			{action:"updateNotifications"}
	);
}
var historyCache = null;
function getHistory(){
	if (historyCache != null) {
		return historyCache;
	}
	if(localStorage["gnc"] == undefined || localStorage["gnc"] == ""){
		return new History();
	}
	var hist = new History();
	hist.decode(localStorage["gnc"]);
	return hist;
}

function saveHistoryEntry(historyEntry, majViewB){
	if (historyEntry.isValid()) {
		var hist = getHistory();
		var found = false;
		for ( var i = 0; i < hist.hes.length; i++) {
			if(hist.hes[i].time == historyEntry.time){
				hist.hes[i] = historyEntry;
				found = true;
			}
		}
		if (!found){
			hist.hes.push(historyEntry);
		}
		saveHistory(hist);
		if (majViewB) {
			clearTimeout(currentTimeout);
			populateTimes();
			majView();
		}
	} else {
		createBug(stackTrace(true, true));
	}
}

//Delete all saved History entries
function clearSaved (){
	
	
	$("#confirmClearAll").dialog({
		modal: true,
		width:350,
		title:"Warning",
		buttons: {
			No: function() {
				$( this ).dialog( "close" );
			},
			Yes: function() {
				$( this ).dialog( "close" );
				localStorage["gnc"] = "";
				historyCache = null;
				clearTimeout(currentTimeout);
				populateTimes();
				majView();
			}
		}
	});
	
}

function getHistoryEntry(time){
	var hes = getHistory().hes;
	for ( var i = 0; i < hes.length; i++) {
		if (hes[i].time == time) {
			return hes[i];
		}
	}
	return false;
}

//Delete an history entry
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
 * Manages the history
 * @author Nicolas POMEPUY
 */

/**
 * Delete an History Entry and save
 * @param time
 */
function deleteHistoryEntry(time){
	var hist = getHistory();
	var hes = hist.hes;
	var newHes = new Array();
	for ( var i = 0; i < hes.length; i++) {
		if (hes[i].time != time) {
			newHes.push(hes[i]);
		}
	}
	hist.hes = newHes;
	saveHistory(hist);
	clearTimeout(currentTimeout);
	populateTimes();
	majView();
}

var currentTimeout;
/**
 * populate the DOM with history
 */
function populateTimes() {
	var hes = getHistory().hes;
	var html = "";
	for ( var i = 0; i < hes.length; i++) {
		//Check if the circle of the History entry exist (to avoid problems with circle delete and multi accounts) 
		if (getCircle(hes[i].circleSelection.circle)!= false){
			
			var dateHtml = "";
			var classNotif = "";
			var titleNotif = "Set by user.";
			if (hes[i].notificationTime != hes[i].time) {
				var date = new Date();
				date.setTime(parseInt(hes[i].notificationTime));
				dateHtml = date.toDateString()+" "+date.toLocaleTimeString();
				if (hes[i].autoNotif == true){
					classNotif = " blueText";
					titleNotif = "Automatic";
				}
			}
			
			html += '<div class="timers"><div class="timerName">' 
				+ hes[i].name
				+'</div><div class="timerTime">'
				+ makeTimeReadable(hes[i].getTimeElapsed())
				+'</div><div class="timerNotification'+classNotif+'" title="'+titleNotif+'">'
				+ dateHtml
				+ '</div>'+
				hes[i].circleSelection.getHtml(getCircle(hes[i].circleSelection.circle)) 
				+ '<span class="timerOptions" hid=\''+hes[i].time+'\'></span></div>'
				;
		} 
	}
	$("#savedTimes").html(html);
	$(".timerOptions").click(function (e){
		showTooltip(e,$(this).attr("hid"), getHistoryEntry($(this).attr("hid")));
	});
	$(".timerPBar").each(function(){
		$(this).progressbar({
			value: $(this).attr("pc")*100
		});
		
	});
	currentTimeout = setTimeout(populateTimes, 1000);
}

var currentTooltipHistory;

/**
 * Show the history tooltip
 * @param event
 * @param id
 * @param he
 */
function showTooltip(event, id,he){
	var name = he.name;
	if (he.name == null) name = "";
	var notifTime = he.notificationTime;
	if (isNaN(notifTime)) notifTime = he.time;
	if (notifTime == he.time){
		$("#hastonotify")[0].checked = false;
	} else {
		$("#hastonotify")[0].checked = true;
	}
	tp.setTime(parseInt(notifTime) - parseInt(he.time));
	tp.include($("#timepicker"));
	
		currentTooltipHistory=id;
		document.getElementById("nameIt").value = name;
	//$('#tooltip').offset({ top: event.pageY - 100, left: event.pageX-200 });
	$('#tooltip').dialog({
		width: 450,
		height:205,
		modal: true,
		resizable: false,
		title: name,
		buttons: {
			Delete: function() {
				deleteFromToolTip();
				$( this ).dialog( "close" );
			},
			OK: function() {
				saveFromToolTip();
				$( this ).dialog( "close" );
			}
		}
	});


}



/**
 * Hide the history tooltip
 */
function hideTooltip(){
	$('#tooltip').hide("slow");
	currentTooltipHistory = null;
}

/**
 * Create a new empty HE
 */
function newEmptyHistoryEntry(){
	var he = new HistoryEntry();
	var now = new Date();
	he.name = "";
	he.time = now.getTime();
	he.notificationTime = now.getTime();
	he.circleSelection = null;
	var settings = new Settings();
	settings.get();
	
	//Is there an automatic notification to put in ?
	if (settings.auto_history_notify) {
		he.autoNotif = true;
		he.notificationTime = parseInt(he.time)+parseInt(settings.notification_default_time)*1000;
	}
	
	saveHistoryEntry(he, true);
}

/**
 * Save an History Entry from the tooltip
 */
function saveFromToolTip(){
	var he = getHistoryEntry(currentTooltipHistory);
	he.name = document.getElementById("nameIt").value;
	if ($("#hastonotify")[0].checked){
		he.notificationTime = parseInt(tp.getTime())*1000 + parseInt(he.time);
	} else {
		he.notificationTime = he.time;
	}
	he.autoNotif = false;
	saveHistoryEntry(he, true);
	hideTooltip();
}

/**
 * Delete an History Entry from the tooltip
 */
function deleteFromToolTip(){
	deleteHistoryEntry(currentTooltipHistory);
	hideTooltip();
}

/**
 * Generate the HTML code for a partial selection
 * @param hes
 * @returns {String}
 */
function partialCheckHTML (hes){
	var html = "";
	for ( var i = 0; i < hes.length; i++) {
		var dateHtml = "";
		if (hes[i].notificationTime != hes[i].time && hes[i].circleSelection.partial) {
			var date = new Date();
			date.setTime(parseInt(hes[i].time));
			dateHtml = date.getFullYear()+"-"+twoDigitsNumber(date.getMonth())+"-"+twoDigitsNumber(date.getDay())+" "+date.toLocaleTimeString();
			if (hes[i].autoNotif == true){
				classNotif = " blueText";
				titleNotif = "Automatic";
			}
		}
		
		
		html += '<div class="timers">'
					+'<div class="timerName">' 
						+ hes[i].name
					+'</div>'
					+'<div class="timerTime">'
						+ dateHtml + 
					'</div>'+
					 hes[i].circleSelection.getHtml(getCircle(hes[i].circleSelection.circle))+
				'<div class="button" id="partialLaunchButton" onclick="continuePartialSelection(\''+hes[i].time+'\')">Continue</div></div>'
		;
	}
	return html;
}

/**
 * Has the History entry a partial selection initiated
 * @param code
 * @returns {Boolean}
 */
function hasPartial(code){
	var history = getHistory();
	for ( var i = 0; i < history.hes.length; i++) {
		if (history.hes[i].circleSelection.circle == code && history.hes[i].circleSelection.partial){
			return true;
		}
	}
	return false;
}

/**
 * Get the notifications' times
 * @returns {Array}
 */
function getAllNotificationTimes(){
	var hes = getHistory();
	hes = hes.hes;
	var notifications = new Array();
	for ( var i = 0; i < hes.length; i++) {
		if (hes[i].notificationTime != hes[i].time){
			notifications.push(hes[i]);
		}
	}
	return notifications;
}