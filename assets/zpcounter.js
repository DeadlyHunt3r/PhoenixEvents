$z(window).on('load', function(){
	function counterObserverCallback (entries, observer) { 
	  entries.forEach(function(entry) {
		var counter = $z(entry.target);
		var min = parseInt(counter.attr('data-min'));
		var max = parseInt(counter.attr('data-max'));
		var duration = parseInt(counter.attr('data-duration')) || 3;
		
		if ( entry.isIntersecting ){	
			// counter became visible. Wait 500ms and then start counting
			setTimeout(function() {
				$({countNum: min}).animate({countNum: max}, {
				  duration: duration*1000,
				  easing:'swing',
				  step: function() {
					// What todo on every count
					counter.html(Math.floor(this.countNum));
				  },
				  complete: function() {
					observer.unobserve(entry.target);
					counter.html(max);
				  }
				});
			}, 500);
		}
		else{
			counter.html(min);
		}
	  });
	};

	var counterObserver;
	var counterObserverOptions = {
	  root: null,
	  rootMargin: '0px',
	  threshold: 1
	}
   
	if ( $z.support.IntersectionObserver ){
    	counterObserver = new IntersectionObserver(counterObserverCallback, counterObserverOptions);
    	
    	$z('.zpcounterwidget').each(function(){
    		var counter = $z(this)[0];
    		counterObserver.observe(counter);
		});
    }
    else{
    
    }

});
