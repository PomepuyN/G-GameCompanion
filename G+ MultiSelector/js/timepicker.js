var timePickers = new Array();
function TimePicker(d,h,m,s,el){
	this.d = d;
	this.h = h;
	this.m = m;
	this.s = s;
	this.el = el.attr('id');
	this.dSelect;
	this.hSelect;
	this.mSelect;
	this.sSelect;

	// Include needed elements in the DOM
	this.include = function(el){
		el.html(
		'<div class="tp-main" uid="tp-main-'+this.el+'">'
			+'<div uid="tp-header-'+this.el+'" class="tp-header"><p uid="tp-closer-'+this.el+'">x</p></div>'
			+this.getSelect(30, this.d, "d")+"days"
			+this.getSelect(24, this.h, "h")+"hours"
			+this.getSelect(60, this.m, "m")+"minutes"
			//+this.getSelect(60, this.s, "s")+"seconds"
			+"</div>"
			+'<p class="tp-string"  uid="tp-string-'+this.el+'">'
			+this.d
			+'d'
			+twoDigitsNumber(this.h)
			+'h'
			+twoDigitsNumber(this.m)
			+'m'
			//+twoDigitsNumber(this.s)
			+'</p>'
		);
		this.init();
	};

	// Init the timePicker's events
	this.init = function(){
		$('p[uid="tp-string-'+this.el+'"]').click(function (event){
			var uid = $(event.target).attr("uid");
			var reg = new RegExp("[\-]+", "g");
			var uidS = uid.split(reg);
			var tp = getTimePicker(uidS[2]);
			tp.open(500);
		});
		$('p[uid="tp-closer-'+this.el+'"]').click(function (event){
			var uid = $(event.target).attr("uid");
			var reg = new RegExp("[\-]+", "g");
			var uidS = uid.split(reg);
			var tp = getTimePicker(uidS[2]);
			tp.close();
		});
		$('select[uid="'+this.el+'"]').change(function(event) {
			var tp = getTimePicker($(event.target).attr("uid"));
			tp.updateProps($(event.target).attr("tv"),event.target.value );
		});
		
		$('div[uid="tp-main-'+this.el+'"]').click(function(event){
		     event.stopPropagation();
		 });
		$('p[uid="tp-string-'+this.el+'"]').click(function(event){
			event.stopPropagation();
		});
		$('div[uid="tp-header-'+this.el+'"]').click(function(event){
			event.stopPropagation();
		});
	};
	
	// Update the tp object with a new value
	this.updateProps= function(timeValue, value){
		
		switch (timeValue) 
		{ 
		case "d": 
			this.d = value;
		break; 
		case "h": 
			this.h = value;
			break; 
		case "m": 
			this.m = value;
			break; 
		case "s": 
			this.s = value;
			break; 
		}
		
		this.include($("#"+this.el));
		this.open(0);
		
	};
	this.getSelect = function (max, checked,id){
		var html = '<select uid="'+this.el+'" tv="'+id+'" class="tp-select">';
		for ( var i = 0; i < max; i++) {
			html+='<option value="'+i+'"';
			if (i==checked){
				html+=' selected="true"';
			}
			html+='>'+i+'</option>';
		}
		html +='</select>';
		return html;
	};
	//open the popup
	this.open =function (time){
		var tpString= $('p[uid="tp-string-'+this.el+'"]');
		$('div[uid="tp-main-'+this.el+'"]').show(time);
		$('div[uid="tp-main-'+this.el+'"]').offset({ 
			top: tpString.offset().top + tpString.height(), 
			left:  tpString.offset().left + tpString.width()/2 -125
		});
	};
	//close the popup
	this.close =function (){
		$('div[uid="tp-main-'+this.el+'"]').hide("slow");
	};
	
	this.getTime = function(){
		return this.d*86400+this.h*3600+this.m*60+this.s;
	};
	
	this.setTime = function(time){
		var splitted = splitTime(time/1000);
		this.d = splitted[0];
		this.h = splitted[1];
		this.m = splitted[2];
		this.s = splitted[3];
	};
	
	timePickers.push(this);
	this.include(el);
}

// Get the current timePicker
function getTimePicker(id){
	for ( var i = 0; i < timePickers.length; i++) {
		if (timePickers[i].el == id){
			return timePickers[i];
		}
	}
}

function splitTime(time) {

	var tempsEnSec = parseInt(time);
	var tempsEnMin = 0;
	var tempsEnHeu = 0;
	var tempsEnJ = 0;
	var result = new Array();

	if (tempsEnSec >= 60) {
		tempsEnMin = tempsEnSec / 60;
		tempsEnSec = tempsEnSec % 60;
	}

	if (tempsEnMin >= 60) {
		tempsEnHeu = tempsEnMin / 60;
		tempsEnMin = tempsEnMin % 60;
	}
	if (tempsEnHeu >= 24) {
		tempsEnJ = tempsEnHeu / 24;
		tempsEnHeu = tempsEnHeu % 24;
	}
	
	
	result.push(Math.floor(tempsEnJ));
	result.push(Math.floor(tempsEnHeu));
	result.push(Math.floor(tempsEnMin));
	result.push(Math.floor(tempsEnSec));

	return result;
}

// Close the popup on click outside
$('html').click(function(e) {
	for ( var i = 0; i < timePickers.length; i++) {
		timePickers[i].close();
	}
});