/*!
	tinyRotary.js: jQuery Content Carousel plugin - v0.8 - 10/22/2011
	http://www.frankiejr.com/projects/code/tiny-rotary/
	Copyright (c) 2011 Frankie Benevides Jr. "frankiejr"
	Dual licensed under the MIT and GPL licenses
*/
(function($){
	$.rotary = {
		opt: {
			multiplier : 1,         // The multiplier: How many tiles are visible at once
			speed      : 250,       // Length of tile change animation (in milliseconds)
			interval   : 0,         // Autoplay interval (in milliseconds / 0 for no autoplay)
			rtl        : true,      // Right to left auto animation (false for "left to right")
			vSize      : true,      // Vertical resize between tabs
			tray       : 'ul',      // Tray selector
			tile       : 'li',      // Tile selector
			win        : 'window',  // Class of the viewable "window" area
			prev       : 'prev',    // Class of the "previous" button (leave empty for no previous button)
			next       : 'next',    // Class of the "next" button (leave empty for no next button)
			prevTxt    : '&laquo;', // Previous button text
			nextTxt    : '&raquo;', // Next button text
			btnBox     : 'btns',    // Class of previous/next button container
			nav        : 'tiny-rotary-nav', // Class of List Navigation (leave empty for no list navigation)
			active     : 'active'   // Active class for current nav item
		}
	};
	$.fn.tinyRotary = function(opt) {
		// Get the options
		var opt = $.extend({}, $.rotary.opt, opt);
		this.each(function() {
			// Create a new rotary, apply the options
			$(this).data(new Rotary($(this), opt));
		});
	};

	function Rotary(el, opt){

		// Set up basic variables
		var obj = $(el);
		var tray = obj.children(opt.tray+':first');
		var tiles = tray.children();
		var total = tiles.length;
		// Set tile width based on the first tile (used for calculation)
		var tileW = $(tiles[0]).outerWidth(true);
		// Buttons & container
		var btnBox;
		var prev;
		var next;
		var nav;

		// Calculate the multiplier
		if ( total > opt.multiplier ) {
			var m = opt.multiplier;
			// if there is at least one button, create a button container
			if( opt.prev.length > 0 || opt.next.length > 0 || opt.nav.length > 0 ) {
				btnBox = obj.append('<div class="'+opt.btnBox+'" />').find('.'+opt.btnBox);
			}
			// If list navigation class exists
			if ( opt.nav.length > 0 ) {
				buildNav();
			};
			// If either the prev or next button class exists
			if( opt.prev.length > 0 || opt.next.length > 0 ) {
				buildButtons();
			};
			// If autoplay is true
			if ( opt.interval > 0 ) {
				autoPlay();
			};
		};
		if ( total < opt.multiplier*2 && total > opt.multiplier ) {
			// If the amount of tiles is less than 2x multiplier, but more than 1x multiplier
			m = 1;
		} else if ( total <= opt.multiplier ) {
			// If the number of tiles is equal to or less than the multiplier
			m = 0;
		};


		// Previous & Next buttons
		function buildButtons() {
			// Add previous button & bind click
			if( opt.prev.length > 0 ) {
				prev = btnBox.prepend('<a href="#" class="'+opt.prev+'">'+opt.prevTxt+'</a>').find('.'+opt.prev);
				prev.bind('click', function(event) {
					event.preventDefault();
					if( opt.vSize === true && m == 1 ) {
						var h = tray.children(opt.tile+':last').height();
					};
					animateTray('prev', m, h);
				});
			};
			// Add next button & bind click
			if( opt.next.length > 0 ) {
				next = btnBox.append('<a href="#" class="'+opt.next+'">'+opt.nextTxt+'</a>').find('.'+opt.next);
				next.bind('click', function(event) {
					event.preventDefault();
					if( opt.vSize === true && m == 1 ) {
						var h = tray.children(opt.tile+':eq(1)').height();
					};
					animateTray('next', m, h);
				});
			};
		};


		// List navigation
		function buildNav() {
			// Create list, place between prev/nav buttons
			nav = btnBox.append('<ul class="'+opt.nav+'" />').find('.'+opt.nav);
			// Loop through tiles and create nav buttons
			for (var t=0; t < total; t++) {
				// Add data-num to tile for reference later
				$(tiles[t]).attr('data-num', t);
				// Create the button
				var button = nav.append('<li data-num="'+t+'"><a href="#">'+t+'</a></li>').find('li:last');
				// Bind each button to corresponding tile
				button.bind('click', function(event) {
					event.preventDefault();
					// Only animate if tray is not moving
					if( tray.is(':animated') != true && $(this).hasClass(opt.active) != true ) {
						// Find the corresponding target tile by getting the data-num
						var target = parseInt($(this).attr('data-num'));
						// Find where indexed tile is in the current tray order
						var currentOrder = tray.children();
						var loc;
						for (loc=0; loc < currentOrder.length; loc++) {
							if ( $(currentOrder[loc]).attr('data-num') == target ) {
								break;
							};
						};
						// Find which tile is currently at zero
						var current = parseInt($(currentOrder[0]).attr('data-num'));
						// Calculate difference between current and target, which reveals animation count							
						var diff = target-current;
						if( diff > 0 ) {
							// Target is ahead of current
							if( diff <= (total/2) ) {
								// Shortest distance to target is forwards
								var dir = 'next';
								var dist = diff;
							} else {
								// Shortest distance to target is backwards
								var dir = 'prev';
								var dist = total-diff;
							};
						} else if( diff < 0 ) {
							// Target is behind current
							diff = Math.abs(diff);
							if( diff <= total/2 ) {
								// Shortest distance to target is backwards
								var dir = 'prev';
								var dist = diff;
							} else {
								// Shortest distance to target is forwards
								var dir = 'next';
								var dist = total-diff;
							};
						};
						if( opt.vSize === true && m == 1 ) {
							h = tray.children(opt.tile+':eq('+dist+')').height();
						};
						animateTray(dir, dist, h);
					};
				});
			};
			// If list navigation exists, set active states
			if ( opt.nav.length > 0 ) {
				setActive(0);
			};
		};


		// Set & keep track of nav active state
		function setActive(num) {
			nav.children().removeClass(opt.active);
			if( m <= 1 ) {
				// If multiplier is 1, mark a single button active
				nav.find('li:eq('+num+')').addClass(opt.active);
			} else if( m > 1 ) {
				// If multiplier > 1, mark correpsonding buttons active
				var btns = nav.children();
				for (var b=num; b < num+m; b++) {
					nav.find('li:eq('+b+')').addClass(opt.active);
				};
				if( num+m > total ) {
					var leftover = (num+m)-total;
					nav.find('li:lt('+leftover+')').addClass(opt.active);
				};
			};
		};


		// Tray animation
		function animateTray(dir, count, height) {
			// Only animate if tray is not moving
			if( tray.is(':animated') != true ) {
				var loopers;
				var distance = (count*tileW);
				if( dir === 'prev' ) {
					// If clicking "previous"
					var dir = '+';
					// Prepare tiles for cloning & animation
					loopers = tray.children(opt.tile+':gt('+(total-count-1)+')');
					loopers.clone().prependTo(tray);
					// Set tray position to prepare for animation back to zero
					tray.css('left', -distance);
				} else if( dir === 'next' ) {
					// If clicking "next"
					var dir = '-';
					// Prepare tiles for cloning & animation
					loopers = tray.children(opt.tile+':lt('+count+')');
					loopers.clone().appendTo(tray);
				};
				// Animate
				tray.animate({
					left: dir+'='+distance,
					height: height
				}, opt.speed, function() {
					// After animation, remove clone sources & reset tray to zero
					loopers.remove();
					tray.css('left',0);
					// If list navigation exists, set active states
					if ( opt.nav.length > 0 ) {
						setActive( parseInt(tray.find(':first-child').attr('data-num')) );
					};
				});
			};
		};


		// Autoplay
		function autoPlay() {
			// If the interval is set and there are enough tiles to animate
			if( opt.interval > 0 && m != 0 ){
				var timer;
				function slideTimer() {
					// Set the autoplay interval & direction
					timer = setInterval(function() {
						if( opt.rtl === true ) {
							animateTray('next', m);
						} else {
							animateTray('prev', m);
						};
					}, opt.interval);
				};
				slideTimer();
				// Stop autoplay on mouseover, restart on mouseout
				obj.hover(
					function() {
						clearInterval(timer);
					},
					function() {
						slideTimer();
					}
				);
			};
		};


		// Create window & set width/height of window & tray
		tray.wrap('<div class="'+opt.win+'" style="width: '+(opt.multiplier*tileW)+'px;" />');
		tray.css('width', (total*tileW)*2);
		if( opt.vSize === true ) {
			var trayH = tray.children(opt.tile+':eq(0)').height();
			tray.css('height', trayH);
		} else {
			var h = tray.outerHeight();
		};


	};
})(jQuery);