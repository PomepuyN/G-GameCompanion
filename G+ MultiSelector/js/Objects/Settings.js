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
 * All the settings to save.
 * @author Nicolas POMEPUY
 */
function Settings() {
	this.allow_history = true;
	this.max_history_limit = 40;
	this.auto_history_notify = true;
	this.auto_name_history = false;
	this.allow_notifications = true;
	this.notification_type = "desktop";
	this.notification_time = 15;
	this.notification_default_time = 86400;
	this.launch_back_action = 3;
	this.max_popup_height = 0;
	this.max_selection = 50;
	this.show_partial_message = true;
	
	this.san_notif_limit = 5;
	this.san_notif_hide = true;
	this.san_notif_delay = 200;
	
	this.san_gs_limit = 20;
	this.san_gs_hide = true;
	this.san_gs_delay = 200;
	this.san_gs_plusone = false;
	this.games_settings = new Array();
	
	this.encode = function(){
		return JSON.stringify(this);
	};
	
	this.decode = function(str){
		var decoded = JSON.parse(str);

		if (decoded.allow_history != undefined) {
			this.allow_history = decoded.allow_history;
		}
		if (decoded.max_history_limit != undefined) {
			this.max_history_limit = decoded.max_history_limit;
		}
		if (decoded.auto_history_notify != undefined) {
			this.auto_history_notify = decoded.auto_history_notify;
		}
		if (decoded.auto_name_history != undefined) {
			this.auto_name_history = decoded.auto_name_history;
		}
		if (decoded.allow_notifications != undefined) {
			this.allow_notifications = decoded.allow_notifications;
		}
		if (decoded.notification_type != undefined) {
			this.notification_type = decoded.notification_type;
		}
		if (decoded.notification_time != undefined) {
			this.notification_time = decoded.notification_time;
		}
		if (decoded.notification_default_time != undefined) {
			this.notification_default_time = decoded.notification_default_time;
		}
		if (decoded.launch_back_action != undefined) {
			this.launch_back_action = decoded.launch_back_action;
		}
		if (decoded.max_popup_height != undefined) {
			this.max_popup_height = decoded.max_popup_height;
		}
		if (decoded.max_selection != undefined) {
			this.max_selection = decoded.max_selection;
		}
		if (decoded.show_partial_message != undefined) {
			this.show_partial_message = decoded.show_partial_message;
		}

		if (decoded.san_notif_limit != undefined) {
			this.san_notif_limit = decoded.san_notif_limit;
		}
		if (decoded.san_notif_hide != undefined) {
			this.san_notif_hide = decoded.san_notif_hide;
		}
		if (decoded.san_notif_delay != undefined) {
			this.san_notif_delay = decoded.san_notif_delay;
		}
		if (decoded.san_gs_limit != undefined) {
			this.san_gs_limit = decoded.san_gs_limit;
		}
		if (decoded.san_gs_hide != undefined) {
			this.san_gs_hide = decoded.san_gs_hide;
		}
		if (decoded.san_gs_delay != undefined) {
			this.san_gs_delay = decoded.san_gs_delay;
		}
		if (decoded.san_gs_plusone != undefined) {
			this.san_gs_plusone = decoded.san_gs_plusone;
		}
		var games = new Array();
		if (decoded.games_settings != undefined){
			for ( var i = 0; i < decoded.games_settings.length; i++) {
				var newGame = new Game();
				newGame.decode(JSON.stringify(decoded.games_settings[i]));
				games.push(newGame);
			}
		}
		this.games_settings = games;
	};
	
	
	
	this.save = function() {
		localStorage["settings"] = this.encode();
	};
	
	this.get = function() {
		var setString = localStorage["settings"];
		if (setString == undefined){
			this.save();
			this.get();
		}
		return this.decode(setString);
	};
}