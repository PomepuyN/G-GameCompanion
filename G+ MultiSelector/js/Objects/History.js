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
 * History object used to store the selections made. Set of History entries.
 * @author Nicolas POMEPUY
 */
function History(){
	this.hes = new Array();
	
	this.encode = function(){
		return JSON.stringify(this);
	};
	
	this.decode = function(str){
		var decoded = JSON.parse(str);
		var hes = new Array();
		
		for ( var i = 0; i < decoded.hes.length; i++) {
			var newHes = new HistoryEntry();
			newHes.decode(JSON.stringify(decoded.hes[i]));
			hes.push(newHes);
		}
		this.hes = hes;
		
	};
	
}