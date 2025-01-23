/*! 
 * ZP Tabs Widget
 * $Id$
 * Copyright Zeta Software GmbH
 */

// define zp Namespace for later use in individual widgets if not only defined
if ( typeof(zp)==="undefined" ){
	var zp = {};
}

$z(document).ready(function () {
	zp.Tabs = function (){
		this.root = null;
		this.bgcoloractive = "#ffffff";
		this.bgcolorinactive = "#f7f7f7";
		this.textcoloractive = "#5e5e5e";
		this.textcolorinactive = "#777777";
		this.bordercolor = "#e7e7e7";
	
		var tabs = this;

		// globals
		var $active, $content, $mobilecontent, $links, clonedidprefix = "m";
	
		this.init = function (elemid){
			tabs.root = elemid;
		
			var tabBreakpoint = 319;
		
	
			// add class if container width is below tabBreakpoint, so the element is also responsive to its own width and not only the viewport
			var tabwidth = 0;
			if ( $z(window).width() > tabBreakpoint ){
				// we only calculate tabwidth if TABs are displayed normally (> tabBreakpoint)
				$z("div" + tabs.root + ".zpTABs ul.zpTABs li.tab").each( function(){ tabwidth += $z(this).outerWidth();});
			}
			$z( window ).on("resize", function() {
			  tabs.beresponsive(tabBreakpoint, tabwidth);
			});
			tabs.beresponsive(tabBreakpoint, tabwidth);
	
			tabs.bgcoloractive = $z(tabs.root).data("bgcoloractive") || tabs.bgcoloractive;
			tabs.bgcolorinactive = $z(tabs.root).data("bgcolorinactive") || tabs.bgcolorinactive;
			tabs.textcoloractive = $z(tabs.root).data("textcoloractive") || tabs.textcoloractive;
			tabs.textcolorinactive = $z(tabs.root).data("textcolorinactive") || tabs.textcolorinactive;
			tabs.bordercolor = $z(tabs.root).data("bordercolor") || tabs.bordercolor;
	
			// define some styles based on settings received in data-attribute
			var head = document.getElementsByTagName('head')[0],
			style = document.createElement('style'),
			mystyles =  "    div" + tabs.root + ".zpTABs > ul.zpTABs > li{ color: " + tabs.textcolorinactive + "; background-color: " + tabs.bgcolorinactive +"; border-color: " + tabs.bordercolor + ";}";
			mystyles += "    div" + tabs.root + ".zpTABs > ul.zpTABs > li a.zpTABs{ color: " + tabs.textcolorinactive + " !important;}";
			mystyles += "    div" + tabs.root + ".zpTABs > ul.zpTABs > li a.zpTABs:hover{ color: " + tabs.textcolorinactive + " !important;}";
			mystyles += "    div" + tabs.root + ".zpTABs > ul.zpTABs > li.active{ color: " + tabs.textcoloractive + "; background-color: " + tabs.bgcoloractive +"; border-color: " + tabs.bordercolor +";}";
			mystyles += "    div" + tabs.root + ".zpTABs > ul.zpTABs > li.acc{ color: " + tabs.textcoloractive + "; background-color: " + tabs.bgcoloractive +"; border-color: " + tabs.bordercolor +";}";
			mystyles += "    div" + tabs.root + ".zpTABs > ul.zpTABs > li.active a.zpTABs{ color: " + tabs.textcoloractive + " !important;}";
			mystyles += "    div" + tabs.root + ".zpTABs > ul.zpTABs > li.active a.zpTABs:hover{ color: " + tabs.textcoloractive + " !important;}";
			mystyles += "    div" + tabs.root + ".zpTABs > ul.zpTABs > li.tab.active::after{ border-color: " + tabs.bordercolor + ";}";
			mystyles += "    div" + tabs.root + ".zpTABs > ul.zpTABs > li.tab.active::before{ border-color: " + tabs.bordercolor + ";}";
			mystyles += "    div" + tabs.root + ".zpTABs > ul.zpTABs > li.acc > *:not(a){ color: " + tabs.textcoloractive + ";}";
	
			mystyles += "    div" + tabs.root + ".zpTABs > div.active{ border-color: " + tabs.bordercolor + "; background-color: " + tabs.bgcoloractive +";}";
			mystyles += "    div" + tabs.root + ".zpTABs > div.active > *:not(a){ color: " + tabs.textcoloractive + ";}";
	
	
			// inject styles 
			var rules = document.createTextNode(mystyles.replace(/\s+/g,' '));
			style.type = 'text/css';
			if(style.styleSheet){
					style.styleSheet.cssText = rules.nodeValue;
			}
			else{
				style.appendChild(rules);
			}
			head.appendChild(style);
		
			$z(elemid + ' ul.zpTABs').each(function(){
				var currenttab = this;
				var numtabs = $z(this).find('li.tab a.zpTABs').length;
				var lastclass = "";
		
				/*
				$z(this).find('li.tab:not(.accordion) a.zpTABs').each(function(i){
					if ( i === numtabs ){ // last iteration
						lastclass = " last";
					}
					$content = $z("div[data-tabid='" + $z(this).attr('href').substr(1) + "']");
					$clone = $content.clone().insertAfter($z(this).parent());
					$clone.wrapInner('<li data-tabid="' + $z(this).attr('href').substr(1) + clonedidprefix + '" class="touchonly acc' + lastclass + '" />').children().unwrap();
					// suffix all id's in cloned element with m
					$z(this).parent().next().find("[id]").each(function(){
						this.id = this.id + clonedidprefix;
					});
					// suffix all for attribs of labels in cloned element with m
					$z(this).parent().next().find("[for]").each(function(){
						$z(this).attr("for", $z(this).attr("for")+clonedidprefix);
					});
				});
				*/
		
				// http://blog.ha-com.com/2012/06/09/ein-jquery-tab-tutorial/
				// Fuer jeden Satz Tabs wollen wir verfolgen welcher
				// Tab aktiv ist und der ihm zugeordnete Inhalt
				//var $active, $content, $mobilecontent, 
				$links = $z(this).find('a.zpTABs');
		
				// make selecting tabs based on the url#hash work also via other relative urls which don't cause a page reload
				var that = this;
				$z(window).off('hashchange.zptabs'+elemid);
				$z(window).on('hashchange.zptabs'+elemid, function(){
					tabs.setActiveTabFromHash(that, tabs.root);
				});
		
				// on init, set active tab if url contains hash to the tab
				tabs.setActiveTabFromHash(that, tabs.root);
		
				// Binde den click event handler ein 
				$z("a.zpTABs", this).off();
				$z("a.zpTABs", this).on("click", function(event){
					// click event verschlucken
					event.preventDefault();
					var isAccordion = $z("div" + tabs.root ).hasClass("accordion") || $z("div" + tabs.root ).hasClass("small");
					var isAutocloose = $z("div" + tabs.root + ".accordion > ul.zpTABs").hasClass("autoclose");
					
					// URL in Browser-Adressleiste aktualisieren, ohne dass der Browser die Seite lädt und zur Sprungmarke scrollt
					if (history.pushState){
						window.history.pushState("object or string", "Title", window.location.pathname + $z(this).attr("href"));
					}
				
					if ( numtabs && numtabs < 2 && !isAccordion ){
						// wenn nur ein TAB im Widget definiert ist, soll der Click keine weiteren Auswirkungen haben
						return;
					}
			
					// Aktualisiere die Variablen mit dem neuen Link und Inhalt
					$active = $z(this);
					$content = $z("div[data-tabid='" + $active.attr('href').substr(1)  + "']");
					$mobilecontent = $z("li[data-tabid='" + $active.attr('href').substr(1) + clonedidprefix + "']");
							
					debug.log("ZP-Tabs autoclose: " + isAutocloose + " / pageY: " + event.pageY + " / click: ", $(this));
						
					if ( isAccordion ){
						// memorize current X scroll and Y click position before dom is changed
						var currentX = window.scrollX || 0;
						var elemY = $active[0].getBoundingClientRect().top || 0;
						
						$z("li", that).removeClass('noani');
						setTimeout(function() {
							// close other accordions
							$z(elemid + ' ul.zpTABs.autoclose li.accordion.active').removeClass("active");
							// open clicked accordion 
							$active.parent().toggleClass('active');
							$mobilecontent.toggleClass('active');
							
							if ( isAutocloose ){
								// keep accordion head at Y location (no scroll due to toggled content)
								var diffY = elemY - $active[0].getBoundingClientRect().top;
								window.scrollTo(currentX, window.scrollY - diffY);
							}
						}, 5);
					}
					else{
						// Mache alle Tabs inaktiv
						$z("div" + tabs.root + ".zpTABs *").removeClass('active');
						// Setze den Tab und seinen Inhalt (desktop und mobil) aktiv
						$active.parent().addClass('active');
						$content.addClass('active');
						$mobilecontent.addClass('active');
					}
				});
			});
	
		};
	
		this.setActiveTabFromHash = function(currentTab, tabsRoot){
			$active = $z(currentTab).find("a.zpTABs[href='" + window.location.hash + "']");
			if ( $active.length  ){
				$z("div" + tabsRoot + ".zpTABs *").removeClass('active');
			
				$content = $z("div[data-tabid='" + $active.attr('href').substr(1) + "']");
				$mobilecontent = $z("li[data-tabid='" + $active.attr('href').substr(1) + clonedidprefix + "']");
				$content.addClass("active");
			
				$z($active).parent().addClass('active noani');
				$mobilecontent.addClass("active noani");
			}
		
			return;
		};

		this.beresponsive = function (tabBreakpoint, tabwidth){
			var containerwidth = $z("div" + tabs.root + ".zpTABs").outerWidth();
			if ( $z(window).width() > tabBreakpoint && tabwidth === 0 ){
				// tabwidth was never set, because page was loaded on a smallscreen (< tabBreakpoint), we need to recalculate tab-width while displayed normally (> tabBreakpoint sans .small class)
				$z("div" + tabs.root + ".zpTABs:not(.accordion)").removeClass("small");
				$z("div" + tabs.root + ".zpTABs:not(.accordion) ul.zpTABs li.tab").each( function(){ tabwidth += $z(this).outerWidth();});
			}
			if ( $z(window).width() > tabBreakpoint && containerwidth < tabwidth ){
				$z("div" + tabs.root + ".zpTABs:not(.accordion)").addClass("small smallcontainer");
			}
			else if ( $z(window).width() < tabBreakpoint ){
				$z("div" + tabs.root + ".zpTABs:not(.accordion)").addClass("small");
			}
			else{
				$z("div" + tabs.root + ".zpTABs:not(.accordion)").removeClass("small");
			}
		};


	};

	// initialize TABs
	$z("div.zpTABs[id]").each(function (){
		new zp.Tabs().init("#" + this.id.toString());
	});
	
	// accordion widget
	$z('div.zpAccordion .accordion-heading').on("click", function( event ){
		event.preventDefault();
		$z(this).parent().find(".accordion-content").slideToggle("fast");
		$z(this).parent().toggleClass("active");
	});
});
