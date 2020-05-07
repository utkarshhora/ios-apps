(function(){
"use strict";
/**
 * @name  Helpers
 * @class  Helpers
 */
var Helpers = {
    /**
     * Concatenates property and returns concatenated obj
     * @param  o object to be returned with new products 
     * @param  O object to be concatenated
     * @return returns object with concatenates products property
     * @memberOf Helpers
     */
    merge: function(o,O) {

       for (var property in O) {

            try {

                if (property === 'products') { 
                    o.products = o.products || [];
                    o.products = o.products.concat(O.products); 
                }
                
                else if (typeof o[property] === "object") {
                    o[property] = Helpers.merge(o[property], O[property]);
                } else {
                    o[property] = O[property];
                }

            } catch(e) {
                o[property] = O[property];
            }
        }

        return o;
    
    },

    /**
     * @memberOf Helpers
     */
    returnMeaningful: function (P) {
        P.reverse();
        
        var x = {};
        var r = [];
        
        P.forEach(function (p) {
            
            if (!x.hasOwnProperty(p.path)) {
                x[p.path] = true;
                r.push(p);
            }
        });
        
        return r;
    
    },

    /**
     * Sets this.StorageExists value to true if Local Sorage is supported
     * @memberOf Helpers
     */
    Storage: function() {
        var fail;
        var uid;
        try {
          uid = new Date();
          (this.StorageExists = window.localStorage).setItem(uid, uid);
          fail = this.StorageExists.getItem(uid) !== uid.toString();
          this.StorageExists.removeItem(uid);
          if (fail) { this.StorageExists = false; }
        } catch (exception) {}
       
    },
    /**
     * console.log wrapper 
     * @param  {string} string 
     * @param  data
     * @param  data2
     * @memberOf Helpers
     */
    debug: function (string,data,data2) {
        var debug = false;
        try {
            if (API.isDebug === true) {
                debug = true; 
            }
            else if ((Helpers.StorageExists) && (window.localStorage.getItem("debug"))) {
                debug = true; 
            }

            if (debug) {
                if (typeof data === "undefined") { 
                    data = ''; 
                }
                if (typeof data2 === "undefined") {
                    data2 = '';
                }
                console.log('[FastSpring API] '+ string,data,data2);
            }
        } catch(e) {}
    },

    runCallback: function(callback) {
        //run callback function if it's function or string
        var func = (typeof callback  === 'function') ?
        callback : new Function(callback);

        //instead of just func(); - pass Markup.data
        func.call(null, Markup.data);   
    }

};

Helpers.Storage();




;
/**
 * @name Spinner
 * @class Spinner
 */
var Spinner = {
    
    attach: function () {
        
        this.spinSVG.style.position = 'absolute';
        this.spinSVG.style.top = '50%';
        this.spinSVG.style.marginTop = '-50px';     
        this.spinSVG.style.left = '50%';
        this.spinSVG.style.marginLeft = '-50px';                
        this.spinSVG.style.zIndex = '100000000000000';
        this.spinSVG.style.display = 'block';
        Popup.canvas.appendChild(this.spinSVG);  
        
    },
    
    remove: function () {
        
        if (typeof this.spinSVG !== "undefined") { this.spinSVG.style.display = 'none'; }
        
    }
    
};;
/**
 * @name  API
 * @class  API
 */
var API = {

    assignAttributeValues: function($fscContainer) {
        /** @property {boolean}  this.animateFader - default: true */
        this.animateFader = ($fscContainer.getAttribute("data-animate-fader") || "true");

        this.beforeRequests = $fscContainer.getAttribute("data-before-requests-callback");
        this.afterRequests = $fscContainer.getAttribute("data-after-requests-callback");

        this.beforeMarkup = $fscContainer.getAttribute("data-before-markup-callback");
        this.afterMarkup = $fscContainer.getAttribute("data-after-markup-callback");

        this.markupHelpers = $fscContainer.getAttribute("data-markup-helpers-callback");

        this.decorateCallback = $fscContainer.getAttribute("data-decorate-callback");

        this.errorCallback = $fscContainer.getAttribute("data-error-callback");

        this.popupWebhookReceived = $fscContainer.getAttribute("data-popup-webhook-received");
        this.popupClosed = $fscContainer.getAttribute("data-popup-closed");     

        this.popupEventReceived = $fscContainer.getAttribute("data-popup-event-received");

        this.storefront = $fscContainer.getAttribute("data-storefront");
        this.dataCallback = $fscContainer.getAttribute("data-data-callback");
        this.isDebug = ($fscContainer.getAttribute("data-debug") === "true");
        this.aKey = $fscContainer.getAttribute("data-access-key");
        this.isContinuous = ($fscContainer.getAttribute("data-continuous") === "true");
    },

    /**
     * Starting function 
     * @memberOf API
     */
    init: function () {
        this.assignAttributeValues(fscContainer);
        
        /** @property {boolean} this.showBlur - default: true */
        //this.showBlur = ($fscContainer.getAttribute("data-blur") || "true");
        this.showBlur = false;

        this.checkoutMode = "redirect";
        if (this.storefront.match(/pinhole/) !== null || this.storefront.match(/popup/) !== null) { 
            this.checkoutMode = "popup"; 
        }
        if (this.storefront.match(/inapp/) !== null) { 
            this.checkoutMode = "inapp"; 
        }

        Helpers.debug("What is the checkout mode?", this.checkoutMode);

        if (this.storefront.match(/\.test\./) !== null) { 
            this.testMode = true; 
        }
        else {
            this.testMode = false; 
        }
        
        Helpers.debug("Are we in the test mode?", this.testMode);
        
        if (this.aKey !== null) { 
            Helpers.debug("Access Key registered", this.aKey);
        }       

        if (this.checkoutMode === "popup") {
            Spinner.spinSVG = document.createElement('img');
            Spinner.spinSVG.src = "https://d1f8f9xcsvx3ha.cloudfront.net/pinhole/spin.svg";
        }

        this.sessionID = null;
        this.data = {};
        this.finishSilently = false;
        this.loadDefaultData = true;
        this.firstRun = true;
        this.builder = '/builder';
        this.requests = [];

        this.firstRun = false;

        if(this.checkoutMode !== "inapp") {
        	Popup.checkURL();
        }

        this.parseInput(fscSession);                
        
        APIInitialized = true;
        
    },

    /**
     * Gets session from LocalStorage if continoius mode enabled  
     * @memberOf API
     */
    continuousGet: function () {
        if (Helpers.StorageExists) {
            Helpers.debug(" -> Getting session from localStorage");
            
            var serial = null;
            var maybeSerial = localStorage.getItem('fscSerial-' + this.storefront);
            
            try {
                if (maybeSerial) { maybeSerial = JSON.parse(maybeSerial); }
                
                if (maybeSerial && maybeSerial.hasOwnProperty('session') && maybeSerial.hasOwnProperty('expires')) {
                    
                    Helpers.debug(" -> Found stored serial");
                    
                    var now = new Date().getTime();
                    if (maybeSerial.expires > now) {
                        
                        serial = maybeSerial.session;
                        Helpers.debug(" (+) Serial is still valid");    

                    } else {
                        
                        Helpers.debug(" (-) Serial is expired");    
                        
                    }
                    
                }
                
                return serial;
            } catch(e) {
                Helpers.debug("Error LocalStorage in continuousGet"); 
            }
        }
        
    },

    /**
     * Stores Session in local storage for continuos mode
     * @param  serial 
     * @memberOf API
     */
    continuousStore: function (serial) {
        Helpers.debug(" <- Writing to localStorage: ", serial );
        
        try {
            if (Helpers.StorageExists) {
                localStorage.setItem('fscSerial-'+this.storefront, JSON.stringify(serial));
            }
        } catch(e) { Helpers.debug("Error LocalStorage in ContiniousStore"); }
        
    },

    /**
     * Removes Session in local storage for continuos mode
     * @memberOf API
     */
    continuousReset: function () {
        Helpers.debug(" <- Resettings session");
        try {
            if (Helpers.StorageExists) {
                localStorage.removeItem('fscSerial-'+this.storefront);
                this.sessionID = null;
            }
        } catch(e) {  Helpers.debug("Error LocalStorage in continuousReset"); }
        
    },
    
    /**
     * Gets everything from Push(s)
     * @memberOf API
     * @param  input
     */
    parseInput: function (input) {
        var output;
        Helpers.debug("Working with input:",input);
        
        output = this.sanitizeInput(input);     
        Helpers.debug("Sanitized output:", output);


        // Check if secure payload exists
        if (input.hasOwnProperty('secure')) {

            if (this.aKey === null) {
                
                Helpers.debug ("Attempted to pass secure payload, but no valid Access Key was found.");
                
            } else if (!input.secure.hasOwnProperty('payload')) {
                
                Helpers.debug ("Attempted to parse secure request but no secure payload was found.");
                
            } else {
                
                if (this.testMode) {
                    
                    if (!input.secure.hasOwnProperty('key')) {
                    
                        output['accessKey'] = this.aKey;
                        Helpers.merge(output,input.secure.payload);
                    
                    } else {
                        
                        output['accessKey'] = this.aKey;
                        output['secureKey'] = input.secure.key;
                        output['securePayload'] = input.secure.payload;                                             
                        
                    }
                    
                } else {
                    
                    if (!input.secure.hasOwnProperty('key')) {
                        
                        Helpers.debug ("Attempted to pass secure payload, but no valid Secure Key was found.");
                        
                    } else {
                        
                        output['accessKey'] = this.aKey;
                        output['secureKey'] = input.secure.key;
                        output['securePayload'] = input.secure.payload;                     
                        
                    }
                    
                }

            }
            
        }

        // Check if authenticate exist
        if (input.hasOwnProperty('authenticate')) {
            
            Helpers.debug('Found authentication payload', input.authenticate);          

            if (this.aKey === null) {
                Helpers.debug ("Attempted to authenticate user, but no valid Access Key was found.");
                return;
            } 
            
            if (input.authenticate.hasOwnProperty('key')) {
                this.authenticateUser(input.authenticate.payload, input.authenticate.key);
            } else {
                this.authenticateUser(input.authenticate.payload);          
            }
            
        }

        if (input.hasOwnProperty('reset')) {
            this.continuousReset();
        }
        
        if (input.hasOwnProperty('clean')) {
            fscCleanCheckout = true;
        }
        
        if (input.hasOwnProperty('session')) {
            this.sessionID = input['session'];
            Helpers.debug('Vendor is forcing a session which we need to obey: ', this.sessionID);           
        } else if (this.isContinuous === true && this.sessionID === null) {
            this.sessionID = this.continuousGet();
            Helpers.debug('We are in continuous mode and the session is: ', this.sessionID);            
        }
        
        Helpers.debug('Working with the session ID: ', this.sessionID);     
        
        if (input.hasOwnProperty('checkout')) {
            
            if (API.checkoutMode === 'popup') {
                Popup.draw();                    
            }
       
            if (input.checkout !== "true" && input.checkout !== "false" && input.checkout.length > 10) {
                var url = 'https://' + this.storefront + '/session/' + input.checkout;
                API.continueCheckoutWithURL(url);

            } else {
                this.loadDefaultData = false;
                API.checkoutRedirect(output);                
            }
            
        } else {
            
            if (!input.hasOwnProperty('authenticate')) {
                this.loadProducts(output);
            }
            
        }
        
        this.flushChain();
        
        fscSession = {};

    },

    /**
     * Adds request to the queue
     * @param r request
     * @memberOf API
     */
    chain: function (r) {

        Helpers.debug(" >> Chaining request:", r);      
        this.requests.push(r);
        
    },
    /**
     * Check if there are any requests running to prevent parallel execution
     * @memberOf API
     * 
     */
    flushChain: function () {
        
        Helpers.debug("Is requests chain locked?",API.ajaxInProgress);
        
        if (API.ajaxInProgress === true) { return; } 

        if (typeof window[this.beforeRequests] === "function") {
            
            Helpers.debug(" <- Calling ", this.beforeRequests);
            try {
                window[this.beforeRequests]();
            }
            catch(e) { Helpers.debug(" --Error in data-before-requests");}

        }

        Helpers.debug('Preparing to make requests:', JSON.stringify(this.requests));
        
        //next request - or first request
        this.nextRequest();
        
    },

    /**
     * running next request in the requests chain
     * @memberOf API
     */
    nextRequest: function () {
        
        var r;

        if (typeof this.requests[0] !== "undefined") {

            r = this.requests.shift();
            
            if (!r.hasOwnProperty('skipsession')) { 
                this.request(r.endpoint,r.method,r.payload);
            }
            else {
                this.request(r.endpoint,r.method,r.payload, true);
            }
            
        } else {
            
            Helpers.debug('We are done with requests chain,  unlocking');

            API.ajaxInProgress = false;
            
            // if (typeof API.passedCallbackFunction === "function") {
                
            //     API.passedCallbackFunction.call(null, Markup.data);
            //     API.passedCallbackFunction = null;
                
            // }
            
            if (typeof window[this.afterRequests] === "function") {
                
                Helpers.debug(" <- Calling ", this.afterRequests);
                try {
                    window[this.afterRequests]();

                } catch(e) { 
                    console.log(e);
                }    
            }

        }

    },


    /**
     * HandleData is called when new JSON received from server
     * @param  {Object} data - data received from the server
     * @memberOf API
     */
    handleData: function (data) {
        
        if (typeof this.requests[0] !== "undefined") {
            Helpers.debug("Not the last request, let's keep going");
            return;
        }
        
        if(this.finishSilently) {
            Helpers.debug("We are finishing silently and return no data");
            return;
        }
        
        data = this.sanitize(data);

        if (typeof window[this.dataCallback] === "function") {
            Helpers.debug(" <- Calling ", this.dataCallback );
            try {
                window[this.dataCallback](data);
            }
            catch(e) { console.log(e); }
        }

        Markup.setData(data);
        Markup.process();
        
        this.data = {};     
        
    },
    /**
    * Saves serialized session and sets values
    * @param  serial  - session serial
    * @param  expires - expiration date
    * @return sessionID - sessionID
    * @memberOf API
    */
    handleSerial: function (serial,expires) {
        
        if (this.sessionID === serial) { return; }

        this.sessionID = serial;
        if (this.isContinuous === true) {
            Helpers.debug("Store session ID for continuity");           
            this.continuousStore({'session':this.sessionID,'expires':expires});
        }
        
        Helpers.debug("We are now working with session ID:", this.sessionID);                   
        
        return this.sessionID;
        
    },
    /**
    * Clears the input. Removes redundant fields
    * @param  data - data to be sanitized
    * @return data - data without unnecessary fields
    * @memberOf API
    */
    sanitize: function (data) {
        
        delete data['serial'];
        delete data['expires'];           
        
        API.groupsByProduct = {};
        
        data.groups.forEach(function(group) {
        
            group.selectables = false;
            group.selectableReplacements = false;            
            group.selectableAdditions = false;                        
           
            group.items.forEach(function(item) {
                item.selectables = false;
                item.selectableReplacements = false;
                item.selectableAdditions = false;                
                                    
                if (!item.selected) {
                    group.selectables = true;
                    if (group.type === 'add') { group.selectableAdditions = true; }                       
                    if (group.type === 'replace') { group.selectableReplacements = true; }                                            
                }
                
                API.groupsByProduct[item.path] = this.driver;                
                
                item.groups.forEach(function(group) { 
                    
                        group.items.forEach(function(item) {
                            
                            if (!item.selected) {
                                group.selectables = true;
                                item.selectables = true;                                
                                
                                if (group.type === 'replace') {
                                    group.selectableReplacements = true;                                            
                                }
                            }
                                        
                        }, group);
                        
                        if (group.selectables === true) { item.selectables = true; }

                        if (group.selectableReplacements === true) { item.selectableReplacements = true; }                       
                                                            
                    if (group.type === 'options') {
                        
                        API.newGroupItemsNamed = {};
                        API.newGroupItems = [];
                        
                        group.items.forEach(function(item) {
                            API.newGroupItemsNamed[item.path] = item;
                        });
                                                
                        API.newGroupItemsNamed[this.path] = this;
                                                                        
                        group.ordering.forEach(function(path) {
                            API.newGroupItems.push(API.newGroupItemsNamed[path]);
                        });
                        
                        group.items = API.newGroupItems;
                                                
                        API.newGroupItemsNamed = {};
                        API.newGroupItems = [];                        
                    }
                    
                }, item);                
                
                
                
            }, group);
                    
        });        
                
        data.groups.forEach(function(group) {
            
            group.driverType = 'storefront';
            
            if (group.type === 'add') {
                
                if (API.groupsByProduct.hasOwnProperty(group.driver)) {
                    group.driverType = 'product';
                    group.driverOrigin = API.groupsByProduct[group.driver];
                }
                
            }
            
        });
        
        API.groupsByProduct = {};
                
        return data;
        
    },
    
    
    
    /**
     * Returns sanitized output
     * @param  input 
     * @return output 
     * @memberOf API
     */
    sanitizeInput: function (input) {

        var output = {};
        
        if (input.hasOwnProperty('coupon')) {
            output['coupon'] = input['coupon'];
        }
        
        if (input.hasOwnProperty('products') && input['products'].length > 0) {         
            output['items'] = Helpers.returnMeaningful( input['products'] );        
        }

        if (input.hasOwnProperty('tags')) {         
            output['tags'] = input['tags'];     
        }

        if (input.hasOwnProperty('paymentContact')) {
            output['paymentContact'] = input['paymentContact'];
        }

        if (input.hasOwnProperty('country')) {          
            output['country'] = input['country'];       
        }

        if (input.hasOwnProperty('language')) {         
            output['language'] = input['language'];     
        }
        
        return output;
        
    },
    /**
     * Authentication via payload
     * @param  accountPayload 
     * @param  secureKey
     * @memberOf API      
     */
    authenticateUser: function (accountPayload, secureKey) {
        
        var payload;
        var endpoint;

        Helpers.debug('Authenticating user');           
        
        if (!this.testMode) {
            
            if (!secureKey) {
                Helpers.debug ("Attempted to authenticate user, but no valid Secure Key was found.");           
                return;
            }   
            
            payload = {'securePayload':accountPayload, 'accessKey': this.aKey, 'secureKey': secureKey};                     
        } else {
            
            payload = accountPayload;           
            payload.accessKey = this.aKey;
            
        }
        
        endpoint = 'https://' + API.storefront + '/account/authenticate';
        
        payload = {'data': JSON.stringify(payload)};
        
        this.chain({'endpoint':endpoint,'method':'POST','payload':payload,'skipsession':true});             
        
    },

    /**
     * Method which queues POST request in order to get products 
     * @param  input input
     * @memberOf API
     */
    loadProducts: function (input) {
        var payload;
        var endpoint;

        Helpers.debug(' + Getting products');
        
        endpoint = 'https://' + API.storefront + API.builder;
        
        if (input) { 
            payload = {'put':JSON.stringify(input)}; 
        }
        else { 
            payload = {};
        }
        
        this.chain({'endpoint':endpoint,'method':'POST','payload':payload});            
        
    },

    /**
     * redirect to checkout page 
     * @param  input input
     * @memberOf API
     */
    checkoutRedirect: function (input) {
        var payload;
        var endpoint;

        Helpers.debug(' + Redirecting to checkout');
        
        endpoint = 'https://' + API.storefront + API.builder + '/finalize';
        
        if (API.checkoutMode === "popup" || API.checkoutMode === "inapp") {
            input['origin'] = document.location.href;
        }

        if (input) {
            payload = {'put':JSON.stringify(input)};
        }
        else {
            payload = {};
        }
        
        this.chain({'endpoint':endpoint,'method':'POST','payload':payload});            
        
    },
    
    
    /**
     * Executes XHR 
     * @param  {string} url - url for req.open 
     * @param  {string} method  - method for req.open
     * @param  {object} payload - payload obj  
     * @param  {boolean} skipsession   
     * @memberOf API
     */
    request: function (url, method, payload, skipsession) {

        Helpers.debug("Locking requests chain");
        API.ajaxInProgress = true;
        
        var obj = this;
        
        if (this.sessionID && !skipsession) {
            payload['session'] = this.sessionID;
        }

        var sendPayload = this.toQueryString(payload);

        Helpers.debug(" > > > Making request to " + url + " (" + method + ") with data:", sendPayload);

        try {

            if (typeof window.XMLHttpRequest !== 'undefined' && window.XMLHttpRequest !== null) {
                var req = new XMLHttpRequest();
                req.open(method, url, true);
                req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                req.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');

                req.onerror = function() {
                    Helpers.debug("(!) Error received: ", req.status, req.responseText);
                    API.runErrorCallback(req.status, req.responseText);
                    API.nextRequest();
                };

                req.onreadystatechange = function() {
                    if (req.readyState === 4) {
                        if (req.status >= 200 && req.status < 400) {
                            API.successHandler(req);
                        } else { 

                            Helpers.debug("(!) Error: Error received: ", req.status, req.responseText);
                            
                            if (API.checkoutMode === 'popup') { 
                                Popup.destroy(); 
                            }

                            API.runErrorCallback(req.status, req.responseText);
                            API.nextRequest();
                        }
                    }
                };

                req.send( sendPayload );
            } else  if ( window.XDomainRequest) {
                // fall back for Internet Explorer 8 and 9

                var xdr = new XDomainRequest();
               
                xdr.onerror = function() {
                    if (API.checkoutMode === 'popup') {
                        Popup.destroy();
                    }
                    Helpers.debug("(!) Error received: ", xdr.status, xdr.responseText);
                    API.runErrorCallback(xdr.status, xdr.responseText);
                    API.nextRequest();
                };
                xdr.open(method, url);

                // Note: There is no setRequestHeader for XDomainRequest 
                
                xdr.onload = function() {
                    API.successHandler(xdr);
                };

                xdr.send( sendPayload );
            }
        } catch (e) {
            Helpers.debug('Exception: ', e);
        }
    },

    /**
     * runs API.errorCallback or request fail if that is function 
     * @param  status       [description]
     * @param  responseText [description]
     * @memberOf API
     */
    runErrorCallback: function(status, responseText) {
        if (typeof window[API.errorCallback] === "function") {
            Helpers.debug(" <- Calling ", API.errorCallback);
            try {
                window[API.errorCallback](status, responseText);
            }
            catch(e) {
                console.log(e);
            }
        }
    },

    /**
     * handler function called from req.onreadystatechange and req.onload within request function
     * @param  req request
     * @memberOf API
     */
    successHandler: function (req) {

        var responseData = JSON.parse(req.responseText);
        Helpers.debug('Request is OK, returned data: ', responseData);

        if (responseData.hasOwnProperty('url') && !responseData.hasOwnProperty('serial')) {                  

            API.nextRequest();                
            Helpers.debug("Obtained redirection parameter", responseData['url']);           
            var url = responseData['url'];

            if (responseData.hasOwnProperty('session')) {
                localStorage.setItem('fscLatestSession-' + API.storefront, responseData['session']);
            }

            API.continueCheckoutWithURL(url);

            return;

        }

        this.handleSerial(responseData['serial'], responseData['expires']);
        this.handleData(responseData);
        this.nextRequest();      

    },

    /**
     * Change payload object to encoded serial string
     * @param  obj payload object
     * @return string encoded serial
     * @memberOf API
     */
    toQueryString: function (obj) {
        var parts = [];

        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                parts.push(i + "=" + encodeURIComponent(obj[i]));
            }
        }   
        return parts.join("&");

    },
    /**
     * redirect ti checkout page
     * @param  {string} url redirect URL
     * @memberOf API
     */
    continueCheckoutWithURL: function (url) {
    
        if (typeof window[API.decorateCallback] === "function") {
            Helpers.debug(" <- Calling ", API.decorateCallback);
            var returnUrl = window[API.decorateCallback](url);
            
            try {
                if (returnUrl && returnUrl.length> 0 && returnUrl.indexOf(url) > -1) {
                    url = returnUrl;
                }
                else {  throw "data-decorate-callback Must return correct url"; }
            } catch(e) { console.log(e); }
        }
                
        if (API.checkoutMode === "popup" && (/\/popup-/).test(url)) {
            
            if (fscCleanCheckout === true) { API.continuousReset(); }
            Popup.drawFrame(url);
            return;

        } else {

            if (fscCleanCheckout === true) { API.continuousReset(); }
            window.location = url;                          
            return;
                                        
        }                         

    }



};
;
/**
 * @name  Popup 
 * @class Popup 
 */
var Popup = {
    iframeId: 'fsc-popup-frame',
    /** Checks the existance of session in url to open it in order to get back after paypal payment  or any other actions   */
    checkURL: function () {
        
        var findings = /fsc:invoke:(session|complete)/g.exec(document.location.href); 
        var sessionPath;
        var lastSession;
        
        if (findings !== null && findings.length > 0 && (findings[1] === 'session' || findings[1] === 'complete')) {
            
            lastSession = localStorage.getItem('fscLatestSession-' + API.storefront);

            if (lastSession === null) {
                return;
            }
            
            if (findings[1] === 'complete') {
                sessionPath = lastSession + '/complete';
            }
            else {
                sessionPath = lastSession;
            }

            var interval = setInterval( function () {
                if ( document.readyState !== 'complete' ) return;
                clearInterval( interval );       
                Popup.draw();
                Popup.drawFrame('https://' + API.storefront + '/session/' + sessionPath );  

            }, 100 );
            
        }
        
    },
    
    draw: function () {
        this.createListeners();
        this.drawCanvas();
    },
    
    createListeners: function () {
        
        if (window.addEventListener){
            window.addEventListener("message", Popup.listener, false);
        } else {
            window.attachEvent("onmessage", Popup.listener);
        }
        
    },
    
    listener: function (event) {

        if (event.data.hasOwnProperty('fscPopupMessage') && event.data.fscPopupMessage.hasOwnProperty('action')) {
            
            var a = event.data.fscPopupMessage;
            
            if (a.action === 'close') {
                if (a.hasOwnProperty('orderReferences')) {
                    Popup.popupClosedFunction(a.orderReferences);
                }
                else {
                    Popup.popupClosedFunction(null);
                }
                
            //event was designed for GA 
            } else if (a.action === 'event') {
                
                if (a.hasOwnProperty('eventData')) {
                    Popup.publishEvent(a.eventData);
                }
                
            } else if (a.action === 'hook') {

                if (a.hasOwnProperty('hookData')) {
                    Popup.hookEvent(a.hookData);
                }
            }
        
        }
    
    },

    popupClosedFunction: function (orderReferences) {

        if (typeof window[API.popupClosed] === "function") {
            Helpers.debug(" <- Calling ", API.popupClosed);
            try {
                window[API.popupClosed](orderReferences);
            }
            catch(e) { Helpers.debug(" --Error in data-popup-closed");}
        }
        
        if (orderReferences) localStorage.removeItem('fscLatestSession-' + API.storefront);                  
        
        Helpers.debug("Popup Closed. Is there an order number?", orderReferences);  
        Popup.destroy();     
        
    },

    publishEvent: function (eventData) {
        Helpers.debug("Event published", eventData);
        
        if (typeof window[API.popupEventReceived] === "function") {

            Helpers.debug(" <- Calling ", API.popupEventReceived);
            try {
                window[API.popupEventReceived](eventData);
            }
            catch(e) { Helpers.debug(" -- Error in popup-event-received");}

        }
    },

    hookEvent: function (hookData) {

        Helpers.debug("Hook published: ", hookData);

        if (typeof window[API.popupWebhookReceived] === "function") {
            Helpers.debug(" <- Calling ", API.popupWebhookReceived);
            try {
                window[API.popupWebhookReceived](hookData);
            }
            catch(e) { Helpers.debug(" --Error in popup-webhook-received");}
        }
    },
    
    drawCanvas: function () {
        
        if (!document.getElementById('fscCanvas')) {

            if (API.showBlur) {
                var body = document.body, html = document.documentElement;
                var height = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
                
                this.blur = document.createElement('div');
                this.blur.id = 'fscBlur';
                this.blur.setAttribute("style", "-webkit-filter: blur(7px);-moz-filter: blur(7px);-o-filter: blur(7px);-ms-filter: blur(7px);filter: blur(7px);");
                this.blur.style.width = '100%';
                this.blur.style.height = height + 'px';
                this.blur.style.position = 'absolute';
                this.blur.style.top = '0';
                this.blur.style.left = '0';
                this.blur.style.zIndex = '1000000000000';
                this.blur.innerHTML = document.body.innerHTML;          
                
                document.body.appendChild(this.blur);
            } 

            this.canvas = document.createElement('div');
            this.canvas.id = 'fscCanvas';
            this.canvas.setAttribute("style", "background: -webkit-linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.8)); background: -o-linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.8)); background: -moz-linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.8)); background: linear-gradient(rgba(0,0,0,0.9), rgba(0,0,0,0.8));");
            this.canvas.style.width = '100%';
            this.canvas.style.height = '100%';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.zIndex = '100000000000000';    

            if (API.animateFader) {

                this.canvas.style.transitionProperty = 'opacity';
                this.canvas.style.transitionDuration = '0.5s';  
                this.canvas.style.opacity = '0';                    
            }
                   
            document.body.appendChild(this.canvas);
            
            if (API.animateFader) {
                setTimeout(function() {document.getElementById('fscCanvas').style.opacity = '1';} , 100);
            }
        }

        Spinner.attach();        

    },
    
    drawFrame: function (url) {
        
        this.frame = this.iframe || null;
        Helpers.debug("Launching popup with URL:",url);
        
        if (!document.getElementById(Popup.iframeId)) {
            
            this.frame = document.createElement('iframe');
            this.frame.id = Popup.iframeId;
            this.frame.className = 'unblurred';         
            this.frame.setAttribute('name',Popup.iframeId);
            this.frame.width = '100%';
            this.frame.height = '100%';
            if( /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                this.frame.style.position = 'absolute';
            }
            else {
                this.frame.style.position = 'fixed';
            }
            this.frame.style.top = '0';
            this.frame.style.left = '0';
            this.frame.style.background = 'transparent';            
            this.frame.style.zIndex = '1000000000000000';
            this.frame.frameBorder = 0;         
            this.frame.setAttribute('background','transparent');

            if (url.length > 0) {
                this.frame.setAttribute("src", url);
            }
            
            document.body.appendChild(this.frame);
            document.body.style.overflow = 'hidden';

            this.frame.onload = function () {       
                Spinner.remove();        
            };          
            
        } else {
            
            if (url.length > 0) {
                this.load(url);
            }
            
        }
        
    },
    
    destroy: function () {

        document.body.removeAttribute('style');
        Spinner.remove();
        if (this.blur !== null && typeof this.blur !== "undefined") { this.blur.parentNode.removeChild(this.blur); this.blur = null; }

        var timeout = 0;

        if (API.animateFader) {

            Popup.canvas.style.opacity = '0';
            timeout = 500;
            
        }
        setTimeout(function() {

            if (Popup.frame !== null && typeof Popup.frame !== "undefined") { Popup.frame.parentNode.removeChild(Popup.frame); Popup.frame = null; }
            if (Popup.canvas !== null && typeof Popup.canvas !== "undefined") { Popup.canvas.parentNode.removeChild(Popup.canvas); Popup.canvas = null; }

        } , timeout);
    },

    
    load: function (url) {
        
        this.frame.location = url;
        
    }

    
};;
/**
 * @name  F
 * @class F
 */
var f = {
    /**
     * Main function 
     * @param input 
     * @memberOf F
     */
    Push: function (input, callback) {    
        
        if (!APIInitialized || fscMerging === true)  {
            fscSession = Helpers.merge(fscSession,input);           
        } else {
            API.parseInput(input);
        }

        if (callback) { Helpers.runCallback(callback); }       
        
    },

    /**
     * Checkout function 
     * @memberOf F
     * 
     */
    Checkout: function (session) {
        var s;
        if (session && session.length > 10) {
            s = {'checkout': session}; 
        } else {
            s = {'checkout':true};  
        }
        f.Push(s);
        
    },

    /**
     * Sets code value to 'coupon' property
     * @param {String} code 
     * @memberOf F
     */
    Promo: function (code, callback) {
        
        var s = {'coupon':code};
        f.Push(s);
        if (callback) { Helpers.runCallback(callback); }       
        
    },

    /**
     * Updates product quantity 
     * @param path    
     * @param quantity 
     * @memberOf F
     * 
     */
    Update: function (path, quantity, callback) {
        
        var s = {'products':[{'path':path,'quantity':parseInt(quantity)}]};
        f.Push(s);
        if (callback) { Helpers.runCallback(callback); }       
        
    },

    /**
     * Removes product from cart
     * @param path    
     * @memberOf F
     * 
     */
    Remove: function (path, callback) {
        
        var s = {'products':[{'path':path,'quantity':0}]};
        f.Push(s);
        if (callback) { Helpers.runCallback(callback); }       
        
    },


    /**
     * Updates with quantity 1
     * @param path 
     * @memberOf F
     * 
     */
    Add: function (path, callback) {
        
        //if (callback) API.passedCallbackFunction = callback;
        if (callback) { Helpers.runCallback(callback); }       
        f.Update(path,1);
        
    },

    /**
     * Sends payment contact data.
     * @param {string} email    
     * @param {string} firstName 
     * @param {string} lastName 
     * @memberOf F
     */
    Recognize: function (email, firstName, lastName, callback) {
        
        var s = {'paymentContact':{'email':email,'firstName':firstName,'lastName':lastName}};
        f.Push(s);
        if (callback) { Helpers.runCallback(callback); }       
        
    },
    /**
     * Sends reset: true
     * @memberOf F
     */
    Reset: function (callback) {
        
        var s = {'reset':true};
        f.Push(s); 
        if (callback) { Helpers.runCallback(callback); }     
        
    },
    /**
     * Sends clean: true
     * @memberOf F
     */
    Clean: function (callback) {

        var s = {'clean':true};
        f.Push(s);    
        if (callback) { Helpers.runCallback(callback); }         
        
    },
    /**
     * Add payload to secure property and set secure key 
     * @param {string} p payload
     * @param {string} k key
     * @memberOf F
     */
    Secure: function (p, k, callback) {
        
        var s = {'secure':{'payload':p}};
        
        if (k) {
            s.secure.key = k;
        }
        
        f.Push(s);
        if (callback) { Helpers.runCallback(callback); }     
        
    },

    /**
     * Authenticate with payload and key
     * @param {string} p payload
     * @param {string} k key
     * @memberOf F
     */
    Authenticate: function (p, k, callback) {
        
        var s = {'authenticate':{'payload': p}};
        
        if (k) {
            s.authenticate.key = k;
        }
        
        f.Push(s);
        if (callback) { Helpers.runCallback(callback); }     
        
    },

    /**
    * Set tags
    * @param {string} key  
    * @param {string} value 
    * @memberOf F
    */
    Tag: function (key, value, callback) {
      
        var s = {'tags': {}};
        s.tags[key] = value;
        f.Push(s);
        if (callback) { Helpers.runCallback(callback); }     
    },

    /**
     * Set country 
     * @param {string} country
     * @memberOf F
     */
    Country: function (country, callback) {
       
        var s = {'country': country};
        f.Push(s);
        if (callback) { Helpers.runCallback(callback); }     

    },
    /**
     * Set language
     * @param {string} language
     * @memberOf F 
     */
    Language: function (language, callback) {
      
        var s = {'language': language};
        f.Push(s);
        if (callback) { Helpers.runCallback(callback); }     
        
    }, 

    Recompile: function (template, filter, callback) {
        
        Markup.compileHandlebarsTemplate(template, filter);
        if (callback) { Helpers.runCallback(callback); }     
        
    }

    
};;
/**
 * @name  Markup
 * @class Markup
 */
var Markup = {

    init: function() {

        this.isDynaCart = false;
        this.ready = true;

        this.listDriver = fscContainer.getAttribute("data-storefront").split(".")[0];

        //are there any handlebars template on the page?
        this.$fscDynaContainers = document.querySelectorAll("[data-fsc-items-container]");
        this.dynaListObjs = [];
        if (typeof this.$fscDynaContainers[0] !== "undefined") {
            this.isDynaCart = true;

            var filterList = "";
            var containerName = "";
            var dynaLength = this.$fscDynaContainers.length;

            for (var i = 0; i < dynaLength; i++) {
                containerName = this.$fscDynaContainers[i].getAttribute("data-fsc-items-container");
                filterList = this.$fscDynaContainers[i].getAttribute("data-fsc-filter");
                this.dynaListObjs.push({'containerName': containerName, 'filterList': filterList});

            }
        }

    },
    
    
    /**
     * setData  function where the data enters Markup
     * @param data
     * @memberOf Markup
     */
    setData: function (data) {
        Helpers.debug("Received data for Markup:",data);    
        this.data = data;
    },
    
    /**
     * Loads library if needed in Markup.process
     * @param {String} sId - Script ID
     * @param {String} fileUrl - handlebars lib URL
     * @param {Function} callback - callback to execute when handlebars is loaded
     * @memberOf Markup
     */
    loadHanlebarsLib: function(sId, fileUrl, callback) {
        if (window.Handlebars) {
            callback();
        }
        else {
            var xhr =  new XMLHttpRequest();
            xhr.open("GET", fileUrl, true);
            xhr.send();
            xhr.onreadystatechange = function() {   
                if ( xhr.readyState === 4 ) {
                    if ( xhr.status === 200 || xhr.status === 304 ) {
                        includeJS( sId, fileUrl, xhr.responseText );
                    }
                    else {
                        Helpers.debug( 'XML request error: ' + xhr.statusText + ' (' + xhr.status + ')' ) ;
                    }

                    callback();
                }
            };
        }

        function includeJS(sId, fileUrl, source) {
            if ( ( source !== null ) && ( !document.getElementById( sId ) ) ){
                var oHead = document.getElementsByTagName('HEAD').item(0);
                var oScript = document.createElement( "script" );
                oScript.language = "javascript";
                oScript.type = "text/javascript";
                oScript.id = sId;
                oScript.defer = true;
                oScript.text = source;
                oHead.appendChild( oScript );
            }
        }
    },

    /**
     * This function helps to triger handlebars compilation. 
     Should be used if filter value changes dynamically
     * @param  {string} templateId - id to be used in [data-fsc-template-for=''] attribute
     * @param  {string} filter     - filter to be applied during compilation. For ex. "path='productPath'";
     */
    compileHandlebarsTemplate: function(templateId, filter) {
        
        if (typeof filter === 'object') {
            
            var output = [];
            
            for (var parameter in filter) {
                
                output.push(parameter + "='"+filter[parameter]+"'");
                
            }
            
            filter = output.join(';');
            
        }
        
        var source;
        for (var i = 0; i < this.dynaListObjs.length; i++) {
            if (this.dynaListObjs[i].containerName === templateId) {
                source = document.querySelector("[data-fsc-template-for='" + templateId + "']");
                if (source == null) { return; }

                this.dynaListObjs[i].filterList = filter;

                this.handlebarTemplates[i] = Handlebars.compile(source.innerHTML);
                this.parseAndPut(this.data);
                this.afterMarkup();
                break;
            }
        }
    },
    /** 
     * process function where all data parsing, process, and markup is 'driven' from including both Static and Dynamic
     * @memberOf Markup
     */
    process: function () {
        
        if (this.ready !== true || !this.data) {
            return;
        }

        //Todo: remove this when fixed on backend 
        this.data.groups.forEach(function(group) {
            group.items.forEach(function(item) {
                if (item.hasOwnProperty('description') && item.description.hasOwnProperty('action')) {
                    item.description.action = item.description.action.replace('<p>', '').replace('</p>','');
                }
            });
        });
        //****************************************************************
        if (typeof window[API.beforeMarkup] === "function") {
            Helpers.debug(" <- Calling ", API.beforeMarkup);
            try{
                window[API.beforeMarkup]();
            }
            catch(e) { Helpers.debug(" --Error in data-before-markup-callback"); }
        }
            
        Helpers.debug("Doing markup with data:", this.data);
        
        if (this.isDynaCart) {
            this.loadHanlebarsLib("handlebarScriptElm", "https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/3.0.1/handlebars.min.js",  function handlebarsCallback() {
    
                if (typeof window[API.markupHelpers] === "function") {
                    Helpers.debug(" <- Calling ", API.markupHelpers);
                    try {
                        window[API.markupHelpers]();
                    }
                    catch(e) { Helpers.debug(" --Error in data-after-markup-callback");}
                }   


                this.handlebarTemplates = [];
                for (var i = 0; i < this.dynaListObjs.length; i++) {

                    var source = document.querySelector("[data-fsc-template-for='" + this.dynaListObjs[i].containerName + "']");
                    if (source !== null) {
                        this.handlebarTemplates[i] = Handlebars.compile(source.innerHTML);
                    }

                }

            // parse the data and put values to places.
            this.parseAndPut(this.data);
            this.afterMarkup();

            }.bind(this));
        }
        else {
            // parse the data and put values to places.
            this.parseAndPut(this.data);
            this.afterMarkup();
        }

    },
    

    afterMarkup: function () {
        if (typeof window[API.afterMarkup] === "function") {
            Helpers.debug(" <- Calling ", API.afterMarkup);
            try {
                window[API.afterMarkup]();
            }
            catch(e) { Helpers.debug(" --Error in data-after-markup-callback");}
        }
    },

    /**
     * Add event handlers for actions available on product
     * @memberOf Markup
     */
    addEventHandlers: function () {
        // handler functions
        // These functions are used in Markup.Multiple to call the 
        // corresponding function of Markup in case if the name of a function and action differs or to map many functions into one
        this.functions = {};

        this.functions.preventDefault = function (e) {
            e.preventDefault();
        };

        this.functions.Add = function (e) {
            Markup.Add(e);
        };

        this.functions.Update = function (e) {
            Markup.Update(e);
        };

        this.functions.Remove = function (e) {
            Markup.Remove(e);
        };

        this.functions.Promocode = function (e) {
            Markup.Promo(e);
        };

        this.functions.Recognize = function (e) {
            Markup.Recognize(e);
        };

        this.functions.Reset = function (e) {
            Markup.Reset(e);
        };

        this.functions.Clean = function (e) {
            Markup.Clean(e);
        };

        this.functions.Checkout =  function (e) {
            Markup.Checkout(e);
        };

        this.functions.autoUpdate = function () {
            setTimeout(function(){
                Markup.Update(this);
            }.bind(this), 1500);
        };

        this.functions.Replace = function (e) {
            Markup.Add(e);
        };

        this.functions.Multiple = function () {
            Markup.Multiple(this);
        };

        var clickSelector = document.querySelectorAll(
            '[data-fsc-action=Add],' +
            '[data-fsc-action=Update],' +
            '[data-fsc-action=Remove], ' +
            '[data-fsc-action=Replace],' +
            '[data-fsc-action=Promocode],' +
            '[data-fsc-action=Reset],' +
            '[data-fsc-action=Recognize],' +
            "[data-fsc-action*=',']," +            
            '[data-fsc-action=Checkout]');
        for(var i=0; i<clickSelector.length; i++) {

            var e = clickSelector[i].cloneNode(true);
            var tag = e.tagName.toLowerCase();
            var changeTypes = ['checkbox','radio', 'search', 'text'];

            if ( tag === "a") {
                if (e.addEventListener) {
                    e.addEventListener('click', this.functions.Multiple, false);
                    e.addEventListener('click', this.functions.preventDefault, false);
                }
                else {
                    e.attachEvent('click', this.functions.Multiple);
                    e.attachEvent('click', this.functions.preventDefault);
                }
            }
            else if ((tag === "select") || (tag === "textarea") || ((tag === "input") && (changeTypes.indexOf(e.type.toLowerCase()) > -1))) {
                if ( e.addEventListener) {
                    e.addEventListener('change', this.functions.Multiple, false);
                } else {
                    e.attachEvent('change', this.functions.Multiple);
                }
            }
            else {
                if (e.addEventListener) {
                    e.addEventListener('click', this.functions.Multiple, false);
                } else {
                    e.attachEvent('click', this.functions.Multiple);
                }
            }

            clickSelector[i].parentNode.replaceChild(e, clickSelector[i]);
        }
    },
    
    /**
     * Checkout with sesion param or without
     * @memberOf Markup
     */
    Checkout: function () {
        var session = Markup.findValue('session');     
        if (session.length < 10) { f.Checkout(); }
        else { f.Checkout(session); }
    },

    /**
     * Apply promocode - Fist need to look for data-fsc-promocode-value else find promocode in markup
     * @memberOf Markup
     */
    Promo: function () {
        var code = Markup.findValue('promocode');
        f.Promo(code);
    },

    /**
     * Update quantity
     * @param elem element which needs to be updated 
     * @memberOf Markup
     */
    Update: function (elem) {

        var quantity;
        var product = elem.getAttribute("data-fsc-item-path-value");
        var quantityValue = elem.getAttribute("data-fsc-item-quantity-value");
        var quantitySrc = elem.getAttribute("data-fsc-quantity-src");
        var quantityElement;
        var quantitySrcValue;
        var tag;
       
       //quantity 0 if checkbox unchecked
        if (elem.tagName.toLowerCase() === 'input' && elem.type.toLowerCase() === 'checkbox' && !elem.checked) {
            quantity = 0;
        } else {
            //get from attribute if set
            if (quantityValue !== null && quantityValue > 0) {
                quantity = quantityValue;
            }
            // //get from source element quantity
            else if (quantitySrc !== null && quantitySrc.length > 0) {
                quantityElement = document.getElementById(quantitySrc);
                quantitySrcValue = quantityElement.getAttribute('data-fsc-item-quantity-value');
                if (quantityElement !== null) {
                    tag = quantityElement.tagName.toLowerCase(); 
                    switch(true) {
                        case tag === 'input' && quantityElement.type.toLowerCase() !== 'checkbox' || tag === 'select':
                            quantity = quantityElement.value; 
                            break;
                        case tag === 'input' && quantityElement.type.toLowerCase() === 'checkbox' && !quantityElement.checked:
                            quantity = 0;
                            break;
                        case tag === 'input' && quantityElement.type.toLowerCase() === 'checkbox' && quantityElement.checked:
                            quantity = 1;
                            break;
                        case quantitySrcValue !== 'null' && quantitySrcValue > 0 :
                            quantity = quantitySrcValue;
                            break;
                        default: 
                            quantity = Markup.findValue("item-quantity", product);
                    }
                }
            }

            else {
                //No need to look for all item quantity values if select element value was changed
                if ( elem.hasOwnProperty('selectedIndex') && elem[elem.selectedIndex].value > -1  ) {
                    quantity = elem[elem.selectedIndex].value;
                }    
                else {
                    quantity = Markup.findValue("item-quantity", product);
                }
            }
        
            quantity = quantity || 1;
        }



        /*
        var lineItemContainerSelected = "[data-fsc-cart-item-template-selected][data-fsc-item-path='" + product + "']";
        var lineItemContainer = "[data-fsc-cart-item-template][data-fsc-item-path='" + product + "']";


        if (document.querySelector(lineItemContainer) === null) {
          lineItemContainer = lineItemContainerSelected;
        }

        // If element clicked is within the dynamic cart line item,
        // then use that line item quantity for update
        if (document.querySelector(lineItemContainer) && document.querySelector(lineItemContainer).contains(elem)) {
          var selector = lineItemContainer + " [data-fsc-item-quantity-value]";
          if (document.querySelector(selector) !== null) {
            quantity = document.querySelector(selector).value;
          }
        }
        */

        f.Update(product, quantity);

    }, 
    /**
     * Add product to cart 
     * @param e element to add 
     * @memberOf Markup
     */
    Add: function (e) {
                
        var product = e.getAttribute("data-fsc-item-path-value");   
        f.Add(product);
        
    },
    /**
     * Remove from cart 
     * @param e element to remove 
     * @memberOf Markup
     */
    Remove: function (e) {
    
        var product = e.getAttribute("data-fsc-item-path-value");   
        f.Update(product, 0);
                
    },
    /**
     * Update with driver product 
     * @param e element to replace
     * @memberOf Markup
     */
    Replace: function (e) {

        var driverProduct =  e.getAttribute("data-fsc-driver-item-path-value");
        f.Update(driverProduct, 0);

    },

    /**
     * @memberOf Markup
     */
    Recognize: function () {

        var firstname = Markup.findValue('firstname');
        var lastname = Markup.findValue('lastname');       
        var email = Markup.findValue('email');     
        
        f.Recognize(email,firstname,lastname);
        
    },

    /**
     * @param e element to reset 
     * @memberOf Markup
     */
    Reset: function (e) {
    
        f.Reset();  
        
    }, 
    /**
     * @memberOf Markup
     */
    Clean: function () {
        f.Clean();  
    },      
    
    /**
     * This function will be called if any of event handlers are triggered. 
     * It's purpose is to Multiply and call corresponding functions from data-fsc-action attributes  
     * @param elem 
     * @memberOf Markup
     */
    Multiple: function (elem) {

        var functions = this.functions;
        fscMerging = true;
        var elementActions = elem.getAttribute("data-fsc-action");
        if (elementActions.indexOf(',') > -1) {
            elementActions.split(",").forEach(function (a) {
                a = a.trim();
                if (functions.hasOwnProperty(a)) {
                   functions[a](elem);
                }
            });

        } else {

            elementActions = elementActions.trim();
            if (functions.hasOwnProperty(elementActions)) {
               functions[elementActions](elem);
            }
        }

        fscMerging = false;
        API.parseInput(fscSession);
  },
    

    // Does values[0] always grab 
    // the correct value in the case where 
    // querySelectorAll() returns array of elements?
    /**
     * find if given tag exists on the page and return it's value
     * @memberOf Markup
     * @param  tag    [description]
     * @param   ofitem [description]
     */
    findValue: function (tag, ofitem) {
        var values;
        var tagValue;
        if (!ofitem) {
            values = document.querySelectorAll('[data-fsc-' + tag + '-value]');
        } else {
            values = document.querySelectorAll("[data-fsc-" + tag + "-value][data-fsc-item-path-value='" + ofitem + "']");          
        }   
                
        if (typeof values[0] !== "undefined") {
            tagValue = values[0];
            if (tagValue.value) {
                return tagValue.value;
            }
                        
            if (tagValue.innerHTML) {
                return tagValue.innerHTML;
            }   
        }
                        
        return '';
    },
    /**
     * Parse and put data
     * @param   data
     * @memberOf Markup
     */
    parseAndPut: function (data) {
        // preserve this as obj in inner function
        var obj = this;

        // is order empty?
        if (data['selections'] === false) {
            fscEmptyOrder = true;
        } else {
            fscEmptyOrder = false;
        }

        Helpers.debug("Let's parse and put!");
        //Products (Items)
        var retrievedItemsUnaltered = this.parseProducts(data);
        var retrievedItemsDyna = this.parseProductsDyna(data);
        
        var retrievedDynaOrderLevel = this.parseDynaOrderLevel(data);
        this.processDynaOrderLists(retrievedItemsDyna, retrievedItemsUnaltered, retrievedDynaOrderLevel);
        
        if (retrievedItemsUnaltered.length > 0) {
            Helpers.debug("Products:", retrievedItemsUnaltered);
            this.processProducts(retrievedItemsUnaltered);

        } else {
            Helpers.debug('No products found in response');
        }

        //Order Level Items

        var retrievedOrderLevel = this.parseOrderLevel(data);
        
        if (retrievedOrderLevel !== false) {
            Helpers.debug("Top level items:", retrievedOrderLevel);         
            this.processOrderLevelItems(retrievedOrderLevel);
        } else {
            Helpers.debug('No top level items found in response (which is weird).');
        }

        this.addEventHandlers();
    },
    /**
     * Parse Products ]
     * @param  data [description]
     * @memberOf Markup
     */
    parseProducts: function (data) {
        
        var obj = this;
        var retrievedItems = [];

        // TODO make retrievedItems an array or groups bundles and products by removing ['items']
        for (var i = 0; i < data.groups.length; i++) {
            retrievedItems = retrievedItems.concat(data.groups[i]);
        }

        Markup.myArray = retrievedItems;

        if (retrievedItems.length > 0) {
            return retrievedItems;
        } else {
            return false;
        }
    },

    /**
     * parseProductsDyna Creates array of objects into storefront and offers list
     * @param  data response data from server
     * @return  storeFrontLists array of lists with api-lists and offer lists
     * @memberOf Markup
     */
    parseProductsDyna: function (data) {
        var obj = this;
        var retrievedItems = [];
        var offerList = [];

        var PRODUCT_GROUP_TYPES = {
            storefront: 'storefront',
            offers: 'offers'
        };


        var ProductGroup = function (options) {
            this.raw = options.raw;
            this.setListType(this.raw.driver);
        };

        /**
         * ProductGroup.prototype.setListType - decides if List is api (driver is storefront),
         *  or offers which need to be weaved below parent product
         * @param  {string} driver - is it an product offer or storefront (api list)
         * 
         */
        ProductGroup.prototype.setListType = function(driver) {

            if (driver === undefined){
                // handle default case
                this.listType = PRODUCT_GROUP_TYPES.storefront;
            } else {
                if (driver === Markup.listDriver || driver.indexOf(Markup.listDriver) > -1){
                    this.listType = PRODUCT_GROUP_TYPES.storefront;
                } else if (driver !== Markup.listDriver){
                    this.listType = PRODUCT_GROUP_TYPES.offers;
                }
            }
        };

        /**
         * ProductGroup.prototype.isStorefront - is it a storefront list?
         * 
         * @return {boolean}  true or false
         */
        ProductGroup.prototype.isStorefront = function() {
            return (this.listType === PRODUCT_GROUP_TYPES.storefront);
        };

        /**
         * ProductGroup.prototype.isOffer - is it an offer list?
         *
         * @return {boolean}  true or false
         * 
         */
        ProductGroup.prototype.isOffer = function() {
            return (this.listType === PRODUCT_GROUP_TYPES.offers);
        };

        var storeFrontLists = data.groups.filter(function(group) {
            var productGroup = new ProductGroup({ 'raw' : group });
            return productGroup.isStorefront();
        });


        var offersLists = data.groups.filter(function(group) {
            var productGroup = new ProductGroup({ 'raw' : group });
            return productGroup.isOffer();
        });

        // weave offer list below driver product if storeFrontLists are selections == true
        var offersStandAlone = true;
        // for (var i = 0; i < storeFrontLists.length; i++) {
        //     for (var j = 0; j < storeFrontLists[i].items.length; j++) {
        //         for (var k = 0; k < offersLists.length; k++) {
        //             if (offersLists[k].driver === storeFrontLists[i].items[j].path && storeFrontLists[i].items[j].selected === true) {
        //                 storeFrontLists[i].items[j].groups = storeFrontLists[i].items[j].groups.concat(offersLists[k]);
        //                 offersStandAlone = false;
        //             }
        //         }
        //     }
        // }

        if (offersStandAlone === true) {
            storeFrontLists = storeFrontLists.concat(offersLists);
        }

        if (storeFrontLists.length > 0) {
            return storeFrontLists;
        } else {
            return false;
        }
    },


    /**
     * applyDynaFilter - if data-fsc-filter="selected=true;etc;etc" this function will filter group
     *
     * @param  {array} group   each group listDriver
     * @param  {object} filter  contains  filter(s) and template container name
     * @return {array}  groupItems  returns filtered list of product objects
     * @memberOf Markup
     */
    applyDynaFilter: function(group, filter) {
        var filters = {};
        var groupItems = [];
        //var groupFilterCount = filter.filterList.split(";").length - 1;
        var retValue;
        var condition;
        var keyToCompare;

        if (filter.filterList !== null) {
            filter.filterList.split(";").forEach(function(eachFilter, j) {
                //filter condition - filter expression which to evaluate
                condition = eachFilter.split("=");
                filters[condition[0]] = condition[1];
            });
            // is there any part of this condition(s) === false?
            // if so return false
            groupItems = group.filter(function(product) {
                retValue = true;
                for (var key in filters) {
                    
                    if (typeof filters[key] === 'undefined' || filters[key] === null) { 
                        return true;
                    }

                    keyToCompare = filters[key];
                    if (filters[key] === "true") { keyToCompare = true; }
                    if (filters[key] === "false") { keyToCompare = false; }

                    //for product.path = 'productName' -> check if that's string or value by starting symbol 
                    if (filters[key][0] === '\'') {
                        var length = filters[key].length;
                        keyToCompare = filters[key].substring(1, length-1);
                    }
                    else if ( typeof window[keyToCompare] !== 'undefined') {
                        keyToCompare = window[keyToCompare];
                    }

                    if ( product[key] !== keyToCompare ) {
                        retValue = false;
                        break;
                    }
                }

                return retValue;
            });

        } 
        return groupItems;
        //return groupItems;

    },


    /**
     * Parse data for all Order level data and which ends up in processOrderLevelItems() for Static Markup
     * @param  data
     * @memberOf Markup
     */
    parseOrderLevel: function (data) {
        var retrievedOrderItems = [];
        for (var prop in data) {
            if (prop !== 'groups') {
                retrievedOrderItems = retrievedOrderItems.concat({key: prop, value: data[prop]});
            }       
        }

        if (retrievedOrderItems.length > 0) {
            return retrievedOrderItems;
        } else {
            return false;
        }
    },

    /**
     * Process data for all Order level items and send data to processOrderLevelItem() for Static Markup
     * @param  retrievedOrderLevel
     * @memberOf Markup
     */
    processOrderLevelItems: function (retrievedOrderLevel) {
        var obj = this;

        if (!Array.isArray(retrievedOrderLevel)) {
            Helpers.debug('Unexpected format of data');
        } else {
            retrievedOrderLevel.forEach( function(orderLevelItem){ 
                obj.processOrderLevelItem(orderLevelItem['key'], orderLevelItem['value']);
            });
        }
    },

    /**
     * Process data for each each Order level item and send each element data to processPropToElem() for Static Markup
     * @memberOf Markup
     */
    processOrderLevelItem: function (property, propertyValue) {
        var obj = this;
        var hideSelector = "[data-fsc-checkout-hideempty]";
        var i;

        if (property === "selections") {
            
            var allControlableItems = document.querySelectorAll(
            '[data-fsc-selections-smartselect],' +
            '[data-fsc-selections-smartdisplay],' +
            '[data-fsc-selections-smartdisplay-inverse], ' +
            '[data-fsc-selections-hideifselections],' +
            '[data-fsc-selections-showifselections],' +
            '[data-fsc-selections-hideifnoselections],' +
            '[data-fsc-selections-showifnoselections],' +
            '[data-fsc-selections-smartdisable],' +            
            '[data-fsc-selections-smartdisable-inverse],' +            
            '[data-fsc-selections-disableifselections],' +            
            '[data-fsc-selections-disableifnoselectios],' +            
            '[data-fsc-selections-enableifselections],' +            
            '[data-fsc-selections-enableifnoselections]');
            
            if ( allControlableItems !== null ) {

                for (i = 0; i < allControlableItems.length; i++) {             
                    var e = allControlableItems[i];
                    
                    if (e.hasAttribute('data-fsc-selections-smartselect') && (e.tagName === 'INPUT' && (e.type.toLowerCase() === 'checkbox' || e.type.toLowerCase() === 'radio'))) {
                        if (propertyValue === true) { e.checked = true; }
                        else { e.checked = false; }
                    }         
                    
                    if (e.hasAttribute('data-fsc-selections-smartdisplay')) {
                        if (propertyValue === true) { e.style.display = 'block'; }
                        else { e.style.display = 'none'; }
                    }

                    if (e.hasAttribute('data-fsc-selections-smartdisplay-inverse')) {
                       if (propertyValue === true) { e.style.display = 'none';} 
                       else { e.style.display = 'block'; }
                    }

                    if (e.hasAttribute('data-fsc-selections-hideifselections')) {
                        if (propertyValue === true) { e.style.display = 'none';}
                    }

                    if (e.hasAttribute('data-fsc-selections-showifselections')) {
                        if (propertyValue === true) { e.style.display = 'block';}
                    }

                    if (e.hasAttribute('data-fsc-selections-hideifnoselections')) {
                        if (propertyValue === false) { e.style.display = 'none'; }
                    }                 

                    if (e.hasAttribute('data-fsc-selections-showifnoselections')) {
                        if (propertyValue === false) { e.style.display = 'block'; }
                    }                 

                    if (e.hasAttribute('data-fsc-selections-smartdisable')) {
                        if (propertyValue === false) { e.setAttribute("disabled", "disabled"); }
                        else { e.removeAttribute("disabled"); }
                    } 

                    if (e.hasAttribute('data-fsc-selections-smartdisable-inverse')) {
                        if (propertyValue === true) { e.setAttribute("disabled", "disabled"); }
                        else { e.removeAttribute("disabled"); }
                    } 

                    if (e.hasAttribute('data-fsc-selections-disableifselections')) {
                       if (propertyValue === true) { e.setAttribute("disabled", "disabled"); }
                    }                 

                    if (e.hasAttribute('data-fsc-selections-disableifnoselectios')) {
                        if (propertyValue === false) { e.setAttribute("disabled", "disabled"); }
                    } 

                    if (e.hasAttribute('data-fsc-selections-enableifselections')) {
                        if (propertyValue === true) { e.removeAttribute("disabled"); }
                    }                 

                    if (e.hasAttribute('data-fsc-selections-enableifnoselections')) {
                        if (propertyValue === false) { e.removeAttribute("disabled"); }
                    }                 
    
                }                  
                
            }
            
            
        }


        if (property === "selections" && propertyValue === false) {
            
            var hideElements = document.querySelectorAll(hideSelector);
            if (hideElements !== null) {
                for (i = 0; i < hideElements.length; i++) {
                    if (hideElements[i].tagName.toLowerCase() === "a") {
                        hideElements[i].setAttribute("style", "display: none");
                    } else if (hideElements[i].tagName.toLowerCase() === "div"){
                        hideElements[i].setAttribute("style", "display: none");
                    } else {
                        hideElements[i].setAttribute("disabled", "disabled");
                    }
                }
            }
        } 

        if (property === "selections" && propertyValue === true) {

            var showElements = document.querySelectorAll(hideSelector);
           if (showElements !== null) {
                for (i = 0; i < showElements.length; i++) {
                    if (showElements[i].tagName.toLowerCase() === "a") {
                        showElements[i].setAttribute("style", "display: inline");
                    } else if (showElements[i].tagName.toLowerCase() === "div"){
                        showElements[i].setAttribute("style", "display: block");
                    } else {
                        showElements[i].removeAttribute("disabled");
                    }
                }
            }
        } 

        property = this.mapProperty(property);
        propertyValue = this.mapValue(property, propertyValue);
        
        Helpers.debug('Processing top order level item:', property, propertyValue);

        var selector = "[data-fsc-order-" + property + "]";
        var elements = document.querySelectorAll(selector);

        for (i = 0; i < elements.length; i++) {
            obj.processPropToElem(property, propertyValue, elements[i], 'data-fsc-order-' + property);
        }

    },
    /**
     * Needed because sometimes our internal property name differs from what arrives in JSON
     * @param  {string} property 
     * @return {string} value
     * @memberOf Markup    
     */
    mapProperty: function (property) {
        var propertiesMap = {};
        propertiesMap['coupons'] = 'promocode';
        propertiesMap['description-action'] = 'calltoaction';
        
        if (propertiesMap.hasOwnProperty(property)) {
            property = propertiesMap[property];
        }
        
        return property;    
        
    },
    /**
     * map Value 
     * @param   property [description]
     * @param   value    [description]
     * @memberOf Markup
     */
    mapValue: function (property,value) {
        
        if (property === 'promocode') {
            value = value[0] || '';
        }
        
        return value;   
    },
    
    // Parse data for all Order level data and which ends up in processOrderLevelItems() for Static Markup


    /**
    * parseDynaOrderLevel - remove products groups and return Order level info only
    *
    * @param  {object} data   response data from server
    * @return {array} retrievedDynaOrderItems   array which holds object of order level fields
    * @memberOf Markup
    */
    parseDynaOrderLevel: function (data) {
        var retrievedDynaOrderItems = [];
//        delete data.groups; -- Hello from Paul
        retrievedDynaOrderItems.push(data);

        if (retrievedDynaOrderItems.length > 0) {
            return retrievedDynaOrderItems;
        } else {
            return false;
        }
    },


    /**
    * processDynaOrderLists - Go thru all lists, adds future (subscription) dates via futureAddProps(),
    * and applyDynaFilter() if container has data-fsc-filter="...". Then loops thru all Dynamic list templates
    * sending each one to displayDynaOrderLists, along with orderlevel data
    *
    * @param  {array} retrievedItems           filtered and future props added lists
    * @param  {array} retrievedItemsUnaltered  unfiltered and no future props added lists
    * @param  {array} retrievedOrderLevel      array which holds object of order level fields
    * @memberOf Markup
    */
    processDynaOrderLists: function(retrievedItems, retrievedItemsUnaltered, retrievedOrderLevel) {

        // filter for dynamic markup api-lists and additional lists
        var thisObj = this;

        if (!Array.isArray(retrievedItems)) {
            Helpers.debug('not an array of products so cannot markup');

        } else {

            // roll thru all products in the array
            // weave in subscription info
            var retrievedLength = retrievedItems.length;
            for (var i = 0; i < retrievedLength;  i++) {
                retrievedItems[i].items.forEach(function(productData) {
                    var productPath = productData.path;
                    if (productData.future !== undefined) {
                        thisObj.futureAddProps(productData);
                    }
                }); // forEach end
            }

            var dynaLength = this.dynaListObjs.length;
            var tempRetrievedItems = {};
            for ( i = 0; i < dynaLength; i++) {
               
                for (var j = 0; j < retrievedLength; j++) {
                    if (this.dynaListObjs[i].filterList !== null) {
                        //copy without modifying reference object
                        tempRetrievedItems[j] = Object.create(retrievedItems[j]);
                        tempRetrievedItems[j].items = this.applyDynaFilter(tempRetrievedItems[j].items, this.dynaListObjs[i]);
                        
                        // tempRetrievedItems[j] = Object.create(Markup.myArray[j]);
                        // tempRetrievedItems[j].items = this.applyDynaFilter(Markup.myArray[j].items, this.dynaListObjs[i]);
                    }
                }
                
                this.displayDynaOrderLists({
                    items: tempRetrievedItems,
                    groups: retrievedItemsUnaltered,
                    //allProductsGroups: retrievedItemsUnaltered,
                    order: retrievedOrderLevel
                }, this.handlebarTemplates[i], this.dynaListObjs[i].containerName);
                
            }
        }
    },


    /**
     * Process data for all Products(Items) and send data to processProduct() for Static Markup and data to displayCartLineItems() for Dynamic Markup
     * @memberOf Markup
     */
    processProducts: function (retrievedItems) {
        var thisObj = this;
        function processProductFunction(productData) {
            var productPath = productData.path;
            if (productData.future !== undefined) {
                thisObj.futureAddProps(productData);
            }
            thisObj.processProduct(productData, productPath);
        }

        if (!Array.isArray(retrievedItems)) {
            Helpers.debug('not an array of products so cannot markup');
        } else {
            
            // roll thru all products in the array 
            var retrievedLength = retrievedItems.length;
            for (var i = 0; i < retrievedLength; i++) {
                retrievedItems[i].items.forEach( function(productData) {
                    processProductFunction(productData);
                });
            }

        }
    },

    // future - this is a subscription product
    // logic to add extra properties to productData['future'] for markup
    /**
     * futureAddProps - if productData['future'] exists, then produce begin and end dates
     * and put in json for display purposes
     *
     * @param  {object} productData    each product in list
     * @memberOf Markup
     */
    futureAddProps: function (productData) {
        var beginsDate;
        var endsDate;
        var beginsDateLocale;
        var day;
        var month;
        var year;
        var monthName;

        if (productData.future.beginsValue !== undefined) {  
            beginsDate = new Date(productData.future.beginsValue); 
            endsDate = new Date(productData.future.beginsValue);
        } else { 
            beginsDate = new Date(); 
            endsDate = new Date(); 
        }

        beginsDateLocale = beginsDate.toLocaleDateString();
        //set end date according to interval Values
        // productData['future']['intervalLength'] = 3 =>  If subscription renews every 3 months
        // productData['future']['discountDurationLength'] = 1 =>  1 period = 3 month
        if (productData.future.intervalUnit === 'week') {
            endsDate.setDate(endsDate.getDate() +  productData.future.discountDurationLength * productData.future.intervalLength * 7);
        }
        if (productData.future.intervalUnit === 'month') {
            endsDate.setMonth(endsDate.getMonth() +  productData.future.discountDurationLength * productData.future.intervalLength);
        }
        if (productData.future.intervalUnit === 'year') {
            endsDate.setFullYear(endsDate.getFullYear() +  productData.future.discountDurationLength * productData.future.intervalLength);
        }

        day = endsDate.getDate();
        month = endsDate.getMonth();
        year = endsDate.getFullYear();
        monthName = String(endsDate).split(' ')[1];

        productData.future.ends = endsDate.toLocaleDateString();
        productData.future.endsValue = endsDate;
        productData.future.beginsDate = beginsDateLocale;

    },

    /**
     * Process data for each Product(Item) and send each element data to processPropToElem() for Static Markup
     * @param   productData 
     * @param   productPath 
     * @memberOf Markup
     */
    processProduct: function(productData, productPath) {
        // preserve this as 'obj' in inner function
        var obj = this;
        var i;
        var elemList;
        
        var sDisplay = '';
        if (productData['priceTotalValue'] === productData['totalValue']) {
            sDisplay = 'hide';
        } else {
            sDisplay = 'show';
        }
        
        var allRecognizedProducts = document.querySelectorAll("[data-fsc-item-path='" + productPath + "']");
        
        // is there at least one element that needs data for this product-path
        if ( allRecognizedProducts !== null ) {
            
            for (i = 0; i < allRecognizedProducts.length; i++) {             
                    
                var e = allRecognizedProducts[i];
                
                if (e.hasAttribute('data-fsc-item-selection-smartselect') && (e.tagName === 'INPUT' && (e.type.toLowerCase() === 'checkbox' || e.type.toLowerCase() === 'radio'))) {
                    if (productData['selected']) { e.checked = true; }
                    else { e.checked = false; }
                }         
                
                if (e.hasAttribute('data-fsc-item-selection-smartdisplay')) {
                   if (productData['selected']) { e.style.display = 'block'; }
                   else { e.style.display = 'none'; }
                }

                if (e.hasAttribute('data-fsc-item-selection-smartdisplay-inverse')) {
                    if (productData['selected']) { e.style.display = 'none'; }
                    else { e.style.display = 'block'; }
                }

                if (e.hasAttribute('data-fsc-item-hideifselected')) {
                    if (productData['selected']) { e.style.display = 'none';}
                }

                if (e.hasAttribute('data-fsc-item-showifselected')) {
                    if (productData['selected']) { e.style.display = 'block'; }
                }

                if (e.hasAttribute('data-fsc-item-hideifnotselected')) {
                    if (!productData['selected']) { e.style.display = 'none';}
                }                 

                if (e.hasAttribute('data-fsc-item-showifnotselected')) {
                    if (!productData['selected']) { e.style.display = 'block';}
                }                 

                if (e.hasAttribute('data-fsc-item-smartdisable')) {
                    if (!productData['selected']) { e.setAttribute("disabled", "disabled"); }
                    else e.removeAttribute("disabled");
                } 

                if (e.hasAttribute('data-fsc-item-smartdisable-inverse')) {
                    if (productData['selected']) { e.setAttribute("disabled", "disabled"); }
                    else e.removeAttribute("disabled");
                } 

                if (e.hasAttribute('data-fsc-item-disableifselected')) {
                    if (productData['selected']) { e.setAttribute("disabled", "disabled"); }
                }                 

                if (e.hasAttribute('data-fsc-item-disableifnotselected')) {
                    if (!productData['selected']) { e.setAttribute("disabled", "disabled"); }
                } 

                if (e.hasAttribute('data-fsc-item-enableifselected')) {
                    if (productData['selected']) { e.removeAttribute("disabled"); }
                }                 

                if (e.hasAttribute('data-fsc-item-enableifnotselected')) {
                    if (!productData['selected']) { e.removeAttribute("disabled"); }
                }                 
                 
            }   
                
            productData['link'] = 'https://' + API.storefront + '/' + productPath;

            for (var prop in productData) {
                if (typeof productData[prop] === 'object' && prop !== "path" ) {
                    for (var innerprop in productData[prop]) {          
                        elemList = document.querySelectorAll("[data-fsc-item-path='" + productPath + "'][data-fsc-item-" + prop + "-" + innerprop + "]");
                        for (i = 0; i < elemList.length; i++) {
                            Markup.processPropToElem(innerprop, productData[prop][innerprop], elemList[i], 'data-fsc-item-' + prop + '-' + innerprop, sDisplay);
                        }          
                    }

                } else if (prop !== "path" ) {
                    elemList = document.querySelectorAll("[data-fsc-item-path='" + productPath + "'][data-fsc-item-" + prop + "]");
                    for (i = 0; i < elemList.length; i++) {
                        Markup.processPropToElem(prop, productData[prop], elemList[i], 'data-fsc-item-' + prop, sDisplay);
                    }

                } else if (prop === "path") {
                    elemList = document.querySelectorAll("[data-fsc-item-path='" + productPath + "'][data-fsc-item-" + prop + "-element]");
                    for (i = 0; i < elemList.length; i++) { 
                        Markup.processPropToElem(prop, productData[prop], elemList[i], 'data-fsc-item-' + prop,sDisplay);            
                    }

                } else {
                    Helpers.debug('?');
                }
            }

        } else {
            Helpers.debug('no markup to markup for the product-path and/or no productData property exist');
        }
    },

    /**
     * Send data to each element for Static markup
     * @param  property     
     * @param  propertyValue
     * @param  elem         
     * @param  original     
     * @param  smartDisplay 
     * @memberOf Markup
     */
    processPropToElem: function (property, propertyValue, elem, original, smartDisplay) {

        Helpers.debug('Processing values for a single element:', property, elem, smartDisplay);
        if (propertyValue !== null) {
            propertyValue = propertyValue.toString().replace("<p>", "");
            propertyValue = propertyValue.replace("</p>", "");          
        }
        
        propertyValue = propertyValue.toString().replace("<p>", "");
        propertyValue = propertyValue.replace("</p>", "");
        original = original.toLowerCase();
        var tag = elem.tagName.toLowerCase();

        if (tag === "a") {

            if (original === 'data-fsc-item-link') {

                Helpers.debug("Setting href to", propertyValue, elem);
                elem.setAttribute("href", propertyValue);
                
            } else {
                
                elem.innerHTML = propertyValue.toString();
                
            }


        } else if (tag === "input")  {
            
            Helpers.debug("Setting value to", propertyValue, elem);
            elem.value = propertyValue; 

        } else if (tag === "select") {
            if (elem[propertyValue-1]) { elem[propertyValue-1].setAttribute("selected", true); }

        } else if (tag === "button") {
            Helpers.debug("Setting value to", propertyValue, elem);
            elem.value = propertyValue; 
            
        } else if (tag === "img") {

            Helpers.debug("Setting src to", propertyValue, elem);           
            elem.setAttribute("src", propertyValue);

        } else if (tag === "div") {      

        } else {
            
            if (property.indexOf("Value") > -1) {
                elem.value = "";
                elem.setAttribute("data-fsc-item-" + property, propertyValue);
                elem.innerHTML = propertyValue.toString();

            } else {
                elem.innerHTML = propertyValue.toString();
            }   
        }


        var smartDisplayProperties = ['data-fsc-item-price','data-fsc-item-pricetotal'];
        var elemToApply;

        //var smartDisplayProperties = ['data-fsc-item-price'];&& smartDisplayProperties.indexOf(original) > -1
        Helpers.debug('do I run SmartDisplay for', property, smartDisplay);

       if (typeof elem.getAttribute('data-fsc-smartdisplay') !== "undefined" && elem.getAttribute('data-fsc-smartdisplay') !==null && smartDisplayProperties.indexOf(original) > -1) {
            Helpers.debug('Agreed to run SmartDisplay for', property, smartDisplay);
            
            if (elem.getAttribute('data-fsc-smartdisplay') === '')  { 
                elemToApply = elem; 
            }
            else  { 
                elemToApply = document.querySelector("[" + elem.getAttribute('data-fsc-smartdisplay') + "]"); 
            }         
            
            if (elemToApply !== null) {
                if (smartDisplay && smartDisplay === 'show') {
                    elemToApply.setAttribute("style", "display: block");
                } else {
                    elemToApply.setAttribute("style", "display: none");
                }   
            }
        }
        
        if (elem.hasAttribute('data-fsc-callback') && typeof window[elem.getAttribute('data-fsc-callback')] === "function") {
            
            Helpers.debug('Agreed to run CallBack function for', property, elem.getAttribute('data-fsc-callback'));
            window[elem.setAttribute('data-fsc-callback')](elem,property,propertyValue);
            
        }
        
        return;     
    },

    /**
    * displayDynaOrderLists - this function displays orderItems in Handlebars template
    *
    * @param  {object} orderItems  contains all arrays needed to display templates correctly
    * @param  {function} template  handlebars template function
    * @param  {string} containerName  name of template container to markup with dyna data
    * @memberOf Markup
    */
    displayDynaOrderLists: function(orderItems, template, containerName) {
        // clear out first
        var itemCart = document.querySelector("[data-fsc-items-container='" + containerName + "']");
        // make sure handlebars template is present first to avoid undefined error

        if (template !== undefined) {
            // this uses handlebars template defined in process: function()
            var output = template(orderItems);
            itemCart.innerHTML = output;
        }
    }

};

Markup.ready = false;
Markup.data = null;
;
var fscContainer = document.querySelector("script#fsc-api");
var fscSession = window.fscSession || {};
var APIInitialized = false;
var fscMerging = false;
var fscCleanCheckout = false;
var fscEmptyOrder = false;

if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', function(){
        Markup.init();
        Markup.process();
    });
}
else {
    document.attachEvent("onclick", function(){
        Markup.init();
        Markup.process();
    });
}

// here we go
API.init();

//make public
window._f = f;

})();