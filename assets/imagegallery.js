/*! $Id: imagegallery.js 2022-03-07 17:29:46 +0100 Stefan S  4f7f8ec7360aa4c05d2e4884a7a73e8ceeda608a $ */

/** 
* jQuery Plugin to add basic "swipe" support on touch-enabled devices
*
* @author Yair Even Or
* @version 1.0.0 (March 20, 2013)
*/

(function($){
	"use strict";

    $.event.special.swipe = {
        setup: function(){
            $(this).on('touchstart', $.event.special.swipe.handler);
        },

        teardown: function(){
            $(this).off('touchstart', $.event.special.swipe.handler);
        },

        handler: function(event){
            var args = [].slice.call( arguments, 1 ), // clone arguments array, remove original event from cloned array
                touches = event.originalEvent.touches,
                startX, startY,
                deltaX = 0, deltaY = 0,
                that = this;

            event = $.event.fix(event);

            if( touches.length == 1 ){
                startX = touches[0].pageX;
                startY = touches[0].pageY;
                this.addEventListener('touchmove', onTouchMove, false);
            }

            function cancelTouch(){
                that.removeEventListener('touchmove', onTouchMove);
                startX = startY = null;
            }

            function onTouchMove(e){
                //e.preventDefault();

                var Dx = startX - e.touches[0].pageX,
                    Dy = startY - e.touches[0].pageY;

                if( Math.abs(Dx) >= 50 ){
                    cancelTouch();
                    deltaX = (Dx > 0) ? -1 : 1;
                }
                else if( Math.abs(Dy) >= 20 ){
                    cancelTouch();
                    deltaY = (Dy > 0) ? 1 : -1;
                }

                event.type = 'swipe';
                args.unshift(event, deltaX, deltaY); // add back the new event to the front of the arguments with the delatas
                return ($.event.dispatch || $.event.handle).apply(that, args);
            }
        }
    };
})($z);

/*! 
 * ZP Image-Gallery Widget
 * Copyright $Date:   2022-03-07 17:29:46 +0100 $ Zeta Software GmbH
 */
 
 // This code depends on jquery.fancybox css and js being loded via the global "_Shared"-Widget.

// define zp Namespace for later use in individual widgets if not only defined
if ( typeof(zp)==="undefined" ){
	var zp = {};
}

$z(document).ready(function () {
	zp.ImageGallery = function (){
		this.root = null;
		this.numbershow = true;
		this.template = "";
		this.titleshow = false;
		this.htmltitle = "";
		this.articleid = "";
		this.kind = "gallery";
		this.width = 200;
		this.height = 150;
		this.bordercolor = "silver";
		this.borderwidth = 0;
		this.margin = 10;
		this.overlaycolor = "black";
		this.titleposition = "over"; /* inside, over - not supported by us: outside*/
		this.transition = "elastic"; /* elastic, fade, none */
		this.slideshow = false;
		this.slideshowinterval = 5000;
		this.slideshowtimer = 0;
		this.lang = "de";
		//this.easing = "swing";
		//this.changefade = "fast";
		var igal = this;
	
		this.init = function (elemid){
			function showHideNavButtons(){
				// hide pev/next links when at beginning or end of pages
				if ( currentPage == 1 ){
					$z(igal.root + " .zppaging a.zppprev").addClass("off");
				}
				else if ( currentPage == numPages ) {
					$z(igal.root + " .zppaging a.zppnext").addClass("off");
				}
			}

			if(!($z.fancybox)){
				trace("Fehler: Fancybox ist nicht geladen");
			}
		
			igal.root = elemid;
			igal.ispaging = $z(igal.root).attr("data-ispaging")=="true"?true:false;
			igal.imageeffect = $z(igal.root).attr("data-imageeffect") || ""
			igal.prevtext = $z(igal.root).data("prevtext");
			igal.nextext = $z(igal.root).data("nexttext");
			igal.pagetext = $z(igal.root).data("pagetext");
			igal.numbershow = $z(igal.root).data("numbershow")!==0?true:false;
			igal.template = $z(igal.root).data("template");
			igal.titleshow = $z(igal.root).data("titleshow")!==0?true:false;
			igal.htmltitle = $z(igal.root).data("htmltitle");
			igal.kind = $z(igal.root).data("kind");
			igal.articleid = $z(igal.root).data("article-id");
			igal.bordercompensatedwWidth = $z(igal.root).data("bordercompensatedwWidth");
			igal.width = $z(igal.root).data("width");
			if ( parseInt(igal.width) ){
				igal.width = igal.width + "px";
			}
			igal.height = $z(igal.root).data("height");
			if ( parseInt(igal.height) ){
				igal.height = igal.height + "px";
			}
			
			if ( igal.ispaging ){
				var currentPage = 1;
				igal.imagesperpage = parseInt($z(igal.root).data("imagesperpage"));
				var data = JSON.parse($z("#article-full-json-"+igal.articleid).html());	
				var numImages = data.images.length;
				var numPages = igal.imagesperpage > 0 ? Math.ceil(numImages / igal.imagesperpage) : 1;
			
				// check if url contains bookmarked parameters pointing to a specific page
				if ( numPages > 1 && document.location.hash === "#a"+igal.articleid && parseInt(zpGetParameterByName("page")) > 0 ){
					currentPage = parseInt(zpGetParameterByName("page"));
					if ( currentPage > numPages ){
						currentPage = numPages;
					}
					else if ( currentPage < 1 ){
						currentPage = 1;
					}
				}
			
				// render the gallery with paging
				$("noscript#"+igal.articleid).replaceWith(renderGallery(data, currentPage, igal.imagesperpage, igal.articleid, igal.imageeffect));
						
				if ( numPages > 1 ){
					var currentPageText = igal.pagetext.replace("{0}", '<span class="pageno">' + currentPage + '</span>').replace("{1}", numPages);
				
					$(igal.root).append('<div class="zppaging"><span class="zppprev"><a class="zppprev" href="#a'+igal.articleid+'">' + igal.prevtext + '</a></span>' + currentPageText +' <span class="zppnext"><a class="zppnext" href="#a'+igal.articleid+'">' + igal.nextext + '</a></span> </div>');
				
					showHideNavButtons();
				
					$z(igal.root + " .zppaging a").off("click");
					$z(igal.root + " .zppaging a").on("click", function(e){
						//e.preventDefault();
			
						$z(igal.root + " .zppaging a").removeClass("off");
				
						if ( $z(this).hasClass("zppprev") ){
							if ( currentPage > 1 ){
								currentPage = currentPage - 1;
							}
						}
						else if ( $z(this).hasClass("zppnext") ){
							if ( currentPage < numPages ){
								currentPage = currentPage + 1;
							}
						}
						// update pagenumber in paging text
						$z(igal.root + " .zppaging span.pageno").html(currentPage);
						// URL in Browser-Adressleiste aktualisieren, ohne dass der Browser die Seite lädt und zur Sprungmarke scrollt
						if (history.pushState){
							window.history.pushState("object or string", "Title", window.location.pathname + "?page=" + currentPage + "#a" + igal.articleid);
						}
			
						showHideNavButtons();
			
						$(igal.root + ' .gallery-item').remove();
						$(igal.root).prepend(renderGallery(data, currentPage, igal.imagesperpage, igal.articleid, igal.imageeffect));
						// initialize fancybox with the new images
						fancy();
					});
				}
			}
		
		
			// make it more responsive, as it used to be always fill layout width and cut off by news columns
			if ( igal.height == "auto" && $z(igal.root).hasClass("zpSlideshow") ){
				igal.width = "auto";
				var factor = $z(igal.root).data("maxheight") / $z(igal.root).data("width");
				var newwidth = $z(igal.root).parent().parent().width();
				var newhight = Math.round(newwidth * factor);
				$z(igal.root).parent().width(newwidth + 2).height(newhight + 6);
				$z(igal.root).width(newwidth + 2).height(newhight + 6);
				$z(igal.root + " .slide").width(newwidth).height(newhight + 4).css({"paddingRight":"2px", "paddingBottom":"2px"});
				$z(igal.root + " .slide .caption").width(newwidth - 2);
			}
			igal.bordercolor = $z(igal.root).data("bordercolor");
			igal.borderwidth = $z(igal.root).data("borderwidth");
			igal.margin = $z(igal.root).data("margin");
			igal.marginhor = parseInt(igal.margin)-4; // -4px compensates for space between inline-block elements https://css-tricks.com/fighting-the-space-between-inline-block-elements/
			igal.titleposition = $z(igal.root).data("titleposition");
			igal.zoom = $z(igal.root).data("transition");
			igal.transition = $z(igal.root).data("inner-transition");
		
			if (igal.transition === "none") {
				igal.changeFade = 0;
			} else {
				igal.changeFade = 100;
			}

			igal.slideshow = $z(igal.root).data("slideshow")!==0?true:false;
			igal.slideshowinterval = $z(igal.root).data("slideshowinterval") * 1000;
			igal.slideshowtimer = 0;
			igal.lang = $z(igal.root).data("lang");
		
			fancy();
		
			function fancy(){
				$z(igal.root + " .fancybox:not(.svg)").fancybox({
					'hideOnContentClick': true,
					'padding': 0,	//Space between FancyBox wrapper and content
					'margin': 30,	//Space between viewport and FancyBox wrapper
					'cyclic' 		: !igal.ispaging, 
					'centerOnScroll': true,
					'changeSpeed'	: 0, 
					'changeFade'	: igal.changeFade,
					'speedIn'		: 300,
					'speedOut'		: 300,
					'transitionIn'	: igal.zoom,
					'transitionOut'	: igal.zoom, 
					'easingIn'		: 'easeOutCubic', 
					'easingOut'		: 'easeInCubic', 
					'titleShow'		: igal.titleshow,
					'overlayColor'	: igal.overlaycolor,
					'overlayOpacity': 0.85,
					'titlePosition'	: igal.titleposition,
					'titleFormat'	: function(title, currentArray, currentIndex) {
						if ( typeof igal.htmltitle != 'undefined' && igal.htmltitle !== null && igal.htmltitle !== "" ){
							// single image
							title = igal.htmltitle;
						}
						else{
							// slideshow or gallery where data-attr ist set with the anchor
							var htmlTitle = $z(igal.root + " .fancybox").eq(currentIndex).data("htmltitle");
							if ( htmlTitle && htmlTitle != "" ){
								title = safe_decodeURI(htmlTitle);
							}
						}
						// add a classname to links in the lightbox
						title = title.replace(/<a href/g,'<a class="zpigaltitlelb" href');
						if ( currentArray.length > 1 && igal.numbershow ){
							if ( igal.lang === "en" ){
								return '<span id="fancybox-title-over">Image ' +  (currentIndex + 1) + ' of ' + currentArray.length + (title ? ": " + title : "") + '</span>';
							}
							else{
								return '<span id="fancybox-title-over">Bild ' +  (currentIndex + 1) + ' von ' + currentArray.length + (title ? ": " + title : "") + '</span>';
							}
					
						}
						else{
							return '<span id="fancybox-title-over">' + title + '</span>';
						}
					},
					'onComplete'		: function(){
						//if user set slideshow = 1 then play slideshow
						if ( igal.slideshow ){
							igal.slideshowtimer = setInterval($z.fancybox.next, igal.slideshowinterval);
						}
						// add swipe to fancybox
						$z("#fancybox-content").off("swipe");
						$z("#fancybox-content").on("swipe", function onSwipe(e, Dx, Dy){
							if ( Dx < 0 ){ // swipeLeft
								$z.fancybox.prev();
							}
							else if ( Dx > 0 ){ // swipeRight
								$z.fancybox.next();
							}
						});	
					},
					'onCleanup'		: function(){
						//if user set slideshow = 1 then stop slideshow on close of fancybox
						if ( igal.slideshow ){
							clearInterval(igal.slideshowtimer);
						}
					}
				});
				$z(igal.root + " .fancybox.svg").fancybox({
					'type':'iframe',
					'width':'100%',
					'height':'100%',
					'hideOnContentClick': true,
					'padding': 0,	//Space between FancyBox wrapper and content
					'margin': 30,	//Space between viewport and FancyBox wrapper
					'cyclic' 		: !igal.ispaging, 
					'centerOnScroll': true,
					'changeSpeed'	: 0, 
					'changeFade'	: igal.changeFade,
					'speedIn'		: 300,
					'speedOut'		: 300,
					'transitionIn'	: igal.zoom,
					'transitionOut'	: igal.zoom, 
					'easingIn'		: 'easeOutCubic', 
					'easingOut'		: 'easeInCubic', 
					'titleShow'		: igal.titleshow,
					'overlayColor'	: igal.overlaycolor,
					'overlayOpacity': 0.85,
					'titlePosition'	: igal.titleposition,
					'titleFormat'	: function(title, currentArray, currentIndex) {
						if ( typeof igal.htmltitle != 'undefined' && igal.htmltitle !== null && igal.htmltitle !== "" ){
							// single image
							title = igal.htmltitle;
						}
						else{
							// slideshow or gallery where data-attr ist set with the anchor
							var htmlTitle = $z(igal.root + " .fancybox").eq(currentIndex).data("htmltitle");
							if ( htmlTitle && htmlTitle != "" ){
								title = safe_decodeURI(htmlTitle);
							}
						}
						// add a classname to links in the lightbox
						title = title.replace(/<a href/g,'<a class="zpigaltitlelb" href');
						if ( currentArray.length > 1 && igal.numbershow ){
							if ( igal.lang === "en" ){
								return '<span id="fancybox-title-over">Image ' +  (currentIndex + 1) + ' of ' + currentArray.length + (title ? ": " + title : "") + '</span>';
							}
							else{
								return '<span id="fancybox-title-over">Bild ' +  (currentIndex + 1) + ' von ' + currentArray.length + (title ? ": " + title : "") + '</span>';
							}
					
						}
						else{
							return '<span id="fancybox-title-over">' + title + '</span>';
						}
					},
					'onComplete'		: function(){
						//if user set slideshow = 1 then play slideshow
						if ( igal.slideshow ){
							igal.slideshowtimer = setInterval($z.fancybox.next, igal.slideshowinterval);
						}
						// add swipe to fancybox
						$z("#fancybox-content").off("swipe");
						$z("#fancybox-content").on("swipe", function onSwipe(e, Dx, Dy){
							if ( Dx < 0 ){ // swipeLeft
								$z.fancybox.prev();
							}
							else if ( Dx > 0 ){ // swipeRight
								$z.fancybox.next();
							}
						});	
					},
					'onCleanup'		: function(){
						//if user set slideshow = 1 then stop slideshow on close of fancybox
						if ( igal.slideshow ){
							clearInterval(igal.slideshowtimer);
						}
					}
				});
			}
		
			// style the fancybox anchors
			var head = document.getElementsByTagName('head')[0],
			style = document.createElement('style');
		
			if ( igal.kind === "singleimage" ){
				var mystyles = "	.zpColumnItem:not(:last-child) " + igal.root + "{overflow: hidden;";
				mystyles += " width: " + igal.width + "; float: none !important; margin-bottom: 5px;";
				mystyles += "}\n";
			}
			else{
				var mystyles = "	" + igal.root + "{overflow: hidden;";
				if (igal.kind === "singleimageleft"){
					mystyles += " width: " + igal.width + "; min-height: " + igal.height + "; float: left; margin-right: 20px; margin-bottom: 5px;";
				}
				else if (igal.kind === "singleimageright"){
					mystyles += " width: " + igal.width + "; min-height: " + igal.height + "; float: right; margin-left: 20px; margin-bottom: 5px;";
				}
				else if (igal.kind === "singleimagecenter"){
					mystyles += " width: " + igal.width + "; float: none !important; margin: 0 auto 5px auto;";
				}
				else if (igal.kind === "singleimager"){
					mystyles += " width: " + igal.width + "; float: none !important; margin: 0 0 5px auto;";
				}
				mystyles += "}\n";
			}
			mystyles += igal.root + "[data-kind=singleimage] > a { \
				margin: 0 !important; \
			}\n";	

			mystyles += igal.root + "[data-kind='singleimage'] > a, " + igal.root + "[data-kind='singleimage'] .slide > a { \
					width: " + igal.width + "; \
					height: " + igal.height + "; \
					box-sizing: border-box; \
					margin: 0 " + igal.marginhor + "px " + igal.margin + "px 0;";
				
		
			if ( igal.bordercolor == "default" ){
				mystyles += "";
			}
			else if ( igal.bordercolor !== "transparent" ){
				mystyles += "	border: " + igal.borderwidth + "px solid " + igal.bordercolor + "; box-sizing: border-box;";
			}
			else{
				mystyles += "	border: none " + ";";
			}
		
			mystyles += "		padding: 0px; \
					display: inline-block; \
					text-align: center; \
					vertical-align: middle; \
					overflow: hidden; \
				}";
	
				//we need to switch borders off, since they would possibly be cut off anyway when portrait and landscape imgs are mixed and imgs will be cropped
				mystyles += igal.root +" > a img { \
					border: none !important;}";
							
			var rules = document.createTextNode(mystyles.replace(/\s+/g,' '));
			style.type = 'text/css';
			if(style.styleSheet){
					style.styleSheet.cssText = rules.nodeValue;
			}
			else{
				style.appendChild(rules);
			}
			head.appendChild(style);
		};
		
		function safe_decodeURI(uri){
			return decodeURI(uri.replace(/%(?![0-9a-fA-F][0-9a-fA-F]+)/g, '%25'));
		};
	
		function renderGallery(data, page, imagesPerPage, articleid, effectclass){
			var result = "";
		
			for (i = (page*imagesPerPage)-imagesPerPage; i < data.images.length; i++ ){
				if ( imagesPerPage > 0 && i >= (page * imagesPerPage) ){
					break;
				}
				var image = data.images[i];
			
				result += '<div class="gallery-item ' + image.thumbTitlePosition + '">';
				result += '	<a class="fancybox zpnolayoutlinkstyles" href="' + image.imagePath + '" title="' + image.description + '" data-htmltitle="' + encodeURI(image.encodedDescription) + '" data-fancybox-group="g' + igal.articleid + '" aria-label="Bild in Lightbox öffnen (open image in lightbox)">';
				if (igal.template == "flex"){
					result += '	<img class="' + effectclass + '" src="' + image.thumbPath + '" title="' + image.description + '" alt="' + image.altText + '" />';
				}
				else{
					result += '	<img class="' + effectclass + '" src="' + image.thumbPath + '" width="' + image.width + '" title="' + image.description + '" alt="' + image.altText + '" />';
				}
				result += '	</a>';
				if ( safe_decodeURI(image.encodedDescription) ){
					result += '	<div class="zpiacaption ' + image.thumbTitlePosition + '"><span>' + safe_decodeURI(image.encodedDescription) + ' &nbsp;</span></div>';
				}
				result += '</div>';
			
				if ( imagesPerPage > 0 && i >= (page * imagesPerPage)-1 ){
					result += '<div class="gallery-item last"></div>';
				}
			}
			return result;
		}
	};
	
	zp.Slideshow = function (){
		this.root = null;
		this.slideshowinterval = 5000;
		this.pauseonhover = true;
		var sshow = this;
	
		this.init = function (elemid){
			sshow.root = elemid;
			sshow.slideshowinterval = $z(sshow.root).data("slideshowinterval") * 1000;
			sshow.pauseonhover = $z(sshow.root).data("pauseonhover")!==0?true:false;
			// hide all slides except first
			$z(elemid + ' div.slide:not(:first)').css("opacity", "0");
			// start the slideshow
			sshow.slideshow = setInterval( function() { sshow.slideSwitch(elemid); }, sshow.slideshowinterval );
			// handle swipes
			$z(sshow.root).on("swipe", function onSwipe(e, Dx, Dy){
				if ( Dx !== 0 ){  //horizontalSwipe
					// reset the slider auto play timer
					clearInterval(sshow.slideshow);
					sshow.slideshow = setInterval( function() { sshow.slideSwitch(elemid); }, sshow.slideshowinterval );
				}
				if ( Dx < 0 ){ // swipeLeft
					sshow.slideSwitch(elemid, "prev");
				}
				else if ( Dx > 0 ){ // swipeRight
					sshow.slideSwitch(elemid, "next");
				}
			});
			// handle arrow keys
			$z(sshow.root).on("hover", function() {
				if (sshow.pauseonhover){
					clearInterval(sshow.slideshow);
				}
				$z(document).keydown(function(event) {
					// 37 = left arrow - 39 = right arrow
					if ( event.which === 37 ){
						sshow.slideSwitch(elemid, "prev");
					}
					else if ( event.which === 39 ){
						sshow.slideSwitch(elemid, "next");
					}
				});
			}, function() {
				// unbind the keydown handler on mouseleave
				 $z(document).off("keydown");
				// restart the slideshow
				if (sshow.pauseonhover){
					sshow.slideshow = setInterval( function() { sshow.slideSwitch(elemid); }, sshow.slideshowinterval );
				}
			});
		};
	
		this.slideSwitch = function (elemid, direction) {
			direction = typeof direction !== 'undefined' ? direction : 'next';
	
			var $active = $z(elemid + ' div.slide.active');
			if ( $active.length === 0 ){ $active = $z(elemid + ' div.slide:first');}
			var $next;
			if ( direction === "next" ){
				$next = $active.next(".slide").length ? $active.next(".slide") : $z(elemid + ' div.slide:first');
			}
			else if ( direction === "prev" ){
				$next = $active.prev(".slide").length ? $active.prev(".slide") : $z(elemid + ' div.slide:last');
			}

			$active.addClass('last-active')
				.css({"z-index": 101});

			$next.css({"opacity": "0.0"})
					.addClass('active')
					.css({"z-index": 102}) 
					.animate({"opacity": "1.0"}, 500, function() {
							$active.removeClass('active last-active')
							.css({"z-index": "100", "opacity": "0"});
			});
		};
	};

	// initialize each zpImageGallery
	$z(".zpImageGallery[id]").each(function (){
		new zp.ImageGallery().init("#" + this.id.toString());
	});
	
	//play each zpSlideshow (part of zpImageGallery)
	$z(".zpSlideshow[id]").each(function (){
		new zp.Slideshow().init("#" + this.id.toString());
	});
	
	// handle special design-blocks (grosses bild links/rechts
	$z(document).ready(function() {
		$z('.zpwBild.zpWideImageLeft').parents('.zpContainer').addClass('zpWideImageLeft');
		$z('.zpwBild.zpWideImageRight').parents('.zpContainer').addClass('zpWideImageRight');
		$z('.zpwBild.zpWideImageLeft, .zpwBild.zpWideImageRight').parents('.zpRow').addClass('zpWideImage');
		$z('.zpwBild.zpWideImageLeft, .zpwBild.zpWideImageRight').parents('.zpColumn').addClass('zpWideImage');
	});
});

$z(window).on('load', function() {		
	var fadeduration = 300;
	var zoomEvent = "click";
	var zoomThreshold = 1.2;
	
	var zoomInCallback = function(){
		$z(this).addClass("zoomed");
		var currentContainer = $z(this).parents("div.zoomable");
		var currentImage = currentContainer.find("img:first");
		var borderRadius = currentImage.css("border-radius");
		var border = currentImage.css("border");
		var boxShadow = currentImage.css("box-shadow");
		
		// add image styles to container, so that image styles are inherited from the image
		currentContainer.css("border-radius", borderRadius);
		currentContainer.css("border", border);
		currentContainer.css("box-shadow", boxShadow);
	};
	var zoomOutCallback = function(){
		$z(this).removeClass("zoomed");
		var currentContainer = $z(this).parents("div.zoomable");
		// remove image styles from container after a delay (fadeduration), so animations can finish
		setTimeout(function() { 
			currentContainer.css("border-radius", "");
			currentContainer.css("border", "");
			currentContainer.css("box-shadow", "");	
		},fadeduration);
	};
	
	// zoomed product images	
	$z('.zpwBild .productimage.zoomable').each(function(e){
		var that = $(this);
		var currentImage = that.find("img:first");
		var displayedWidth = parseInt(currentImage.css("width"));
		var zoomUrl = that.attr("data-zoom");
		
		
		if ( zoomUrl ){
			// only zoom if image in data-zoom is wider than currently displayed image
			var zoomImg = new Image();
			zoomImg.src = zoomUrl;
			zoomImg.onload = function() {
				if ( displayedWidth * zoomThreshold < zoomImg.naturalWidth ){
					that.zoom({onZoomIn: zoomInCallback, onZoomOut: zoomOutCallback, duration: fadeduration, on: zoomEvent, url: zoomUrl});
				}
			};
		} else {
			// only zoom if image is actually wider than already displayed
			currentImage.eq(0).onload = function(){
				if ( displayedWidth * zoomThreshold < that.find("img:first").get(0).naturalWidth ){
					that.zoom({onZoomIn: zoomInCallback, onZoomOut: zoomOutCallback, duration: fadeduration, on: zoomEvent});
				}
			};
		}
	});
	// trigger mouseover on image which is overlayed by zoom-image
	$z('.zpwBild .productimage.zoomable').each(function(e){
		$z(this).off('mouseenter.zoomable');
		$z(this).on('mouseenter.zoomable', function(e){
			$(this).find("img:first").addClass('hover');
		});
		$z(this).off('mouseleave.zoomable');
		$z(this).on('mouseleave.zoomable', function(e){
			$(this).find("img:first").removeClass('hover');
		});
	});
	
});
