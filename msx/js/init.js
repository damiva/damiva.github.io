TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler(new function(){
        var w = new TVXBusyService();
        this.ready = function(){
            w.start();
            TVXInteractionPlugin.onValidatedSettings(function(){w.stop()});
        };
        this.handleRequest = function(i, d, f){
            w.onReady(function(){f({
                name:       "TorrServer Plugin",
                version:    "0.0.3",
                dictionary: TVXServices.storage.getBool("russian", false) ? (window.location.origin + "/msx/russian.json") : null,
                reference:  "request:interaction:menu@" + window.location.origin + "/msx/torrents?platform=" + TVXSettings.PLATFORM
                            + (TVXServices.urlParams.has("addr") ? ("&addr=" + encodeURIComponent(TVXServices.urlParams.getFullStr("addr", ""))) : "")
            })});
        }
    });
    TVXInteractionPlugin.init();
});
