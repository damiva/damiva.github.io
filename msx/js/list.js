var EXTS = [["mkv", "ts", "mp4", "avi", "mpeg"], ["mp3", "acc"], ["jpg", "jpeg", "png"]];
function EXT(n){
    var i = n.lastIndexOf(n);
    if(i > 0 && i < n.length - 2){
        n = n.substr(i + 1);
        for(i = 0; i < EXTS.length; i++) if(EXTS[i].indexOf(n) > -1) return i
    }
    return -1
}
function LNG(s){return s + "B"}
function O2Q(o){return Object.keys(o).map(function(k){return k + "=" + encodeURIComponent(o[k])}).join("&")}
function TDB(d, c){return {
    type: "list", compress: c, reuse: false, cache: false, restore: false, extension: "{ico:offline-bolt}",
    template: {layout: c ? "0,0,8,2" : "0,0,6,2", icon: "msx-glass:bolt", imageWidth: 1.3, imageFiller: "height", 
        action: "execute:request:interaction:trn@" + window.location.href, data: {link: "{context:id"},
        options: {
            caption: "{dic:caption:options|Options}:{tb}{ico:msx-red:stop} {dic:Rem|Remove the torrent}{tb}{ico:msx-green:stop} {dic:Drop|Drop the torrent}",
            headline: "{dic:caprion:options|Options}:", enumerate: false, template: {layout: "0,0,8,1", type: "control"},
            items: [
                {label: "{dic:Rem|Remove the torrent}", icon: "msx-red:stop", action: "interaction:commit:message:rem", data: "{context:id}"},
                {label: "{dic:Drop|Drop the torrent}", icon: "msx-green:stop", action: "interaction:commit:message:drop", data: "{context:id}"},
                {label: "{dic:caption:menu|Menu}", icon: "msx-blue:menu", action: "[cleanup|menu]"}
            ]
        }
    },
    items: d.map(function(t){return {
        id: t.hash,
        headline: t.title,
        titleFooter: "{ico:msx-white:attachment} " + LNG(t.torrent_size),
        image: t.poster || null,
        stamp: t.stat > 4 ? null : ("{ico:north} " + (t.current_peers || 0) + " • " + (t.pending_peers || 0) + " / " + (t.total_peers || 0)),
        stampColor: t.stat == 4 ? "msx-red" : t.stat == 3 ? "msx-green" : "msx-yellow",
    }})
}}
function TFS(d, с, t){return {
    type: "list", compress: c, reuse: false, cache: false, restore: false, headline: d.title, extension: "{ico:bolt}",
    template: {type: "control", layout: c ? "0,0,16,1" : "0,0,12,1", action: "execute:request:interaction:trn@" + window.location.href, data: {link: "{context:id"}},
    items: 
}}
function PLG(P, Q, S, A){
    var W = new TVXBusyService(),
        mfs = S.getFullStr("stg:mfs", null),
        trn = S.getFullStr("stg:trn", null);
    this.ready = function(){
        W.start();
        P.onValidatedSettings(function(){W.stop();});
    };
    this.handleRequest = function(i, d, f){W.onReady(function(){
        var t = TVXSettings.PLATFORM == "tizen";
            c = S.getBool("stg:cmp", false),
            e = function(m){P.error(m); f();},
            o = function(d){f({action: "content:data", data: TFS(d, c, t)})};
        switch(i){
            case "mfs":
                if(!mfs) e("MFS address is not set!");
                else A.get(mfs + "/files/" + (d || ""), {success: d ? o : f(TFS(d, c, t)), error: e});
                break;
            case "trn":
                if(!trn) e("TorrServer address is not set!");
                else if(d) A.get(trn + "/stream/?stat&" + O2Q(d), {success: o, error: e});
                else A.post(trn + "/torrents", '{"action":"list"}', {success: function(d){f(TDB(d, c))}, error: e});
                break;
            default: f();
        }
    })};
    this.handleData = function(d){
        var t = false, r = function(){P.executeAction("[cleanup|reload" + (t ? "" : ":content") + "]")};
        switch(d.message){
            case "drop":
            case "rem":
                A.post(trn + "/torrents", '{"action":"' + d.message + '","hash":"' + d.data + '"}', {success: r, error: P.error}, {dataType: "text"});
                break;
            case "cnt":
                if(S.getBool("stg:cnt", false)) A.post(trn + "/viewed", '{"action":"list","hash":"' + d.data + '"}', {success: function(d){
                    var l = 0;
                    d.forEach(function(i){if(i > l) l = i});
                    if(l) P.executeAction("focus:" + l);
                }});
            }
    }
}
TVXPluginTools.onReady(function() {
    var t = TVXInteractionPlugin;
    t.setupHandler(new PLG(t, TVXServices.urlParams, TVXServices.storage, TVXServices.ajax));
    t.init();
});
