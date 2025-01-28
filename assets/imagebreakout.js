/*! $Id: imagebreakout.js 2022-03-03 13:19:14 +0100 Stefan S  8346573d72a0df1280fcb1adcebeb168cba1069f $ */

$z(document).ready(function () {
	function setImageBreakout(){
		var bodyWidth = $z("body").outerWidth();
		// image widget
		$z(".supportsbreakout body:not(.withnews) .zpColumn .zpwBild.zpBreakout.left:not(.hasNews), body.supportsbreakout:not(.withnews) .zpColumn .zpwBild.zpBreakout.left:not(.hasNews)").each( function(index, value){
			// adjust css of image wrapper
			// // $z(this).css("width",bodyWidth+"px").css("padding-left", "0").css("margin-left","calc(-" + bodyWidth/2 + "px + 50% )")
			//var offset = $z(this).offset().left;
			var offset = $z(this).css("margin-left","0").css("margin-right", "0").css("width", "").offset().left;
			//console.warn("Breakout IMG offset: " + offset);
			$z(this).css({
				"padding": "0",
				"margin-left": "-" + offset + "px",
				"margin-right": "-15px",
				"margin-bottom": "0",
				"border-radius": "" 
			});
			
			// set image width to browser-window-width, so it also enlarges if necessary
			// // $z(this).find('img.singleImage').css('width', bodyWidth + 'px').css('max-width','none');
			
			// set width of image description to column-width and horizontally center it
			var columnWidth = parseInt($z(this).parent('.zpColumnItem').width()) + "px";
			$z(this).find('.imagedescription').css("max-width", columnWidth).css("margin-left", "auto").css("margin-right", "auto");
		});
		
		$z(".supportsbreakout body:not(.withnews) .zpColumn .zpwBild.zpBreakout.right:not(.hasNews), body.supportsbreakout:not(.withnews) .zpColumn .zpwBild.zpBreakout.right:not(.hasNews)").each( function(index, value){
			// adjust css of image wrapper
			// // $z(this).css("width",bodyWidth+"px").css("padding-left", "0").css("margin-left","calc(-" + bodyWidth/2 + "px + 50% )")
			var offset = bodyWidth - ( $z(this).css("margin-left","0").css("margin-right", "0").css("width", "").offset().left + $z(this).width() );
			$z(this).css({
				"padding": "0",
				"margin-right": "-" + offset + "px",
				"margin-left": "-15px",
				"margin-bottom": "0",
				"border-radius": "" 
			});
			
			// set image width to browser-window-width, so it also enlarges if necessary
			// // $z(this).find('img.singleImage').css('width', bodyWidth + 'px').css('max-width','none');
			
			// set width of image description to column-width and horizontally center it
			var columnWidth = parseInt($z(this).parent('.zpColumnItem').width()) + "px";
			$z(this).find('.imagedescription').css("max-width", columnWidth).css("margin-left", "auto").css("margin-right", "auto");
		});
		
		// make sure parent column has no top/bottom padding
		$z("body:not(.withnews):not(#addspecificity) .zpColumn:has(.zpwBild.zpBreakout)").css({
			"margin-top": "0px",
			"margin-bottom": "0px"
		});
	}
	
	// if we have breakout images, take care of them at load and resize
	if ( $z('.zpwBild.zpBreakout').length > 0 ){
		var resizeTimeout = null;
		$z(window).on("resize", zpthrottle(200, function(event) {
			var event = event || window.event;
			if ( event && $z(event.target.nodeType).length == 0 ){// enable window.resize only for the window object (resizing elements might also trigger window.resize) which doesn't have a nodeType
				setImageBreakout();
			}
		}));
		setImageBreakout();
	}
});