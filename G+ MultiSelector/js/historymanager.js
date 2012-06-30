function saveHistory(c){var b=new Settings();b.get();var d=0;if(b.max_history_limit!=0){d=c.hes.length-b.max_history_limit;if(d<0){d=0}}newHes=new Array();for(var a=d;a<c.hes.length;a++){newHes.push(c.hes[a])}c.hes=newHes;localStorage.gnc=c.encode();historyCache=c;chrome.extension.sendRequest({action:"updateNotifications"})}var historyCache=null;function getHistory(){if(historyCache!=null){return historyCache}if(localStorage.gnc==undefined||localStorage.gnc==""){return new History()}var a=new History();a.decode(localStorage.gnc);return a}function saveHistoryEntry(e,d){if(e.isValid()){var c=getHistory();var b=false;for(var a=0;a<c.hes.length;a++){if(c.hes[a].time==e.time){c.hes[a]=e;b=true}}if(!b){c.hes.push(e)}saveHistory(c);if(d){clearTimeout(currentTimeout);populateTimes();majView()}}else{createBug(stackTrace(true,true))}}function clearSaved(){$("#confirmClearAll").dialog({modal:true,width:350,title:"Warning",buttons:{No:function(){$(this).dialog("close")},Yes:function(){$(this).dialog("close");localStorage.gnc="";historyCache=null;clearTimeout(currentTimeout);populateTimes();majView()}}})}function getHistoryEntry(c){var a=getHistory().hes;for(var b=0;b<a.length;b++){if(a[b].time==c){return a[b]}}return false}function deleteHistoryEntry(e){var d=getHistory();var a=d.hes;var c=new Array();for(var b=0;b<a.length;b++){if(a[b].time!=e){c.push(a[b])}}d.hes=c;saveHistory(d);clearTimeout(currentTimeout);populateTimes();majView()}var currentTimeout;function populateTimes(){var a=getHistory().hes;var f="";for(var e=0;e<a.length;e++){if(getCircle(a[e].circleSelection.circle)!=false){var c="";var d="";var g="Set by user.";if(a[e].notificationTime!=a[e].time){var b=new Date();b.setTime(parseInt(a[e].notificationTime));c=b.toDateString()+" "+b.toLocaleTimeString();if(a[e].autoNotif==true){d=" blueText";g="Automatic"}}f+='<div class="timers"><div class="timerName">'+a[e].name+'</div><div class="timerTime">'+makeTimeReadable(a[e].getTimeElapsed())+'</div><div class="timerNotification'+d+'" title="'+g+'">'+c+"</div>"+a[e].circleSelection.getHtml(getCircle(a[e].circleSelection.circle))+'<span class="timerOptions" hid=\''+a[e].time+"'></span></div>"}}$("#savedTimes").html(f);$(".timerOptions").click(function(h){showTooltip(h,$(this).attr("hid"),getHistoryEntry($(this).attr("hid")))});$(".timerPBar").each(function(){$(this).progressbar({value:$(this).attr("pc")*100})});currentTimeout=setTimeout(populateTimes,1000)}var currentTooltipHistory;function showTooltip(b,e,c){var a=c.name;if(c.name==null){a=""}var d=c.notificationTime;if(isNaN(d)){d=c.time}if(d==c.time){$("#hastonotify")[0].checked=false}else{$("#hastonotify")[0].checked=true}tp.setTime(parseInt(d)-parseInt(c.time));tp.include($("#timepicker"));currentTooltipHistory=e;document.getElementById("nameIt").value=a;$("#tooltip").dialog({width:450,height:205,modal:true,resizable:false,title:a,buttons:{Delete:function(){deleteFromToolTip();$(this).dialog("close")},OK:function(){saveFromToolTip();$(this).dialog("close")}}})}function hideTooltip(){$("#tooltip").hide("slow");currentTooltipHistory=null}function newEmptyHistoryEntry(){var c=new HistoryEntry();var a=new Date();c.name="";c.time=a.getTime();c.notificationTime=a.getTime();c.circleSelection=null;var b=new Settings();b.get();if(b.auto_history_notify){c.autoNotif=true;c.notificationTime=parseInt(c.time)+parseInt(b.notification_default_time)*1000}saveHistoryEntry(c,true)}function saveFromToolTip(){var a=getHistoryEntry(currentTooltipHistory);a.name=document.getElementById("nameIt").value;if($("#hastonotify")[0].checked){a.notificationTime=parseInt(tp.getTime())*1000+parseInt(a.time)}else{a.notificationTime=a.time}a.autoNotif=false;saveHistoryEntry(a,true);hideTooltip()}function deleteFromToolTip(){deleteHistoryEntry(currentTooltipHistory);hideTooltip()}function partialCheckHTML(a){var e="";for(var d=0;d<a.length;d++){var c="";if(a[d].notificationTime!=a[d].time&&a[d].circleSelection.partial){var b=new Date();b.setTime(parseInt(a[d].time));c=b.getFullYear()+"-"+twoDigitsNumber(b.getMonth())+"-"+twoDigitsNumber(b.getDay())+" "+b.toLocaleTimeString();if(a[d].autoNotif==true){classNotif=" blueText";titleNotif="Automatic"}}e+='<div class="timers"><div class="timerName">'+a[d].name+'</div><div class="timerTime">'+c+"</div>"+a[d].circleSelection.getHtml(getCircle(a[d].circleSelection.circle))+'<div class="button" id="partialLaunchButton" onclick="continuePartialSelection(\''+a[d].time+"')\">Continue</div></div>"}return e}function hasPartial(b){var c=getHistory();for(var a=0;a<c.hes.length;a++){if(c.hes[a].circleSelection.circle==b&&c.hes[a].circleSelection.partial){return true}}return false}function getAllNotificationTimes(){var a=getHistory();a=a.hes;var b=new Array();for(var c=0;c<a.length;c++){if(a[c].notificationTime!=a[c].time){b.push(a[c])}}return b};