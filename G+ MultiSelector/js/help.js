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
 * FIXME : This file should be renamed
 */
/**
 * Get the use information (has the extension already been launched ...)
 * @author Nicolas POMEPUY
 */

var oldVersion;
/**
 * Is this the first launch ?
 * @returns {Boolean}
 */
function verifyFirstTimeUse() {
	oldVersion = localStorage["lastversion"];
	if (localStorage["lastversion"] != getVersion()){
		localStorage["lastversion"] = getVersion();
		return true;
	}
	return false;
}
/**
 * Retrieve the extention version
 * @returns version number
 */
function getVersion() {
    var details = chrome.app.getDetails();
    return details.version;
 }

/**
 * Compare old version to another
 * @param old version number
 * @returns {Boolean}
 */
function isOldVersionSuperior(comp){
	var reg = new RegExp("[.]+", "g");
	var compS = comp.split(reg);
	var currentVS = oldVersion;
	if (currentVS == undefined){
		currentVS = "1.0.0";
	}
	currentVS = currentVS.split(reg);
	
	if (compS.length < 3){
		compS.push(0);
	}
	if (currentVS.length < 3){
		currentVS.push(0);
	}
	
	if (compS[0] < currentVS[0]){
		return true;
	}
	if (compS[1] < currentVS[1]){
		return true;
	}
	if (compS[2] < currentVS[2]){
		return true;
	}
	
	return false;
	 
}