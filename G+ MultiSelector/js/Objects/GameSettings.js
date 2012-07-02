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
 * Global settings for a game.
 * @author Nicolas POMEPUY
 */
function GameSettings() {
	this.games = new Array();
	
	this.notif_limit = 5;
	this.notif_hide = true;
	this.notif_delay = 200;
	this.notif_reverse = true;
	
	this.gs_limit = 20;
	this.gs_hide = true;
	this.gs_delay = 200;
	this.gs_reverse = true;
	
	this.encode = function(){
		return JSON.stringify(this);
	};
	
	this.decode = function(str){
		if (str == "") return;
		var decoded = JSON.parse(str);

		if (decoded.games != undefined) {
			this.games = decoded.games;
		}
		if (decoded.notif_limit != undefined) {
			this.notif_limit = decoded.notif_limit;
		}
		if (decoded.notif_hide != undefined) {
			this.notif_hide = decoded.notif_hide;
		}
		if (decoded.notif_delay != undefined) {
			this.notif_delay = decoded.notif_delay;
		}
		if (decoded.notif_reverse != undefined) {
			this.notif_reverse = decoded.notif_reverse;
		}
		if (decoded.gs_limit != undefined) {
			this.gs_limit = decoded.gs_limit;
		}
		if (decoded.gs_hide != undefined) {
			this.gs_hide = decoded.gs_hide;
		}
		if (decoded.gs_delay != undefined) {
			this.gs_delay = decoded.gs_delay;
		}
		if (decoded.gs_reverse != undefined) {
			this.gs_reverse = decoded.gs_reverse;
		}

		var games = new Array();
		if (decoded.games != undefined){
			for ( var i = 0; i < decoded.games.length; i++) {
				var newGame = new GameS();
				newGame.decode(JSON.stringify(decoded.games[i]));
				games.push(newGame);
			}
		}
		this.games = games;
	};
	
	
	
	this.save = function() {
		localStorage["gamesettings"] = this.encode();
	};
	
	this.get = function() {
		var setString = localStorage["gamesettings"];
		if (setString == undefined){
			this.save();
			return this.get();
		}
		return this.decode(setString);
	};
}


function Filter(){
	this.name;
	this.type;
	this.filterIn;
	this.filterOut;
	this.plusOne;
	this.fold = false;
	
	this.encode = function(){
		return JSON.stringify(this);
	};
	this.decode = function(str){
		var decoded = JSON.parse(str);

		if (decoded.name != undefined){
			this.name = decoded.name;
		}
		if (decoded.type != undefined){
			this.type = decoded.type;
		}
		if (decoded.filterIn != undefined){
			this.filterIn = decoded.filterIn;
		}
		if (decoded.filterOut != undefined){
			this.filterOut = decoded.filterOut;
		}
		if (decoded.plusOne != undefined){
			this.plusOne = decoded.plusOne;
		}
		if (decoded.fold != undefined){
			this.fold = decoded.fold;
		}
	};
}

function GameS(){
	this.name;
	this.slugName;
	this.filters= new Array();
	this.lastFilterN;
	this.lastFilterGS;
	
	this.encode = function(){
		return JSON.stringify(this);
	};
	this.decode = function(str){
		var decoded = JSON.parse(str);

		if (decoded.name != undefined){
			this.name = decoded.name;
		}
		if (decoded.lastFilterN != undefined){
			this.lastFilterN = decoded.lastFilterN;
		}
		if (decoded.lastFilterGS != undefined){
			this.lastFilterGS = decoded.lastFilterGS;
		}
		this.slugName = decoded.slugName;
		
		var filters = new Array();
		if (decoded.filters != undefined){
			for ( var i = 0; i < decoded.filters.length; i++) {
				var newFilter = new Filter();
				newFilter.decode(JSON.stringify(decoded.filters[i]));
				filters.push(newFilter);
			}
		}
		this.filters = filters;
	};
}