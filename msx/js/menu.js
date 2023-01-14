function PLG(P, Q, S, A){
    var K = {},
        E = {mfs: false, trn: false},
        V = {mfs: S.getFullStr("stg:mfs", null), trn: S.getFullStr("stg:trn", null), dic: "", ttl: ""},
        W = new TVXBusyService(),
        M = function(m, f1, f2){
            if(f2 && !V.mfs) f1(m, f2);
            else A.get(f2 ? (V.mfs + "/plugins/index.json") : (window.location.origin + "/msx/plugins.json"), {
                success: function(d){
                    d.forEach(function(p){
                        var l = m.length;
                        m.push({type: "separator", label: f2 ? "{dic:Plugins|My plugins}" : ""})
                        if((!delete p.mfs || mfs) && (!delete p.trn || trn)) m.push(p);
                        m[l].display = (l > 0 || f2) && l < m.length - 1;
                        f1(m, f2);
                    });
                },
                error: function(e){P.error(e); f1(m, f2)}
            });
        },
        X = function(a, t){
            var s = function(){
                var k = t ? "trn" : "mfs";
                S.set("stg:" + k, V[k] = a);
                P.executeAction("[cleanup|update:content:" + k + "]", {extensionLabel: a || "{dic:label:none|None}"});
            };
            if(!a) s();
            else A.get(a + (t ? "/echo" : "/info"), {
                success: function(d){
                    if(!t || d[0] == "M") s();
                    else P.error("TorrServer v. " + d + " is not supported!");
                },
                error: P.error
            }, {contentType: t ? "text" : "json"});
        };
    this.ready = function(){
        Object.keys(E).forEach(function(k){if(E[k] = Q.has[k]) S.set("stg:" + k, V[k] = Q.getFullStr(k))});
        W.start();
        P.requestData("info:extended", function(d){
            V.dic = d.info.dictionary.name || "";
            V.ttl = d.info.content.name + " v. " + d.info.content.version;
            W.stop();
        });
    };
    this.handleRequest = function(i, d, f){W.onReady(function(){
        switch(i){
            case "init":
                f({
                    name: "damiva's MSX Plugin",
                    version: "0.0.1",
                    reference: "request:interaction:menu@" + window.location.href,
                    dictionary: S.getFullStr("stg:dic", null)
                });
                break;
            case "menu":
                var m = [], u = window.location.origin + "/msx/list.html", t = S.getFullStr("stg:trn", null);
                if(S.get("stg:mfs", null)) m.push({label: "{dic:Files|My files}", icon: "folder", data: "request:interaction:0@" + u});
                if(t) m.push({label: "{dic:Torrents|My torrents}", image: t + "/apple-touch-icon.png", data: "request:interaction:torr@" + u});
                M(m, M, function(m){
                    if(m.length > 1) m.push({type: "separator"});
                    m.push({label: "{dic:label:settings|Settings}", icon: "settings", data: "request:interaction:sets@" + window.location.href});
                    f({
                        reuse: false, cache: false, restore: false,
                        logo: window.location.origin + "/msx/logo.png",
                        menu: m
                    });
                });
                break;
            case "sets":
                f({
                    type: "list", 
                    template: {type: "control", layout: "0,0,12,1"},
                    items: [
                        {type: "space", headline: V.ttl, alignment: "center", action: "interaction:commit:message:set", data: "{context:id}"},
                        {id: "dic", label: "{dic:label:dictionary|Translation}:", extensionLabel: V.dic || "{dic:label:none|None} (English)"},
                        {id: "mfs", label: "Media Files Server:", icon: "folder", extensionLabel: V.mfs || "{dic:label:none|None}"},
                        {id: "trn", label: "TorrServer:", icon: "offline-bolt", extensionLabel: V.trn || "{dic:label:none|None}"},
                        {label: "{dic:label:restart|Restart}", icon: "restart-alt", action: "restart"}
                    ]
                });
                break;
            default: f();
        };
        this.handleData = function(d){
            var t = false;
            switch(d.message){
                case "set":
                    switch(d.data){
                        case "trn": t = true;
                        case "mfs": 
                            var v = S.getFullStr("stg:" + d.data, "//").split("//")
                            K = {s: v[0] != "https", v: v[1], p: t ? ":8090" : ":8008", t: t};
                            t = true
                        default:
                            P.showPanel(window.location.origin + "/msx/" + (t ? "kbd" : "dics") + ".json");
                    }
                    break;
                case "key":
                    switch(d.data){
                        case "OK":
                            X(K.v ? ("http" + (K.s ? "s" : "") + "://" + K.v + (K.v.indexOf(":") < 0 ? K.p : "")) : "", K.t);
                            return;
                        case "IN":
                            P.executeAction("update:panel:underlay:TTL", {label: K.t ? "TorrServer:" : "Media Files Server:"});
                        case "SC":
                            P.executeAction("update:panel:SC", {icon: (K.s = !K.s ? "" : "msx-white-soft:") + "https"});
                            break;
                        case "CL":
                            K.v = "";
                            break;
                        case "BS":
                            if(K.v.length > 0) K.v = K.v.substr(0, K.v.length - 1);
                            break;
                        default:
                            K.v += d.data;
                    }
                    P.executeAction("update:panel:underlay:VAL", {label: "{dic:msx-white-soft:http" + (K.s ? "s" : "") + "://" + K.v + "{col:msx-white-soft}" + (K.v.indexOf(":") < 0 ? K.p : "")});
                    break;
                case "dic":
                    S.set("stg:dic", d.data);
                    P.executeAction("restart");
            }
        };
    })};
}
TVXPluginTools.onReady(function() {
    var t = TVXInteractionPlugin;
    t.setupHandler(new PLG(t, TVXServices.urlParams, TVXServices.storage, TVXServices.ajax));
    t.init();
});
