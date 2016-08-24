/*! rModal - v1.0.0 - 2016-08-24
* https://github.com/SubZane/rmodal
* Copyright (c) 2016 Andreas Norman; Licensed MIT */
var rModal = (function () {
	var innerHeight = document.documentElement.clientHeight;
	var overlay;
	var scrollbarWidth;

	// Modal object used to store all modal data for quick access.
	var modal = {
		element: null,
		name: '',
		isFed: false,
		ajaxdataurl: ''
	};

	// Default options.
	var defaults = {
		transitiontime: 300,
		redrawOnResize: true,
		logerrors: false,
	};

  var init = function (settings) {

		options = extend(defaults, settings || {});

		detectScrollbarWidth();

		document.querySelector('body').innerHTML += '<div class="rModal-overlay"></div>';
		overlay = document.querySelector('.rModal-overlay');

		// Prevent scroll if content doesn't need scroll.
		var modals = document.querySelectorAll('.rModal');
		forEach(modals, function (index, value) {
			index.addEventListener('touchmove', function (e) {
				if (index.scrollHeight <= parseInt(innerHeight, 10)) {
					e.preventDefault();
				}
			});
		});

		var rmodals = document.querySelectorAll('[data-modal]');
		forEach(rmodals, function (index, value) {
			index.addEventListener('click', function (e) {
				e.preventDefault();
				modal.name = index.getAttribute('data-modal');
				modal.effect = index.getAttribute('data-effect');
				modal.element = document.querySelector('#' + modal.name);
				modal.element.classList.add(modal.effect);

				// Force element to apply new css rules
				modal.element.style.display='none';
				var temp = modal.element.offsetHeight; // no need to store this anywhere, the reference is enough
				modal.element.style.display='';

				if (modal.element.hasAttribute('data-modaldata')) {
					modal.isFed = true;
					modal.ajaxdataurl = modal.element.getAttribute('data-modaldata');
				} else {
					modal.isFed = false;
				}

				// Close the modal if overlay behind is touched/clicked. Not working at the moment.
				('click touchmove touchend touchleave touchcancel'.split(' ')).forEach(function (event) {
					overlay.addEventListener(event, function (e) {
						if (e.target === this) {
							close();
						}
					});
				});

				if (options.redrawOnResize === true) {
					var resizeTimer;
					clearTimeout(resizeTimer);
					resizeTimer = setTimeout(afterWindowResize, 100);
				}

				window.addEventListener('orientationchange', function() {
					setHeight();
				});
				open();
			});
		});

  };

	var isMobileBrowser = function () {
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
			return true;
		} else {
			return false;
		}
	};

	var hasVerticalScroll = function () {
		var scrollHeight = document.body.scrollHeight;
		var clientHeight = document.documentElement.clientHeight;
		var hasVerticalScrollbar = scrollHeight > clientHeight;
		return hasVerticalScrollbar;
	};

	var createModalWindow = function () {
	};

	var destroyModalWindow = function (modal_id) {
	};

	var detectScrollbarWidth = function () {
		var outer = document.createElement('div');
		outer.style.visibility = 'hidden';
		outer.style.width = '100px';
		outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps

		document.body.appendChild(outer);

		var widthNoScroll = outer.offsetWidth;
		// force scrollbars
		outer.style.overflow = 'scroll';

		// add innerdiv
		var inner = document.createElement('div');
		inner.style.width = '100%';
		outer.appendChild(inner);

		var widthWithScroll = inner.offsetWidth;

		// remove divs
		outer.parentNode.removeChild(outer);

		scrollbarWidth = widthNoScroll - widthWithScroll;
	};

	var loadContent = function () {
		var request = new XMLHttpRequest();

		request.open('GET', modal.ajaxdataurl, true);

		request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
				// Success!
				var response = JSON.parse(request.response);
				var _content = response.content;
				modal.element.querySelector('.rModal').innerHTML += '<div class="content">'+ _content +'</div>';
			} else {
				// We reached our target server, but it returned an error
				if (options.logerrors) {
					console.log('An error occured when trying to load data from ' + modal.ajaxdataurl);
				}
			}
		};
		request.onerror = function () {
			// There was a connection error of some sort
			if (options.logerrors) {
				console.log('A connection error occured when trying to access ' + modal.ajaxdataurl);
			}
		};
		request.send();

	};

	var afterWindowResize = function() {
		innerHeight = window.innerHeight;
		setHeight();
	};

	var setHeight = function () {
		modal.element.style.height = innerHeight;
	};

	var open = function () {
		setHeight(modal.name);
		if (hasVerticalScroll() === true && isMobileBrowser() === false) {
			document.querySelector('body').style.marginRight = scrollbarWidth + 'px';
		}
		document.querySelector('body').classList.add('rModal-locked');
		document.querySelector('html').classList.add('rModal-locked');
		overlay.classList.add('fadein');

		if (modal.isFed) {
			loadContent();
		}
		modal.element.classList.add('rModal-active');
		modal.element.classList.add('md-show');

		setTimeout(function () {
			modal.element.classList.add('md-animation-done');
		}, options.transitiontime);

		modal.element.querySelector('.md-cross').addEventListener('click', function(e) {
			e.preventDefault();
			close();
		});
	};

	var close = function () {
		modal.element.classList.remove('md-show');
		modal.element.classList.remove('md-animation-done');

		overlay.classList.add('fadeout');
		// let's wait for the neat animations to finish!
		setTimeout(function () {
			overlay.classList.remove('fadein');
			overlay.classList.remove('fadeout');
			document.querySelector('body').classList.remove('rModal-locked');
			document.querySelector('html').classList.remove('rModal-locked');
			/*
			If the content is fetched with ajax, we need to remove the content div in order to avoid duplicate content.
			An alternative would be not to fetch content on the second click.
			*/
			if (modal.isFed) {
				modal.element.querySelector('.rModal .content').remove();
			}
			document.querySelector('body').style.marginRight = '';
			modal.element.classList.remove(modal.effect);
		}, options.transitiontime);
	};


	/*

	Helper functions

	*/

	var hasClass = function (element, classname) {
		if (element.classList.contains(classname)) {
			return true;
		} else {
			return false;
		}
	};

	/**
	 * Merge defaults with user options
	 * @private
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 * @returns {Object} Merged values of defaults and options
	 */
	var extend = function (defaults, options) {
		var extended = {};
		forEach(defaults, function (value, prop) {
			extended[prop] = defaults[prop];
		});
		forEach(options, function (value, prop) {
			extended[prop] = options[prop];
		});
		return extended;
	};

	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	var forEach = function (collection, callback, scope) {
		if (Object.prototype.toString.call(collection) === '[object Object]') {
			for (var prop in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, prop)) {
					callback.call(scope, collection[prop], prop, collection);
				}
			}
		} else {
			for (var i = 0, len = collection.length; i < len; i++) {
				callback.call(scope, collection[i], i, collection);
			}
		}
	};

	/*

	Return public methods here

	*/

  return {
    init: init,
  };
})();
