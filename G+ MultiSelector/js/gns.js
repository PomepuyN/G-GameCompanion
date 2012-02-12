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
 * This script is injected in the page to perform the popup actions (ie : all the actions dealing with the selection in the contact picker)
 * @author Nicolas POMEPUY
 */


/**
 * These variables represent the node used in Google Plus pages.
 * When Google make changes into its code, this part has to be modified.
 */
/**
 * TODO : make a map to make changes more convenient.
 */
var classUnselected = "nk";
var classSelected = "Sf-I";
var classScrollDiv = "eoTope";
var classHideNotification = "Yt";
var blockedCircleId = 15;

var domCircleUser = ".vi";
var domCircleName = ".ic-X";


var circles = new Array();
var members = new Array();
var circleUrl = new Array();
circleUrl.push("https://plus.google.com/u/");
circleUrl.push("/_/socialgraph/lookup/circles/?m=true");

var multiAccountUrl = new Array();
multiAccountUrl.push("https://plus.google.com/u/");
multiAccountUrl.push("/_/initialdata?key=11");
var multiAccountData =  new Array();
var multiAccountIndex = 0;
var multiAccountUsers = new Array();

//Classes used to select in the circle page
var myCirclesContainer = "oz-sg-elements";
var myCirclesContact = "AkM0qf";
var myCirclesSelectedContact = "Sf-I";


var gplustoken = null;


/**
 * Look if the user is using multi-accounts
 */
function look4MultiAccounts(){
	var url = multiAccountUrl[0]+multiAccountIndex+multiAccountUrl[1];
	$.ajax({
		url: url,
		beforeSend: function( xhr ) {
			xhr.overrideMimeType( 'text/plain;' );
		},
		context: document.body,
		error: function(jqXHR, textStatus, errorThrown){
			sendDataError2Ext(textStatus, jqXHR.responseText);
		},
		timeout: 5000,
		success: function(data){
			var found = false;
			// Loop through saved data
			for ( var i = 0; i < multiAccountData.length; i++) {
				if (multiAccountData[i] == data){
					found = true;
				}
			}
			if (multiAccountIndex < 5 && !found){
				look4MultiAccounts();
				multiAccountData.push(normalizeGJsonMA(data.substring(5)));
			} else {
				
				//Extract user infos
				for ( var i = 0; i < multiAccountData.length; i++) {
					
					var userInfo= new Object();
					
					var subObj = multiAccountData[i][0][1].firstObj;
									
					for ( var j = 0; j < subObj.length; j++) {
						if (subObj[j] != undefined) {
						var aclEntries = subObj[j].aclEntries;
							if (aclEntries != undefined) {
								for ( var k = 0; k < aclEntries.length; k++) {
									if (aclEntries[k].scope.scopeType == "user"){
										userInfo.user = aclEntries[k].scope.name;
										userInfo.userId = aclEntries[k].scope.id;
										userInfo.index = i;
										var idFound = false;
										for ( var l = 0; l < multiAccountUsers.length; l++) {
											if (multiAccountUsers[l].userId == userInfo.userId){
												idFound = true;
											}
										}
										if (!idFound) {
											multiAccountUsers.push(userInfo);
										}
									}
								}
							}
						}
					}
				}
				
				if (multiAccountUsers.length > 1){
					sendMA2Ext(multiAccountUsers);
				}
			}
		}
	});
	multiAccountIndex++;
}


var messageToSend = "";
function addContactsToCircle(contactsToAdd, circleId, circlename) {
	var contactsAddedString = "[[";
	for ( var i = 0; i < contactsToAdd.length; i++) {
		if (i > 0) {
			contactsAddedString+=",";
		}
		contactsAddedString+='[[null,null,"'+contactsToAdd[i]+'"],"",[]]';
	}
	contactsAddedString+=']]';
	$.post(
			'https://plus.google.com/_/socialgraph/mutate/modifymemberships/', 
			'a=[[["' + circleId + '"]]]&m='+contactsAddedString+'&at=' + gplustoken + '&r=[[]]', function () {openAlert("Contacts added", messageToSend);},'text');
	messageToSend = contactsToAdd.length+" contacts have been added to the "+circlename+" circle.";
	
}

//Get the circles from G+
function importCircle(userId){
	
	/**
	 * gplustoken is a string used to identify the user for further requests
	 */
	$.ajax({
		type: 'GET',
		url: 'https://plus.google.com/me',
		dataType: 'html',
		success: function(data) {
			this_pattern = /csi","[a-zA-Z0-9_\-]+:\d{13,}"/gm;
			gplustoken = this_pattern.exec(data);					
			if (gplustoken)	{
				gplustoken = gplustoken[0];
				gplustoken = gplustoken.replace(/csi","/g,'');
				gplustoken = gplustoken.replace(/"/g,'');
			}
		}
	});
	
	
	
	var url = circleUrl[0]+userId+circleUrl[1];

	//Load only if not already done
	//if (circles.length == 0 && members.length == 0){
		//AJAX request
		$.ajax({
			url: url,
			beforeSend: function( xhr ) {
				xhr.overrideMimeType( 'text/plain;' );
			},
			context: document.body,
			error: function(jqXHR, textStatus, errorThrown){
				sendDataError2Ext(textStatus, jqXHR.responseText);
			},
			timeout: 5000,
			success: function(data){
				
				//Circles ans members vars population
				circles = new Array();
				members = new Array();
				//AJAX response normalization
				var normalizedData = normalizeGJson(data.substring(5));
				var circlesData = normalizedData[0][1];
				var membersData = normalizedData[0][2];

				/**
				 * Data decoding
				 */
				//Circles
				for (var i=0; i < circlesData.length;i++){
					var circle = new Circle();
					circle.code = circlesData[i][0][0];
					circle.name = circlesData[i][1][0];
					circle.members = new Array();

					//Escaping blocked circle 
					if (circle.code != blockedCircleId){
						circles.push(circle);
					}
				}

				//Members
				for (var i=0; i < membersData.length;i++){
					var member = new Contact();
					member.code = membersData[i][0][2];
					member.img = membersData[i][2][8];

					if (member.img != null){
						if (member.img.indexOf("http")<0){
							member.img = "https:"+member.img;
						}
					}

					member.name = membersData[i][2][0];

					var mCircles = new Array();
					for (var j=0; j < membersData[i][3].length;j++){
						mCircles.push(membersData[i][3][j][2]);
						for (var k=0; k < circles.length;k++){
							if (circles[k].code == membersData[i][3][j][2]){
								circles[k].members.push(member);
							}
						}
					}
					member.circles = mCircles;


					members.push(member);
				}

				//Send data to popup
				sendData2Ext(JSON.stringify(circles), JSON.stringify(members));

				if (waiting4Circle != undefined && waiting4Circle == true){
					populateCirclesToAddPeople();
				}

			}
		});
//	} else {
//		//Send data to popup
//		sendData2Ext(circles, members);
//	}

}


/**
 * Send the retrieved data to the extension.
 * @param circles
 * @param members
 */
function sendData2Ext(circles, members){
	chrome.extension.sendRequest(
			{action:"sendData",circles: circles, members:members}
	);
}

/**
 * Send a message to the extension when a selection has been performed
 * @param members
 * @param time
 * @param partial
 * @param circleCode
 */
function sendPerformed(members, time, partial,circleCode){
	chrome.extension.sendRequest(
			{action:"performed",time: time, members:members, partial:partial, circleCode:circleCode}
	);
}

/**
 * Send a message to the extension when a selection has not been performed (contact picker not opened)
 * @param members
 * @param time
 * @param partial
 * @param circleCode
 */
function sendNotPerformed(){
	chrome.extension.sendRequest(
			{action:"notperformed"}
	);
}

/**
 * Sends multiaccount information
 * @param users
 */
function sendMA2Ext(users){
	chrome.extension.sendRequest(
			{action:"multiAccount",users: users}
	);
}

/**
 * Send data error on Ajax error
 * @param statusText
 * @param AjError
 */
function sendDataError2Ext(statusText,AjError){
	chrome.extension.sendRequest(
			{action:"sendDataError",text:statusText,error:AjError}
	);
}


/**
 * Remove added characters from a Google Json and return an object
 * @param json
 * @returns an object
 */
function normalizeGJson(json){
	while(json != json.replace(/\s\[/g, "[")){
		json = json.replace(/\s\[/g, "[");
	}
	while(json != json.replace(/\s\]/g, "]")){
		json = json.replace(/\s\]/g, "]");
	}
	while(json != json.replace(/\s\"/g, '"')){
		json = json.replace(/\s\"/g, '"');
	}
	while(json != json.replace(/\s,/g, ",")){
		json = json.replace(/\s,/g, ',');
	}
	while(json != json.replace(/\s$/g, "")){
		json = json.replace(/\s$/g, '');
	}
	return  eval(json);
}

/**
 * Remove added characters from a Multi account Google Json and return an object
 * @param json
 * @returns an object
 */
function normalizeGJsonMA(json){
	while(json != json.replace(/\s\[/g, "[")){
		json = json.replace(/\s\[/g, "[");
	}
	while(json != json.replace(/\s\]/g, "]")){
		json = json.replace(/\s\]/g, "]");
	}
	while(json != json.replace(/\s\"/g, '"')){
		json = json.replace(/\s\"/g, '"');
	}
	while(json != json.replace(/\s,/g, ",")){
		json = json.replace(/\s,/g, ',');
	}
	while(json != json.replace(/\s$/g, "")){
		json = json.replace(/\s$/g, '');
	}
	while(json != json.replace(/\\n/g, "")){
		json = json.replace(/\\n/g, '');
	}
	while(json != json.replace(/\\"/g, '"')){
		json = json.replace(/\\"/g, '"');
	}
	while(json != json.replace(/"{/g, '{')){
		json = json.replace(/"{/g, '{');
	}
	while(json != json.replace(/}"/g, '}')){
		json = json.replace(/}"/g, '}');
	}
	while(json != json.replace(/"11"/g, '"firstObj"')){
		json = json.replace(/"11"/g, '"firstObj"');
	}
	return  eval("{"+json+"}");
}

//Simulate mouse event on a DOM element
var dispatchMouseEvent = function(target, var_args) {
	var e = document.createEvent("MouseEvents");
	e.initEvent.apply(e, Array.prototype.slice.call(arguments, 1));
	target.dispatchEvent(e);
};

// Parent iFrame of the Contact Picker
var CPIframe = null;
// Div to scroll
var scrollDiv=null;
var scrollDivHeight=0;
var currentScroll=0;
var selectedMembers;

/**
 * Add the scroll listener and launch the selection + save the history
 * @param members
 * @param time
 * @param partial
 * @param circleCode
 */
function launchSelection(members, time, partial,circleCode) {
	CPIframe = null;
	selectedMembers = JSON.parse(members);
	$('iframe').each(function(index) {
		var url = $(this).attr("src");
		if (url != null) {

			if (url.indexOf("contactPicker")>-1){
				//Is it shown ?
				if ($(this).width() > 0){
					
					CPIframe = $(this);
					CPIframe.contents().find("."+classScrollDiv).each(function(index) {
						scrollDivHeight = $(this).height();
						scrollDiv = $(this)[0];
						$(this).scroll(function() {
							pickVisibleContacts();
						});
					});
				}

			}
		}
	});

	if (CPIframe != null && CPIframe != undefined){
		scrollDiv.scrollTop = 0;
		pickVisibleContacts();
		scrollTheDiv(scrollDiv);
		CPIframe.attr("gnc","true");
		sendPerformed(members, time, partial, circleCode);
	} else if($("."+myCirclesContainer).length > 0) {
		cont = $("."+myCirclesContainer)[0];
		scrollDiv = $(cont).parent()[0];
		
		scrollDiv.scrollTop = 100;
		
		pickVisibleContactsInMyCircles(cont);
		$(scrollDiv).scroll(function() {
			pickVisibleContactsInMyCircles(cont);
		});
		
		scrollTheDiv(scrollDiv);
		sendPerformed(members, time, partial, circleCode);
		
		
	} else {
		sendNotPerformed();
	}
}

// Selects all the contacts !
function pickVisibleContacts(){

	CPIframe.contents().find("."+classUnselected).each(function(index) {
		for (var i=0; i < selectedMembers.length;i++){
			if (parseInt($(this).attr("oid")) == parseInt(selectedMembers[i])){
				dispatchMouseEvent($(this)[0], 'mousedown', true, true);
				dispatchMouseEvent($(this)[0], 'mouseup', true, true);
			}

		}
	});
}
// Selects all the contacts in my circles !
function pickVisibleContactsInMyCircles(cont){
	$(cont).contents().find("."+myCirclesContact).each(function(index) {
		if (!$(this).hasClass(myCirclesSelectedContact)){
			for (var i=0; i < selectedMembers.length;i++){
				if (parseInt($(this).attr("oid")) == parseInt(selectedMembers[i])){
					dispatchMouseEvent($(this)[0], 'mousedown', true, true);
					dispatchMouseEvent($(this)[0], 'mouseup', true, true);
				}
			}
		}
	});
}

var scrollTimer;
var lastScroll;
/**
 * Routine to scroll over the div
 * @param element to scroll
 */
function scrollTheDiv(el){ 
	el.scrollTop += 200;
	//console.log(el.scrollTop);
	if (el.scrollTop != lastScroll){
		scrollTimer = setTimeout('scrollTheDiv(scrollDiv)', 50);
	} else {
		clearTimeout(scrollTimer);
	}
	lastScroll = el.scrollTop;
}
/**
 * Retrieve the iFrame
 * @returns
 */
function getIFrame(){
	var elements = document.getElementsByTagName("iframe");
	for ( var i = 0; i < elements.length; i++) {
		if (elements[i].getAttribute("gnc") == "true"){
			return elements[i];
		}
	}
}
