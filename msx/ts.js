var info = {name: "TorrServer Plugin", version: "0.1.133", reference: "request:interaction:menu@" + window.location.href};
var main = {logo: window.location.origin + "/logo.png", cache: false, reuse: false, restore: false, menu: [
    {icon: "bookmarks", label: "{dic:trns|My torrents}",    data: "request:interaction:trns@" + window.location.href},
    {icon: "search",    label: "{dic:srch|Search torrents}",data: "request:interaction:init@" + window.location.origin + "/msx/tss"},
    {icon: "folder",    label: "{dic:files|My files}",      data: "request:interaction:access:" + window.location.host + "@" + window.location.protocol + "//nb.msx.benzac.de/interaction"},
    {type: "separator"},
    {id: "settings", icon: "settings", label: "{dic:label:settings|Settings}", data: {
        type: "list", reuse: false,
        ready: {action: "interaction:load:" + window.location.href, data: ""},
        underlay: {items:[
            {
                layout: "0,0,3,1", type: "space", imageWidth: 1, image: window.location.origin + "/logo.png",
                headline: "{col:msx-white-soft}{dic:label:application|Application}:{br}{dic:label:content_server|Server}:"
            },{
                layout: "0,0,4,1", type: "space", headline: info.name + " " + info.version + "{br}"
            }]},
        template: {type: "control", layout: "0,0,7,1", action: "interaction:commit", data: "{context:id}", area: "0,1,7,5"},
        items: [
            {id: "russian", icon: "translate", label: "Перевести на русский", extensionIcon: "msx-red:refresh"},
            {id: "folders", icon: "folder", label: "{dic:folder|Show folders in torrent}", extensionIcon: ""},
            {id: "refocus", icon: "history", label: "{dic:refocus|Focus on last viwed file", extensionIcon: ""},
            {type: "space", imageWidth: 1, icon: "msx-blue:info", text: "{dic:searchInfo|To enable Search torrents Turn on torrents search by RuTor in the Additional Settings by browsing to}: {col:msx-white}" + window.location.origin},
            {type: "space", imageWidth: 1, icon: "msx-blue:info", text: "{dic:filesInfo|To enable My files set path to server's folder by browsing to}: {col:msx-white}" + window.location.origin + "/msx/"}
        ]
    }}
]};
function stor(k, c){
    var v = TVXServices.storage.getBool("ts:" + k, k == "russian");
    if(c) TVXServices.storage.set("ts:" + k, v = !v);
    return v;
}
function size(s){
    var i = s == 0 ? 0 : Math.floor(Math.log(s) / Math.log(1024));
    return (s / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}
function plug(){
    var a = function(k, v){TVXInteractionPlugin.executeAction("update:content:" + k, {extensionIcon: v ? "msx-white:toggle-on" : "toggle-off"})},
        u = TVXServices.urlParams.get("addr", window.location.origin);
        b = new TVXBusyService();
    this.ready = function(){
        var i = main.menu.length - 1;
        if(stor("russian")){
            info.dictionary = u + "/msx/russian.json";
            main.menu[i].data.items[0].label = "Switch to english";
        }
        b.start();
        TVXServices.ajax.get(u + "/msx/start.json", {
            success: function(d){
                main.menu[i].data.underlay.items[1].headline += d.name + " " + d.versionж
                b.stop();
            },
            error: function(){b.stop()}
        });    
    };
    this.handleData = function(d){
        b.onReady(function(){
            if(!(d = d && d.data)) ["folders", "refocus"].forEach(function(d){a(d, stor(d))});
            else if(typeof d == "object") TVXServices.ajax.post(u + "/torrents", JSON.stringify(d), {
                success: function(){TVXInteractionPlugin.executeAction("[cleanup|reload:content|success]")},
                error: TVXInteractionPlugin.error,
                dataType: "text"
            });
            else {
                var v = stor(d, true)
                if(d == "russian") TVXInteractionPlugin.executeAction("reload");
                else a(d, v);
            }        
        });
    };
    this.handleRequest = function(i, _, f){
        b.onReady(function(){
            switch(i){
                case "menu":
                    TVXServices.ajax.post(u + "/settings", '{"action":"get"}', {
                        success: function(d){main.menu[1].display = d.EnableRutorSearch},
                        error: function(){main.menu[1].display = false},
                        complete: function(){
                            TVXServices.ajax.get("/files", {
                                success: function(d){main.menu[2].display = d ? true : false},
                                error: function(){main.menu[2].display = false},
                                complete: function(){f(main)}
                            });
                        }
                    });                
                    break;
                case "trns":
                    TVXServices.ajax.post(u + "/torrents", '{"action":"list"}', {
                        success: function(d){
                            f({
                                type: "list", cache: false, reuse: false, restore: false, extension: "{ico:msx-white:bookmarks} " + d.length,
                                template: {
                                    layout: d.length ? "0,0,6,2" : "0,0,12,1", imageWidth: 1.3, imageFiller: "height", 
                                    action: "request:interaction:init@" + window.location.origin + "/msx/tst", data: "{context:id}",
                                    options: d.length ? {
                                        headline: "{dic:caption:options|Opts}:",
                                        caption: "{dic:caption:options|Opts}:{tb}{ico:msx-red:stop} {dic:rem}Remove the torrent}{tb}{ico:msx-yellow:stop} {dic:drop|Drop the torrent}",
                                        template: {enumerate: false, layout: "0,0,8,1", type: "control", action: "interaction:load"},
                                        items: [{
                                            icon: "msx-red:stop", label: "{dic:rem|Remove the torrent}", key: "red",
                                            data: {action: "rem", hash: "{context:id}"}
                                        }, {
                                            icon: "msx-yellow:stop", label: "{dic:drop|Drop the torrent}", key: "yellow",
                                            data: {action: "drop", hash: "{context:id"}, display: t.stat
                                        }]
                                    } : null,    
                                },
                                items: d.length ? d.map(function(t){return {
                                    id: t.hash,
                                    image: t.poster,
                                    icon: t.poster ? "" : "msx-white-soft:bookmark",
                                    headline: t.title,
                                    titleFooter: "{ico:msx-white:attach-file} " + size(t.torrent_size),
                                    live: (t.stat = t.stat) < 5 ? {
                                        type: "setup", action: "execute:" + window.location.origin + "/msx/torrent", data: "update:content:" + t.hash
                                    } : null
                                }}) : [{icon: "refresh", label: "{dic:empty|Nothing found}", action: "reload:content"}]
                            });
                        },
                        error: function(e){
                            TVXInteractionPlugin.error(e);
                            f();
                        }
                    });                
                    break;
                default: f(info);
            }
        });
    };
}
TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler(new plug());
    TVXInteractionPlugin.init();
});
