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
 * Set of contacts selected in a circle.
 * @author Nicolas POMEPUY
 */
function CircleSelection(){
	this.circle;
	this.members;
	this.partial;

	this.encode = function(){
		return JSON.stringify(this);
	};
	this.decode = function(str){
		var decoded = JSON.parse(str);

		this.circle = decoded.circle;
		if (decoded.members != null){			
			var membersA = new Array();
			for ( var i = 0; i < decoded.members.length; i++) {
				membersA.push(decoded.members[i]);
			}
			this.members = membersA;
		} else {
			createBug(stackTrace(true, true));
		}
		this.partial = decoded.partial;

	};
	
	this.getCircle= function(){
		getCircle(code);
	};
	this.getMember= function(){
		getMember(code);
	};

	this.getHtml = function(circle){
		if (circle != undefined){
			
			var nbs = this.getCompleteStatus(circle);
			var pc = parseInt(nbs.selected) / parseInt(nbs.total);
			var ci = getCircle(this.circle);
			return '<div class="circleSelection">'+ci.name+' ('+nbs.selected+'/'+nbs.total+')<div class="timerPBar" pc="'+pc+'">'+
			'</div></div>';
		} else {
			createBug(stackTrace(true, true));
		}
	};
	this.partializeSelection = function(circle, excluded, max_limit){
		var newMembers = new Array();
		for ( var i = 0; i < circle.members.length; i++) {
			var add = true;
			for ( var j = 0; j < excluded.length; j++) {
				if (circle.members[i].code == excluded.code){
					add = false;
				}

			}
			if (add && newMembers.length < max_limit){
				newMembers.push(circle.members[i].code);
			}
		}
		this.members = newMembers;
		this.partial = true;
	};

	this.getCompleteStatus = function(circleRef){
		if (circleRef != undefined){
			
			var selected = 0;
			for ( var i = 0; i < circleRef.members.length; i++) {
				for ( var j = 0; j < this.members.length; j++) {
					if (this.members[j] == circleRef.members[i].code){
						selected++;
					}
				}
			}
			var result = new Object();
			result.selected = selected;
			result.total = circleRef.members.length;
			return result;
		} else {
			createBug(stackTrace(true, true));
		}
	};

}