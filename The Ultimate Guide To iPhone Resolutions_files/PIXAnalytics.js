var PIXAnalytics = 
{
    trackEvent: function(name, product, dataObject)
    {
        dataObject.locationHref = location.href;
        dataObject.referrer = document.referrer;
        dataObject.languages = navigator.languages;
        dataObject.oscpu = navigator.oscpu;
        dataObject.cookie = this.getCookie();
        dataObject.windowWidth = window.innerWidth;
        dataObject.windowHeight = window.innerHeight;
        dataObject.screenWidth = screen.height;
        dataObject.screenHeight = screen.width;

        var protocol = (location.protocol === "https:") ? "https:" : "http:";

        this.jsonp(protocol + '//analytics.pixelcut.com/'
         + '?name=' + encodeURIComponent(name)
         + '&product=' + encodeURIComponent(product)
         + '&serial='
         + '&id='
         + '&data=' + encodeURIComponent(JSON.stringify(dataObject)));
    },
    
    jsonp: function(url)
    {
        var script = document.createElement('script');
        script.src = url;
        script.onload = function()
        {
//            document.body.removeChild(script);
        };
    
        document.body.appendChild(script);
    },
    

    setCookie: function(id)
    {
        var exdays = 1000;
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = "pix=" + id + "; " + expires;
    },


    getCookie: function()
    {
        var cookieArray = document.cookie.split(';');
        var name = "pix=";
        
        for (var i = 0; i < cookieArray.length; i++)
        {
            var currentCookie = cookieArray[i].replace(/^ +/, "");
            if (currentCookie.indexOf(name) == 0)
                return currentCookie.substring(name.length, currentCookie.length);
        }
        return "";
    } 
}


