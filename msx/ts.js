var init = {name: "TorrServer Plugin", version: "0.1.133", reference: "request:interaction:menu@" + window.location.href};
var sets = {
    type: "list", reuse: false,
    ready: {action: "interaction:load:" + window.location.href, data: ""},
    template: {type: "control", layout: "0,0,7,1", action: "interaction:commit", data: "{context:id}"},
    items: [
        {type: "space", headline: init.name + " " + init.version},
        {type: "space"},
        {type: "space"},
        {id: "russian", icon: "translate", label: "Перевести на русский", extensionIcon: "msx-red:refresh"},
        {id: "folders", icon: "folder", label: "{dic:folder|Show folders in torrent}", extensionIcon: ""},
        {id: "refocus", icon: "history", label: "{dic:refocus|Focus on last viwed file", extensionIcon: ""}
    ]
};
var menu = {
    logo: window.location.origin + "/logo.png", menu: [
        {icon: "bookmarks", label: "{dic:trns|My torrents}",    data: "request:interaction:trns@" + window.location.href},
        {icon: "search",    label: "{dic:srch|Search torrents}",data: "request:interaction:init@" + window.location.origin + "/msx/tss"},
        {icon: "folder",    label: "{dic:files|My files}",      data: "request:interaction:access:" + window.location.host + "@http://nb.msx.benzac.de/interaction"},
        {type: "separator"},
        {icon: "settings", label: "{dic:label:settings|Settings}", data: sets}
    ],
};
function plug(){
    var W = new TVXBusyService(),
        S = function(k, c){
            var v = TVXServices.storage.getBool(k = "ts:" + k, false);
            if(c) TVXServices.storage.set(k, v = !v);
            return v;
        },
        I = function(v){return v ? "msx-white:toggle-on" : "toggle-off"};
    this.ready = function(){
        W.start();
        if(S("russian")){
            init.dictionary = window.location.origin + "/msx/russian.json";
            sets.items[3].label = "Switch to english";
        }
        TVXInteractionPlugin.requestData("info:application", function(d){
            sets.items[2].headline = d.data.info.application.name + " " + d.data.info.appliction.version;
            TVXServices.ajax.get("/msx/start.json", {
                success: function(d){
                    sets.items[1].headline + d.name + " " + d.version;
                },
                complete: function(){
                    W.stop();
                }
            })
        })
    };
    this.handleData = function(d){
        W.onReady(function(){
            if(d.data){
                var v = S(d.data, c);
                if(d.data == "russian") TVXInteractionPlugin.executeAction("reload");
                else TVXInteractionPlugin.executeAction("update:content:" + d.data, {extensionIcon: I(v)});
            }else ["folders", "refocus"].forEach(function(k){
                TVXInteractionPlugin.executeAction("update:content:" + k, {extensionIcon: I(S(k))});
            });
        });    
    };
    this.handleRequest = function(i, _, f){
        W.onReady(function(){
            var e = function(m){TVXInteractionPlugin.error(m); f();};
            switch(i){
                case "init": f(init); break;
                case "menu": 
                    TVXBusyService.ajax.get("/files", {
                        success: function(d){menu.menu[2].display = d ? true : false},
                        error: function(){menu.menu[2].display = false},
                        complete: function(){f(menu)}
                    });
                    break;
                case "trns":
                    TVXServices.ajax.post("/torrents", '{"action":"list"}', {success: function(d){
                        f({
                            type: "list", cache: false, reuse: false, restore: false, extension: "{ico:msx-white:bookmarks} " + d.length,
                            template: {
                                layout: d.length ? "0,0,6,2" : "0,0,1,12", imageWidth: 1.4, imageFiller: "height",
                                action: "execute:request:interaction:trn@" + window.location.origin + "/msx/tst", data: {link: "{context:id}"},
                                options: {
                                    headline: "{dic:caption:options|Opts}:",
                                    caption: "{dic:caption:options|Opts}:{tb}{ico:msx-red:stop} {dic:rem|Remove the torrent}{tb}{ico:msx-yellow} {dic:drop|Drop the torrent}",
                                    template: {enumerate: false, layout: "0,0,8,1", type: "control", action: "execute:request:interaction:trnt"},
                                    items: [
                                        {icon: "msx-red:stop", key: "red", label: "{dic:rem|Remove the torrent}", data: {action: "rem", hash: "{context:id}"}},
                                        {icon: "msx-yellow:stop", key: "yellow", label: "{dic:drop|Drop the torrent}", data: {action: "drop", hash: "{context:id}"}},
                                    ]
                                }
                            },
                            items: !d.length ? [{icon: "refresh", label: "{dic:empty:Nothing found}", action: "reload:content"}] : d.map(function(t){return {
                                id: t.hash,
                                headline: t.title,
                                image: t.poster,
                                icon: t.poster ? "" : "msx-white-soft:bookmark",
                                group: t.category,
                                titleFooter: size(t.torrent_size),
                                live: t.stat < 5 ? {type: "setup", action: "execute:" + window.location.origin + "/msx/torrent", data: "update:content:" + t.hash} : null
                            }})
                        });
                    }, error: e});
                    break;
                case "trnt": if(d && d.data){
                    TVXServices.ajax.post("/torrents", JSON.stringify(d.data), {
                        success: function(){f({action: "[reload:content|success]"})},
                        error: function(e){f({action: "error:" + e})}
                    }, {dataType: "text"})
                    break;
                }
                default: e("wrong request: " + i);
            }
        });
    }
};
TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler(new plug());
    TVXInteractionPlugin.init();
});