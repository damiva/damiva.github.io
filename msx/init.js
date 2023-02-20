TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler(new function(){
        this.handleRequest = function(i, d, f){
            TVXInteractionPlugin.onValidatedSettings(function(){
                f({
                    name:       "TorrServer Plugin",
                    version:    "0.0.3",
                    dictionary: TVXServices.storage.getBool("russian", false) ? (window.location.origin + "/msx/russian.json") : null,
                    reference:  "request:interaction:menu@" + window.location.origin + "/msx/torrents?p=" + TVXSettings.PLATFORM
                        + (TVXServices.urlParams.has("a") ? ("&a=" + encodeURIComponent(TVXServices.urlParams.getFullStr("a", ""))) : "")
                });
            });
        }
    });
    TVXInteractionPlugin.init();
});
