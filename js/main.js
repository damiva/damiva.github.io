var Serv = {
    a: "",
    r: function(d, s, e, t){
        if(!this.a) e("Server is not set!");
        else if(typeof d == "string") TVXServices.ajax.get(this.a + "/search/?query=" + encodeURIComponent(d), {success: s, error: e});
        else TVXServices.ajax.post(this.a + "/torrents", JSON.stringify(d), {success: s, error: e}, {dataType: t ? "text" : "json"});
    }
}
function Keys(){
    var o = TVXServices.storage.getFullStr("ts:search", ""), v = "", i = "";
    this.key = function(k){
        switch(k){
            case "eng":
            case "rus":
            case "123":
                TVXInteractionPlugin.executeAction("replace:panel:keyboard:" + window.location.protocol + "://tsmsx.yourok.ru/kbd/" + k + ".json");
                return;
            case "ok":
                if(v) {
                    TVXInteractionPlugin.executeAction("replace:content:main:request:interaction:st:" + this.c + "@" + window.location.href);
                    TVXServices.storage.set("ts:search", o = v);
                    v = "";
                }else if (o) {
                    v = o;
                    break;
                }
                return;
            case "bs":
                if(v) v = v.substr(0, this.c.length - 1);
                break;
            default: if(k) v += k;
        }
        k = null;
        if(v && i != "done") k = i = "done";
        else if(!v && o && i != "history") k = i = "history";
        else if(!v && !o && i) k = i = "";
        if(k !== null) TVXInteractionPlugin.executeAction("update:panel:OK", {icon: d});
        TVXInteractionPlugin.executeAction("update:panel:val", {label: v + "{col:msx-white-soft}" + (v ? "_" : o)});
    };
}
function Tlist(l, r, h){return {
    headline: (h ? "{ico:search} " : "{ico:bookmarks} ") + (h || "{dic:trns|My torrents}"),
    extension: "{ico:msx-white:functions} " + l.length, flag: "main",
    type: "list", reuse: false, cache: false, restore: false,
    header: {items: [
        {icon: "bookmarks", progress: h ? 0 : 1, action: "replace:content:main:request:interaction:list@" + window.location.href, layout: "0,0,1,1"},
        {icon: "search", progress: h ? 1 : 0, action: "panel:" + window.location.href + "kbd/" + (r ? "rus" : "eng") + ".json", layout: "1,0,1,1"},
    ]},
}}
function Main(){
    var addr = "", rudi = TVXServices.storage.getBool("ts:russian", true);
    var keys = new Keys();
    var trns = functionTrns(d, s, e, t){
        if(!Addr) e("Server is not set!");
        else TVXServices.ajax.post(Addr + "/torrents", TVXTools.serialize(d), {success: s, error: e}, {dataType : t ? "text" : "json"});
    };
    this.handleData = function(d){
        switch(d.message){
            default: keys.key(d.data);
        }
    };
    this.handleRequest = function(i, _, f){
        var e = function(m){TVXInteractionPlugin.error(m); f();}
        if(i == "list") trns({action: "list"}, function(d){

        }, e);
        else if((i = i.split(":", 2)).length < 2 || !i[1]) error("Bad request!", f);
        else switch(i[0]){
            case "ts":
                addr = i[1];
                f({
                    name: "TorrServer Plugin",
                    version: "133.0.2",
                    reference: "request:interaction:list@" + window.location.href,
                    dictionary: rudi ? (window.location.href + "ru.json") : null
                });
                break;
            case "st": srch(i[1], f); break;
            case "th":
                trns({action: "get", hash: i[1]}, function(s){

                }, e) 
                break;
            default: e("Bad request!");
        }
    };
}