// page init
jQuery(function() {
	initInfinityScroll();
});

// init ajax load more
function initInfinityScroll() {
	jQuery('.post-list').infinityScroll();
}

/*
 * jQuery Infinty Scroll Plugin
 */
;(function($, window) {
	'use strict';

	var $win = $(window);
	var $doc = $(document);

	var InfinityScroll = function(options) {
		this.options = $.extend({}, InfinityScroll.DEFAULTS, options);
		this.init();
	};

	InfinityScroll.DEFAULTS = {
		// elements
		itemsContainer: '.container',
		items: '.post',
		attrb: 'href',
		loadMoreLink: '.load-more',

		// classes
		loadingClass: 'loading',
		noPostsClass: 'no-posts',
		newItemsClass: 'transition',

		// boolean
		newItemsDelay: 100,
		additionBottomOffset: 50,

		// ajax
		ajaxType: 'get',
		ajaxData: 'ajax=1',
		ajaxDataType: 'html',

		// callbacks
		onInit: null,
		onBeforeLoad: null,
		onSuccessLoad: null,
		onDestroy: null
	};

	InfinityScroll.prototype = {
		init: function() {
			if (this.options.holder) {
				this.initStructure();
				this.attachEvents();
				this.makeCallback('onInit', this);
			}
		},
		initStructure: function() {
			this.$holder = $(this.options.holder);
			this.$itemsContainer = this.$holder.find(this.options.itemsContainer);
			this.$items = this.$itemsContainer.children(this.options.items);
			this.$loadLink = this.$holder.find(this.options.loadMoreLink);
			this.isLoaded = true;
			this.isResize = true;
			this.timerID = null
		},
		attachEvents: function() {
			var self = this;

			this.onScrollHandler = function() {
				self.scrollHandler();
			};

			this.onResizeHandler = function() {
				self.resizeHandler();
			};

			$win.on('scroll', this.onScrollHandler);
			$win.on('load resize orientationchange', this.onResizeHandler);
			$win.on('refresh.infinty.scroll', this.onResizeHandler);
		},
		detachEvents: function() {
			$win.off('scroll', this.onScrollHandler);
			$win.off('load resize orientationchange', this.onResizeHandler);
			$win.off('refresh.infinty.scroll', this.onResizeHandler);
		},
		scrollHandler: function() {
			var scrollTop = $win.scrollTop();
			if (scrollTop + $win.height() > this.getPositionLink() + this.options.additionBottomOffset) {
				this.loadNewItems();
			}
		},
		resizeHandler: function() {
			if (this.isResize) {
				this.scrollHandler();
			}
		},
		loadNewItems: function() {
			var self = this;
			var urlPage = this.$holder.find(this.options.loadMoreLink).attr(this.options.attrb);

			if (this.isLoaded) {
				this.isLoaded = false;
				this.$holder.addClass(this.options.loadingClass);
				this.makeCallback('onBeforeLoad', this);
				this.xmlHttpRequest(urlPage).done(successCallback).fail(errorCallback);
			}

			function successCallback(response, textStatus, jqXHR) {
				if (jqXHR.status === 200 && jqXHR.statusText === 'OK') {
					self.$newContent = $(response);
					self.refreshItems();
					self.refreshLinks();
					self.isLoaded = true;
					
					if (self.getDocumentHeight()) {
						self.loadNewItems();
					}

					self.$holder.removeClass(self.options.loadingClass);
					self.removeItemsAnimate();
					self.makeCallback('onSuccessLoad', self, self.$newItems);
				}
			}

			function errorCallback(jqXHR, textStatus, errorThrown) {
				if (console && console.warn) {
					console.warn('Status Error - ' + jqXHR.status + '\n' + 'Status Text - ' + jqXHR.statusText);
				}
			}
		},
		refreshItems: function() {
			this.$newItems = this.$newContent.filter(this.options.items);
			this.$newItems.addClass(this.options.newItemsClass).appendTo(this.$itemsContainer);
		},
		refreshLinks: function() {
			var newUrlPage = this.$newContent.filter(this.options.loadMoreLink).attr(this.options.attrb);

			if (newUrlPage) {
				this.$loadLink.attr(this.options.attrb, newUrlPage);
			} else {
				this.$loadLink.remove();
				this.$holder.addClass(this.options.noPostsClass);
				this.detachEvents();
			}
		},
		removeItemsAnimate: function() {
			var self = this;

			this.timerID = setTimeout(function() {
				self.$newItems.removeClass(self.options.newItemsClass);
			}, this.options.newItemsDelay);
		},
		getDocumentHeight: function() {
			return $win.height() >= $doc.height();
		},
		getPositionLink: function() {
			return this.$loadLink.offset().top;
		},
		xmlHttpRequest: function(url) {
			var d = $.Deferred();

			$.ajax({
				url: url,
				type: this.options.ajaxType,
				data: this.options.ajaxData,
				dataType: this.options.ajaxDataType,
				success: function(response, textStatus, jqXHR) {
					d.resolve(response, textStatus, jqXHR);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					d.reject(jqXHR, textStatus, errorThrown);
				}
			});

			return d;
		},
		destroy: function() {
			this.$holder.removeClass(this.options.noPostsClass).removeClass(this.options.loadingClass);
			this.isResize = false;
			this.detachEvents();
			this.makeCallback('onDestroy', this);
		},
		makeCallback: function(name) {
			if (typeof this.options[name] === 'function') {
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		}
	};

	$.fn.infinityScroll = function(options) {
		return this.each(function() {
			var settings = $.extend({}, options, { holder: this });
			var instance = new InfinityScroll(settings);
			$.data(this, 'InfinityScroll', instance);
		});
	};

}(jQuery, window));
