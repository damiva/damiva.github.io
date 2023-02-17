TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler(new function(){
        var w = new TVXBusyService();
        this.ready = function(){
            if(TVXServices.urlParams.has("addr")) TVXServices.storage.set("address", TVXServices.urlParams.getFullStr("addr"));
            w.start();
            TVXInteractionPlugin.onValidatedSettings(function(){w.stop()});
        };
        this.handleRequest = function(i, d, f){
            w.onReady(function(){f({
                name:       "TorrServer Plugin",
                version:    "0.0.3",
                reference:  "request:interaction:menu@" + window.location.origin + "/msx/torrents?js=torrent" 
                            + (TVXSettings.PLATFORM == "tizen" ? "&js=tizen" : ""),
                dictionary: TVXServices.storage.getBool("russian", false) ? (window.location.origin + "/msx/russian.json") : null
            })});
        }
    });
    TVXInteractionPlugin.init();
});
