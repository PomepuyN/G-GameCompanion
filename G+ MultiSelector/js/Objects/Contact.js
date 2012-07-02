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
 * Simple contact.
 * @author Nicolas POMEPUY
 */
function Contact(){
	this.code;
	this.name;
	this.img;
	
	this.encode = function(){
		return JSON.stringify(this);
	};
	
	this.decode = function(str){
		var decoded = JSON.parse(str);
		this.code = decoded.code;
		this.name = decoded.name;
		this.img = decoded.img;
	};
	
}

function decodeContactArray(arr){
	arr = JSON.parse(arr);
	var newArr = new Array();
	for ( var i = 0; i < arr.length; i++) {
		var newC = new Contact();
		newC.decode(JSON.stringify(arr[i]));
		newArr.push(newC);
	}
	return newArr;
}