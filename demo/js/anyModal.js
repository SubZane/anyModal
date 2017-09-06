/*! anyModal - v1.1.0 - 2017-09-06
* https://github.com/SubZane/anymodal
* Copyright (c) 2017 Andreas Norman; Licensed MIT */
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory(root));
	} else if (typeof exports === 'object') {
		module.exports = factory(root);
	} else {
		root.anyModal = factory(root);
	}
})(typeof global !== 'undefined' ? global : this.window || this.global, function (root) {

	'use strict';

	//
	// Variables
	//

	var anyModal = {}; // Object for public APIs
	// Modal object used to store all modal data for quick access.
	var modal = {
		element: null,
		name: '',
		effect: 'am-effect-1',
		title: '',
		url: null
	};
	var supports = !!document.querySelector && !!root.addEventListener; // Feature test
	var settings;
	var el;
	var innerHeight = document.documentElement.clientHeight;
	var scrollbarWidth;
	var overlay;
	// Need to get the topbar height in order to later set the correct height of .anyModal-content

	// Default settings
	var defaults = {
		transitiontime: 300,
		redrawOnResize: true,
		logerrors: false,
		backgroundscroll: true,
		onInit: function () {},
		onCreateModal: function () {},
		onDestroyModal: function () {},
		onOpen: function () {},
		onClose: function () {},
		onDestroy: function () {},
		OnOrientationChange: function () {},
		onLoadModalContent: function () {},
		afterWindowResize: function () {}
	};

	//
	// Methods
	//

	var detectScrollbarWidth = function () {
		// Create the measurement node
		var scrollDiv = document.createElement('div');
		scrollDiv.className = 'scrollbar-measure';
		document.body.appendChild(scrollDiv);

		// Get the scrollbar width
		scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
		//console.warn(scrollbarWidth); // Mac:  15

		// Delete the DIV
		document.body.removeChild(scrollDiv);
	};

	var createOverlay = function () {
		var div = document.createElement('div');
		div.classList.add('am-overlay');
		document.body.appendChild(div);
		overlay = document.querySelector('.am-overlay');
	};

	var appendHtml = function (el, str, callback) {
		var div = document.createElement('div');
		div.innerHTML = str;
		while (div.children.length > 0) {
			el.appendChild(div.children[0]);
		}
		callback(true);
	};

	var createModal = function (callback) {
		var html = '<div class="am-modal" id="'+modal.name+'"><div class="am-content"><div class="am-header"><h3>'+modal.title+'</h3><a href="#" class="am-cross"><img src="img/cross.svg" width="19" height="19" alt="" /></a></div><div class="am-inner"></div></div></div>';
		appendHtml(document.body, html, function (callback) {
			modal.element = document.querySelector('#' + modal.name);
			modal.element.classList.add(modal.effect);
			// Force element to apply new css rules
			modal.element.style.display='none';
			var temp = modal.element.offsetHeight; // no need to store this anywhere, the reference is enough
			modal.element.style.display='';
		});
		hook('onCreateModal');
		callback(true);
	};

	var destroyModal = function () {
		modal.element.remove();
		hook('onDestroyModal');
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

	var afterWindowResize = function () {
		innerHeight = window.innerHeight;
		setHeight();
		hook('afterWindowResize');
	};

	var setHeight = function () {
		modal.element.style.height = innerHeight;
	};

	var loadContent = function (callback) {
		var request = new XMLHttpRequest();
		request.open('GET', modal.url, true);
		request.onload = function () {
			if (request.status >= 200 && request.status < 400) {
				// Success!
				modal.data = request.response;
				hook('onLoadModalContent');
				callback(true);
			} else {
				// We reached our target server, but it returned an error
				if (options.logerrors) {
					console.log('An error occured when trying to load data from ' + modal.url);
					callback(false);
				}
			}
		};
		request.onerror = function () {
			// There was a connection error of some sort
			if (options.logerrors) {
				console.log('A connection error occured when trying to access ' + modal.url);
				callback(false);
			}
		};
		request.send();
	};

	var open = function () {
		if (hasVerticalScroll() === true && isMobileBrowser() === false) {
			document.querySelector('body').style.marginRight = scrollbarWidth + 'px';
		}
		if (settings.backgroundscroll) {
			document.querySelector('body').classList.add('am-modal-locked');
			document.querySelector('html').classList.add('am-modal-locked');
		}
		overlay.classList.add('fadein');

		if (modal.url !== null && document.querySelector('#' + modal.name) === null) {
			createModal(function (response) {
				setHeight();
				loadContent(function (response) {
					appendHtml(modal.element.querySelector('.am-inner'), modal.data, function (callback) {
						modal.element.classList.add('am-show');
						setTimeout(function () {
							modal.element.classList.add('am-animation-done');
						}, settings.transitiontime);

						modal.element.querySelector('.am-cross').addEventListener('click', function (e) {
							e.preventDefault();
							close();
						});
					});
				});
			});
		} else {
			setHeight();
			modal.element.classList.add('am-show');
			setTimeout(function () {
				modal.element.classList.add('am-animation-done');
			}, settings.transitiontime);

			modal.element.querySelector('.am-cross').addEventListener('click', function (e) {
				e.preventDefault();
				close();
			});
		}
	};

	var close = function () {
		modal.element.classList.remove('am-show');
		modal.element.classList.remove('am-animation-done');
		overlay.classList.add('fadeout');

		// let's wait for the neat animations to finish!
		setTimeout(function () {
			overlay.classList.remove('fadein');
			overlay.classList.remove('fadeout');
			document.querySelector('body').classList.remove('am-modal-locked');
			document.querySelector('html').classList.remove('am-modal-locked');
			document.querySelector('body').style.marginRight = '';
			modal.element.classList.remove(modal.effect);
			if (modal.url !== null) {
				destroyModal();
			}
		}, settings.transitiontime);
		hook('onClose');
	};

	/**
	 * Callback hooks.
	 * Usage: In the defaults object specify a callback function:
	 * hookName: function() {}
	 * Then somewhere in the plugin trigger the callback:
	 * hook('hookName');
	 */
	var hook = function (hookName) {
		if (settings[hookName] !== undefined) {
			// Call the user defined function.
			// Scope is set to the jQuery element we are operating on.
			settings[hookName].call(el);
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

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	anyModal.destroy = function () {

		// If plugin isn't already initialized, stop
		if (!settings) {
			return;
		}

		// Remove init class for conditional CSS
		document.documentElement.classList.remove(settings.initClass);

		// @todo Undo any other init functions...

		// Remove event listeners
		document.removeEventListener('click', eventHandler, false);
		window.removeEventListener('orientationchange', eventHandler, false);

		// Reset variables
		settings = null;
		eventTimeout = null;
		hook('onDestroy');
	};

	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	anyModal.init = function (options) {
		// feature test
		if (!supports) {
			return;
		}

		// Destroy any existing initializations
		anyModal.destroy();
		detectScrollbarWidth();

		// Merge user options with defaults
		settings = extend(defaults, options || {});
		el = document.querySelector(settings.container);
		createOverlay();

		('click touchmove touchend touchleave touchcancel'.split(' ')).forEach(function (event) {
			overlay.addEventListener(event, function (e) {
				if (e.target === this) {
					close();
				}
			});
		});

		var rmodals = document.querySelectorAll('[data-modal]');
		forEach(rmodals, function (index, value) {
			index.addEventListener('click', function (e) {
				e.preventDefault();
				modal.name = index.getAttribute('data-modal');
				modal.effect = index.getAttribute('data-effect');
				modal.url = index.getAttribute('data-url');
				modal.title = index.getAttribute('data-title');
				if (modal.url === null) {
					modal.element = document.querySelector('#' + modal.name);
					modal.element.classList.add(modal.effect);
					// Force element to apply new css rules
					modal.element.style.display='none';
					var temp = modal.element.offsetHeight; // no need to store this anywhere, the reference is enough
					modal.element.style.display='';
				}
				if (settings.redrawOnResize === true) {
					var resizeTimer;
					clearTimeout(resizeTimer);
					resizeTimer = setTimeout(afterWindowResize, 100);
				}

				window.addEventListener('orientationchange', function() {
					setHeight();
					hook('OnOrientationChange');
				});
				open();
			});
		});
		// Remove preload class when page has loaded to allow transitions/animations
		hook('onInit');
	};

	anyModal.closePanels = function () {
		close();
	};
	//
	// Public APIs
	//

	return anyModal;
});
