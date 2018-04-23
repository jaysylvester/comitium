window.CF={},CF.immediate=function(){"use strict";return{init:{init:function(){document.querySelector("html").classList.add("js")}}.init}}(CF),CF.immediate.init();
CF.global=function(){"use strict";var c={init:function(){var e,n,t=document.querySelector("body"),i=0,s=document.querySelector("body > header"),o=s.querySelector("nav ul.account");window.addEventListener("scroll",function(){i>t.getBoundingClientRect().top&&Math.abs(t.getBoundingClientRect().top)>s.getBoundingClientRect().height&&!t.classList.contains("floating-header")?t.classList.add("floating-header"):(t.getBoundingClientRect().top>=i||Math.abs(t.getBoundingClientRect().top)<=s.getBoundingClientRect().height)&&t.classList.remove("floating-header"),i=t.getBoundingClientRect().top}),(n=document.createElement("div")).setAttribute("id","main-menu-icon"),n.innerHTML='<svg class="icon menu"><use xlink:href="themes/default/images/symbols.svg#icon-menu"></use></svg>',n.appendChild(document.createTextNode("Menu")),s.insertBefore(n,s.querySelector("a.home")),c.menu({menu:"header nav",trigger:"#main-menu-icon",position:"left"}),600<=document.body.clientWidth&&(o.addEventListener("mouseleave",function(){e=setTimeout(function(){o.classList.remove("active")},500)},!1),o.addEventListener("mouseover",function(){e&&clearTimeout(e)}),s.classList.contains("authenticated")&&(s.querySelector("a.account").addEventListener("click",function(e){600<=document.body.clientWidth&&e.preventDefault(),o.classList.contains("active")?o.classList.remove("active"):o.classList.add("active")}),window.addEventListener("scroll",function(){o.classList.contains("active")&&o.classList.remove("active")})))},collapseQuotes:function(){for(var e=document.body.querySelectorAll("section.content > blockquote"),n=function(n){var t=document.createElement("a");t.setAttribute("href","#"),t.classList.add("expand"),t.innerHTML="Expand",t.addEventListener("click",function(e){e.preventDefault(),n.classList.toggle("expanded"),"Expand"===t.innerHTML?t.innerHTML="Collapse":t.innerHTML="Expand"}),n.classList.add("nested"),n.appendChild(t)},t=0;t<e.length;t++)e[t].querySelector("blockquote")&&n(e[t])},menu:function(t){var i,s=document.querySelector("body");document.querySelector(t.trigger).addEventListener("click",function(){var e=document.querySelector(t.menu),n=document.createElement("div");i=e.cloneNode(!0),s.appendChild(i),n.className="menu-shadow",s.appendChild(n),!1===t.keepClass?i.className="slide-menu "+t.position:i.className+=" slide-menu "+t.position,s.classList.contains("menu-open")?(s.classList.remove("menu-open"),i.classList.remove("open"),s.classList.add("menu-closing"),setTimeout(function(){s.classList.remove("menu-closing")},200)):(s.classList.add("menu-opening"),setTimeout(function(){s.classList.remove("menu-opening"),s.classList.add("menu-open"),i.classList.add("open")},200)),n.addEventListener("click",function(){s.classList.remove("menu-open"),i.classList.remove("open"),s.classList.add("menu-closing"),setTimeout(function(){s.classList.remove("menu-closing"),s.removeChild(n),null!==i.parentNode&&s.removeChild(i)},200)},!1)},!1)}};return{collapseQuotes:c.collapseQuotes,init:c.init,menu:c.menu}}(CF);
CF.init=function(){"use strict";var t=document.getElementsByTagName("body")[0],e=t.getAttribute("data-controller"),i=t.getAttribute("data-action"),n=t.getAttribute("data-view");CF.global.init(),CF[e]&&(CF[e].init(),CF[e][i]&&"function"==typeof CF[e][i]&&(CF[e][i](),CF[e][i][n]&&CF[e][i][n]()))},document.onreadystatechange=function(){"use strict";"interactive"===document.readyState&&CF.init()};
CF.post=function(){"use strict";var t={init:function(){CF.global.collapseQuotes()},topic:function(){CF.topic.handler()}};return{init:t.init,topic:t.topic}}(CF);
CF.topic=function(){"use strict";var e,t;return e={handler:function(){var i,e=document.querySelector("#quick-reply-form");e&&!e.parentNode.classList.contains("quote")&&t.postContent(),720<=document.body.clientWidth&&((i=document.createElement("div")).setAttribute("id","mask"),document.body.appendChild(i),document.querySelectorAll("section.posts article.post section.content.post p > img, section.posts article.post section.content.post > img").forEach(function(e){var t=document.createElement("span"),n=document.createElement("span"),s=document.createElement("span"),o=e.parentNode,a=e.getAttribute("src");t.classList.add("zoom"),n.classList.add("zoom-image"),t.appendChild(n),o.appendChild(t),o.insertBefore(t,e),s.classList.add("zoom-button"),s.innerHTML='<svg class="icon zoom-in"><use xlink:href="themes/default/images/symbols.svg#icon-zoom-in"></use></svg>',n.appendChild(e),n.appendChild(s),n.addEventListener("click",function(){i.innerHTML='<div id="mask-close"><svg class="icon close"><use xlink:href="themes/default/images/symbols.svg#icon-close"></use></svg></div><img src="'+a+'"><a class="open-tab" href="'+a+'" target="_blank">'+a+'<svg class="icon arrow-up-right"><use xlink:href="themes/default/images/symbols.svg#icon-arrow-up-right"></use></svg></a>',document.querySelector("html").classList.add("mask-enabled"),i.classList.add("enabled"),i.querySelector("#mask-close").addEventListener("click",function(){i.classList.add("closing"),document.querySelector("html").classList.remove("mask-enabled"),setTimeout(function(){i.classList.remove("closing","enabled"),i.innerHTML=""},200)})})}))},start:function(){t.postContent()},reply:function(){var e=document.querySelector("#topic-reply-form");e&&!e.parentNode.classList.contains("quote")&&t.postContent()}},{init:(t={init:function(){CF.global.collapseQuotes()},postContent:function(){var e=document.getElementById("post-content"),t=e?e.value:"";e&&(e.addEventListener("focus",function(){e.value===t&&(e.value="")}),e.addEventListener("blur",function(){""===e.value&&(e.value=t)}))}}).init,handler:e.handler,start:e.start,startPrivate:e.start,startAnnouncement:e.start,reply:e.reply}}(CF),CF.announcement=CF.topic;
CF.user=function(){"use strict";return{init:{init:function(){CF.global.collapseQuotes()}}.init}}(CF);
!function(){if("undefined"!=typeof window&&window.addEventListener){var e,h=Object.create(null),t=function(){clearTimeout(e),e=setTimeout(n,100)},w=function(){},f=function(){if(window.addEventListener("resize",t,!1),window.addEventListener("orientationchange",t,!1),window.MutationObserver){var e=new MutationObserver(t);e.observe(document.documentElement,{childList:!0,subtree:!0,attributes:!0}),w=function(){try{e.disconnect(),window.removeEventListener("resize",t,!1),window.removeEventListener("orientationchange",t,!1)}catch(e){}}}else document.documentElement.addEventListener("DOMSubtreeModified",t,!1),w=function(){document.documentElement.removeEventListener("DOMSubtreeModified",t,!1),window.removeEventListener("resize",t,!1),window.removeEventListener("orientationchange",t,!1)}},v=function(e){function t(e){if(void 0!==e.protocol)var t=e;else(t=document.createElement("a")).href=e;return t.protocol.replace(/:/g,"")+t.host}if(window.XMLHttpRequest){var n=new XMLHttpRequest,o=t(location);e=t(e),n=void 0===n.withCredentials&&""!==e&&e!==o?XDomainRequest||void 0:XMLHttpRequest}return n},n=function(){function o(){0===--u&&(w(),f())}function e(e){return function(){!0!==h[e.base]&&(e.useEl.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","#"+e.hash),e.useEl.hasAttribute("href")&&e.useEl.setAttribute("href","#"+e.hash))}}function t(n){return function(){var e=document.body,t=document.createElement("x");n.onload=null,t.innerHTML=n.responseText,(t=t.getElementsByTagName("svg")[0])&&(t.setAttribute("aria-hidden","true"),t.style.position="absolute",t.style.width=0,t.style.height=0,t.style.overflow="hidden",e.insertBefore(t,e.firstChild)),o()}}function n(e){return function(){e.onerror=null,e.ontimeout=null,o()}}var i,r,u=0;w();var s=document.getElementsByTagName("use");for(r=0;r<s.length;r+=1){try{var d=s[r].getBoundingClientRect()}catch(e){d=!1}var a=(i=s[r].getAttribute("href")||s[r].getAttributeNS("http://www.w3.org/1999/xlink","href")||s[r].getAttribute("xlink:href"))&&i.split?i.split("#"):["",""],l=a[0];a=a[1];var c=d&&0===d.left&&0===d.right&&0===d.top&&0===d.bottom;d&&0===d.width&&0===d.height&&!c?(s[r].hasAttribute("href")&&s[r].setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",i),l.length&&(!0!==(i=h[l])&&setTimeout(e({useEl:s[r],base:l,hash:a}),0),void 0===i&&(void 0!==(a=v(l))&&(i=new a,(h[l]=i).onload=t(i),i.onerror=n(i),i.ontimeout=n(i),i.open("GET",l),i.send(),u+=1)))):c?l.length&&h[l]&&setTimeout(e({useEl:s[r],base:l,hash:a}),0):void 0===h[l]?h[l]=!0:h[l].onload&&(h[l].abort(),delete h[l].onload,h[l]=!0)}s="",u+=1,o()},o=function(){window.removeEventListener("load",o,!1),e=setTimeout(n,0)};"complete"!==document.readyState?window.addEventListener("load",o,!1):o()}}();
//# sourceMappingURL=site.js.map
