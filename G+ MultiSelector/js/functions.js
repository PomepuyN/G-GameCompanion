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
 * Global functions to perform tasks.
 * @author Nicolas POMEPUY
 */


/**
 * Tranform the time to a readable string.
 * @param time
 * @returns Readable date.
 */
function makeTimeReadable(time) {

	var tempsEnMs = time;
	var tempsEnSec = 0;
	var tempsEnMin = 0;
	var tempsEnHeu = 0;
	var tempsEnJ = 0;

	if (tempsEnMs >= 1000) {
		tempsEnSec = tempsEnMs / 1000;
		tempsEnMs = tempsEnMs % 1000;
	}

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

	return twoDigitsNumber(Math.floor(tempsEnJ)) + "d"
	+ twoDigitsNumber(Math.floor(tempsEnHeu)) + "h" 
	+ twoDigitsNumber(Math.floor(tempsEnMin)) + "m"
	+ twoDigitsNumber(Math.floor(tempsEnSec)) + "s";
}

/**
 * Return a number with a leading 0 if necessary.
 * @param num
 * @returns String
 */
function twoDigitsNumber(num) {
	if (num < 10){
		return "0"+num;
	}
	return num;
}


/**
 * Generate a strack trace for the bug logger
 * @param iLevel
 * @param bArguments
 * @returns {String}
 */
function stackTrace(iLevel, bArguments) {
	var asStack = [];
	var iCalls = 0;
	// Walk the stack:
	for (var oCaller = arguments.callee.caller; oCaller != null; oCaller = oCaller.caller) {
		// Skip the first X calls on the stack
		if (typeof(iLevel) == "number" && iLevel-- > 0) continue;
		iCalls++;
		var bLastCall = !(oCaller.caller);
		// Convert caller function to a string and cut the function
		// body. For simplicity, I'm not taking into account inline
		// comments in the function declaration, otherwise the regular
		// expressions would become quite complex.
		sCaller = (oCaller+"").replace(/function\s*|\s*{[\s\S]*/g, "");
		// sCaller is now something like "stackDump()", let's seperate
		// the function name from the argument list:
		var asCaller = sCaller.match(/(\w*\s*)\(([^\)]*)\)/);
		// If this failed, we'll use what we have so far and not try to be
		// smart about the arguments:
		var sCallHeadHeader = " " + (bLastCall ? "\u2514":"\u251C") + "\u2500 ";
		var sCallBodyHeader = " " + (bLastCall ? " " : "\u2502") + "  ";
		if (asCaller == null) {
			asStack.push(sCallHeadHeader + visualize(sCaller));
			if (bArguments) asStack.push(sCallBodyHeader + "    Argument info unavailable.");
		} else {
			// We've split the function name from the arguments:
			var sName = asCaller[1];
			// Now let's split the individual arguments, if any:
			var asArgumentNames = asCaller[2].match(/^\s*$/) ?
				[]: asCaller[2].split(",");
			// Add the function name + argument names to the call stack:
			asStack.push(sCallHeadHeader + sName + " (" + asArgumentNames.join(", ") + ")");
			// Next we'll walk the argument names and the argument values
			// to process them and see if there are any arguments in the
			// function definition that were not supplied in the call or
			// extra arguments supplied in the call that are not in the
			// definition:
			if (bArguments) {
				for (var i = 0; i < asArgumentNames.length || i < oCaller.arguments.length; i++) {
					var sArgumentName = "arguments[" + i + "]";
					if (i < asArgumentNames.length) {
						// This argument exists in the function definition, use
						// the name rather than the number:
						asArgumentNames[i] = asArgumentNames[i].replace(/^\s*|\s*$/g, "");
						sArgumentName = asArgumentNames[i];
					}
					// We'll display each named argument from the definition,
					// even if it is not defined in the call. We'll also
					// display any arguments defined in the call that are not
					// in the function definition:
					var bLastArgument = (i + 1 >= asArgumentNames.length && i + 1 >= oCaller.arguments.length);
					var sArgumentHeadHeader = " " + (bLastArgument ? "\u2514":"\u251C") + "\u2500 ";
					var sArgumentBodyHeader = " " + (bLastArgument ? " " : "\u2502") + "  ";
					asStack.push(
						sCallBodyHeader +
						sArgumentHeadHeader +
						sArgumentName + "=" +
						visualize(oCaller.arguments[i], sCallBodyHeader + sArgumentBodyHeader)
					);
				}
			}
		}
	}
	if (iCalls == 0) return "Call stack info unavailable.";
	// Combine all information found and return it:
	return "Call stack (" + iCalls + " calls):\r\n" + asStack.join("\r\n");
}
function visualize(xValue, sPadding, iDepth) {
	if (typeof(sPadding) !== "string") sPadding = "";
	if (typeof(iDepth) !== "number") iDepth = 2;
	switch (typeof(xValue)) {
		case "undefined": return "undefined";
		case "boolean":   return xValue.toString();
		case "string":    return "\"" + JavaScriptStringEncode(xValue) + "\"";
		case "number":
			// Inifinity, NaN, floats, small integers and negative numbers
			// are displayed as is:
			if (
				!isFinite(xValue) || isNaN(xValue) ||
				xValue != parseInt(xValue) || xValue < 10
			) {
				return xValue.toString();
			}
			// Otherwise we'll display as a decimal and hexadecimal number:
			return xValue.toString() + "  (0x" + xValue.toString(16).toUpperCase() + ")";
		case "function":
			var sFunction = xValue.toString();
			if (iDepth == 2) return sFunction.replace(/\r?\n/g, "$&" + sPadding);
			else return sFunction.replace(/\{[\s\S]*$/, "{ \u2026 }");
		case "object":
			if (xValue == null) return "null";
			var sConstructor = null;
			try { sConstructor = xValue.constructor.toString(); }
			catch (e) { return "object unknown"; }
			var sHeader = "Unknown{", sFooter = "}";
			var oName = sConstructor.match(/^\r?\n?function\s+(\w+)\s*\([\s\S]*$/);
			if (oName) switch (oName[1]) {
				case "Boolean": return "Boolean(" + visualize(xValue.valueOf(), sPadding, iDepth) + ")";
				case "Date":    return "Date(" + visualize(xValue.toString(), sPadding, iDepth) + ")";
				case "Number":  return "Number(" + visualize(xValue.valueOf(), sPadding, iDepth) + ")";
				case "String":  return "String(" + visualize(xValue.valueOf(), sPadding, iDepth) + ")";
				case "RegExp":
					var sFlags = "";
					if (xValue.global) sFlags += "g";
					if (xValue.ignoreCase) sFlags += "i";
					if (xValue.multiline) sFlags += "m";
					return "RegExp(/" + xValue.source + "/" + sFlags + ")";
				case "Array":
					sHeader = "Array [", sFooter = "]";
					break;
				default:
					sHeader = "Object " + oName[1] + " {";
			} else try {
				oName = xValue.toString().match(/^\[(?:object )?(.*)\]$/);
				if (oName) sHeader = "Object [" + oName[1] + "] {";
			} catch (e) { }
			if (iDepth == 0) return sHeader + " \u2026 " + sFooter;
			var asValues = [];
			try {
				for (var i in xValue) {
					// Integers are displayed as numbers, anything else as a string
					var sIndex = parseInt(i).toString() == i ?
						i:
						visualize(i);
					// A child object that is the same as its parent is displayed as "=> self",
					// Anything else is "visualized":
					var sValue = xValue[i] === xValue ?
						"\u21D2 self":
						visualize(xValue[i], sPadding + "\xB7   ", iDepth - 1);
					asValues.push(sPadding + "\xB7   " + sIndex + ": " + sValue);
				}
			} catch (e) {
				return "object unknown";
			}
			return sHeader + "\r\n" +
				asValues.join("\r\n") + "\r\n" +
				sPadding + sFooter;
		default:
			try { return typeof(xValue) + " " + new String(xValue); }
			catch(e) { return "unknown"; }
	}
}
function JavaScriptStringEncode(sString) {
	return (sString+"").replace(/[\0-\x1F\"\\\x7F-\xA0\u0100-\uFFFF]/g, function (sChar) {
		switch (sChar) {
			case "\b": return "\\b";
			case "\t": return "\\t";
			case "\n": return "\\n";
			case "\f": return "\\f";
			case "\r": return "\\r";
			case "\\": return "\\\\";
			case "\"": return "\\\"";
		}
		var iChar = sChar.charCodeAt(0);
		if (iChar < 0x10) return "\\x0" + iChar.toString(16);
		if (iChar < 0x100) return "\\x" + iChar.toString(16);
		if (iChar < 0x1000) return "\\u0" + iChar.toString(16);
		return "\\u" + iChar.toString(16);
	});
}

function createBug(stack){
	var bug = new BugEntry();
	bug.time = new Date().getTime();
	bug.stackTrace = stack;
	var bHist = new BugHistory();
	bHist.get();
	bHist.add(bug);
	bHist.save();
}