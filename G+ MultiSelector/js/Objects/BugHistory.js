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
 * Set of bug entries.
 * @author Nicolas POMEPUY
 */
function BugHistory(){
	this.bugs;
	
	this.encode = function(){
		return JSON.stringify(this);
	};
	
	this.decode = function(str){
		var decoded = JSON.parse(str);

		if (decoded.bugs != null){			
			var bugsA = new Array();
			for ( var i = 0; i < decoded.bugs.length; i++) {
				bugsA.push(decoded.bugs[i]);
			}
			this.bugs = bugsA;
		}

	};
	
	this.add = function(bug){
		if (this.bugs == undefined){
			this.bugs = new Array();
		}
		this.bugs.push(bug);
	};
	
	
	this.save = function() {
		localStorage["bugsHistory"] = this.encode();
	};
	
	this.get = function() {
		var setString = localStorage["bugsHistory"];
		if (setString == "" || setString == undefined){
			var bh = new BugHistory();
			bh.bugs = new Array();
			return bh;
		}
		return this.decode(setString);
	};
}