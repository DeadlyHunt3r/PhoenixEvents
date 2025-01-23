/*!
 * $Id: app.js 2024-08-27 10:26:32 +0200 Stefan S  058a8fc08689b51ee7c72e94d1a8ca969cf37b35 $
 * Copyright Zeta Software GmbH
 */
/* jshint strict: false, mgetparultistr: true, smarttabs:true, jquery:true, devel:true */

document.documentElement.className = document.documentElement.className.replace(/no-js/g, 'js');

var nualc = navigator.userAgent.toLowerCase();

$z.support.placeholder = (function(){
    var i = document.createElement('input');
    return 'placeholder' in i;
})();
$z.support.IntersectionObserver = 'IntersectionObserver' in window;
$z.support.beforeprint = 'onbeforeprint' in window;

var isDebug = false;
$z.migrateMute = true;
if (document.getElementsByTagName("html")[0].getAttribute("data-zpdebug") == "true") {
  isDebug = true;
  $z.migrateMute = false;
}
// logs to the browser-console with a timestamp
function setDebug(isDebug=false) {		
		var timestamp = function(){};
		timestamp.toString = function(){
			var ts = new Date();
			var pad = "000";
			var ms = ts.getMilliseconds().toString();
			var timestamp = ts.toLocaleTimeString("de-DE") + "." + pad.substring(0,pad.length - ms.length) + ms + ": ";

			return timestamp;    
		};
		
		if (isDebug) {
			window.debug = {
			  log:   window.console.log.bind(window.console, '%s', timestamp),
			  error: window.console.error.bind(window.console, '%s', timestamp),
			  info:  window.console.info.bind(window.console, '%s', timestamp),
			  warn:  window.console.warn.bind(window.console, '%s', timestamp)
			};
		} else {
			var __no_op = function() {};

			window.debug = {
			  log: __no_op,
			  error: __no_op,
			  warn: __no_op,
			  info: __no_op
			}
		}
}
setDebug(isDebug);

// display nice notifications in a lightbox
function zpalert(oArg={}){
	var title =  oArg.hasOwnProperty('title') ? oArg.title : 'Hinweis';
	var text =   oArg.hasOwnProperty('text') ? oArg.text : 'Ein Fehler ist aufgetreten!';
	var button = oArg.hasOwnProperty('button') ? oArg.button : true;
	var icon =   oArg.hasOwnProperty('icon') ? oArg.icon : 'info';
	
	var iconEl = "";
	
	switch ( icon ) {
		case "info":
			iconEl = '<i class="fa fa-exclamation-circle" aria-hidden="true"></i> ';
			break;
		
		case "warning":
			iconEl = iconEl = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>';
			break;
		
		default:
			iconEl = '<i class="fa ' + faiconclass + '" aria-hidden="true"></i>';
	}
	
	var buttonEl = "";
	if ( button ){
		buttonEl = '<a href="#" class="button primary closezpalert"><span>OK</span></a>';
	}
	var titleEl = "";
	if ( title ){
		titleEl = '<h3 style="margin: 0 0 1rem 0;">' + iconEl + title + '</h3>';
	}
	$z.fancybox(
		'<div class="zpalert" style="min-width: 320px; box-sizing: border-box;">\
			' + titleEl + '<p>' + text + '</p><p class="buttons" style="text-align: right;">' + buttonEl + '</p>\
		</div>',
		{
			'showCloseButton'	: false,
			'autoDimensions'	: true,
			'width'         	: 'auto',
			'height'        	: 'auto',
			'transitionIn'		: 'fade',
			'transitionOut'		: 'fade',
			'padding'			: 20,
			'opacity'			: false,
			'overlayColor'		: '#000',
			'overlayOpacity'	: 0.7,
			'onComplete'		: function(){
				$z('.closezpalert').on('click', function(e){
					e.preventDefault();
					e.stopPropagation();
					$z.fancybox.close();
				});
			},
			'onStart'			:function(){
				$z('#fancybox-content').css('background', '#fff').css('color','#333');
			}
		}
	);
}

// function to preload images
function zpPreloadImage(url)
{
    var img=new Image();
    img.src=url;
}

// add classes to nav menus which help to decide wether hierarchies collapse left or right
function zpIsLeftOrRight(navselector){
	navselector = typeof navselector !== 'undefined' ? navselector : "ul.nav > li";
	$z(navselector).each(function(i,o){
		var current = $z(this);
		var elwidth = current.width();
		var elleft = current.offset().left;
		var elmiddle = elleft + (elwidth / 2);
		var helperClass = "zpisleft";
		
		if ( elmiddle >= $z(document).width()/2 ){
			helperClass = "zpisright";
		}
		current.removeClass('zpisleft zpisright');
		current.addClass(helperClass);
	});
}

// get a parameter from the querystring by name
function zpGetParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
// add or update a QueryString Parameter in a URL
function zpUpdateQueryStringParameter(uri, key, value) {
	var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
	var separator = uri.indexOf('?') !== -1 ? "&" : "?";
	if (uri.match(re)) {
		// update parameter
		return uri.replace(re, '$1' + key + "=" + value + '$2');
	}
	else {
		// add parameter
		if ( typeof(value) !== "undefined" && value !== "" ){
			return uri + separator + key + "=" + value;
		}
	}
}

function zpTextOverflow(e, filler){
	filler = typeof filler !== 'undefined' ? filler : "…";
	
	$z(e).each(function(d){
		var wordcount = 0;
		var nodes = $z(this).find("*");
		var nodecount = nodes.length;
		var done = false;
		
		while ( !done && $z(this).overflown() && nodecount >= 0 ){
			//console.log(Date.now() + " Article No.:" + d + " Nodecount: " + nodecount);
			if ( nodecount > 0 ){
				var chtml = $z(nodes).eq(nodecount-1).html();
				var target = $z(nodes).eq(nodecount-1);
			}
			else{
				var chtml = $z(this).html();
				var target = $z(this);
			}
			var words = chtml.split(" ");
			
			for (i = words.length; i >= 0; i--){
				if ( i == words.length ){ // only runs this in the first iteration of the for loop
					// schnell an die richtige Wortanzahl rantasten, wenn mehr als 7 wörter durschsucht werden müssen.
					while ( i >=2 && $z(this).overflown() ){
						i = parseInt(i / 2);
						//console.log("    " + Date.now() + " Wordsestimate: " + i);
						$z(target).html(words.slice(0,i).join(" ") + filler);
					}
					i = i * 2;
				}
				//console.log("    Wordcount: " + i );
				if ( i > 0 ) {
					$z(target).html(words.slice(0,i).join(" ") + filler);
				}
				else{
					$z(target).remove();
				}
				if (!$z(this).overflown()){
					done = true;
					break;
				}
			}
			nodecount--;
		}
	});
};

//
// Debounce calls to "callback" routine so that multiple calls
// made to the event handler before the expiration of "delay" are
// coalesced into a single call to "callback". Also causes the
// wait period to be reset upon receipt of a call to the
// debounced routine.
//
function zpdebounce(delay, callback) {
    if (typeof(delay)==='undefined') delay = 250;
    var timeout = null;
    return function () {
        //
        // if a timeout has been registered before then
        // cancel it so that we can setup a fresh timeout
        //
        if (timeout) {
            clearTimeout(timeout);
        }
        var args = arguments;
        timeout = setTimeout(function () {
            callback.apply(null, args);
            timeout = null;
        }, delay);
    };
}
//
// Throttle calls to "callback" routine and ensure that it
// is not invoked any more often than "delay" milliseconds.
// http://blogorama.nerdworks.in/javascriptfunctionthrottlingan/
//
function zpthrottle(delay, callback) {
	if (typeof(delay)==='undefined') delay = 250;
    var timeout = null;
    var previousCall = new Date().getTime();
    return function() {
        var time = new Date().getTime();

        //
        // if "delay" milliseconds have expired since
        // the previous call then propagate this call to
        // "callback"
        //
        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
            
             // make sure callback is called again in case event ended before timer elapsed
	    	if (timeout) {
				clearTimeout(timeout);
			}
			timeout = setTimeout(function () {
				callback.apply(null, arguments);
				timeout = null;
			}, delay);
        }
    };
}

function trace(s) {
  try { console.log(s); } catch (e) { alert(s); }
}

// test for touch device
function is_touch_device() {
	if ( $("html").attr("data-whatintent") == "mouse" ){
		var touch = false;
	}
	else if( $("html").attr("data-whatintent") == "touch" ){
		var touch = true;
	}
	else{
	    // in the responsive preview, we set the touch class manually, so we also need to check tor that, so we can simulate
		var touch = 'ontouchstart' in window || navigator.maxTouchPoints || $z('body').hasClass('touch');
	}
	
	return touch;
}


// Helper for Nav-Menues with hover effects to make them work via alternating clicks
// 1st Click will open the Submenues, 2nd Click will load the link associated with the clicked element
function hoverToClickMenu(element, breakpointMobileMenu, instancenumber, triangleMode) { 
	//var listenEvent = 'ontouchend' in document.documentElement ? "touchend" : "click";
	var listenEvent = "click";
		
	// The stock browser on Android 4.X can't cancel touchend events and will thus always fire an additional click event, so we need to revert to click events StS 2015-02-24
	if ( nualc.indexOf("android 4") > -1 && nualc.indexOf("chrome") === -1 ) {
		listenEvent = "click";
	}
	
	/* clean up added styles after the user resizes the browser window and might reach desktop resolution */
	if ( instancenumber == 1 && (breakpointMobileMenu !== undefined || triangleMode)  ) {
			var menuResizeTimer;
			
			var clearAddedStyles = function(){
				if( $z('#nav.on, nav.on').length > 0 ){
					// skip if mobile menu us currently shown, so it is not dismissed when scrolling
					// https://community.zeta-producer.com/thread/19257-mobiles-menü-klappt-zu/
					return;
				}
				if (  triangleMode || $z(window).width() > parseInt(breakpointMobileMenu) ){					
					$z(".hoverToClickMenuAdded").children("ul").css({'display' : '', 'visibility' : ''});
					$z(".hoverToClickMenuAdded").removeClass("clicked").removeClass("open").removeClass("hoverToClickMenuAdded");
				}
			};
			
			$z(window).on("resize", function(e) {
				clearTimeout(menuResizeTimer);
				menuResizeTimer = setTimeout(clearAddedStyles, 250);
			});
	}

	var firstClick = function(element, event) {
		var event = event || window.event;
		var mobileMenu = false;
		if ( breakpointMobileMenu !== undefined && $z(window).width() <= parseInt(breakpointMobileMenu) ){
			triangleMode = true;
			mobileMenu = true;
		}
		else if ( !is_touch_device() && breakpointMobileMenu !== undefined && listenEvent == "click" && $z(window).width() > parseInt(breakpointMobileMenu) ) {
			// we're NOT displaying a mobile menu on non-touch devices, so return and don't modify the click behavior
			return true;
		}
		
		if ( triangleMode ){
			if ( (event.pageX - $z(element).offset().left) <= parseInt($z(element).css("padding-left")) || (event.pageX - $z(element).offset().left) > (parseInt($z(element).css("padding-left")) + $z(element).width() -6) ){
				// user clicked on triangle to the left or right of a link
				var hasVisibleChilds = $z(element).parent().children("ul").css("display") == "block" && $z(element).parent().children("ul").css("visibility") == "visible";
				//var hasVisibleChilds = $z(element).parent().children("ul").is(":visible") && $z(element).parent().children("ul").css("visibility") !== "hidden";
				if ( hasVisibleChilds && ($z(element).parent().hasClass("open") ||  $z(element).parent().hasClass("active")) ){
					$z(element).attr('aria-expanded', 'false');
					$z(element).parent().removeClass("clicked").removeClass("open").addClass("closed");
					$z(element).parent().children("ul").css({'display' : 'none', 'visibility' : ''});
					
					// remove manually set classes and styles on mouseout, so a consecutive mouseover on non touch devices will trigger the open state again
					if ( !is_touch_device() ){
						$z(element).parent().prevAll(".clicked").off("mouseleave.nav");
						$z(element).parent().off("mouseleave.nav");
						$z(element).parent().on("mouseleave.nav", function(e){
							// return if mobile menu is active
							if ( $z(element).parents("nav.on").length || $z(element).parents("#nav.on").length || mobileMenu ){
								//console.log("Mobile menu is didplayed. Returning early. breakpointMobileMenu: " + breakpointMobileMenu);
								return;
							}
							$z(element).parent().removeClass("hoverToClickMenuAdded").removeClass("clicked").removeClass("open").removeClass("closed");
							$z(element).parent().children("ul").css({'display' : '', 'visibility' : ''});
						});
					}
				}
				else{
					$z(element).attr('aria-expanded', 'true');
					$z(element).parent().addClass("hoverToClickMenuAdded").removeClass("closed").addClass("clicked").addClass("open");
					$z(element).parent().children("ul").css({'display' : 'block', 'visibility' : 'visible'});
				}
				event.preventDefault();
				return false;
			}	
			else{
				// user clicked directly on link, so we load the url immediately
				return true;
			}
		}
		else{
			var otherMenus = $z(element).parent().prevAll(".clicked").add($z(element).parent().nextAll(".clicked"));
			otherMenus.removeClass("clicked").removeClass("open");
			otherMenus.find("ul").css({'display' : '', 'visibility' : ''});
			otherMenus.find(".clicked").removeClass("clicked");
			otherMenus.find(".open").removeClass("open");
			otherMenus.find(".hoverToClickMenuAdded").removeClass("hoverToClickMenuAdded");
			var hasVisibleChilds = $z(element).parent().children("ul").css("display") == "block" && $z(element).parent().children("ul").css("visibility") == "visible";
		
			if ( $z(element).parent().hasClass("clicked") || hasVisibleChilds ){ // TODO ZP13 check layouts for incompatibilities due to commenting out this: || ($z(element).parent().children("xul").css("display") == "block" && $z(element).parent().children("xul").css("visibility") == "visible") ) {
				// element has been clicked before, so now we fire a click
				return true;
			}
			// element has been clicked for the first time, so we do not fire a click and only show submenues
		
			// add ".open" classname to parent li element so we can style it if we want
			$z(element).parent().addClass("clicked").addClass("open");
			// in case suckerfish is used
			$z(element).parent().children("ul").css({'display' : 'block', 'visibility' : 'visible'});
			return false;
		}
	};
	$z(element).off("click touchend");
	$z(element).on( listenEvent , function(event) {
		var firstClickResult = firstClick($z(this), event);
		if ( !firstClickResult ){
			event.preventDefault();
		}
		return firstClickResult;
	});
}

// For IE8 and earlier version which don't have native support for Date.now.
if (!Date.now) {
  Date.now = function() {
    return new Date().valueOf();
  };
}

// polyfill for array.find (native substitute for underscrote _.find
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if (!Array.prototype.find && Object.defineProperty) {
  Object.defineProperty(Array.prototype, 'find', {
	value: function(predicate) {
	 'use strict';
	 if (this == null) {
	   throw new TypeError('Array.prototype.find called on null or undefined');
	 }
	 if (typeof predicate !== 'function') {
	   throw new TypeError('predicate must be a function');
	 }
	 var list = Object(this);
	 var length = list.length >>> 0;
	 var thisArg = arguments[1];
	 var value;

	 for (var i = 0; i < length; i++) {
	   value = list[i];
	   if (predicate.call(thisArg, value, i, list)) {
		 return value;
	   }
	 }
	 return undefined;
	}
  });
}

// lets us define css classes which only apply after all assets are loaded
window.addEventListener("load", (event) => {
	document.body.classList.add("loaded");
});

// helper for pseudo masonrty layout via css columns
function getColumnsNumber(el){
    var $el = $(el),
        width = $el.innerWidth(),
        paddingLeft, paddingRight, columnWidth, columnGap, columnsNumber;

    paddingLeft = parseInt( $el.css('padding-left'), 10 );
    paddingRight = parseInt( $el.css('padding-right'), 10 );

    $.each(['-webkit-','-moz-',''], function(i, prefix){
        var _width = parseInt( $el.css(prefix+'column-width'), 10 );
        var _gap =   parseInt( $el.css(prefix+'column-gap'), 10 );
        if (!isNaN(_width)) columnWidth = _width;
        if (!isNaN(_gap))   columnGap = _gap;
    });

    columnsNumber = Math.floor( (width - paddingLeft - paddingRight) / (columnWidth + columnGap) );
    if (isNaN(columnsNumber) || columnsNumber < 1) columnsNumber = 1;
    return columnsNumber;
}
function reorderMasonry(el){
	function sortByOrder(a, b) {
	  const startA = parseInt($(a).data('order')) || Number.MAX_VALUE;
	  const startB = parseInt($(b).data('order')) || Number.MAX_VALUE;
	  return startA === startB ? 0 : startA > startB ? 1 : -1;
	}
	
	var   _wrapper = $z(el),
		  _cards = _wrapper.find(".gallery-item").sort(sortByOrder),
		  //_cols = Number(_wrapper.css("column-count")),
		  _cols = getColumnsNumber(_wrapper),
		  _out = [],
		  _col = 0;

	// if no. of cols hasn't changed, do nothing		  
	if ( _cols == parseInt(_wrapper.attr('data-cols')) ){
		return;
	}
		  
	while(_col < _cols) {
		for (var i = 0; i < _cards.length; i += _cols) {
			var _val = _cards[i + _col];
			if (_val !== undefined)
				_out.push(_val);
		}
		_col++;
	}
	_wrapper.html(_out);
	_wrapper.attr("data-cols", _cols);
}
				
$z(document).ready(function () {
	var url = window.location.href;
	var responsivePreview = false;
	var pvmode = zpGetParameterByName("responsivepreview", url); //url.searchParams.get("responsivepreview");
	if ( pvmode ){
		responsivePreview = true;
		window.location = window.location.origin + "/supplemental-external-previewing/index.html?url=" + url;
		//alert("Responsive-Preview Reload");
	}
	
	if ( $z(".zpgrid").length === 0 ){
		// we have a layout that was not modified for ZP13 i.e. a copied Layout from Version 12.5 or earlier
		// layouts not modified have no div with class .zpgrid, so we append the class to the document body
		$z('.zparea[data-areaname="Standard"], .zparea[data-areaname="Banner"], .zparea[data-areaname="Footer"]').addClass("zpgrid copiedlayout");
	}

	//define some helper css classes
	$z("html").removeClass("no-js");
	$z("html, body").addClass("js");
	// recognize IE (since IE10 doesn't support conditional comments anymore)
	// removed in jQuery 1.9, so be careful!
	if ( $z.browser.msie || !!navigator.userAgent.match(/Trident.*rv\:11\./) ) {
		$z("html").removeClass("notie");
		$z("html").addClass("ie");
		$z("html").addClass("ie" + parseInt($z.browser.version, 10));
	}
	else if( !!navigator.userAgent.match(/Edge\/\d\d/) ){
		$z("html").addClass("edge");
	}
	else if ($z.browser.mozilla){
		$z("html").addClass("mozilla");
	}
	else if ($z.browser.chrome){
		$z("html").addClass("chrome");
	}
	else if ($z.browser.safari && !navigator.appVersion.match(/Chrome\//) ){
		$z("html").addClass("safari");
		if ( navigator.appVersion.match(/version\/(\d+)/i) ){
			$z("html").addClass("safari" + navigator.appVersion.match(/version\/(\d+)/i)[1]);
		}
	}
	
	// detect object-fit css support
	if ( document.createElement("detect").style.objectFit === "" ) {
		$z("body").addClass("objectfit");
	}
	
	// system prefers reduced motion (used i.e. to switch off animations in css)
	if ( window.matchMedia && window.matchMedia( "(prefers-reduced-motion: reduce)" ).matches ){
		$z("body:not(.zppreview)").addClass("zpreducemotion");
	}
	
	// add a top-padding to html5 audio because firefox has a time indicator implemented as a bubble which would be cut off due to our overflow hidden grid system
	if ($z.browser.mozilla){
		$z("audio").animate({paddingTop: '+=12px'}, 0); // we only use .animate() here, as that is a convenient way to be able to add values to (possibly) existing values
	}
	
	if ( is_touch_device() ) {
		// add .touch class to body if we run on a touch device, so we can use the class in css (used e.g. in ONLINE-CMS)
		$z("body").removeClass("notouch");
		$z("body").addClass("touch");
		
		// fix for hover menues (which contain submenues) to make them work on touch devices
		var breakpointmobilemenu = $z(".clickhovermenu").data("breakpointmobilemenu");
		var trianglemode = $z(".clickhovermenu").data("trianglemode") || false;
		$z(".touchhovermenu li:has(li) > a").each(function(i){
			hoverToClickMenu(this, breakpointmobilemenu, i, trianglemode);
		});
	}
	else{
		// In case we want to substitute hover with click menues on non touch devices too
		$z("body").removeClass("touch");
		$z("body").addClass("notouch");
		var breakpointmobilemenu = $z(".clickhovermenu").data("breakpointmobilemenu");
		var trianglemode = $z(".clickhovermenu").data("trianglemode") || false;
		$z(".clickhovermenu li:has(li) > a").each(function(i){
			hoverToClickMenu(this, breakpointmobilemenu, i, trianglemode);
		});
	}
		
	// make sure, the mobile menu is closed, if a link to an article on the same page is clicked
	$z('#nav ul li a:not(#mobilenavtoggle), nav ul li a:not(#mobilenavtoggle), div.nav-collapse ul li a:not(#mobilenavtoggle):not(.btn-navbar)').on('click.closeafterclick', function(e){
	//$('.nav-collapse ul li a').on('click', function(e){
		//console.log("Clicked on nav. defaultPrevented: " + e.isDefaultPrevented() + " ", e);
		if ( !e.isDefaultPrevented() && $z(".btn-navbar[data-toggle], #mobilenavtoggle").is(":visible") ){
			$z('.btn-navbar[data-toggle], #mobilenavtoggle').trigger("click");
		}
	});
	
	// set correct dimensions for breakout elements which in CSS are only approximated due to problems with browsers handling scrollbars differently when using vw/vh
	function setBreakout(){
		var bodyWidth = $z("body").outerWidth();
		// any widget
		$z(".supportsbreakout body:not(.withnews) .zpBreakout:not(.hasNews):not(.zpwBild.left):not(.zpwBild.right)").css("width",bodyWidth+"px").css("padding-left", "0").css("margin-left","calc(-" + bodyWidth/2 + "px + 50% )");
		$z("body.supportsbreakout:not(.withnews) .zpBreakout:not(.hasNews):not(.zpwBild.left):not(.zpwBild.right)").css("width",bodyWidth+"px").css("padding-left", "0").css("margin-left","calc(-" + bodyWidth/2 + "px + 50% )");
		// image widget
		$z(".supportsbreakout body:not(.withnews) .zpColumn.c12 .zpwBild.zpBreakout:not(.hasNews), body.supportsbreakout:not(.withnews) .zpColumn.c12 .zpwBild.zpBreakout:not(.hasNews)").each( function(index, value){
			// adjust css of image wrapper
			$z(this).css("width",bodyWidth+"px").css("padding-left", "0").css("margin-left","calc(-" + bodyWidth/2 + "px + 50% )")
			// set image width to browser-window-width, so it also enlarges if necessary
			$z(this).find('img.singleImage').css('width', bodyWidth + 'px').css('max-width','none');
			// set width of image description to column-width and horizontally center it
			var columnWidth = parseInt($z(this).parent('.zpColumnItem').width()) + "px";
			$z(this).find('.imagedescription').css("max-width", columnWidth).css("margin-left", "auto").css("margin-right", "auto");
		});
	}
	
	setBreakout();
	
	window.focalImages = function(){
		var minScreenWidth = 640; // breakpoint mobil
		
		$z('.zpContainer.zpfocal, img.zpfocal, li.zpfocal, img.zpflexgalfocal').each(function(){
			if ( $z(document).width() > minScreenWidth ){
				//return;
			}
			var imageObject = $z(this);
			//console.log("focalImages() on: ", imageObject);
			
			if ( imageObject[0].complete === false ){
				//console.log("focalImages imageObject incomplete: ", imageObject[0]);
				// image isn't loaded yet and dimensions in the dom are unknown (partent dimensions), so setup a listener for when it is loaded and then set the focal point
				// btw: imageObject[0] converts the jQuery-Object to a plain JS-Object
				imageObject[0].onload = function (){
					//console.log("focalImages imageObject complete: ", imageObject[0]);
					setFocalPoint(imageObject);
				}
			}
			else{
				// image is loaded already or node doesn't suport .complete, so we can set focus point immediately
				setFocalPoint(imageObject);
			}
		});
		
		function setFocalPoint($image){
			// math taken from https://css-tricks.com/focusing-background-image-precise-location-percentages/
			iw = $image.outerWidth();  								// bounding box width of scaled responsive image
			ih = $image.outerHeight(); 								// bounding box height of scaled responsive image
			// for flexbox galeries, we need to take dimensions from the parent
			if ($image.hasClass('zpflexgalfocal')){
				iw = $image.parent().outerWidth();  								// bounding box width of scaled responsive image
				ih = $image.parent().outerHeight(); 		
			}
			
			inw =  parseInt($image.attr("data-image-w")) || 0; 	// bgimage original width
			inh =  parseInt($image.attr("data-image-h")) || 0; 	// bgimage original height
			ifx =  parseInt($image.attr("data-focus-x")) || 50;	// desired focus point X as percentage from original image 
			ify =  parseInt($image.attr("data-focus-y")) || 50;	// desired focus point X as percentage from original image 
			
			scaleH = ih / inh;
			zW = parseFloat( (inw * scaleH) / iw ); 				// horizontal factor for focus as bg-position  
			bgx = zW !== 1 ? ( (ifx - 50) * zW/(zW-1) + 50 ) : ifx;		

			scaleW = iw / inw;
			zH = parseFloat( (inh * scaleW) / ih ); 				// vertical factor for focus as bg-position  
			bgy = zH !== 1 ? ( (ify - 50) * zH/(zH-1) + 50 ) : ify;
		
			//console.log(`bgx: ${bgx} / bgy: ${bgy} / zH: ${zH} / zW: ${zW} / ifx: ${ifx} / ify: ${ify}`);
			//console.log(`Focal image - this.outerWidth: ${iw} / this.outerHeight ${ih} / scaleH/scaleW: ${scaleH}/${scaleW} / bgy/bgy: ${bgx}/${bgy}`);
			
			// auf min. 0 und max. 100 limitieren
			scaledFocusX = parseInt(bgx);
			if ( scaledFocusX > 100 ){
				scaledFocusX = 100;
			}
			if ( scaledFocusX < 0 ){
				scaledFocusX = 0;
			}
			scaledFocusY = parseInt(bgy);
			if ( scaledFocusY > 100 ){
				scaledFocusY = 100;
			}
			if ( scaledFocusY < 0 ){
				scaledFocusY = 0;
			}
			// set inline styles with important to override layout css				
			var crule = scaledFocusX.toString() + "% " + scaledFocusY.toString() + '%';
			//console.log(`Set inline styles (${crule}) for: `, $z($image)[0]);
			//console.log("focalImages() x/y: " + scaledFocusX.toString() + "/" + scaledFocusY.toString() + " - iw/ih: " + iw + "/" + ih + " - complete: " + $image[0].complete, $image);
			$z($image)[0].style.setProperty('background-position', crule, 'important');
			$z($image)[0].style.setProperty('object-position',     crule, 'important');
			
			//console.log("Get inline styles for: ", $z($image)[0].style);		
			//$image.attr('style', "background-position: " + scaledFocusX + "% " + scaledFocusY + "%" + " !important;" + "object-position: " + scaledFocusX + "% " + scaledFocusY + "% !important; ");
		}
	}
	focalImages();
	
	/*
	// reorder masonry galleries
	$z('.zpImageGallery.columngal').each(function (){
		reorderMasonry($z(this));
	});
	*/
	
	$z(window).on("resize", zpdebounce(100, function(event) {
		setBreakout();
		focalImages();
		// set some helper classnames on first level menu items to assist dropdown positioning
		zpIsLeftOrRight();
		/*
		// reorder masonry galleries
		$z('.zpImageGallery.columngal').each(function (){
			reorderMasonry($z(this));
		});
		*/
	}));
	
	// animate Containers on Scroll
	function isElementInViewport (el) {
		//special bonus for those using jQuery
		if (el instanceof jQuery) {
			el = el[0];
		}
		
		var rect = el.getBoundingClientRect();

		//document.documentElement.clientHeight is a fallback for IE8
		return ( (rect.top >= 0 && rect.top <= (window.innerHeight || document.documentElement.clientHeight) ) || (rect.bottom >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) );
	}
	
	var lastScrollTop = 0;
	// ugly hack to execute this late, so all the doc ready code from widgeds already ran
	setTimeout(function() {
		var hasAnimatableContent = $z("body:not(.zpreducemotion) .zpanimate").length;	
		if ( hasAnimatableContent ){
			if ( $z.support.IntersectionObserver ){
				var zpanimCallback = function(entries, observer) { 
					entries.forEach(function(entry) {
						if ( entry.isIntersecting ){
							//console.log("IntersectionObserver. Element became visible: ", entry.target);
							observer.unobserve(entry.target);
							$z(entry.target).find(".zpanimate").addBack().addClass("show");
						}
					});
				};
				var zpanimObserver = new IntersectionObserver(zpanimCallback, {rootMargin: '0px', threshold: 0});
			}
			
			// store current body overeflow so we can later reset to this
			var bodyOverflow = $z("body").css("overflow") || "";
			var bodyOverflowX = $z("body").css("overflow-x") || "";
		
			// wrap animatable content in wrapper with overflow hidden to prevent scrollbars due to content shifted to the right
			$z('body:not(.zpreducemotion) .zpanimate.slideleft, \
				body:not(.zpreducemotion) .zpanimate.floatin, \
				body:not(.zpreducemotion) .zpanimate.zoomout').each(function(i, el){   
				var currentElement = $z(this);
				var inlineStyles = "";
				var rowRightPadding = 0;
				
				if ( currentElement.hasClass("zpColumn") ){
					// effects in columns need different wrapper css due to different parent styles
					inlineStyles += "margin: 0 !important;";
					inlineStyles += "padding: 0 !important;";
					if ( currentElement.find(".zpWideImage").length ) {
						// if the column contains a breakout image (desoign block), we need to modify the width by adding the right padding of the row
						//rowRightPadding = parseInt(currentElement.parents(".zpRow").css("padding-right"));
						debug.log("zpanimate: Adding extra padding to animated column width of " + rowRightPadding);
					}
				} else{
					inlineStyles += "padding-left:" + $z(this).css("padding-left") + " !important;";
					if ( !currentElement.hasClass("zpBreakout") ){
						inlineStyles += "margin-left: auto !important;";
						inlineStyles += "margin-right: auto !important;";
					}
					else{
						inlineStyles += "margin-left:" + $z(this).css("margin-left") + ";";
						inlineStyles += "margin-right" + $z(this).css("margin-right") + ";";;
					}
					inlineStyles += "padding-top: 0 !important;";
					inlineStyles += "padding-bottom: 0 !important;";
				}
				// in order to avoid errors due to JS returning rounded values, we use parseInt
				// IntersectionObserver might not recognize an element if the width contains fractions like e.g. 152.543px
				if ( window.getComputedStyle(this).width && !isNaN(parseInt(window.getComputedStyle(this).width)) ){
					inlineStyles += " width:" + (parseInt(window.getComputedStyle(this).width) + rowRightPadding) + "px;";
				}
				
				// remove margins from current element since they'll be applied to wrapper by the zpContainer/zpRow class css
				currentElement.css("margin-top", "0px");
				currentElement.css("margin-bottom", "0px");
				// depending if current Element is zpRow or zpContainer, use propper className in wrapper too, so the correct CSS applies to the wrapper
				var currentElementClass = "zpContainer";
				
				var currentContainerId = ''; // we set the wrapper to the same IDs, so the inline CSS applies to the wrappers too 
				var currentRowId = '';		 // and keeps margins etc. set in the "Darstellungs-Tab"
				var currentColumnId = '';
				var columnWidthClass = '';
				if ( currentElement.hasClass("zpContainer") ){
					currentContainerId = ' data-container-id="' + currentElement.attr("data-zpleid") + '"';
				}
				if ( currentElement.hasClass("zpRow") ){
					currentRowId = ' data-row-id="' + currentElement.attr("data-row-id") + '"';
					currentElementClass = "zpRow";
				}
				if ( currentElement.hasClass("zpColumn") ){
					currentColumnId = ' data-column-id="' + currentElement.attr("data-column-id") + '"';
					currentElementClass = " zpColumn";
					// currentElementClass = currentElement.attr("class");
					// add column class (i.e. c1 to c12) from current column so the width is set properly
					columnWidthClass = currentElement.attr("class").match(/c[1-9][0-2]?/); 
					currentElementClass += " " + columnWidthClass;
					// add wideImage class in case such a design block is animated
					currentElementClass += " " + currentElement.attr("class").match(/zpWideImage/); 
					//console.warn("anim Current Element (" + currentColumnId + ") width: " + currentElement.width());
				}
				if ( currentElement.hasClass("floatin") ){
					currentElementClass += " floatin";
				}
				if ( currentElement.hasClass("zpBreakout") ){
					currentElementClass += " zpBreakout";
				}
				// remove inline-scripts from ZP search-page as these destroy the dom during animation
				var currentScript = currentElement.find('script.zpsearchinlinescript').text();
				currentElement.find('script.zpsearchinlinescript').remove();
				currentElement.removeClass(columnWidthClass).css("width", "100%").wrap('<div' + currentContainerId + currentRowId + currentColumnId + ' class="zpanimatewrap ' + currentElementClass + '" style="' + inlineStyles + '">');
				
				//console.warn("anim Current Wrap (" + currentColumnId + ") width: " + currentElement.parent().width());
				
				// unwrap the content again after the animation finished to make sure it properly displays and doesn't get disturbed by the wrapper
				currentElement.off("webkitTransitionEnd.zpaniwrap otransitionend.zpaniwrap oTransitionEnd.zpaniwrap msTransitionEnd.zpaniwrap transitionend.zpaniwrap animationend.zpaniwrap" );
				currentElement.on( "webkitTransitionEnd.zpaniwrap otransitionend.zpaniwrap oTransitionEnd.zpaniwrap msTransitionEnd.zpaniwrap transitionend.zpaniwrap animationend.zpaniwrap", function(event) {
					if ( event && event.currentTarget == event.target ){
						//console.log(new Date().toISOString() + ": transitionEnd() Event:", event);
						if ( currentElement.parent().hasClass("zpanimatewrap") ){
							currentElement.addClass("played").unwrap(); // .played is used to avoid animations playing again if el is unwrapped
						}
						currentElement.addClass(columnWidthClass);
						// reset added CSS – width and margins
						currentElement.css("width", "");
						currentElement.css("margin-top", "");
						currentElement.css("margin-bottom", "");	
					}
				});
			}); ;
			
			function doAnimations(e){
				var delay = 0;
				var st = $z(this).scrollTop();
				if (st > lastScrollTop){
					var scrollDirection = "down";
				}
				else{
					var scrollDirection = "up";
				}
				lastScrollTop = st;
				$z("body:not(.zpreducemotion) .zpanimate:not(.zppreview)").each(function(i, el){
					// find children with position fixed and hide them because they'd be positioned wrong
					var fixedChilds = $z(el).find('*').filter(function(){
						var $this = $(this);
						//return $this.css('position') == 'relative';
						return $this.css('position') == 'fixed';
					});
					fixedChilds.hide();
					
					$z(el).off("webkitTransitionEnd.zpaniend otransitionend.zpaniend oTransitionEnd.zpaniend msTransitionEnd.zpaniend transitionend.zpaniend animationend.zpaniend" );
					$z(el).on( "webkitTransitionEnd.zpaniend otransitionend.zpaniend oTransitionEnd.zpaniend msTransitionEnd.zpaniend transitionend.zpaniend animationend.zpaniend", function(event) {
						if ( event && event.currentTarget == event.target ){
							// remove animation classes so that fixed Widgets (e.g. Reservierungs-Popup) are placed correctly
							$z(el).removeClass("zpanimate show played slideleft slideright fadein floatin zoomout pulse");
							// show fixed children again
							fixedChilds.fadeIn();
							// set breakout dimensions
							setBreakout();
						}
					});
					
					var viewportTestElement = el;
					// FYI: el is a Dom-Object, not a jQuery-Object
					if ( el.className.indexOf("floatin") !== -1 ){
						// Elements with Effect "Einschweben" have a translateY(50%) applied, so we need to get the proper .top coordinates of the parent-wrapper in order to find out if it's in viewport
						viewportTestElement = el.parentElement;
					}
					
					if ( $z.support.IntersectionObserver ){
						zpanimObserver.observe(viewportTestElement);
					}
					else{
						if ( isElementInViewport(viewportTestElement) ) {
							if ( ! $z(this).hasClass("show")){
								var currentElement = $z(this);
								// animate consecutively visible elements via setTimeout, so the elements are animated consecutive and not at the same time 
								if ( typeof this.timeoutId !== 'undefined' ) {
									clearTimeout(this.timeoutId);
								}
								this.timeoutId = setTimeout(function() { 
									currentElement.addClass("show");
								}, delay);
								delay += 250;
							}
						}
						else{
							// reset delay once we reach an element out of viewport, so once this reaches viewport, it isn't animated with delay
							delay = 0;
						}
					}
				});
			}
			
			if ( $z('body').hasClass('loaded') ){
				// window is already loaded, so call doAnimation once as the window.load event won't triger it
				doAnimations();
			}
	
			$z(window).off('load.zpanim scroll.zpanim');
			if ( $z.support.IntersectionObserver ){
				$z(window).on('load.zpanim', doAnimations); 
			}
			else{
				$z(window).on('scroll.zpanim', zpthrottle(50, doAnimations));
			}
	
		}
	}, 10);
	
	// set some helper classnames on first level menu items to assist dropdown positioning
	zpIsLeftOrRight();
		
	// wire up xmenu language selection
	function setLanguageSelectWidth(element){
		// find the width of the selected element and set the width of the select accordingly, so the selected element will never be cut off
		var text = $z(element).find("option:selected").text() || "";
		$z('a.xmenulink').css("vertical-align","top");
		var itemwrapper = $z('i.zpextralang').attr('data-itemwrapper').split(',') || ["",""];
		var $link = $('<a class="xmenulink">').html(text);
		$link.insertBefore('i.zpextralang');
		
		// set styles, so it displays properly and width is calculated correctly
		$z('i.zpextralang').css('color', $link.css('color'));
		$z('i.zpextralang').css('line-height', $link.css('line-height'));
		$z('i.zpextralang').css('padding', $link.css('padding'));
		$z('i.zpextralang').css('margin-left', $link.css('margin-left'));
		$z('i.zpextralang').css('margin-top', $link.css('margin-top'));
		$z('i.zpextralang').css('margin-bottom', $link.css('margin-bottom'));
		$z('i.zpextralang').css('border-width', $link.css('border-width'));
		$z('i.zpextralang').css('border-style', $link.css('border-style'));
		
		$z(element).css('font-family', $link.css('font-family'));
		$z(element).css('font-size', $link.css('font-size'));
		$z(element).css('font-weight', $link.css('font-weight'));
		$z(element).css('font-style', $link.css('font-style'));
		$z(element).css('font-style', $link.css('font-style'));
		$z(element).css('text-shadow', $link.css('text-shadow'));
		$z(element).css('color', $link.css('color'));
		$z(element).css('text-decoration', $link.css('text-decoration'));
		
		// measure link-width
		var width = parseInt($link.innerWidth());// + 5;
		// remove link-element we only temporarily inserted to measure
		$link.remove();
		
		var arrowWidth = .5 *1.4142;// ".5em"; //parseInt($z(element).css("padding-right")) || 0;
		$z(element).css("width", "calc( "+ width + "px + " + arrowWidth + "em)");
	}
	$z('#zpextralang').each(function(){
		// set select width to width of selected option
		setLanguageSelectWidth(this); //$z('a.xmenulink').last();
	});

	$z('#zpextralang').on("change", function(){
		var url = this.value;
		if ( url ){
			//setLanguageSelectWidth(this);
			// go to the respective url
			window.location.href = url;
		}
	});   
	
	// highlight searchstrings if aplicable 
	var searchstr = zpGetParameterByName("q") || "";

	if ( searchstr && searchstr !== "" ){
		debug.log("Marking searchstring: " + searchstr);
		searchstr = searchstr.replace(/\+/g, " ");
		// mark the string except in search results .restitle and .SO-SiteSearchResult
		$('.zparea[data-areaname="Standard"], .zparea[data-areaname="News"]').mark(searchstr, {"className": "zpsearchmatch", "exclude": [".zpwSuche", ".zpwSuche *", ".zpwShop-_Suche *", "nav *", ".nav *"]});
	
		// scroll first marked match into view (bottom of window due to fixed headers)
		var firstMatch = $z('.zpsearchmatch');
		if ( firstMatch.length ){
			$z(firstMatch)[0].scrollIntoView({
				behavior: "smooth", // or "auto" or "instant"
				block: "end", 
				inline: "nearest"
			});
		}
	}
	
});

// define zp Namespace for later use in individual widgets
// define zp Namespace for later use in individual widgets if not only defined
if ( typeof(zp)==="undefined" ){
	var zp = {  
	}; // end zp
}
// test HTML5 field-type support and store it in zp.html5support
zp.html5support = {number: false, email: false, tel: false, url: false, date: false, time: false, color: false, search: false};
var tester = document.createElement('input');
for(var i in zp.html5support){
	// Use try/catch because IE9 throws "Invalid Argument" when trying to use unsupported input types
	try {
		tester.type = i;
		if(tester.type === i){
			zp.html5support[i] = true;
		}
	} catch (e){}
}

(function($){
	// make $z.unique also work on arrays and not only DOM-Elements (without this, we have a problem with the EventCalendars in Chrome)
	// http://stackoverflow.com/a/7366133
    var _old = $.unique;
    $.unique = function(arr){
        // do the default behavior only if we got an array of elements
        if ( arr.length == 0  || !!arr[0].nodeType){
            return _old.apply(this,arguments);
        }
        else {
            // reduce the array to contain no dupes via grep/inArray
            return $.grep(arr,function(v,k){
                return $.inArray(v,arr) === k;
            });
        }
    };
    
    // custom function to shorten and suffix text with _filler_ to make it fit its container - StS 2016-10-27
    // call it like this: $z(".mySelector").fitText();
    $.fn.fitText = function( filler ){
    	filler = typeof filler !== 'undefined' ? filler : "…";
    	
		zpTextOverflow(this, filler);
	
		return this;
	}
	
	// custom function to find out if content of an element is overflowing 
	$.fn.overflown=function(direction){
		if (typeof(direction)==='undefined') direction = "any";
		var e=this[0];
		var buffer = 4; // needs to be greater than value + buffer to be considered overflown. Compensates Browser rounding-bugs(cough, IE)…
		if ( typeof e !== "undefined" ){
			switch(direction) {
				case "x":
					return e.scrollWidth>(e.clientWidth+buffer);
					break;
				case "y":
					return e.scrollHeight>(e.clientHeight+buffer);
					break;
				default:
					return e.scrollHeight>(e.clientHeight+buffer)||e.scrollWidth>(e.clientWidth+buffer);
			}
		}
		else{
			return false;
		}
	}
    
})($z);

/*!
  stickybits - Stickybits is a lightweight alternative to `position: sticky` polyfills
  @version v3.6.1
  @link https://github.com/dollarshaveclub/stickybits#readme
  @author Jeff Wainwright <yowainwright@gmail.com> (https://jeffry.in)
  @license MIT
*/
!function(t){"function"==typeof define&&define.amd?define(t):t()}(function(){"use strict";var s=function(){function t(t,s){var e=void 0!==s?s:{};this.version="3.6.1",this.userAgent=window.navigator.userAgent||"no `userAgent` provided by the browser",this.props={customStickyChangeNumber:e.customStickyChangeNumber||null,noStyles:e.noStyles||!1,stickyBitStickyOffset:e.stickyBitStickyOffset||0,parentClass:e.parentClass||"js-stickybit-parent",scrollEl:"string"==typeof e.scrollEl?document.querySelector(e.scrollEl):e.scrollEl||window,stickyClass:e.stickyClass||"js-is-sticky",stuckClass:e.stuckClass||"js-is-stuck",stickyChangeClass:e.stickyChangeClass||"js-is-sticky--change",useStickyClasses:e.useStickyClasses||!1,useFixed:e.useFixed||!1,useGetBoundingClientRect:e.useGetBoundingClientRect||!1,verticalPosition:e.verticalPosition||"top"},this.props.positionVal=this.definePosition()||"fixed",this.instances=[];var i=this.props,n=i.positionVal,o=i.verticalPosition,r=i.noStyles,a=i.stickyBitStickyOffset,l=i.useStickyClasses,c="top"!==o||r?"":a+"px",f="fixed"!==n?n:"";this.els="string"==typeof t?document.querySelectorAll(t):t,"length"in this.els||(this.els=[this.els]);for(var u=0;u<this.els.length;u++){var p=this.els[u];if(p.style[o]=c,p.style.position=f,"fixed"===n||l){var h=this.addInstance(p,this.props);this.instances.push(h)}}}var s=t.prototype;return s.definePosition=function(){var t;if(this.props.useFixed)t="fixed";else{for(var s=["","-o-","-webkit-","-moz-","-ms-"],e=document.head.style,i=0;i<s.length;i+=1)e.position=s[i]+"sticky";t=e.position?e.position:"fixed",e.position=""}return t},s.addInstance=function(t,s){var e=this,i={el:t,parent:t.parentNode,props:s};this.isWin=this.props.scrollEl===window;var n=this.isWin?window:this.getClosestParent(i.el,i.props.scrollEl);return this.computeScrollOffsets(i),i.parent.className+=" "+s.parentClass,i.state="default",i.stateContainer=function(){return e.manageState(i)},n.addEventListener("scroll",i.stateContainer),i},s.getClosestParent=function(t,s){var e=s,i=t;if(i.parentElement===e)return e;for(;i.parentElement!==e;)i=i.parentElement;return e},s.getTopPosition=function(t){if(this.props.useGetBoundingClientRect)return t.getBoundingClientRect().top+(this.props.scrollEl.pageYOffset||document.documentElement.scrollTop);for(var s=0;s=t.offsetTop+s,t=t.offsetParent;);return s},s.computeScrollOffsets=function(t){var s=t,e=s.props,i=s.el,n=s.parent,o=!this.isWin&&"fixed"===e.positionVal,r="bottom"!==e.verticalPosition,a=o?this.getTopPosition(e.scrollEl):0,l=o?this.getTopPosition(n)-a:this.getTopPosition(n),c=null!==e.customStickyChangeNumber?e.customStickyChangeNumber:i.offsetHeight,f=l+n.offsetHeight;return s.offset=a+e.stickyBitStickyOffset,s.stickyStart=r?l-s.offset:0,s.stickyChange=s.stickyStart+c,s.stickyStop=r?f-(i.offsetHeight+s.offset):f-window.innerHeight,s},s.toggleClasses=function(t,s,e){var i=t,n=i.className.split(" ");e&&-1===n.indexOf(e)&&n.push(e);var o=n.indexOf(s);-1!==o&&n.splice(o,1),i.className=n.join(" ")},s.manageState=function(t){var s=t,e=s.el,i=s.props,n=s.state,o=s.stickyStart,r=s.stickyChange,a=s.stickyStop,l=e.style,c=i.noStyles,f=i.positionVal,u=i.scrollEl,p=i.stickyClass,h=i.stickyChangeClass,d=i.stuckClass,y=i.verticalPosition,k="bottom"!==y,g=function(t){t()},m=this.isWin&&(window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame)||g,v=this.toggleClasses,C=this.isWin?window.scrollY||window.pageYOffset:u.scrollTop,w=k&&C<=o&&("sticky"===n||"stuck"===n),S=a<=C&&"sticky"===n;o<C&&C<a&&("default"===n||"stuck"===n)?(s.state="sticky",m(function(){v(e,d,p),l.position=f,c||(l.bottom="",l[y]=i.stickyBitStickyOffset+"px")})):w?(s.state="default",m(function(){v(e,p),v(e,d),"fixed"===f&&(l.position="")})):S&&(s.state="stuck",m(function(){v(e,p,d),"fixed"!==f||c||(l.top="",l.bottom="0",l.position="absolute")}));var b=r<=C&&C<=a;return C<r/2||a<C?m(function(){v(e,h)}):b&&m(function(){v(e,"stub",h)}),s},s.update=function(t){void 0===t&&(t=null);for(var s=0;s<this.instances.length;s+=1){var e=this.instances[s];if(this.computeScrollOffsets(e),t)for(var i in t)e.props[i]=t[i]}return this},s.removeInstance=function(t){var s=t.el,e=t.props,i=this.toggleClasses;s.style.position="",s.style[e.verticalPosition]="",i(s,e.stickyClass),i(s,e.stuckClass),i(s.parentNode,e.parentClass)},s.cleanup=function(){for(var t=0;t<this.instances.length;t+=1){var s=this.instances[t];s.props.scrollEl.removeEventListener("scroll",s.stateContainer),this.removeInstance(s)}this.manageState=!1,this.instances=[]},t}();if("undefined"!=typeof window){var t=window.$z||window.$||window.jQuery||window.Zepto;t&&(t.fn.stickybits=function(t){return new s(this,t)})}});

// Highlight strings in text 
/*!***************************************************
* mark.js v9.0.0
* https://markjs.io/
* Copyright (c) 2014–2018, Julian Kühnel
* Released under the MIT license https://git.io/vwTVl
*****************************************************/
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t(require("jquery")):"function"==typeof define&&define.amd?define(["jquery"],t):e.Mark=t(e.jQuery)}(this,function(e){"use strict";function t(e){return(t="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function o(e,t,n){return t&&r(e.prototype,t),n&&r(e,n),e}function i(){return(i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}e=e&&e.hasOwnProperty("default")?e.default:e;var a=
/* */
function(){function e(t){var r=!(arguments.length>1&&void 0!==arguments[1])||arguments[1],o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[],i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:5e3;n(this,e),this.ctx=t,this.iframes=r,this.exclude=o,this.iframesTimeout=i}return o(e,[{key:"getContexts",value:function(){var e=[];return(void 0!==this.ctx&&this.ctx?NodeList.prototype.isPrototypeOf(this.ctx)?Array.prototype.slice.call(this.ctx):Array.isArray(this.ctx)?this.ctx:"string"==typeof this.ctx?Array.prototype.slice.call(document.querySelectorAll(this.ctx)):[this.ctx]:[]).forEach(function(t){var n=e.filter(function(e){return e.contains(t)}).length>0;-1!==e.indexOf(t)||n||e.push(t)}),e}},{key:"getIframeContents",value:function(e,t){var n,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:function(){};try{var o=e.contentWindow;if(n=o.document,!o||!n)throw new Error("iframe inaccessible")}catch(e){r()}n&&t(n)}},{key:"isIframeBlank",value:function(e){var t="about:blank",n=e.getAttribute("src").trim();return e.contentWindow.location.href===t&&n!==t&&n}},{key:"observeIframeLoad",value:function(e,t,n){var r=this,o=!1,i=null,a=function a(){if(!o){o=!0,clearTimeout(i);try{r.isIframeBlank(e)||(e.removeEventListener("load",a),r.getIframeContents(e,t,n))}catch(e){n()}}};e.addEventListener("load",a),i=setTimeout(a,this.iframesTimeout)}},{key:"onIframeReady",value:function(e,t,n){try{"complete"===e.contentWindow.document.readyState?this.isIframeBlank(e)?this.observeIframeLoad(e,t,n):this.getIframeContents(e,t,n):this.observeIframeLoad(e,t,n)}catch(e){n()}}},{key:"waitForIframes",value:function(e,t){var n=this,r=0;this.forEachIframe(e,function(){return!0},function(e){r++,n.waitForIframes(e.querySelector("html"),function(){--r||t()})},function(e){e||t()})}},{key:"forEachIframe",value:function(t,n,r){var o=this,i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:function(){},a=t.querySelectorAll("iframe"),s=a.length,c=0;a=Array.prototype.slice.call(a);var u=function(){--s<=0&&i(c)};s||u(),a.forEach(function(t){e.matches(t,o.exclude)?u():o.onIframeReady(t,function(e){n(t)&&(c++,r(e)),u()},u)})}},{key:"createIterator",value:function(e,t,n){return document.createNodeIterator(e,t,n,!1)}},{key:"createInstanceOnIframe",value:function(t){return new e(t.querySelector("html"),this.iframes)}},{key:"compareNodeIframe",value:function(e,t,n){if(e.compareDocumentPosition(n)&Node.DOCUMENT_POSITION_PRECEDING){if(null===t)return!0;if(t.compareDocumentPosition(n)&Node.DOCUMENT_POSITION_FOLLOWING)return!0}return!1}},{key:"getIteratorNode",value:function(e){var t=e.previousNode();return{prevNode:t,node:null===t?e.nextNode():e.nextNode()&&e.nextNode()}}},{key:"checkIframeFilter",value:function(e,t,n,r){var o=!1,i=!1;return r.forEach(function(e,t){e.val===n&&(o=t,i=e.handled)}),this.compareNodeIframe(e,t,n)?(!1!==o||i?!1===o||i||(r[o].handled=!0):r.push({val:n,handled:!0}),!0):(!1===o&&r.push({val:n,handled:!1}),!1)}},{key:"handleOpenIframes",value:function(e,t,n,r){var o=this;e.forEach(function(e){e.handled||o.getIframeContents(e.val,function(e){o.createInstanceOnIframe(e).forEachNode(t,n,r)})})}},{key:"iterateThroughNodes",value:function(e,t,n,r,o){for(var i,a,s,c=this,u=this.createIterator(t,e,r),l=[],h=[];s=void 0,s=c.getIteratorNode(u),a=s.prevNode,i=s.node;)this.iframes&&this.forEachIframe(t,function(e){return c.checkIframeFilter(i,a,e,l)},function(t){c.createInstanceOnIframe(t).forEachNode(e,function(e){return h.push(e)},r)}),h.push(i);h.forEach(function(e){n(e)}),this.iframes&&this.handleOpenIframes(l,e,n,r),o()}},{key:"forEachNode",value:function(e,t,n){var r=this,o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:function(){},i=this.getContexts(),a=i.length;a||o(),i.forEach(function(i){var s=function(){r.iterateThroughNodes(e,i,t,n,function(){--a<=0&&o()})};r.iframes?r.waitForIframes(i,s):s()})}}],[{key:"matches",value:function(e,t){var n="string"==typeof t?[t]:t,r=e.matches||e.matchesSelector||e.msMatchesSelector||e.mozMatchesSelector||e.oMatchesSelector||e.webkitMatchesSelector;if(r){var o=!1;return n.every(function(t){return!r.call(e,t)||(o=!0,!1)}),o}return!1}}]),e}(),s=
/* */
function(){function e(t){n(this,e),this.opt=i({},{diacritics:!0,synonyms:{},accuracy:"partially",caseSensitive:!1,ignoreJoiners:!1,ignorePunctuation:[],wildcards:"disabled"},t)}return o(e,[{key:"create",value:function(e){return"disabled"!==this.opt.wildcards&&(e=this.setupWildcardsRegExp(e)),e=this.escapeStr(e),Object.keys(this.opt.synonyms).length&&(e=this.createSynonymsRegExp(e)),(this.opt.ignoreJoiners||this.opt.ignorePunctuation.length)&&(e=this.setupIgnoreJoinersRegExp(e)),this.opt.diacritics&&(e=this.createDiacriticsRegExp(e)),e=this.createMergedBlanksRegExp(e),(this.opt.ignoreJoiners||this.opt.ignorePunctuation.length)&&(e=this.createJoinersRegExp(e)),"disabled"!==this.opt.wildcards&&(e=this.createWildcardsRegExp(e)),e=this.createAccuracyRegExp(e),new RegExp(e,"gm".concat(this.opt.caseSensitive?"":"i"))}},{key:"sortByLength",value:function(e){return e.sort(function(e,t){return e.length===t.length?e>t?1:-1:t.length-e.length})}},{key:"escapeStr",value:function(e){return e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")}},{key:"createSynonymsRegExp",value:function(e){var t=this,n=this.opt.synonyms,r=this.opt.caseSensitive?"":"i",o=this.opt.ignoreJoiners||this.opt.ignorePunctuation.length?"\0":"";for(var i in n)if(n.hasOwnProperty(i)){var a=Array.isArray(n[i])?n[i]:[n[i]];a.unshift(i),(a=this.sortByLength(a).map(function(e){return"disabled"!==t.opt.wildcards&&(e=t.setupWildcardsRegExp(e)),e=t.escapeStr(e)}).filter(function(e){return""!==e})).length>1&&(e=e.replace(new RegExp("(".concat(a.map(function(e){return t.escapeStr(e)}).join("|"),")"),"gm".concat(r)),o+"(".concat(a.map(function(e){return t.processSynonyms(e)}).join("|"),")")+o))}return e}},{key:"processSynonyms",value:function(e){return(this.opt.ignoreJoiners||this.opt.ignorePunctuation.length)&&(e=this.setupIgnoreJoinersRegExp(e)),e}},{key:"setupWildcardsRegExp",value:function(e){return(e=e.replace(/(?:\\)*\?/g,function(e){return"\\"===e.charAt(0)?"?":""})).replace(/(?:\\)*\*/g,function(e){return"\\"===e.charAt(0)?"*":""})}},{key:"createWildcardsRegExp",value:function(e){var t="withSpaces"===this.opt.wildcards;return e.replace(/\u0001/g,t?"[\\S\\s]?":"\\S?").replace(/\u0002/g,t?"[\\S\\s]*?":"\\S*")}},{key:"setupIgnoreJoinersRegExp",value:function(e){return e.replace(/[^(|)\\]/g,function(e,t,n){var r=n.charAt(t+1);return/[(|)\\]/.test(r)||""===r?e:e+"\0"})}},{key:"createJoinersRegExp",value:function(e){var t=[],n=this.opt.ignorePunctuation;return Array.isArray(n)&&n.length&&t.push(this.escapeStr(n.join(""))),this.opt.ignoreJoiners&&t.push("\\u00ad\\u200b\\u200c\\u200d"),t.length?e.split(/\u0000+/).join("[".concat(t.join(""),"]*")):e}},{key:"createDiacriticsRegExp",value:function(e){var t=this.opt.caseSensitive?"":"i",n=this.opt.caseSensitive?["aàáảãạăằắẳẵặâầấẩẫậäåāą","AÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ","cçćč","CÇĆČ","dđď","DĐĎ","eèéẻẽẹêềếểễệëěēę","EÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ","iìíỉĩịîïī","IÌÍỈĨỊÎÏĪ","lł","LŁ","nñňń","NÑŇŃ","oòóỏõọôồốổỗộơởỡớờợöøō","OÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ","rř","RŘ","sšśșş","SŠŚȘŞ","tťțţ","TŤȚŢ","uùúủũụưừứửữựûüůū","UÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ","yýỳỷỹỵÿ","YÝỲỶỸỴŸ","zžżź","ZŽŻŹ"]:["aàáảãạăằắẳẵặâầấẩẫậäåāąAÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÄÅĀĄ","cçćčCÇĆČ","dđďDĐĎ","eèéẻẽẹêềếểễệëěēęEÈÉẺẼẸÊỀẾỂỄỆËĚĒĘ","iìíỉĩịîïīIÌÍỈĨỊÎÏĪ","lłLŁ","nñňńNÑŇŃ","oòóỏõọôồốổỗộơởỡớờợöøōOÒÓỎÕỌÔỒỐỔỖỘƠỞỠỚỜỢÖØŌ","rřRŘ","sšśșşSŠŚȘŞ","tťțţTŤȚŢ","uùúủũụưừứửữựûüůūUÙÚỦŨỤƯỪỨỬỮỰÛÜŮŪ","yýỳỷỹỵÿYÝỲỶỸỴŸ","zžżźZŽŻŹ"],r=[];return e.split("").forEach(function(o){n.every(function(n){if(-1!==n.indexOf(o)){if(r.indexOf(n)>-1)return!1;e=e.replace(new RegExp("[".concat(n,"]"),"gm".concat(t)),"[".concat(n,"]")),r.push(n)}return!0})}),e}},{key:"createMergedBlanksRegExp",value:function(e){return e.replace(/[\s]+/gim,"[\\s]+")}},{key:"createAccuracyRegExp",value:function(e){var t=this,n=this.opt.accuracy,r="string"==typeof n?n:n.value,o="string"==typeof n?[]:n.limiters,i="";switch(o.forEach(function(e){i+="|".concat(t.escapeStr(e))}),r){case"partially":default:return"()(".concat(e,")");case"complementary":return i="\\s"+(i||this.escapeStr("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~¡¿")),"()([^".concat(i,"]*").concat(e,"[^").concat(i,"]*)");case"exactly":return"(^|\\s".concat(i,")(").concat(e,")(?=$|\\s").concat(i,")")}}}]),e}(),c=
/* */
function(){function e(t){n(this,e),this.ctx=t,this.ie=!1;var r=window.navigator.userAgent;(r.indexOf("MSIE")>-1||r.indexOf("Trident")>-1)&&(this.ie=!0)}return o(e,[{key:"log",value:function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"debug",r=this.opt.log;this.opt.debug&&"object"===t(r)&&"function"==typeof r[n]&&r[n]("mark.js: ".concat(e))}},{key:"getSeparatedKeywords",value:function(e){var t=this,n=[];return e.forEach(function(e){t.opt.separateWordSearch?e.split(" ").forEach(function(e){e.trim()&&-1===n.indexOf(e)&&n.push(e)}):e.trim()&&-1===n.indexOf(e)&&n.push(e)}),{keywords:n.sort(function(e,t){return t.length-e.length}),length:n.length}}},{key:"isNumeric",value:function(e){return Number(parseFloat(e))==e}},{key:"checkRanges",value:function(e){var t=this;if(!Array.isArray(e)||"[object Object]"!==Object.prototype.toString.call(e[0]))return this.log("markRanges() will only accept an array of objects"),this.opt.noMatch(e),[];var n=[],r=0;return e.sort(function(e,t){return e.start-t.start}).forEach(function(e){var o=t.callNoMatchOnInvalidRanges(e,r),i=o.start,a=o.end;o.valid&&(e.start=i,e.length=a-i,n.push(e),r=a)}),n}},{key:"callNoMatchOnInvalidRanges",value:function(e,t){var n,r,o=!1;return e&&void 0!==e.start?(r=(n=parseInt(e.start,10))+parseInt(e.length,10),this.isNumeric(e.start)&&this.isNumeric(e.length)&&r-t>0&&r-n>0?o=!0:(this.log("Ignoring invalid or overlapping range: "+"".concat(JSON.stringify(e))),this.opt.noMatch(e))):(this.log("Ignoring invalid range: ".concat(JSON.stringify(e))),this.opt.noMatch(e)),{start:n,end:r,valid:o}}},{key:"checkWhitespaceRanges",value:function(e,t,n){var r,o=!0,i=n.length,a=t-i,s=parseInt(e.start,10)-a;return(r=(s=s>i?i:s)+parseInt(e.length,10))>i&&(r=i,this.log("End range automatically set to the max value of ".concat(i))),s<0||r-s<0||s>i||r>i?(o=!1,this.log("Invalid range: ".concat(JSON.stringify(e))),this.opt.noMatch(e)):""===n.substring(s,r).replace(/\s+/g,"")&&(o=!1,this.log("Skipping whitespace only range: "+JSON.stringify(e)),this.opt.noMatch(e)),{start:s,end:r,valid:o}}},{key:"getTextNodes",value:function(e){var t=this,n="",r=[];this.iterator.forEachNode(NodeFilter.SHOW_TEXT,function(e){r.push({start:n.length,end:(n+=e.textContent).length,node:e})},function(e){return t.matchesExclude(e.parentNode)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT},function(){e({value:n,nodes:r})})}},{key:"matchesExclude",value:function(e){return a.matches(e,this.opt.exclude.concat(["script","style","title","head","html"]))}},{key:"wrapRangeInTextNode",value:function(e,t,n){var r=this.opt.element?this.opt.element:"mark",o=e.splitText(t),i=o.splitText(n-t),a=document.createElement(r);return a.setAttribute("data-markjs","true"),this.opt.className&&a.setAttribute("class",this.opt.className),a.textContent=o.textContent,o.parentNode.replaceChild(a,o),i}},{key:"wrapRangeInMappedTextNode",value:function(e,t,n,r,o){var i=this;e.nodes.every(function(a,s){var c=e.nodes[s+1];if(void 0===c||c.start>t){if(!r(a.node))return!1;var u=t-a.start,l=(n>a.end?a.end:n)-a.start,h=e.value.substr(0,a.start),f=e.value.substr(l+a.start);if(a.node=i.wrapRangeInTextNode(a.node,u,l),e.value=h+f,e.nodes.forEach(function(t,n){n>=s&&(e.nodes[n].start>0&&n!==s&&(e.nodes[n].start-=l),e.nodes[n].end-=l)}),n-=l,o(a.node.previousSibling,a.start),!(n>a.end))return!1;t=a.end}return!0})}},{key:"wrapGroups",value:function(e,t,n,r){return r((e=this.wrapRangeInTextNode(e,t,t+n)).previousSibling),e}},{key:"separateGroups",value:function(e,t,n,r,o){for(var i=t.length,a=1;a<i;a++){var s=e.textContent.indexOf(t[a]);t[a]&&s>-1&&r(t[a],e)&&(e=this.wrapGroups(e,s,t[a].length,o))}return e}},{key:"wrapMatches",value:function(e,t,n,r,o){var i=this,a=0===t?0:t+1;this.getTextNodes(function(t){t.nodes.forEach(function(t){var o;for(t=t.node;null!==(o=e.exec(t.textContent))&&""!==o[a];){if(i.opt.separateGroups)t=i.separateGroups(t,o,a,n,r);else{if(!n(o[a],t))continue;var s=o.index;if(0!==a)for(var c=1;c<a;c++)s+=o[c].length;t=i.wrapGroups(t,s,o[a].length,r)}e.lastIndex=0}}),o()})}},{key:"wrapMatchesAcrossElements",value:function(e,t,n,r,o){var i=this,a=0===t?0:t+1;this.getTextNodes(function(t){for(var s;null!==(s=e.exec(t.value))&&""!==s[a];){var c=s.index;if(0!==a)for(var u=1;u<a;u++)c+=s[u].length;var l=c+s[a].length;i.wrapRangeInMappedTextNode(t,c,l,function(e){return n(s[a],e)},function(t,n){e.lastIndex=n,r(t)})}o()})}},{key:"wrapRangeFromIndex",value:function(e,t,n,r){var o=this;this.getTextNodes(function(i){var a=i.value.length;e.forEach(function(e,r){var s=o.checkWhitespaceRanges(e,a,i.value),c=s.start,u=s.end;s.valid&&o.wrapRangeInMappedTextNode(i,c,u,function(n){return t(n,e,i.value.substring(c,u),r)},function(t){n(t,e)})}),r()})}},{key:"unwrapMatches",value:function(e){for(var t=e.parentNode,n=document.createDocumentFragment();e.firstChild;)n.appendChild(e.removeChild(e.firstChild));t.replaceChild(n,e),this.ie?this.normalizeTextNode(t):t.normalize()}},{key:"normalizeTextNode",value:function(e){if(e){if(3===e.nodeType)for(;e.nextSibling&&3===e.nextSibling.nodeType;)e.nodeValue+=e.nextSibling.nodeValue,e.parentNode.removeChild(e.nextSibling);else this.normalizeTextNode(e.firstChild);this.normalizeTextNode(e.nextSibling)}}},{key:"markRegExp",value:function(e,t){var n=this;this.opt=t,this.log('Searching with expression "'.concat(e,'"'));var r=0,o="wrapMatches";this.opt.acrossElements&&(o="wrapMatchesAcrossElements"),this[o](e,this.opt.ignoreGroups,function(e,t){return n.opt.filter(t,e,r)},function(e){r++,n.opt.each(e)},function(){0===r&&n.opt.noMatch(e),n.opt.done(r)})}},{key:"mark",value:function(e,t){var n=this;this.opt=t;var r=0,o="wrapMatches",i=this.getSeparatedKeywords("string"==typeof e?[e]:e),a=i.keywords,c=i.length;this.opt.acrossElements&&(o="wrapMatchesAcrossElements"),0===c?this.opt.done(r):function e(t){var i=new s(n.opt).create(t),u=0;n.log('Searching with expression "'.concat(i,'"')),n[o](i,1,function(e,o){return n.opt.filter(o,t,r,u)},function(e){u++,r++,n.opt.each(e)},function(){0===u&&n.opt.noMatch(t),a[c-1]===t?n.opt.done(r):e(a[a.indexOf(t)+1])})}(a[0])}},{key:"markRanges",value:function(e,t){var n=this;this.opt=t;var r=0,o=this.checkRanges(e);o&&o.length?(this.log("Starting to mark with the following ranges: "+JSON.stringify(o)),this.wrapRangeFromIndex(o,function(e,t,r,o){return n.opt.filter(e,t,r,o)},function(e,t){r++,n.opt.each(e,t)},function(){n.opt.done(r)})):this.opt.done(r)}},{key:"unmark",value:function(e){var t=this;this.opt=e;var n=this.opt.element?this.opt.element:"*";n+="[data-markjs]",this.opt.className&&(n+=".".concat(this.opt.className)),this.log('Removal selector "'.concat(n,'"')),this.iterator.forEachNode(NodeFilter.SHOW_ELEMENT,function(e){t.unwrapMatches(e)},function(e){var r=a.matches(e,n),o=t.matchesExclude(e);return!r||o?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT},this.opt.done)}},{key:"opt",set:function(e){this._opt=i({},{element:"",className:"",exclude:[],iframes:!1,iframesTimeout:5e3,separateWordSearch:!0,acrossElements:!1,ignoreGroups:0,each:function(){},noMatch:function(){},filter:function(){return!0},done:function(){},debug:!1,log:window.console},e)},get:function(){return this._opt}},{key:"iterator",get:function(){return new a(this.ctx,this.opt.iframes,this.opt.exclude,this.opt.iframesTimeout)}}]),e}();return e.fn.mark=function(e,t){return new c(this.get()).mark(e,t),this},e.fn.markRegExp=function(e,t){return new c(this.get()).markRegExp(e,t),this},e.fn.markRanges=function(e,t){return new c(this.get()).markRanges(e,t),this},e.fn.unmark=function(e){return new c(this.get()).unmark(e),this},e});




/*!
 * END $Id: app.js 2024-08-27 10:26:32 +0200 Stefan S  058a8fc08689b51ee7c72e94d1a8ca969cf37b35 $ 
 */


