var ADDR = window.location.origin,
    EXTS = [
        ["3g2","3gp","aaf","asf","avchd","avi","drc","flv","m2ts","ts","m2v","m4p","m4v","mkv","mng","mov","mp2","mp4","mpe","mpeg","mpg","mpv","mxf","nsv","ogg","ogv","qt","rm","rmvb","roq","svi",".vob","webm","wmv","yuv"],
        ["aac","aiff","ape","au","flac","gsm","it","m3u","m4a","mid","mod","mp3","mpa","pls","ra","s3m","sid","wav","wma","xm"]
    ];
function AJAX(u, d, s, e){
    var r = {success: s, error: e || TVXInteractionPlugin.error},
        t = {dataType: e ? "json" : "text"},
        g = typeof d == "string";
    TVXServices.ajax[g ? "get" : "post"](ADDR + u + (g ? d : ""), g ? r : JSON.stringify(d), g ? t : r, g ? null : t);
}
function SETS(k, c){
    var v = TVXServices.storage.getBool(k, false);
    if(c) TVXServices.storage.set(k, v = !v);
    return v;
}
function SIZE(s){
    var i = s == 0 ? 0 : Math.floor(Math.log(s) / Math.log(1024));
    return (s / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}
function OPTS(){
    var r = {caption: "{dic:caption:options|Options}:", template: {enumerate: false, type: "control", layout: "0,0,8,1"}, items: []},
        k = ["red", "green", "yellow"];
    r.headline = r.caption;
    for(var i = 0; i < 3 && i < arguments.length; i++) if(arguments[i]){
        arguments[i].key = k[i];
        arguments[i].icon = "msx-" + k[i] + ":stop";
        r.items.push(arguments[i]);
        r.caption += "{tb}{ico:" + arguments[i].icon + "} " + arguments[i].label;
    }
    if(r.items.length == 0) return null
    r.items.push({icon: "msx-blue:menu", label: "{dic:caption:menu|Menu}", action: "[cleanup|menu]"});
    if(arguments.length > 3 && arguments[3]) r.template.action = arguments[3];
    return r;
}
function Torrent(P, Q){
    var L = Q.has("link") ? {
            link: Q.getFullStr("link", ""),
            title: Q.getFullStr("title", ""),
            poster: Q.getFullStr("poster", ""),
            group: Q.getFullStr("group", "")
        } : null,
        TP = null, TS = null,
        W = new TVXBusyService();
    this.ready = function(){
        ADDR = Q.getFullStr("a", ADDR),
        W.start();
        P.onValidatedSettings(function(){
            if(TVXSettings.PLATFORM == "tizen" && TizenPlayer){
                TP = new TizenPlayer();
                TP.init();
            }
            if(Torrents){
                TS = new Torrents(P);
                TS.init(function(){W.stop()});
            } else W.stop();
        });
    };
    this.handleRequst = function(i, d, f){W.onReady(function(){
        var e = function(m){P.error(m); f();}, l = "";
        console.log(i);
        console.log(d);
        if(d && d.data) f({action: "interaction:commit:message:" + (i == "get" ? i : "add"), data: d.data});
        else switch(i){
            case "add":
                i = null;
                l = "&title=" + encodeURIComponent(L.title) + "&poster=" + encodeURIComponent(L.poster);
            case "get":
                l += "&link=" + encodeURIComponent(L.link);
                AJAX("/stream/?stat", l, function(d){
                    var c = SETS("compress"), s = SETS("folders"), b = SETS("background"), fs = [], ds = [], is = 0;
                    d.file_stats.forEach(function(v){
                        var e = v.path.lastIndexOf("/"), u = ADDR + "/play/" + d.hash + "/" + v.id;
                        v.path = [v.path.substr(e + 1), e > 0 ? v.path.substr(0, e) : ""];
                        if(!(e = (e = v.path[0].lastIndexOf(".")) > -1 ? v.path[0].substr(e + 1) : "")) return;
                        for(var l = 0; l < EXTS.length; l++) if(EXTS[l].lastIndexOf(e)) break;
                        if(l = EXTS.length) return;
                        if(v.path[1] && (ds.length == 0 || ds[ds.length - 1].label != v.path[1])){
                            ds.push({label: v.path[1], action: "{cleanup|focus:" + d.hash + "-" + v.id + "]"});
                            if(s) fs.push({type: "space", label: "{col:msx-yellow}{ico:folder} " + v.path[1]});
                        }
                        fs.push({
                            id: d.hash + "-" + v.id,
                            label: v.path[0],
                            folder: v.path[1] ? ("{ico:msx-white:msx-yellow:folder} " + v.path[1] + "{br}") : "",
                            icon: l ? "audiotrack" : "movie",
                            group: l ? "{dic:label:audio|Audio}" : "{dic:label:video|Video}",
                            background: l && b ? ("https://source.unsplash.com/random/" + TVXSettings.WIDTH + "x" + TVXSettings.HEIGHT + "/" + Math.random() + "#msx-keep-ratio") : "default",
                            extensionLabel: SIZE(v.length),
                            action: (l ? "audio:" : "video:") + (TP || l ? u : ("http://msx.benzac.de/plugins/html5x.html?url=" + encodeURIComponent(u)))
                        });
                        is++;
                    });
                    f({
                        type: "list", compress: c, items: fs, flag: "torrent",
                        extension: "{ico:msx-white:list} " + is , headline: d.title,
                        options: OPTS(null,
                            !i ? {label: "{dic:add|Add to} {dic:trns|My torrents}", action: "[cleanup|interaction:commit:message:save]"} :
                            is > 1 ? {label: "{dic:continue|Continue}", action: "[cleanup|interaction:commit:message:continue]", data: d.hash} : null,
                            ds.length > 1 ? {label: "{dic:folder|Select folder}", action: "[cleanup|panel:data]", data: {
                                type: "list", headline: "{dic:folder|Select folder}", items: ds, compress: true,
                                template: {type: "control", icon: "folder", layout: "0,0,10,1"}
                            }} : null
                        ),
                        template: {type: "control", layout: c ? "0,0,16,1" : "0,0,12,1", progress: -1, playerLabel: d.title,
                            live: {type: "playback", action: "player:show"}, properties: {
                                "info:text": "{context:folder}{ico:msx-green:play-arrow} {context:label}",
                                "info:image": d.poster || "default",
                                "control:type": "extended",
                                "resume:key": "id",
                                "trigger:complete": "[player:auto:next|resume:cancel]",
                                "button:content:icon": "build",
                                "button:content:action": TP ? "content:request:interaction:tizen" : "panel:request:player:options"
                            }
                        }   
                    });        
                }, e);
                break;
            case "tizen":
                if(TP) TP.handleRequst("tizen", "init", f);
                else e("No tizen!");
                break;
            default: if(!TS || !TS.handleRequst(i, f, e)) e("Wrong requestID: " + i);
        }
    })};
    this.handleData = function(d){
        switch(d.message){
            case "add":
            case "get":
                L = d.data;
                P.executeAction("content:request:interaction:" + d.message);
                break;
            case "save":
                AJAX("/torrents", {
                    action: "add",
                    link: L.link,
                    title: L.title || "",
                    poster: L.poster || "",
                    data: d.data.group ? ("GRP:" + d.data.group) : "",
                    save_to_db: true
                }, function(){P.executeAction("replace:content:torrent:request:interaction:get")});
                break;
            case "continue":
                AJAX("/viewed", {action: "list", hash: d.data}, function(v){
                    var i = 0;
                    v.forEach(function(t){if(t.file_index > i) i = t.file_index});
                    if(i > 0) P.executeAction("focus:" + d.data + "-" + i);
                }, P.error);
                break;
            default: if((!TS || !TS.handleData(d)) && TP) TP.handleData("tizen", d);
        }
    };
}
TVXPluginTools.onReady(function() {
    var p = TVXInteractionPlugin;
    p.setupHandler(new Torrent(p, TVXServices.urlParams));
    p.init();
});
