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
* Stream injection
*/

function gs_launchMoreAction(mode){
	dispatchMouseEvent($("." + dn_plusDivClass)[0], 'mouseover', true, true);
	dispatchMouseEvent($("." + dn_plusDivClass)[0], 'mousedown', true, true);
	dispatchMouseEvent($("." + dn_plusDivClass)[0], 'mouseup', true, true);
	dispatchMouseEvent($("." + dn_plusDivClass)[0], 'click', true, true);
	look4Loader("g", mode);
}



/**
 * Initialization of the dom modification
 */
function gs_init() {
	selectedId = null;
	$("#gncCP").remove();
	
	if (whatPage() == "stream") {
		visibleGames = new Array();
		// Is this a real initialization ?
		if ($("#gncGSCP").length == 0) {
			gs_games = new Array();
			$("." + d_streamPostContainer).bind('DOMNodeInserted', function(e) {
				gs_bindCallback(e);
			});
			var html = '<div id="ggc_alert" class="hidden"></div>'+
				'<div id="gncGSCP" class="dockcontainerGS">'+
					'<div id="dockcontainer"><div id="dock"></div></div>'+
					'<div class="arrow_div">'+
						'<div class="arrow-left arrows">∂</div>'+
						'<div class="arrow-right arrows">d</div>'+
					'</div>'+
					'<div id="gs_gs_game_toolbar" class="toolbar ui-widget-header ui-corner-all">'+
						'<button id="gs_gtb_more">Load 20 more</button>'+
 						'<button id="gs_gtb_more_all">Load all</button>'+
 						'<button class="right" id="gs_gtb_my_games">My games</button>'+
						'<button class="right" id="gs_gtb_notifications">Notifications</button>'+
						'<button class="right" id="gs_gtb_all_games">All games</button>'+
					'</div>'+
					'<div id="yourGames" style="display:none;"></div>' +
				'</div>';

			
			$("." + d_mainCarousel).before(html);
			$("."+d_mainCarousel).remove();
			$("#ggc_alert").before($("."+d_yourGames));
			
			$("#yourGames").append($("."+d_yourGames));
			$("."+d_yourGames).css("margin", "auto").css("padding-left", "10px").css("padding-top", "20px").css("margin-top", "20px").css("background", "#f1f1f1").css("border-radius", "3px").css("border", "1px solid #e1e1e1");
			
			
			$("."+d_rightInformation).css("margin-right", "20px");
			$("."+d_rightInformation).css("float", "right");
			$( "#gs_gtb_more" ).button({
				text: true,
				icons: {
					primary: "ui-icon-arrowrefresh-1-w"
				}
			});
			$( "#gs_gtb_more_all" ).button({
				text: true,
				icons: {
					primary: "ui-icon-refresh"
				}
			});
			$( "#gs_gtb_all_games" ).button({
				text: true,
				icons: {
					primary: "ui-icon-circle-plus"
				}
			});

			$( "#gs_gtb_notifications" ).button({
				text: true,
				icons: {
					primary: "ui-icon-mail-closed"
				}
			});
			
			$( "#gs_gtb_my_games" ).button({
				text: true,
				icons: {
					primary: "ui-icon-person"
				}
			});
			
			$( "#gs_gtb_more" ).click(function(){
				gs_launchMoreAction(0);
			});
			
			$( "#gs_gtb_more_all" ).click(function(){
				gs_launchMoreAction(1);
			});

			$( "#gs_gtb_all_games" ).click(function(){
				window.location.href = "games/directory";
			});

			$( "#gs_gtb_notifications" ).click(function(){
				window.location.href = "games/notifications";
			});

				$("#gs_gtb_my_games").toggle(
					function () {
			          $("#yourGames").slideDown();
			        },
			        function () {
			          $("#yourGames").slideUp();
			        }
				);
			
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
				if ($("#dock").position().left >  -(totalLength -570) ){
					$("#dock").animate(
						{
							left: '-=204'
						},
						{
							step: function(now, fx) {
								if (now <  -(totalLength -570)){
									$("#dock").stop();
									$("#dock").offset({left:$("#dock").offset().left-now});
								}
							}
						});
				}
			});
			
			
				getGplusToken(function() { 
					getGameModel(function(){
						gs_generateGameBar();
						gs_showVisibleGames();
						resetGSCounts();
					});
				});
			
			
		} else {
			gs_showVisibleGames();
			
		}
		gs_generateGameBar();
		gs_arrange();
		resetGSCounts();
		$("." + d_streamPostTitleClass).addClass("notifTitle");
	}
}

var totalArr = 0;
var hideListenerInterval;
function gs_arrange() {
	$("." + d_gameChooserClass).hide();
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
				if (settings != undefined) {
					hide = computeGameSettings(game);
				}
				var alreadyDone = false;
				for ( var i = 0; i < visibleGames.length; i++) {
					if (visibleGames[i] == slugify(game) && $('div[id="cgncGST-' + slugify(game) + '"]').length > 0){
						alreadyDone = true;
					} 
				}
				if (!alreadyDone) {
					gs_addGame(game);
				}
			} else {
				setTimeout('gs_arrange()', 200);
				return false;
			}
			
			if (selectedId == null) {
				selectAGSGame(game);
			}
			
			$(this).addClass("gsEntry");
			totalArr++;
			$(this).removeClass("xi");
			
			if ($('.'+d_streamPostMutedClass, $(this)).length > 0){
				$('#gncGSmorehidden-' + slugify(game)).append($(this));
				$('#gncGShiddenbar-' + slugify(game)).slideDown("slow");
				return;
			}
			
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

function gs_generateGameBar(){
	$('div[id^="gsid-"]').remove();
	if (lastPlayedGames != null) {
		
		var computingGames = settings.games_settings;
		html='';
		for ( var i = 0; i < lastPlayedGames.length; i++) {
			for ( var j = 0; j < computingGames.length; j++) {
				if (lastPlayedGames[i] == computingGames[j].gId) {
					g = computingGames[j].name;
					html +=  '<div class="gameTitle hidden" id="gsid-'+slugify(g)+'" oid="'+slugify(g)+'" title="'+g+'"><img style="width:70px; height:84px;" class="gameTitle" src="'+computingGames[j].image+'"/><p class="bold" id="#gncGST-' + slugify(g) + '"></p></div>';
					computingGames.splice(j,1);
				}
			}
			
		}
		for ( var i = 0; i < computingGames.length; i++) {
			g = computingGames[i].name;
			html +=  '<div class="gameTitle hidden" id="gsid-'+slugify(g)+'" oid="'+slugify(g)+'" title="'+g+'"><img style="width:70px; height:84px;" class="gameTitle" src="'+computingGames[i].image+'"/><p class="bold" id="#gncGST-' + slugify(g) + '"></p></div>';
		}
		$("#dock").prepend(html);
		$('div[id^="gsid-"]').tooltip({offset: [20 , 0], position: "bottom center", effect: 'fade', fadeInSpeed: 400, layout:'<div><div class="tooltip-arrow-border"></div><div class="tooltip-arrow"></div></div>'});
		
		$("div[id^='gsid-']").hide();
		
		$("div[id^='gsid-']").unbind("click");
		$("div[id^='gsid-']").click(function() {
			selectAGSGame($(this).attr("oid")); 
		});
	}

}

var visibleGames = new Array();
function gs_showVisibleGames(){
	for ( var i = 0; i < visibleGames.length; i++) {
		$('div[id="gsid-'+visibleGames[i]+'"]').show();
	}
	if ($('selectedGameTitle').length == 0) {
		selectAGSGame($('div[id^="gsid-"]:visible:first').attr("oid"));
	}
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
	for ( var i = 0; i < gs_games.length; i++) {
		if (gs_games[i] == g) {
			return false;
		}
	}

	visibleGames.push(slugify(g));
	//gs_showVisibleGames();
	
	html = '<div class="aNDiv" id="gncGST-'
			+ slugify(g)
			+ '" style="display:none;">'
			+ '<div class="gncGStopbar">'
			+ '<h2>'+g+'</h2>'
			+ '<div class="toolbar ui-widget-header ui-corner-all">'
			+ '<button id="gncGS_go_btn_'
			+ slugify(g)
			+ '" title="Start">Start</button>'
			+ '<button id="gncGS_stop_btn_'
			+ slugify(g)
			+ '" title="Stop">Stop</button>'
			+ '<button class="right" id="gncGS_show_hide_options_btn_'
			+ slugify(g)
			+ '" title="Stop">Hide options</button>'
			+ '<button class="right" id="gncGS_game_settings_btn_'
			+ slugify(g)
			+ '" title="Stop">Game settings</button>'
			+ '<button class="right" id="gncGS_gen_settings_btn_'
			+ slugify(g)
			+ '" title="Stop">Global settings</button>'
			+ '</div>'
			+ '<div class="hideOptions" id="hideOptions-'
			+ slugify(g)
			+ '" style="display:none;">'
			+ '<button id="gncGS_hide_all_btn_'
			+ slugify(g)
			+ '">All</button>'
			+ '<button id="gncGS_hide_preset_btn_'
			+ slugify(g)
			+ '">Matching preset</button>'
			+ '<button id="gncGS_hide_not_preset_btn_'
			+ slugify(g)
			+ '">Non matching preset</button>'
			+ '<button id="gncGS_hide_auto_'
			+ slugify(g)
			+ '">This game</button>'
			+ '</div>'
			+ '<div class="moreoptions" id="gncGSmoreoptions-'
			+ slugify(g)
			+ '">'

			+'<div class="optionsDiv hidden" id="gncGSGlobalSettings-'
			+ slugify(g)
			+ '">'
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
			+ '<tr><td align="right"><button id="gncGS_save' + slugify(g) + '">Make default</button></td><td></td></tr>' +

			'</table>' + '</div>' + '<div class="optionsDiv hidden" id="gncGSGameSettings-'
			+ slugify(g)
			+ '">' + '<img id="gs_info_img' + slugify(g) + '" class="infoImg" src="' + img_url + '"/>' + '<h3>Game settings</h3>' +

			'<table align="center">' +

			'<tr><td align="right"><label for="gs-preset' + slugify(g) + '">Presets </label></td><td align="left"><select style="max-width:172px;width:172px;" id="gs-preset' + slugify(g)
			+ '"><option value="" selected="selected">New</option></select></td></tr>' + '<tr><td align="right"><label for="gs-name' + slugify(g)
			+ '">Preset name </label></td><td align="left"><input id="gs-name' + slugify(g) + '" type="text" value=""/></td></tr>' + '<tr><td align="right"><label for="gs-filterIn' + slugify(g)
			+ '">Open only posts containing </label></td><td align="left"><input id="gs-filterIn' + slugify(g) + '" type="text" value=""/></td></tr>'
			+ '<tr><td align="right"><label for="gs-filterOut' + slugify(g) + '">Open posts not containing </label></td><td align="left"><input id="gs-filterOut' + slugify(g)
			+ '" type="text" value=""/></td></tr>' + '<tr><td align="right"><label for="plusOne' + slugify(g) + '">Automatically +1 the posts </label></td><td align="left"><input id="plusOne'
			+ slugify(g) + '" type="checkbox"/></td></tr>' + '<tr style="display:none" class="gs_gpmefold"><td align="right"><label for="fold' + slugify(g)
			+ '">G+Me fold the posts instead of hidding </label></td><td align="left"><input id="fold' + slugify(g) + '" type="checkbox" checked/></td></tr>'
			+ '<tr><td align="center" colspan="2"><button id="gncGS_preview_' + slugify(g) + '">Preview</button><button id="gncGS_add_preset' + slugify(g)
			+ '">Add</button><button id="gncGS_del_preset' + slugify(g) + '">Delete</button></td></tr>' +

			'</table>' +

			'</div>' +

			'</div></div>' + '<div class="gncGShiddenbar hidden" id="gncGShiddenbar-' + slugify(g) + '">'
			+ '<div class="title">Hidden posts</div>' + '<div class="hidden moreoptions" id="gncGSmorehidden-' + slugify(g) + '">' + '</div>' + '<div class="spacer" id="toggleGSmorehidden-'
			+ slugify(g) + '">Ï</div>' + '</div>' + '<div id="cgncGST-' + slugify(g) + '" class="topList"></div>' + '</div>';
	$("."+d_streamPostTitleClass).after(html);
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
		if (confirm("You are about to hide all notifications / posts for this game in the future. You can undo this action in the options")) {
			computeGameHide(g);
			$('#gsid-'+slugify(g)).hide();
			$('#gncGST-'+ slugify(g)).hide();
			selectAGSGame($('div[id^="gsid-"]:visible:first').attr("oid"));
		}
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
	
	$("#gncGS_show_hide_options_btn_" + slugify(g)).toggle(
			function () {
	          $("div[id^='hideOptions-']").slideDown();
	          $( "button[id^='gncGS_show_hide_options_btn_']").button({
		      		text: true,
		      		icons: {
		      			primary: "ui-icon-circle-triangle-s"
		      		}
		      	});
	        },
	        function () {
	        	$("div[id^='hideOptions-']").slideUp();
	        	$( "button[id^='gncGS_show_hide_options_btn_']").button({
		      		text: true,
		      		icons: {
		      			primary: "ui-icon-circle-triangle-n"
		      		}
		      	});
	        }
		);
	$("#gncGS_game_settings_btn_" + slugify(g)).toggle(
			function () {
				$("#gncGSGameSettings-" + slugify(g)).slideDown();
				$( "#gncGS_game_settings_btn_"+ slugify(g) ).button({
					text: true,
					icons: {
						primary: "ui-icon-circle-triangle-s"
					}
				});
			},
			function () {
				$("#gncGSGameSettings-" + slugify(g)).slideUp();
				$( "#gncGS_game_settings_btn_"+ slugify(g) ).button({
					text: true,
					icons: {
						primary: "ui-icon-circle-triangle-n"
					}
				});
			}
	);
	$("#gncGS_gen_settings_btn_" + slugify(g)).toggle(
			function () {
				$("#gncGSGlobalSettings-" + slugify(g)).slideDown();
				$( "#gncGS_gen_settings_btn_"+ slugify(g) ).button({
					text: true,
					icons: {
						primary: "ui-icon-circle-triangle-s"
					}
				});
			},
			function () {
				$("#gncGSGlobalSettings-" + slugify(g)).slideUp();
				$( "#gncGS_gen_settings_btn_"+ slugify(g) ).button({
					text: true,
					icons: {
						primary: "ui-icon-circle-triangle-n"
					}
				});
			}
	);
	
	
//	$("#toggleGSmoreoptions-" + slugify(g)).unbind("click");
//	$("#toggleGSmoreoptions-" + slugify(g)).click(function() {
//		toggleGSMoreOptions(slugify(g));
//	});
	$("#toggleGSmorehidden-" + slugify(g)).unbind("click");
	$("#toggleGSmorehidden-" + slugify(g)).click(function() {
		toggleGSMoreHidden(slugify(g));
	});
	
	$( "#gncGS_hide_all_btn_"+ slugify(g) ).button({
		text: true
	});

	$( "#gncGS_hide_all_btn_"+ slugify(g) ).button({
		text: true
	});
	$("#gncGS_hide_all_btn_" + slugify(g)).unbind("click");
	$("#gncGS_hide_all_btn_" + slugify(g)).click(function() {
		gs_hideAll(slugify(g));
	});
	
	
	$( "#gncGS_hide_preset_btn_"+ slugify(g) ).button({
		text: true
	});
	$("#gncGS_hide_preset_btn_" + slugify(g)).unbind("click");
	$("#gncGS_hide_preset_btn_" + slugify(g)).click(function() {
		gs_hidePreset(slugify(g));
	});

	$( "#gncGS_hide_not_preset_btn_"+ slugify(g) ).button({
		text: true
	});
	$("#gncGS_hide_not_preset_btn_" + slugify(g)).unbind("click");
	$("#gncGS_hide_not_preset_btn_" + slugify(g)).click(function() {
		gs_hideNotPreset(slugify(g));
	});
	
	
	$( "#gncGS_save"+ slugify(g) ).button({
		text: true
	});
	$("#gncGS_save" + slugify(g)).unbind("click");
	$("#gncGS_save" + slugify(g)).click(function() {
		gs_saveToOptions(slugify(g));
	});

	$( "#gncGS_add_preset"+ slugify(g) ).button({
		text: true
	});
	$("#gncGS_add_preset" + slugify(g)).unbind("click");
	$("#gncGS_add_preset" + slugify(g)).click(function() {
		gs_addPresetSettings(slugify(g));
	});
	
	$( "#gncGS_del_preset"+ slugify(g) ).button({
		text: true
	});
	$("#gncGS_del_preset" + slugify(g)).unbind("click");
	$("#gncGS_del_preset" + slugify(g)).click(function() {
		gs_delPresetSettings(slugify(g));
	});
	
	$( "#gncGS_preview_"+ slugify(g) ).button({
		text: true
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
	if (selectedId == null){
		//selectedId = slugify(g);
		selectAGSGame(selectedId);
	}
	generateToobar(g);
	return false;
}

function generateToobar(g){
	$( "#gncGS_go_btn_"+ slugify(g) ).button({
		text: true,
		icons: {
			primary: "ui-icon-play"
		}
	});
	$( "#gncGS_stop_btn_"+ slugify(g) ).button({
		text: true,
		icons: {
			primary: "ui-icon-stop"
		},
		disabled: true
	});

	$( "#gncGS_gen_settings_btn_"+ slugify(g) ).button({
		text: true,
		icons: {
			primary: "ui-icon-circle-triangle-n"
		}
	});
	$( "#gncGS_game_settings_btn_"+ slugify(g) ).button({
		text: true,
		icons: {
			primary: "ui-icon-circle-triangle-n"
		}
	});
	$( "#gncGS_show_hide_options_btn_"+ slugify(g) ).button({
		text: true,
		icons: {
			primary: "ui-icon-circle-triangle-n"
		}
	});
	$( "#gncGS_hide_auto_"+ slugify(g) ).button({
		text: true
	});
	$( "#gncGS_hide_all_btn_"+ slugify(g) ).button({
		text: true
	});
	$( "#gncGS_hide_preset_btn_"+ slugify(g) ).button({
		text: true
	});
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
	
	toHide.each(function(){
		if ($("a[oid='"+myId+"']", $(this)).length == 0) {
			var notif = parseStreamPostNode($(this));
			hideStreamPost(notif);
			setTimeout(function() {
				gs_hideAll(g);
			}, 200);
			resetGSCounts();
			return;
		}
		
	});
	
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
		if ($("a[oid='"+myId+"']", $(this)).length != 0) {
			skip=true;
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
 * Hide the posts not matching preset
 * @param g
 */
function gs_hideNotPreset(g) {
	var gameContainer = $("#cgncGST-" + g);
	var posts = $("." + d_streamPostNodeClass, gameContainer);
	
	var toHide = new Array();
	
	posts.each(function() {
		var skip = false;
		// Is it filtered ?
		var notifText = $("div[class*='" + d_streamPostLinkContainer + "']", $(this)).text();
		if (computeFilterContaining($("#gs-filterIn" + g).val(), notifText) && computeFilterNotContaining($("#gs-filterOut" + g).val(), notifText)) {
			skip = true;
		}
		if ($("a[oid='"+myId+"']", $(this)).length != 0) {
			skip=true;
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
	if (hideNode[0] == undefined) {
		$(n.mainnode).addClass("done");
		return false;
	}
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
//function toggleGSMoreOptions(g) {
//	if ($("#toggleGSmoreoptions-" + g).html() == 'Ï') {
//		$("#toggleGSmoreoptions-" + g).html('F');
//		$("#gncGSmoreoptions-" + g).slideDown("slow");
//	} else {
//		$("#toggleGSmoreoptions-" + g).html('Ï');
//		$("#gncGSmoreoptions-" + g).slideUp("slow");
//	}
//}
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
	$("#gncGS_stop_btn_" + slugGame).button({disabled: false});
	$("#gncGS_go_btn_" + slugGame).button({disabled: true});
	$("#gncGS_stop_btn_" + slugGame).click(function() {
		streamPostToProcess = new Array();
		$("#gncGS_stop_btn_" + slugGame).button({disabled: true});
		$("#gncGS_go_btn_" + slugGame).button({disabled: false});
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
			$(this).css("border", "3px solid #c2d9fe");
		} else {
			$(this).css("border", "none");
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
			$("#gncGS_stop_btn_" + slugify(notifToPick.game)).button({disabled: true});
			$("#gncGS_go_btn_" + slugify(notifToPick.game)).button({disabled: false});
		}
	} else {
		$("button[id^='gncGS_stop_btn_']").button({disabled: true});
		$("button[id^='gncGS_go_btn_']").button({disabled: false});
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
	$("p[id*=gncGST]").each(function() {

		var target = $(this).attr("id").substring(1);
//		var cont = $("#c" + target);
		

		var nb = $('div[id^="update-"]:not(.done)',$("#c" + target)).length;
//		cont.children().each(function() {
//			if (!$(this).hasClass("done")) {
//				nb++;
//			}
//		});
		$(this).html(' (' + nb + ')');
		totalReset += nb;
	});

}

function selectAGSGame(g){
	if (selectedId == g || g == null) {
		return false;
	}
	$("div[id^='gncGST-']").hide();
	selectedId = g;
	
	$("div[id^='gsid-']").removeClass("selectedGameTitle");
	$("div[id='gsid-"+g+"']").addClass("selectedGameTitle");
	
	$("#gncGST-"+selectedId).show();
	//$('img', $('div[id^="gsid-"]')).tooltip({position: "bottom center"});
}


function resetGS() {
	resetGSCounts();
	
	

	
	

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