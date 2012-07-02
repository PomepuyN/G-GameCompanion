/** 
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
 * Notifications injection
 */

function n_launchMoreAction(mode){
	dispatchMouseEvent($("." + dn_plusDivClass)[0], 'mouseover', true, true);
	dispatchMouseEvent($("." + dn_plusDivClass)[0], 'mousedown', true, true);
	dispatchMouseEvent($("." + dn_plusDivClass)[0], 'mouseup', true, true);
	dispatchMouseEvent($("." + dn_plusDivClass)[0], 'click', true, true);
	look4Loader("n", mode);
}

n_plusDivLeft = 0;

/**
 * Initialization of the notification page
 */
function n_init() {
	selectedId = null;
	if (whatPage() == "notifs") {
		// Is this a real initialization ?
		if ($("#gncCP").length == 0) {
			visibleGames = new Array();
			notifgames = new Array();
			$("." + dn_notificationContainer).unbind('DOMNodeInserted');
			$("." + dn_notificationContainer).bind('DOMNodeInserted', function(e) {
				n_bindCallback(e);
			});
			var html = '<div id="ggc_alert" class="hidden"></div>'+
			'<div id="gncCP">'+
			'<div id="dockcontainer"><div id="dock"></div></div>'+
			'<div class="arrow_div">'+
			'<div class="arrow-left arrows">∂</div>'+
			'<div class="arrow-right arrows">d</div>'+
			'</div>'+
			'<div id="n_game_toolbar" class="toolbar ui-widget-header ui-corner-all">'+
			'<button id="n_gtb_more">Load 20 more</button>'+
			'<button id="n_gtb_more_all">Load all</button>'+
			'<button class="right" id="n_gtb_stream">Game stream</button>'+
			'<button class="right" id="n_gtb_all_games">All games</button>'+
			'</div>'+
			'</div>';

			$("." + dn_insertAfterNode).before(html);
			$( "#n_gtb_more" ).button({
				text: true,
				icons: {
					primary: "ui-icon-arrowrefresh-1-w"
				}
			});
			$( "#n_gtb_more_all" ).button({
				text: true,
				icons: {
					primary: "ui-icon-refresh"
				}
			});
			$( "#n_gtb_all_games" ).button({
				text: true,
				icons: {
					primary: "ui-icon-circle-plus"
				}
			});

			$( "#n_gtb_stream" ).button({
				text: true,
				icons: {
					primary: "ui-icon-home"
				}
			});

			$( "#n_gtb_more" ).click(function(){
				n_launchMoreAction(0);
			});

			$( "#n_gtb_more_all" ).click(function(){
				n_launchMoreAction(1);
			});

			$( "#n_gtb_all_games" ).click(function(){
				window.location.href = "games/directory";
			});

			$( "#n_gtb_stream" ).click(function(){
				window.location.href = "games";
			});

			$(".arrow-left").click(function(){
				$("#dock").animate(
						{
							left: '+=204'
						},
						{
							step: function(now, fx) {
								if (now > 0){
									setTimeout(function() {
										$("#dock").css("left", "0px");
									}, 20);
									$("#dock").stop();
								}
							}
						});
			});
			$(".arrow-right").click(function(){
				var totalLength = $('div .gameTitle:visible',$("#dock")).length *102;
				if ($("#dock").position().left >  -(totalLength -760) ){
					$("#dock").animate(
							{
								left: '-=204'
							},
							{
								step: function(now, fx) {
									if (now <  -(totalLength -760)){
										$("#dock").stop();
										$("#dock").offset({left:$("#dock").offset().left-now});
									}
								}
							});
				}
			});

			getGplusToken(function() { 
				getGameModel(function(){
					n_generateGameBar();
					n_showVisibleGames();
					n_resetCounts();
				});
			});
		}
		n_generateGameBar();
		n_arrange();
		//$("." + dn_notificationTitleClass).addClass("notifTitle");

	}
}

function n_generateGameBar(){
	$('div[id^="nid-"]').remove();
	
	if (lastPlayedGames != null) {
		var computingGames = settings.games_settings;
		html='';
		for ( var i = 0; i < lastPlayedGames.length; i++) {
			for ( var j = 0; j < computingGames.length; j++) {
				if (lastPlayedGames[i] == computingGames[j].gId) {
					g = computingGames[j].name;
					html +=  '<div class="gameTitle hidden" id="nid-'+slugify(g)+'" oid="'+slugify(g)+'" title="'+g+'"><img style="width:70px; height:84px;" class="gameTitle" src="'+computingGames[j].image+'"/><p class="bold" id="#gncT-' + slugify(g) + '"></p></div>';
					computingGames.splice(j,1);
				}
			}

		}
		for ( var i = 0; i < computingGames.length; i++) {
			g = computingGames[i].name;
			html +=  '<div class="gameTitle hidden" id="nid-'+slugify(g)+'" oid="'+slugify(g)+'" title="'+g+'"><img style="width:70px; height:84px;" class="gameTitle" src="'+computingGames[i].image+'"/><p class="bold" id="#gncT-' + slugify(g) + '"></p></div>';
		}
		$("#dock").prepend(html);
		$('div[id^="nid-"]').tooltip({offset: [20 , 0], position: "bottom center", effect: 'fade', fadeInSpeed: 400, layout:'<div><div class="tooltip-arrow-border"></div><div class="tooltip-arrow"></div></div>'});

		$("div[id^='nid-']").hide();

		$("div[id^='nid-']").unbind("click");
		$("div[id^='nid-']").click(function() {
			selectANGame($(this).attr("oid")); 
		});

	}

}

var visibleGames = new Array();
function n_showVisibleGames(){
	for ( var i = 0; i < visibleGames.length; i++) {
		$('div[id="nid-'+visibleGames[i]+'"]').show();
	}
	if ($('.selectedGameTitle').length == 0) {
		selectANGame($('div[id^="nid-"]:visible:first').attr("oid"));
	}
}

function selectANGame(g){
	if (selectedId == g || g == null) {
		return false;
	}
	$("div[id^='gncT-']").hide();
	selectedId = g;

	$("div[id^='nid-']").removeClass("selectedGameTitle");
	$("div[id='nid-"+g+"']").addClass("selectedGameTitle");

	$("#gncT-"+selectedId).show();
	//$('img', $('div[id^="gsid-"]')).tooltip({position: "bottom center"});
}

/**
 * Sort the notification posts in their tabs
 */
function n_arrange() {
	var cont = $("." + dn_notificationContainer);
	$("div", cont).each(function() {
		if ($(this).hasClass(dn_notificationNodeClass)) {
			var game = "";
			game = $('span[class*="' + dn_notificationGameTextClass + '"]', $(this)).html();
			var hide = false;
//			$('span[class*="' + dn_notificationGameTextClass + '"]', $(this)).each(function() {
//			game = $(this).html();
//			if (game != undefined) {
//			hide = n_addGame(game);
//			} else {
//			setTimeout('n_arrange()', 200);
//			return false;
//			}
//			});

			if (game != undefined && game != "") {
				if (settings != undefined) {
					hide = computeGameSettings(game);
				}
				var alreadyDone = false;
				for ( var i = 0; i < visibleGames.length; i++) {
					if (visibleGames[i] == slugify(game) && $('div[id="cgncT-' + slugify(game) + '"]').length > 0){
						alreadyDone = true;
					} 
				}
				if (!alreadyDone) {
					n_addGame(game);
				}
			} else {
				setTimeout('n_arrange()', 200);
				return false;
			}

			if (selectedId == null) {
				selectANGame(game);
			}

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
	for ( var i = 0; i < notifgames.length; i++) {
		if (notifgames[i] == g) {
			return false;
		}
	}
	visibleGames.push(slugify(g));
	n_showVisibleGames();


	html = '<div class="aNDiv" id="gncT-'
		+ slugify(g)
		+ '" style="display:none;">'
		+ '<div class="gnctopbar">'
		+ '<h2>'+g+'</h2>'
		+ '<div class="toolbar ui-widget-header ui-corner-all">'
		+ '<div id="gnc_go_btn_'
		+ slugify(g)
		+ '">Launch</div>'
		+ '<div id="gnc_stop_btn_'
		+ slugify(g)
		+ '">Stop</div>'
		+ '<button class="right" id="gnc_show_hide_options_btn_'
		+ slugify(g)
		+ '" title="Stop">Hide options</button>'
		+ '<button class="right" id="gnc_game_settings_btn_'
		+ slugify(g)
		+ '" title="Stop">Game settings</button>'
		+ '<button class="right" id="gnc_gen_settings_btn_'
		+ slugify(g)
		+ '" title="Stop">Global settings</button>'
		+ '</div>'
		+ '<div class="hideOptions" id="hideOptions-'
		+ slugify(g)
		+ '" style="display:none;">'		
		+ '<div id="gnc_hide_all_btn_'
		+ slugify(g)
		+ '">All</div>'
		+ '<div id="gnc_hide_preset_btn_'
		+ slugify(g)
		+ '">Matching preset</div>'
		+ '<div id="gnc_hide_not_preset_btn_'
		+ slugify(g)
		+ '">Not matching preset</div>'
		+ '<div id="gnc_hide_auto_'
		+ slugify(g)
		+ '">This game</div>'
		+ '</div>'
		+ '<div class="moreoptions" id="gncmoreoptions-'
		+ slugify(g)
		+ '">'
		+

		'<div class="optionsDiv hidden" id="gncGlobalSettings-'
		+ slugify(g)
		+ '">'
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

		'<div class="optionsDiv hidden" id="gncGameSettings-'
		+ slugify(g)
		+ '">' + '<img id="n_info_img' + slugify(g) + '" class="infoImg" src="' + img_url + '"/>' + '<h3>Game settings</h3>' +

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

		'</div>'  + '</div>' + '<div class="gnchiddenbar hidden" id="gnchiddenbar-' + slugify(g) + '">'
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
	
	$("#gnc_show_hide_options_btn_" + slugify(g)).toggle(
			function () {
				$("div[id^='hideOptions-']").slideDown();
				$( "button[id^='gnc_show_hide_options_btn_']").button({
		      		text: true,
		      		icons: {
		      			primary: "ui-icon-circle-triangle-s"
		      		}
		      	});
	        },
	        function () {
	        	$("div[id^='hideOptions-']").slideUp();
	        	$( "button[id^='gnc_show_hide_options_btn_']").button({
		      		text: true,
		      		icons: {
		      			primary: "ui-icon-circle-triangle-n"
		      		}
		      	});
	        }
		);
	$("#gnc_game_settings_btn_" + slugify(g)).toggle(
			function () {
				$("#gncGameSettings-" + slugify(g)).slideDown();
				$( "#gnc_game_settings_btn_"+ slugify(g) ).button({
					text: true,
					icons: {
						primary: "ui-icon-circle-triangle-s"
					}
				});
			},
			function () {
				$("#gncGameSettings-" + slugify(g)).slideUp();
				$( "#gnc_game_settings_btn_"+ slugify(g) ).button({
					text: true,
					icons: {
						primary: "ui-icon-circle-triangle-n"
					}
				});
			}
	);
	$("#gnc_gen_settings_btn_" + slugify(g)).toggle(
			function () {
				$("#gncGlobalSettings-" + slugify(g)).slideDown();
				$( "#gnc_gen_settings_btn_"+ slugify(g) ).button({
					text: true,
					icons: {
						primary: "ui-icon-circle-triangle-s"
					}
				});
			},
			function () {
				$("#gncGlobalSettings-" + slugify(g)).slideUp();
				$( "#gnc_gen_settings_btn_"+ slugify(g) ).button({
					text: true,
					icons: {
						primary: "ui-icon-circle-triangle-n"
					}
				});
			}
	);

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
	$("#gnc_hide_not_preset_btn_" + slugify(g)).unbind("click");
	$("#gnc_hide_not_preset_btn_" + slugify(g)).click(function() {
		n_hideNotPreset(slugify(g));
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
	generateToobarN(g);
	return true;
}

function generateToobarN(g){
	$( "#gnc_go_btn_"+ slugify(g) ).button({
		text: true,
		icons: {
			primary: "ui-icon-play"
		}
	});
	$( "#gnc_stop_btn_"+ slugify(g) ).button({
		text: true,
		icons: {
			primary: "ui-icon-stop"
		},
		disabled: true
	});
	$( "#gnc_show_hide_options_btn_"+ slugify(g) ).button({
		text: true,
		icons: {
			primary: "ui-icon-circle-triangle-n"
		}
	});
	$( "#gnc_gen_settings_btn_"+ slugify(g) ).button({
		text: true,
		icons: {
			primary: "ui-icon-circle-triangle-n"
		}
	});
	$( "#gnc_game_settings_btn_"+ slugify(g) ).button({
		text: true,
		icons: {
			primary: "ui-icon-circle-triangle-n"
		}
	});
	$( "#gnc_hide_auto_"+ slugify(g) ).button({
		text: true
	});
	$( "#gnc_hide_all_btn_"+ slugify(g) ).button({
		text: true
	});
	$( "#gnc_hide_preset_btn_"+ slugify(g) ).button({
		text: true
	});
	$( "#gnc_hide_not_preset_btn_"+ slugify(g) ).button({
		text: true
	});
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
		return;
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
 * Hide the posts non matching preset
 * @param g
 */
function n_hideNotPreset(g) {
	var gameContainer = $("#cgncT-" + g);
	var posts = $("." + dn_notificationNodeClass, gameContainer);
	
	var toHide = new Array();
	
	posts.each(function() {
		var skip = true;
		// Is it filtered ?
		var notifText = $("div[class*='" + dn_textNotificationContainer + "']", $(this)).text();
		if (!computeFilterContaining($("#n-filterIn" + g).val(), notifText) && !computeFilterNotContaining($("#n-filterOut" + g).val(), notifText)) {
			skip = false;
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
	$("#gnc_stop_btn_" + slugGame).button({disabled: false});
	$("#gnc_go_btn_" + slugGame).button({disabled: true});
	$("#gnc_stop_btn_" + slugGame).click(function() {
		notifToProcess = new Array();
		$("#gnc_stop_btn_" + slugGame).button({disabled: true});
		$("#gnc_go_btn_" + slugGame).button({disabled: false});
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
			$(this).css("border", "3px solid #c2d9fe");
		} else {
			$(this).css("border", "none");
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
			$("#gnc_stop_btn_" + slugify(notifToPick.game)).button({disabled: true});
			$("#gnc_go_btn_" + slugify(notifToPick.game)).button({disabled: false});
		}
	} else {
		$("button[id^='gnc_stop_btn_']").button({disabled: true});
		$("button[id^='gnc_go_btn_']").button({disabled: false});
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
	var totalReset = 0;
	$("p[id*=gncT]").each(function() {

		var target = $(this).attr("id").substring(1);

		var nb = $('div[class*="notifEntry"]:not(.done)',$("#c" + target)).length;

		$(this).html(' (' + nb + ')');
		totalReset += nb;
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