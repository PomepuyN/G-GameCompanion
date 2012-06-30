/*!
 * jQuery Tools v1.2.6 - The missing UI library for the Web
 * 
 * tooltip/tooltip.js
 * 
 * NO COPYRIGHTS OR LICENSES. DO WHAT YOU LIKE.
 * 
 * http://flowplayer.org/tools/
 * 
 */
(function(f){f.tools=f.tools||{version:"v1.2.6"},f.tools.tooltip={conf:{effect:"toggle",fadeOutSpeed:"fast",predelay:0,delay:30,opacity:1,tip:0,fadeIE:!1,position:["top","center"],offset:[0,0],relative:!1,cancelDefault:!0,events:{def:"mouseenter,mouseleave",input:"focus,blur",widget:"focus mouseenter,blur mouseleave",tooltip:"mouseenter,mouseleave"},layout:"<div/>",tipClass:"tooltip"},addEffect:function(b,j,i){e[b]=[j,i]}};var e={toggle:[function(j){var i=this.getConf(),l=this.getTip(),k=i.opacity;k<1&&l.css({opacity:k}),l.show(),j.call()},function(b){this.getTip().hide(),b.call()}],fade:[function(a){var d=this.getConf();!f.browser.msie||d.fadeIE?this.getTip().fadeTo(d.fadeInSpeed,d.opacity,a):(this.getTip().show(),a())},function(a){var d=this.getConf();!f.browser.msie||d.fadeIE?this.getTip().fadeOut(d.fadeOutSpeed,a):(this.getTip().hide(),a())}]};function h(a,p,o){var n=o.relative?a.position().top:a.offset().top,m=o.relative?a.position().left:a.offset().left,l=o.position[0];n-=p.outerHeight()-o.offset[0],m+=a.outerWidth()+o.offset[1],/iPad/i.test(navigator.userAgent)&&(n-=f(window).scrollTop());var k=p.outerHeight()+a.outerHeight();l=="center"&&(n+=k/2),l=="bottom"&&(n+=k),l=o.position[1];var j=p.outerWidth()+a.outerWidth();l=="center"&&(m-=j/2),l=="left"&&(m-=j);return{top:n,left:m}}function g(D,C){var B=this,A=D.add(B),z,y=0,x=0,w=D.attr("title"),v=D.attr("data-tooltip"),u=e[C.effect],t,s=D.is(":input"),c=s&&D.is(":checkbox, :radio, select, :button, :submit"),b=D.attr("type"),a=C.events[b]||C.events[s?c?"widget":"input":"def"];if(!u){throw'Nonexistent effect "'+C.effect+'"'}a=a.split(/,\s*/);if(a.length!=2){throw"Tooltip: bad events configuration for "+b}D.bind(a[0],function(d){clearTimeout(y),C.predelay?x=setTimeout(function(){B.show(d)},C.predelay):B.show(d)}).bind(a[1],function(d){clearTimeout(x),C.delay?y=setTimeout(function(){B.hide(d)},C.delay):B.hide(d)}),w&&C.cancelDefault&&(D.removeAttr("title"),D.data("title",w)),f.extend(B,{show:function(d){if(!z){v?z=f(v):C.tip?z=f(C.tip).eq(0):w?z=f(C.layout).addClass(C.tipClass).appendTo(document.body).hide().append(w):(z=D.next(),z.length||(z=D.parent().next()));if(!z.length){throw"Cannot find tooltip for "+D}}if(B.isShown()){return B}z.stop(!0,!0);var j=h(D,z,C);C.tip&&z.html(D.data("title")),d=f.Event(),d.type="onBeforeShow",A.trigger(d,[j]);if(d.isDefaultPrevented()){return B}j=h(D,z,C),z.css({position:"absolute",top:j.top,left:j.left}),t=!0,u[0].call(B,function(){d.type="onShow",t="full",A.trigger(d)});var i=C.events.tooltip.split(/,\s*/);z.data("__set")||(z.unbind(i[0]).bind(i[0],function(){clearTimeout(y),clearTimeout(x)}),i[1]&&!D.is("input:not(:checkbox, :radio), textarea")&&z.unbind(i[1]).bind(i[1],function(k){k.relatedTarget!=D[0]&&D.trigger(a[1].split(" ")[0])}),C.tip||z.data("__set",!0));return B},hide:function(d){if(!z||!B.isShown()){return B}d=f.Event(),d.type="onBeforeHide",A.trigger(d);if(!d.isDefaultPrevented()){t=!1,e[C.effect][1].call(B,function(){d.type="onHide",A.trigger(d)});return B}},isShown:function(d){return d?t=="full":t},getConf:function(){return C},getTip:function(){return z},getTrigger:function(){return D}}),f.each("onHide,onBeforeShow,onShow,onBeforeHide".split(","),function(d,i){f.isFunction(C[i])&&f(B).bind(i,C[i]),B[i]=function(j){j&&f(B).bind(i,j);return B}})}f.fn.tooltip=function(a){var d=this.data("tooltip");if(d){return d}a=f.extend(!0,{},f.tools.tooltip.conf,a),typeof a.position=="string"&&(a.position=a.position.split(/,?\s/)),this.each(function(){d=new g(f(this),a),f(this).data("tooltip",d)});return a.api?d:this}})(jQuery);