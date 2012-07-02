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
 * History entry to be stored.
 * @author Nicolas POMEPUY
 */
/**
 * @returns {HistoryEntry}
 */
function HistoryEntry(){
	this.time;
	this.name = "";
	this.notificationTime;
	this.autoNotif=false;
	this.circleSelection;
	this.partialGroup=0;

	this.encode = function(){
		return JSON.stringify(this);
	};
	
	this.decode = function(str){
		var decoded = JSON.parse(str);
		this.time = decoded.time;
		this.name = decoded.name;
		this.notificationTime = decoded.notificationTime;
		this.autoNotif = decoded.autoNotif;
		this.circleSelection = new CircleSelection();
		if (decoded.circleSelection != null && decoded.circleSelection.circle != undefined){
			this.circleSelection.decode(JSON.stringify(decoded.circleSelection));
		} else {
			createBug(stackTrace(true, true));
		}
		
		this.partialGroup= decoded.partialGroup;
		
	};
	
	this.getTimeElapsed = function(){
		var now = new Date();
		return parseInt(now.getTime()) - parseInt(this.time);
	};
	
	this.isValid = function(){
		return (this.circleSelection != undefined 
				&& this.circleSelection.circle != undefined 
				&& this.time != undefined);
	};
	
}