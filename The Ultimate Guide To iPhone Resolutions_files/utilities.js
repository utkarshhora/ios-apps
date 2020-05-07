jQuery(document).ready(function()
{    
    highlightAll();
    window._pq = window._pq || [];
    
    
    
    (function() {
          var hidden = "hidden";

          // Standards:
          if (hidden in document)
            document.addEventListener("visibilitychange", onchange);
          else if ((hidden = "mozHidden") in document)
            document.addEventListener("mozvisibilitychange", onchange);
          else if ((hidden = "webkitHidden") in document)
            document.addEventListener("webkitvisibilitychange", onchange);
          else if ((hidden = "msHidden") in document)
            document.addEventListener("msvisibilitychange", onchange);
          // IE 9 and lower:
          else if ("onfocusin" in document)
            document.onfocusin = document.onfocusout = onchange;
          // All others:
          else
            window.onpageshow = window.onpagehide
            = window.onfocus = window.onblur = onchange;

          function onchange (evt) {
            var v = "visible", h = "hidden",
                evtMap = {
                  focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
                };

            evt = evt || window.event;
            if (evt.type in evtMap)
              document.body.className = evtMap[evt.type];
            else
              document.body.className = this[hidden] ? "hidden" : "visible";
          }

          // set the initial state (but only if browser supports the Page Visibility API)
          if( document[hidden] !== undefined )
            onchange({type: document[hidden] ? "blur" : "focus"});
        })();
    
});

/* disable scrolling */

var disableScroll = false;
var lockedScrollPosition = [0, 0];

function disableScrolling()
{
    disableScroll = true;
    lockedScrollPosition = getScrollXY();
}


function enableScrolling()
{
    disableScroll = false;
}

function keepScroll(e)
{
    if(disableScroll)
    {
        e.preventDefault();
        window.scrollTo(lockedScrollPosition[0], lockedScrollPosition[1]);
    }
}

document.ontouchmove = function(e)
{
    keepScroll(e);
}

document.onscroll = function(e)
{
    keepScroll(e);
}





/* various */


function getScrollXY()
{
    var scrOfX = 0, scrOfY = 0;
    if( typeof( window.pageYOffset ) == 'number' )
    {
        //Netscape compliant
        scrOfY = window.pageYOffset;
        scrOfX = window.pageXOffset;
    }
    else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) )
    {
        //DOM compliant
        scrOfY = document.body.scrollTop;
        scrOfX = document.body.scrollLeft;
    }
    else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) )
    {
        //IE6 standards compliant mode
        scrOfY = document.documentElement.scrollTop;
        scrOfX = document.documentElement.scrollLeft;
    }
    return [ scrOfX, scrOfY ];
}


function scrollToBlock(fromY, toY, after)
{
//    disableScrolling();
    
    var maxY = fromY;
    var minY = toY - $(window).height();
    var currentY = getScrollXY()[1];
    
    if (currentY < minY || maxY < currentY)
    {
        var newY = Math.min(Math.max(minY,currentY), maxY); 
        $('html, body').animate({scrollTop: newY}, 300, "swing", after);
    }
    else
        after();
}



/* ajax */

function submit_email(type)
{
    var ab = 'none';

    if (typeof t != 'undefined')
    {
        ab = t
    }

    if (type == 't')
    {
        _pq.push(['track', 'trial']);
        infinario.track("Download trial", {});
        dataDictionary = { "email": $("#subscriber_email").val(), "t": "t"};
    }
    else if (type == 'g')
    {
        _pq.push(['track', 'guide_download']);
        infinario.track("Download guide", {});
        dataDictionary = { "email": $("#ultimate_guide_subscribe input[type=\"email\"]").val(), "t": "g"};
    }
    else if (type == 'o')
    {
        _pq.push(['track', 'origami_download']);
        infinario.track("Download Origami plugin", {});
        dataDictionary = { "email": $("#subscriber_email").val(), "t": "o"};
    }
    else if (type == 'p')
    {
        _pq.push(['track', 'plugin_download']);
        infinario.track("Download Sketch plugin", {});
        dataDictionary = { "email": $("#subscriber_email").val(), "t": "p"};
    }
    else if (type == 'telekinesis')
    {
        _pq.push(['track', 'telekinesis']);
        infinario.track("Telekinesis subscribe", {});
        dataDictionary = { "email": $("form.telekinesis_subscribe input[type=email]").val(), "t": "telekinesis"};
    }
    
    
    dataDictionary["ab"] = ab;


    infinario.identify(dataDictionary['email']);    
    infinario.update({
      email: dataDictionary['email']
    });


    
	$.ajax({
		type: "POST",
		url: "/saveemail.php",
		data: dataDictionary
	})
	.done(function(msg)
	{
		if (msg == "fake")
		{
		    if (type == 'telekinesis')
		        $(".telekinesis_subscribe input[type=email]").val("Please try again.");
            else
            {
                var jqObject = null;
                if (type == 't')
                    jqObject = $("div#try_popover p.email_error");
                else if (type == 'g')
                    jqObject = $("#ultimate_guide_subscribe p.email_error");
                else if (type == 'o')
                    jqObject = $("div#origami_popover p.email_error");
                else if (type == 'p')
                    jqObject = $("div#try_plugin_popover p.email_error");
                
                jqObject.html("Please, enter your email address.").show();
            }
		}
		else if (msg == "invalid")
		{
		    if (type == 't')
		        $("div#try_popover p.email_error").show();
		    else if (type == 'g')
		        $("#ultimate_guide_subscribe p.email_error").show();
		    else if (type == 'o')
		        $("div#origami_popover p.email_error").show();
		    else if (type == 'p')
		        $("div#try_plugin_popover p.email_error").show();
		    else if (type == 'telekinesis')
		        $(".telekinesis_subscribe input[type=email]").val("Please try again.");
		}
		else
		{
            if (type == 't')
            {
                $("div#try_popover p.email_error").hide();
                var response_obj = JSON.parse(msg);
                $("iframe#automatic_download").attr("src", response_obj[0]);
                $("a.substituteHref").attr("href", response_obj[1]);
                
                $("#try_popover_page1").hide();
                $("#try_popover_page2").show();
            }
		    else if (type == 'g')
		    {
		        $("#ultimate_guide_subscribe p.email_error").fadeOut(200);
		        $("#ultimate_guide_subscribe input").fadeOut(200,
		            function()
		            {
		                $("#ultimate_guide_subscribe p.email_sent").fadeIn(200)
		            });
		    }
		    else if (type == 'o')
		    {
                $("div#origami_popover p.email_error").hide();
                var response_obj = JSON.parse(msg);
                $("iframe#automatic_download").attr("src", response_obj[0]);
                $("a.substituteHref").attr("href", response_obj[1]);
                
                $("#origami_popover_page1").hide();
                $("#origami_popover_page2").show();
		    }
            else if (type == 'p')
            {
                $("div#try_plugin_popover p.email_error").hide();
                var response_obj = JSON.parse(msg);
                $("iframe#automatic_download").attr("src", response_obj[0]);
                $("a.substituteHref").attr("href", response_obj[1]);
                
                $("#try_plugin_popover_page1").hide();
                $("#try_plugin_popover_page2").show();
            }
		    else if (type == 'telekinesis')
		    {
                $(".telekinesis_subscribe").fadeOut("fast", function() {
                        $(".telekinesis_subscribe_message").fadeIn("fast");
                });
                
		    }
		}
	});
}



function test(data, url)
{
    _pq.push(['track', data]);
    

     
    if (typeof t == 'undefined')
    {
        dataDictionary = { "d": data};
        infinario.track(data, {});
    }
    else
    {
        dataDictionary = { "d": data, "t": t};
        infinario.track(data, {storetype: t % 2});
        
        if (t%2 == 1)
            infinario.track(data.concat("_subscription"), {});
        else
            infinario.track(data.concat("_non-subscription"), {});
    }
        
	$.ajax({
		type: "POST",
		url: "/open_test.php",
		data: dataDictionary,
	})
	.done(function(msg)
	{
	    if (url === undefined || url == "")
	        return;

        window.location.href = url;
	});
}