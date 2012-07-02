/**
 * Numeric Stepper
 * ------------------------------------------------
 *
 * Copyright 2007-2008 Ca Phun Ung
 *	
 * This software is licensed under the CC-GNU LGPL
 * http://creativecommons.org/licenses/LGPL/2.1/
 * 
 * Version 0.1.2  Added keyboard Accessibility enhancements. 
 *                Refactored some code.
 *                Added a few more comments.
 *                
 * Version 0.1    Alpha release
 */

/**
 * Numeric Stepper Class.
 */
var NumericStepper = {	
    register : function(name, minValue, maxValue, stepSize){
        this.minValue = minValue;
		this.maxValue = maxValue;
		this.stepSize = stepSize;
		var elements = getElementsByClassName(document, "*", name);
		for (var i=0; i<elements.length; i++){
			var textbox = elements[i].getElementsByTagName('input')[0];
			if (textbox){				
				var buttons = elements[i].getElementsByTagName('button');
				if (textbox.value == undefined || textbox.value == '' || isNaN(textbox.value)) 
					textbox.value = 0;		
				textbox.next = (buttons[0] ? buttons[0] : null);		                
				// detect key presses and restrict to numeric values only
				textbox.onkeypress = function(e){
					var keynum = (window.event ? event.keyCode : (e.which ? e.which : null));
					keychar = String.fromCharCode(keynum);
					numcheck = /[0-9\-.]/;		
					switch (keynum) {
						case NumericStepper.keys.BACKSPACE :
						case NumericStepper.keys.TAB : 
                        case null : 						 
                            return true;
						default : 
						    return numcheck.test(keychar);
					}															
				};
				// detect cursor keys
                textbox.onkeyup = function(e){
                };
				textbox.onblur = function(e){
					if (parseFloat(this.value) < NumericStepper.minValue)
						this.value = NumericStepper.minValue;
					if (parseFloat(this.value) > NumericStepper. maxValue)
						this.value = NumericStepper.maxValue;
				};	
				textbox.autocomplete = "off"; // turns off autocomplete in opera! 							
                if (buttons[0]){this.addButtonEvent(buttons[0], textbox, this.stepUp, {next:buttons[1], prev:textbox});}
                if (buttons[1]){this.addButtonEvent(buttons[1], textbox, this.stepDown, {next:null, prev:buttons[0]});}                    
			}
		}
	}	
    ,addButtonEvent:function(o, textbox, func, moveTo){
        o.textbox = textbox;
		o.moveTo = moveTo;
		// convert button type to button to prevent form submission onclick
		if (o.getAttribute("type")=="submit"){
			o.removeAttribute("type"); // IE fix
			o.setAttribute("type","button");
		}
        o.onclick = func;
		o.onkeyup = function(e) {
	        var keynum = (window.event ? event.keyCode : (e.which ? e.which : null));
	        switch (keynum) {
				// (prev object)
	            case NumericStepper.keys.UP_ARROW : 
	            case NumericStepper.keys.LEFT_ARROW : 
	                if (this.moveTo.prev && typeof this.moveTo.prev == 'object') this.moveTo.prev.focus(); break;
				// (next object)
	            case NumericStepper.keys.DOWN_ARROW : 
	            case NumericStepper.keys.RIGHT_ARROW :  
	                if (this.moveTo.next && typeof this.moveTo.next == 'object') this.moveTo.next.focus(); break;					
	        }			
		}
	}
    ,stepUp:function(){
    	var val = NumericStepper.stepSize;
    	if (this.textbox.value < 1){
    		val = NumericStepper.stepSize/10;
    	}
		NumericStepper.stepper(this.textbox, val);
    }
    ,stepDown:function(){
    	var val = -NumericStepper.stepSize;
    	if (this.textbox.value <= 1){
    		val = -NumericStepper.stepSize/10;
    	}
		NumericStepper.stepper(this.textbox, val);
    }
    ,stepper:function(textbox, val){
		if (textbox == undefined) 
		  return false;
		if (val == undefined || isNaN(val)) 
		  val = 1;
		if (textbox.value == undefined || textbox.value == '' || isNaN(textbox.value)) 
		  textbox.value = 0;
			textbox.value = parseFloat(textbox.value) + parseFloat(val);
		if (parseFloat(textbox.value) < NumericStepper.minValue)
		  textbox.value = NumericStepper.minValue;
		if (parseFloat(textbox.value) >NumericStepper. maxValue)
		  textbox.value = NumericStepper.maxValue;
		if (parseFloat(textbox.value) > 1){
			textbox.value = Math.round(textbox.value);
		} else {
			textbox.value = Math.round(textbox.value*10)/10;
		}
    }
	,keys : {
        BACKSPACE: 8,
        TAB: 9,
        LEFT_ARROW: 37,
        UP_ARROW: 38,
        RIGHT_ARROW: 39,
        DOWN_ARROW: 40
    }
}

function initNumericStepper(){ var myNumericStepper = NumericStepper.register("numeric-stepper", 0, 100, 1); }

/**
 * getElementsByClassName - returns an array of elements selected by their class name.
 * @author Jonathan Snook <http://www.snook.ca/jonathan>
 * @add-ons Robert Nyman <http://www.robertnyman.com> 
 */
function getElementsByClassName(oElm, strTagName, strClassName){
    var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
    var arrReturnElements = new Array();
    strClassName = strClassName.replace(/-/g, "\-");
    var oRegExp = new RegExp("(^|\s)" + strClassName + "(\s|$)");
    var oElement;
    for(var i=0; i<arrElements.length; i++){
        oElement = arrElements[i];
    if(oRegExp.test(oElement.className)){
        arrReturnElements.push(oElement);
    }
  }
  return (arrReturnElements)
}

/**
 * addEvent - simple add event loader.
 */
function addEvent(o, evt, f){
    var r = false;
    if (o.addEventListener){
        o.addEventListener(evt, f, false);
		r = true;
    } else if (o.attachEvent) {
		r = o.attachEvent("on"+evt, f);
	}        
    return r;
}

/**
 * This attaches the NumericStepper to the window.onload event.
 * Feel free to replace the following with your own onload handler
 * Ideally you should detect DOM Ready instead to enhance the load 
 * time of the NumericStepper.  
 */
