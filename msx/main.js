var addr = "", version = ;
function ajax(u){
    var d = null, s = null, t = null;
    for(var i = 1; i < arguments.length; i++) switch(typeof arguments[i]){
        case "string": t = {dataType: arguments[i]}; break;
        case "object": d = JSON.stringify(arguments[i]); break;
        case "function": if(s) s.error = arguments[i]; else s = {success: arguments[i], error: arguments[i]};
    }
    u = (u[0] == "/" ? window.location.origin : addr) + u;
    TVXServices.ajax[d ? "post" : "get"](u, d || s, d ? s : t, d ? t : undefined);
}
function icon(i){return i ? "msx-white:toggle-on" : "toggle-off"}
function main(){
    var W = new TVXBusyService(), 
        R = TVXServices.storage.getBool("ts:russian", false), 
        C = TVXServices.storage.getBool("ts:compress", false),
        S = TVXServices.storage.getBool("ts:order", false),
        I = {
            name: "TorrServer Plugin",
            version: "133.1.162",
            reference: "request:interaction:init@" + window.location.href,
            dictionary: R ? (u + "russian.json") : null
        },
        M = [
            {icon: "bookmarsk", label: "{dic:torrents|My torrents}", data: "interaction:request:torrents@" + window.location.href},
            {icon: "search", label: "{dic:search|Search torrents}", data: "interaction:request:search@" + window.location.href, display: false},
            {icon: "folder", label: "{dic:files|My files}", data: "interaction:request:files/@" + window.location.href, display: false},
            {icon: "settings", label: "{dic:label:settings|Settings}", data: {
                type: "list", headline: "{dic:label:settings|Settings}",
                ready: {action: "interaction:load:" + window.location.href, data: -1},
                template: {type: "control", action: "interaction:load:" + window.location.href, layout: "0,0,12,1"},
                items: [
                    {type: "space", image: "logo.png", imageFiller: "height"},
                    {icon: "translate", label: R ? "Switch to english" : "Перевести на русский", data: 0},
                    {icon: "compress", label: "{dic:compress|Compress lists}", extensionIcon: "", data: 1},
                    {icon: "filter-list", label: "{dic:filter|Filter torrents menu}", extensionIcon: "", data: 2},
                    {icon: "sort", label: "{dic:sort|Order files by name}", extensionIcon: "", data: 3, enable: false},
                    {icon: "refresh", label: "{dic:label:reload|Reload}", action: "reload"}
                ]
            }}
        ];
    this.ready = function(){
        var e = TVXInteractionPlugin.error;
        W.start();
        if(addr = TVXServices.urlParams.getFullStr("server", "")) TVXInteractionPlugin.requestData("info:extended", function(d){
            addr = window.location.protocol + "://" + addr + "/";
            M[3].data.items[0].image = addr + M[3].data.items[0].image;
            M[3].data.items[0].titleFooter = d.info.content.name + " " + d.info.content.version;
            ajax("echo", "text", function(d){
            M[3].data.items[0].titleHeader = "TorrServer " + d;
                ajax("files", function(d){
                    files = (M[3].data.items[4].enable = M[2].display = d ? true : false) ? new files() : null;
                    ajax("settings", {action: "get"}, function(d){
                        search = M[1].enable = d.enableRutorSearch ? new search() : null;
                        W.stop();
                    }, e);
                }, e);
            }, e);
        });
        else e("TorrServer address is not set!");
    };
    this.handleData = function(d){W.onReady(function(){
        switch(typeof d){
            case "number": switch(d){
                case -1: TVXInteractionPlugin.executeAction("update:")
                case 0:
                case 1:
                case 2:
            }
            break;
            case "object":
            case "string":
        }
    })};
    this.handleRequest = function(i, d, f){W.onReady(function(){
        switch(i){
            case "init": f(I); break;
            case "menu": f({logo: addr + "logo.png", menu: M}); break;
            case "torrents": torrents(f); break;
            case "settings":
                f({
                    type: "list", headline: "{dic:label:settings|Settings}",
                    ready: {action: "interaction:load:" + window.location.href, data: -1},
                    template: {type: "control", action: "interaction:load:" + window.location.href, layout: "0,0,12,1"},
                    items: [
                        {type: "space", image: "logo.png", imageFiller: "height"},
                        {icon: "translate", label: R ? "Switch to english" : "Перевести на русский", data: 0},
                        {icon: "compress", label: "{dic:compress|Compress lists}", extensionIcon: icon(C), data: 1},
                        {icon: "filter-list", label: "{dic:filter|Filter torrents menu}", extensionIcon: icon(F), data: 2},
                        {icon: "sort", label: "{dic:sort|Order files by name}", extensionIcon: icon(S), data: 3, enable: false},
                        {icon: "refresh", label: "{dic:label:reload|Reload}", action: "reload"}
                    ]
                });
                break;
            case "search": 
                if(search) search.handle(d, f); 
                else {
                    TVXInteractionPlugin.error("search is off"); 
                    f();
                }
                break;
            default:
                if(i.length > 0 && i[i.length = 1] == "/")
                    if(files) files.handle(i, f);
                    else {
                        TVXInteractionPlugin.error("files is off");
                        f();
                    }
                else torrent(i, d, f);
        }
    })};
}