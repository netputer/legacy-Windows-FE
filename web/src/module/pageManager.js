/**
 * @fileoverview
 * jingfeng@wandoujia.com
 */

wonder.addModule('PageManager', function(W) {
	W.namespace('wonder.ui');
	var CONTENT_DOM_ID = 'd-content', doc = W.host.document;

	/**
	 * @constructor
	 */
	function PageManager() {

	};

	PageManager.PageNames = {
		ADDRESS_BOOK : 'address_book',
		ADDRESS_BOOK_ALL_CONTACT : 'address_book_all_contact',
		ADDRESS_BOOK_STAR_CONTACT : 'address_book_star_contact',
		ADDRESS_BOOK_OFTEN_CONTACT : 'address_book_often_contact',
		ADDRESS_BOOK_PHONE_CONTACT : 'address_book_phone_contact',

		MUSIC_PAGE : 'music',

		VIDEO_PAGE : 'video_page',

		WELCOME_PAGE : 'welcome_page'
	};

	W.mix(PageManager.prototype, W.events);

	PageManager.prototype._pages = {};

	PageManager.prototype.isValidPageName = function(pageName) {
		for (var i in PageManager.PageNames) {
			if (PageManager.PageNames[i] == pageName)
				return true;
		}
		return false;
	};
	PageManager.prototype.getPage = function(pageName) {
		return this._pages[this.mapPageName(pageName)];
	};
	PageManager.prototype.addPage = function(page) {
		if (!page) {
			throw new Error('Please specified the valid page');
		}

		if (!this.isValidPageName(page.getPageName())) {
			throw new Error('The input page name is invalid.');
		}

		if (this.getPage(page.getPageName())) {
			throw new Error('the page existed');
		} else {
			this._pages[this.mapPageName(page.getPageName())] = page;
			if (page.getDefaultRender()) {
				page.render(doc.getElementById(CONTENT_DOM_ID));
			}
		}
		page.setPageManager(this);
		return page;
	};
	PageManager.prototype.removePage = function(pageName) {
		if (!this.getPage[pageName])
			throw new Error('the page didn\'t existed.');
		delete this._pages[pageName];
	};
	PageManager.prototype.showPage = function(pageName, data, undefined) {
		var page = this.getPage(pageName);

		if (!page)
			throw new Error('the page -' + pageName + ' didn\'t existed.');

		if (!page.isRendered()) {
			page.render(doc.getElementById(CONTENT_DOM_ID));
		}

		for (var pn in this._pages) {
			if (this.mapPageName(pageName) != pn) {
				this._pages[pn].hide();
			}
		}
		page.show();
		page.trigger(Page.Actions.SHOW, data || pageName);
	};
	PageManager.prototype.mapPageName = function(pageName) {
		var pn;
		switch(pageName) {
			case W.PageManager.PageNames.ADDRESS_BOOK:
			case W.PageManager.PageNames.ADDRESS_BOOK_ALL_CONTACT:
			case W.PageManager.PageNames.ADDRESS_BOOK_STAR_CONTACT:
			case W.PageManager.PageNames.ADDRESS_BOOK_OFTEN_CONTACT:
			case W.PageManager.PageNames.ADDRESS_BOOK_PHONE_CONTACT:
				pn = W.PageManager.PageNames.ADDRESS_BOOK;
				break;
			case W.PageManager.PageNames.WELCOME_PAGE :
				pn = W.PageManager.PageNames.WELCOME_PAGE;
				break;
			case W.PageManager.PageNames.MUSIC_PAGE:
				pn = W.PageManager.PageNames.MUSIC_PAGE;
				break;
			case W.PageManager.PageNames.VIDEO_PAGE:
				pn = W.PageManager.PageNames.VIDEO_PAGE;
				break;
				break;
			default :
				console.log('the page ' + pageName + ' didnot existed.');
				break;
		}
		return pn;
	};
	W.PageManager = PageManager;
	W.PM = new PageManager();

	/**
	 * @constructor
	 */
	function Page(pageName, config) {
		W.ui.UIBase.call(this, config);
		this._name = pageName;
	};

	Page.Actions = {
		SHOW : 'show',
		HIDE : 'hide',
		SCROLL_LEFT : 'scroll_left'
	}

	W.extend(Page, W.ui.UIBase);

	/**
	 * Don't overrite this config
	 */
	Page.prototype._defaults = {
		top : true,
		left : true,
		right : true,
		leftWidth : '70%',
		rightWidth : '30%'
	};

	Page.prototype._defaultRender = false;

	Page.prototype._leftPage = null;

	Page.prototype._rightPage = null;

	Page.prototype._pm = null;

	Page.prototype.initPage = function() {
		this._pageTop = $('<div/>').addClass('w-page-top');
		this._leftPage = $('<div/>').addClass('w-page-left');
		this._rightPage = $('<div/>').addClass('w-page-right');

		if (this._config.top) {
			this._element.append(this._pageTop);
		}
		if (this._config.left) {
			this._element.append(this._leftPage);
		}
		if (this._config.right) {
			this._element.append(this._rightPage);
		}
		if (this._config.top) {
			this._element.append($('<div/>').addClass('w-page-top-shadow'));
		}

		if (this._config.leftWidth === 0) {
			this._rightPage.css({
				width : '100%'
			});
		} else if (this._config.rightWidth === 0) {
			this._leftPage.css({
				width : '100%'
			});
		} else {
			setTimeout(this.resizeWidth.bind(this), 0);
			$(window).bind('resize', $.proxy(function() {
				W.delay(this, this.resizeWidth, 25);
			}, this));
		}
	};
	Page.prototype.resizeWidth = function() {
		var relativeWidth = this._element.width(), rightWidth = 0;
		leftWidth = 0;
		if (W.isNumber(this._config.leftWidth)) {
			leftWidth = this._config.leftWidth;
			rightWidth = relativeWidth - leftWidth;
		} else if (W.isNumber(this._config.rightWidth)) {
			rightWidth = this._config.rightWidth;
			leftWidth = relativeWidth - rightWidth;
		} else {
			rightWidth = this._config.rightWidth;
			leftWidth = this._config.leftWidth;
		}
		this._leftPage.width(rightWidth === 0 ? leftWidth : (leftWidth - 1));
		this._rightPage.width(rightWidth);
	};
	Page.prototype.setPageManager = function(pm) {
		this._pm = pm;
	};
	Page.prototype.getPageManager = function(pm) {
		return this._pm;
	};
	Page.prototype.getPageName = function() {
		return this._name;
	};
	Page.prototype.addTopContent = function(component) {
		console.debug('Page Manager - Add top content: ' + this.getPageName());
		component.render(this._pageTop);
	};
	Page.prototype.addLeftContent = function(component) {
		console.debug('Page Manager - Add left content: ' + this.getPageName());
		if (component.render instanceof Function) {
			component.render(this._leftPage);
		} else {
			$(this._leftPage).append(component);
		}
	};

	Page.prototype.addClassToLeftPage = function(className) {
		this._leftPage.addClass(className);
	};

	Page.prototype.addRightContent = function(component) {
		console.debug('Page Manager - Add right content: ' + this.getPageName());
		component.render(this._rightPage);
	};

	Page.prototype.addPageContent = function(component) {
		component.render(this._element);
	};

	Page.prototype.getDefaultRender = function() {
		return this._defaultRender;
	};
	Page.prototype.setDefaultRender = function(defaultRender) {
		this._defaultRender = defaultRender;
	};
	Page.prototype.load = function() {
		if (this._isRendered)
			return;
		this.render(doc.getElementById(CONTENT_DOM_ID));
		this.trigger(Page.Actions.SHOW, this._name);
		if (this.isVisible()) {
			this.show();
		} else {
			this.hide();
		}
	};
	/**
	 *@override the "show" method in UIBase
	 */
	Page.prototype.show = function() {
		this._isVisible = true;
		this.removeClassName('wd-invisible');
	};
	/**
	 * *@override the "hide" method in UIBase
	 */
	Page.prototype.hide = function() {
		this._isVisible = false;
		this.addClassName('wd-invisible');
		this.trigger(Page.Actions.HIDE, this._name);
	};
	Page.prototype.render = function(opt_parent) {
		if (!this._isRendered) {
			Page._super_.render.call(this, opt_parent);
			this._element = this._element || $('<div/>').addClass('w-page');
			this._element.appendTo(opt_parent);
			this._isRendered = true;
			this.initPage();

			this._leftPage.bind('scroll', $.proxy(function(e) {
				this.trigger(Page.Actions.SCROLL_LEFT, e.target.scrollTop, e.target.scrollHeight);
			}, this));
		} else {
			throw new Error('Page rendered');
		}
	};
	W.ui.Page = Page;
});
wonder.useModule('PageManager');
