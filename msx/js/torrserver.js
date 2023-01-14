var TZN = null, VRS = "", ADR = "";
function EXT(p){
    var x = [["mkv", "mp4", "ts", "avi", "mpeg"], ["mp3", "acc"]], 
        f = p.indexOf("/"), l = p.lastIndexOf("/");
    p = [p.substr(l + 1), f > -1 && l > f ? p.substr(f + 1, l - f - 1) : "", -1];
    if((f = p[0].lastIndexOf(".") + 1) > 0 && f < p[0].length){
        var e = p[0].substr(f);
        for(var i = 0; i < x.length; i++) if(x[i].indexOf(e) >= 0){
            p[2] = i; 
            break;
        }
    }
    return p;
}
function LNG(s){
    var i = s == 0 ? 0 : Math.floor(Math.log(s) / Math.log(1024));
    return (s / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}
function PRS(t){
    return "{ico:msx-white:north} " + (t.active_peers || 0) + " ⋅ " + (t.pending_peers || 0) + " / " + (t.total_peers || 0);
}
function SRC(t, h, i){
    var a = ADR + "/play/" + h + "/" + i;
    return t ? ("audio:" + a) : TZN ? ("video:" + a) : ("video:plugin:http://msx.benzac.de/plugins/html5x.html?url=" + encodeURIComponent(s));
}
function TDB(d, c, r){return {
    type: "list", reuse: false, cache: false, restore: false, headline: "TorrServer", extension: VRS,
    header: VRS ? {items: [
        {type: "button", icon: "refresh", action: "reload:content", layout: "0,0,2,1"},
        {type: "button", icon: "zoom-" + (c ? "in" : "out"), action: "interaction:commit:message:cmp", layout: (c ? 7 : 5) + ",0,2,1"},
        {type: "button", label: r ? "{txt:msx-white-soft:EN} {ico:toggle-on} RU" : "EN {ico:toggle-off} {txt:msx-white-soft:RU}", action: "interaction:commit:message:rus", layout: (c ? 14 : 10) + ",0,2,1"}
    ]} : null,
    template: {
        imageWidth: 1.3, imageFiller: "height", icon: "msx-glass:bolt",
        layout: c ? "0,0,8,1" : "0,0,6,1",
        action: "execute:request:interaction:list@" + window.location.href, data: {link: "{context:id}"}
    },
    items: d.map(function(t){return {
        id: t.hash,
        headline: t.title,
        image: t.poster || null,
        titleFooter: "{ico:msx-white:attach-file} " + LNG(t.torrent_size),
        stamp: t.stat < 5 ? PRS(t) : null,
        stampColor: t.stat == 4 ? "msx-red" : t.stat == 3 ? "msx-green" : "msx-yellow"
    }})
}}
function TFS(d, c){return {
    type: "list", reuse: false, cache: false, restore: false, headline: d.title, extension: PRS(d),
    ready: {action: "interaction:commit:message:cnt", data: d.hash},
    template: {type: "control", layout: c ? "0,0,16,1" : "0,0,12,1", playerLabel: d.title, 
        progress: -1, live: {type: "playback", action: "player:show"},
        properties: {
            "control:type": "extended",
            "info:image": d.poster || "default",
            "info:text": "{col:msx-yellow}{context:Dir}{col:msx-white}{ico:arrow-play} {context:label}",
            "trigger:complete": "[player:auto:next|player:video:position:0]",
            "trigger:player": "execute:fetch:request:interaction:" + d.hash,
            "resume:key": "id"
        }
    },
    items: d.file_stats.map(function(f){return {
        id: d.hash + "-" + f.id,
        Dir: (f.path = EXT(f.path))[1] ? ("{ico:folder} " + f.path[1] + "{br}") : "",
        label: f.path[0],
        extensionLabel: LNG(f.length),
        display: f.path[2] >= 0,
        icon: f.path[2] ? "audiotrack" : "movie",
        group: "{dic:label:" + (f.path[2] ? "audio|Audio}" : "video|Video}"),
        action: SRC(f.path[2], d.hash, f.id)
    }})
}}
function PLG(P, S, Q, A){
    var W = new TVXBusyService();
    this.ready = function(){
        W.start();
        if(Q.has("trn")) S.set("stg:trn", ADR = Q.getFullStr("trn", ""));
        else ADR = S.getFullStr("stg:trn");
        P.validateSettings(function(){
            if(TVXSettings.PLATFORM == "tizen"){
                TZN = new TizenPlayer();
                TZN.init();
            }
            W.stop();
        });
    };
    this.handleEvent = function(d){
        if(d.event == "video:load" && data.info.type == "video"){
            P.executeAction("player:button:content:setup", {icon: "build", action: TZN
                ? "content:request:interaction:tzn"
                : "panel:request:player:options"
            })
        }
    };
    this.handleRequest = function(i, d, f){
        W.onReady(function(){
            var e = function(m){P.error(m); f();},
                c = S.getBool("stg:cmp", false),
                r = S.getBool("stg:rus", false)
            if(!ADR) e("TorrServer is not set!");
            else if(i == "tzn" && TZN) TZN.handleRequest("tizen", "init", f); 
            else if(d) A.get(
                ADR + "/stream/?stat&" + Object.keys(d).map(function(k){return k + "=" + encodeURIComponent(d[k])}).join("&"),
                {success: function(d){f({action: "content:data", data: TFS(d, c)})}, error: e}
            );
            else if(i == "init") A.get(
                ADR + "/echo",
                {
                    success: function(d){f({
                        name: "TorrServer",
                        version: V = d,
                        reference: "request:interaction:list@" + window.location.href,
                        dictionary: r ? (window.location.origin + "/msx/russian.json") : null
                    })},
                    error: e
                },
                {dataType: "text"}
            );
            else if(i == "list") A.post(
                ADR + "/torrents", 
                '{"action":"list"}',
                {success: function(d){f(TDB(d, c, r))}, error: e}
            );
            else A.post(
                ADR + "/cache",
                '{"action":"get","hash":"' + i + '"}',
                {success: function(d){f({action: "player:label:position:{VALUE}{tb}" + PRS(d.torrent)})}}
            );
        });
    };
    this.handleData = function(d){
        var e = "reload", r = function(){P.executeAction(e)};
        switch(d.message){
            case "cmp":
                e += ":content";
            case "rus":
                S.set("stg:" + d.message, !S.getBool("stg:" + d.message, false));
                r();
                break;
            case "drop":
            case "rem":
                A.post(
                    ADR + "/torrents",
                    '{"action":"' + d.message + '","hash":"' + d.data + '"}',
                    {success: r, error: P.error},
                    {dataType: "text"}
                );
                break;
            case "cnt":
                P.requestData("info", function(i){
                    if(i.info && i.info.content && i.info.content.state && !i.info.content.state.videoActive && i.info.content.state.contentIndex == 0)
                        A.post(ADR + "/viewed", '{"action":"list","hash":"' + d.data + '"}', {success: function(d){
                            var l = 0;
                            d.forEaach(function(i){if(i.file_index > l) l = i.file_index});
                            if(l > 1) P.executeAction("focus:" + d.data + "-" + l);
                        }});
                });
                break;
            default:
                if(TZN) TZN.handleData("tizen", d);
        }
    };
}
TVXPluginTools.onReady(function() {
    var p = TVXInteractionPlugin;
    p.setupHandler(new PLG(p, TVXServices.storage, TVXServices.urlParams, TVXServices.ajax));
    p.init();
});
