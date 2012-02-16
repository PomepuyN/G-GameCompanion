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
 * Game  with its options.
 * @author Nicolas POMEPUY
 */
function Game(){
	this.name;
	this.slugName;
	this.autoHide;
	this.n_filterIn;
	this.n_filterOut;
	this.s_filterIn;
	this.s_filterOut;
	this.hide = false;
	
	this.encode = function(){
		return JSON.stringify(this);
	};
	this.decode = function(str){
		var decoded = JSON.parse(str);

		if (decoded.name != undefined){
			this.name = decoded.name;
		}
		this.slugName = decoded.slugName;
		if (decoded.autoHide != undefined){
			this.autoHide = decoded.autoHide;
		}
		if (decoded.n_filterIn != undefined){
			this.n_filterIn = decoded.n_filterIn;
		}
		if (decoded.n_filterOut != undefined){
			this.n_filterOut = decoded.n_filterOut;
		}
		if (decoded.s_filterIn != undefined){
			this.s_filterIn = decoded.s_filterIn;
		}
		if (decoded.s_filterOut != undefined){
			this.s_filterOut = decoded.s_filterOut;
		}
		if (decoded.hide != undefined){
			this.hide = decoded.hide;
		}
	};
}