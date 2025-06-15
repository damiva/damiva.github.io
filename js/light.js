function main(){
    var b = new TVXBusyService(), a = TVXServices.urlParams.getFullStr("server", ""), r = TVXServices.storage.getBool("ts:russian", true);
    this.ready = function(){
        b.start();
        if(a == "") TVXInteractionPlugin.error("TorrServer address is not set!");
        else TVXServices.ajax.get((a = window.location.protocol + "://" + a + "/") + "files", {
            success: function(d){
                files = d && files ? new files(a) : null;
                TVXServices.ajax.post(a + "settings", '{"action":"get"}', {
                    success: function(d){
                        search = d.enableRutorSearch && search ? new search(a, r) : null;
                        torrents = new torrents(a);
                        b.stop()
                    },
                    error: TVXInteractionPlugin.error
                });
            },
            error: TVXInteractionPlugin.error
        }, {dataType: "text"});
    };
    this.handleData = function(d){
        if(typeof d.data == "boolean"){
            TVXServices.storage.set("ts:russian", d.data);
            TVXInteractionPlugin.executeAction("reload");
        }else if(!torrents.handleData(d) && search) search.handleData(d);
    };
    this.handleRequest = function(i, d, f){b.onReady(function(){
        switch(i){
            case "init":
                f({
                    name: "TorrServer Plugin",
                    version: "133.1.162",
                    reference: "interaction:request:menu@" + window.location.href,
                    dictionary: r ? (window.location.origin + "/ru.json") : null
                });
                break;
            case "menu":
                f({logo: a + "logo.png", menu: [
                    {icon: "bookmarks", label: "{dic:torrents|My torrents}", data: "interaction:request:torrents@" + window.location.href},
                    {icon: "search", label: "{dic:search|Search torrents}", date: "interaction:request:search@" + window.location.href, display: search ? true : false},
                    {icon: "folder", label: "{dic:files|My files}", data: "interaction:request:files/@" + window.location.href, display: files ? true : false},
                ], options: {
                    type: "list", headline: ""
                }});
                break;
            case "sets":
            default: if(!(files && files.handleRequest(i, f)) && !(search && search.handleRequest(i, d, f))) torrents.handleRequest(i, d, f);
        }
    })};
}