var classUnselected="lz";var classSelected="pj-S";var classScrollDiv="Hh";var blockedCircleId=15;var circles=new Array();var members=new Array();var circleUrl=new Array();circleUrl.push("https://plus.google.com/u/");circleUrl.push("/_/socialgraph/lookup/circles/?m=true");var multiAccountUrl=new Array();multiAccountUrl.push("https://plus.google.com/u/");multiAccountUrl.push("/_/initialdata?key=11");var multiAccountData=new Array();var multiAccountIndex=0;var multiAccountUsers=new Array();var myCirclesContainer="oz-sg-elements";var myCirclesContact="AkM0qf";var myCirclesSelectedContact="Sf-I";var gplustoken=null;function look4MultiAccounts(){var a=multiAccountUrl[0]+multiAccountIndex+multiAccountUrl[1];$.ajax({url:a,beforeSend:function(b){b.overrideMimeType("text/plain;")},context:document.body,error:function(b,d,c){sendDataError2Ext(d,b.responseText)},timeout:5000,success:function(g){var n=false;for(var h=0;h<multiAccountData.length;h++){if(multiAccountData[h]==g){n=true}}if(multiAccountIndex<5&&!n){look4MultiAccounts();multiAccountData.push(normalizeGJsonMA(g.substring(5)))}else{for(var h=0;h<multiAccountData.length;h++){var m=new Object();var o=multiAccountData[h][0][1].firstObj;for(var f=0;f<o.length;f++){if(o[f]!=undefined){var e=o[f].aclEntries;if(e!=undefined){for(var d=0;d<e.length;d++){if(e[d].scope.scopeType=="user"){m.user=e[d].scope.name;m.userId=e[d].scope.id;m.index=h;var c=false;for(var b=0;b<multiAccountUsers.length;b++){if(multiAccountUsers[b].userId==m.userId){c=true}}if(!c){multiAccountUsers.push(m)}}}}}}}if(multiAccountUsers.length>1){sendMA2Ext(multiAccountUsers)}}}});multiAccountIndex++}var messageToSend="";function addContactsToCircle(b,e,c){var a="[[";for(var d=0;d<b.length;d++){if(d>0){a+=","}a+='[[null,null,"'+b[d]+'"],"",[]]'}a+="]]";$.post("https://plus.google.com/_/socialgraph/mutate/modifymemberships/",'a=[[["'+e+'"]]]&m='+a+"&at="+gplustoken+"&r=[[]]",function(){openAlert("Contacts added",messageToSend)},"text");messageToSend=b.length+" contacts have been added to the "+c+" circle."}function getGplusToken(a){$.ajax({type:"GET",url:"https://plus.google.com/me",dataType:"html",timeout:function(){console.log("TIMEOUT getToken !!!!")},success:function(b){this_pattern=/csi","[a-zA-Z0-9_\-]+:\d{13,}"/gm;this_pattern2=/"plus.google.com",["[0-9]+"]/gm;gplustoken=this_pattern.exec(b);myId=this_pattern2.exec(b);if(myId){myId=myId[0];myId=myId.replace(/"plus.google.com",\["/g,"");myId=myId.replace(/"\]/g,"");a()}if(gplustoken){gplustoken=gplustoken[0];gplustoken=gplustoken.replace(/csi","/g,"");gplustoken=gplustoken.replace(/"/g,"");a()}}})}function importCircle(b){getGplusToken(function(){});var a=circleUrl[0]+b+circleUrl[1];$.ajax({url:a,beforeSend:function(c){c.overrideMimeType("text/plain;")},context:document.body,error:function(c,e,d){sendDataError2Ext(e,c.responseText)},timeout:5000,success:function(h){circles=new Array();members=new Array();var n=normalizeGJson(h.substring(5));var o=n[0][1];var c=n[0][2];for(var l=0;l<o.length;l++){var d=new Circle();d.code=o[l][0][0];d.name=o[l][1][0];d.members=new Array();if(d.code!=blockedCircleId){circles.push(d)}}for(var l=0;l<c.length;l++){var g=new Contact();g.code=c[l][0][2];g.img=c[l][2][8];if(g.img!=null){if(g.img.indexOf("http")<0){g.img="https:"+g.img}}g.name=c[l][2][0];var m=new Array();for(var f=0;f<c[l][3].length;f++){m.push(c[l][3][f][2]);for(var e=0;e<circles.length;e++){if(circles[e].code==c[l][3][f][2]){circles[e].members.push(g)}}}g.circles=m;members.push(g)}sendData2Ext(JSON.stringify(circles),JSON.stringify(members));if(waiting4Circle!=undefined&&waiting4Circle==true){populateCirclesToAddPeople()}}})}function sendData2Ext(b,a){chrome.extension.sendRequest({action:"sendData",circles:b,members:a})}function sendPerformed(c,d,b,a){chrome.extension.sendRequest({action:"performed",time:d,members:c,partial:b,circleCode:a})}function sendNotPerformed(){chrome.extension.sendRequest({action:"notperformed"})}function sendMA2Ext(a){chrome.extension.sendRequest({action:"multiAccount",users:a})}function sendDataError2Ext(b,a){chrome.extension.sendRequest({action:"sendDataError",text:b,error:a})}function normalizeGJson(json){while(json!=json.replace(/\s\[/g,"[")){json=json.replace(/\s\[/g,"[")}while(json!=json.replace(/\s\]/g,"]")){json=json.replace(/\s\]/g,"]")}while(json!=json.replace(/\s\"/g,'"')){json=json.replace(/\s\"/g,'"')}while(json!=json.replace(/\s,/g,",")){json=json.replace(/\s,/g,",")}while(json!=json.replace(/\s$/g,"")){json=json.replace(/\s$/g,"")}return eval(json)}function normalizeGJsonMA(json){while(json!=json.replace(/\s\[/g,"[")){json=json.replace(/\s\[/g,"[")}while(json!=json.replace(/\s\]/g,"]")){json=json.replace(/\s\]/g,"]")}while(json!=json.replace(/\s\"/g,'"')){json=json.replace(/\s\"/g,'"')}while(json!=json.replace(/\s,/g,",")){json=json.replace(/\s,/g,",")}while(json!=json.replace(/\s$/g,"")){json=json.replace(/\s$/g,"")}while(json!=json.replace(/\\n/g,"")){json=json.replace(/\\n/g,"")}while(json!=json.replace(/\\"/g,'"')){json=json.replace(/\\"/g,'"')}while(json!=json.replace(/"{/g,"{")){json=json.replace(/"{/g,"{")}while(json!=json.replace(/}"/g,"}")){json=json.replace(/}"/g,"}")}while(json!=json.replace(/"11"/g,'"firstObj"')){json=json.replace(/"11"/g,'"firstObj"')}return eval("{"+json+"}")}var dispatchMouseEvent=function(b,c){var a=document.createEvent("MouseEvents");a.initEvent.apply(a,Array.prototype.slice.call(arguments,1));b.dispatchEvent(a)};var CPIframe=null;var scrollDiv=null;var scrollDivHeight=0;var currentScroll=0;var selectedMembers;function launchSelection(c,d,b,a){CPIframe=null;selectedMembers=JSON.parse(c);$("iframe").each(function(f){var e=$(this).attr("src");if(e!=null){if(e.indexOf("contactPicker")>-1){if($(this).width()>0){CPIframe=$(this);CPIframe.contents().find("."+classScrollDiv).each(function(g){scrollDivHeight=$(this).height();scrollDiv=$(this)[0];$(this).scroll(function(){pickVisibleContacts()})})}}}});if(CPIframe!=null&&CPIframe!=undefined){scrollDiv.scrollTop=0;pickVisibleContacts();scrollTheDiv(scrollDiv);CPIframe.attr("gnc","true");sendPerformed(c,d,b,a)}else{if($("."+myCirclesContainer).length>0){cont=$("."+myCirclesContainer)[0];scrollDiv=$(cont).parent()[0];scrollDiv.scrollTop=100;pickVisibleContactsInMyCircles(cont);$(scrollDiv).scroll(function(){pickVisibleContactsInMyCircles(cont)});scrollTheDiv(scrollDiv);sendPerformed(c,d,b,a)}else{sendNotPerformed()}}}function pickVisibleContacts(){CPIframe.contents().find("."+classUnselected).each(function(a){for(var b=0;b<selectedMembers.length;b++){if(parseInt($(this).attr("oid"))==parseInt(selectedMembers[b])){dispatchMouseEvent($(this)[0],"mousedown",true,true);dispatchMouseEvent($(this)[0],"mouseup",true,true)}}})}function pickVisibleContactsInMyCircles(a){$(a).contents().find("."+myCirclesContact).each(function(b){if(!$(this).hasClass(myCirclesSelectedContact)){for(var c=0;c<selectedMembers.length;c++){if(parseInt($(this).attr("oid"))==parseInt(selectedMembers[c])){dispatchMouseEvent($(this)[0],"mousedown",true,true);dispatchMouseEvent($(this)[0],"mouseup",true,true)}}}})}var scrollTimer;var lastScroll;function scrollTheDiv(a){a.scrollTop+=200;if(a.scrollTop!=lastScroll){scrollTimer=setTimeout("scrollTheDiv(scrollDiv)",50)}else{clearTimeout(scrollTimer)}lastScroll=a.scrollTop}function getIFrame(){var b=document.getElementsByTagName("iframe");for(var a=0;a<b.length;a++){if(b[a].getAttribute("gnc")=="true"){return b[a]}}};