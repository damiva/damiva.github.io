var Addr = "";
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
function Trns(d, s, e, t){
    if(!Addr) e("Server is not set!");
    else TVXServices.ajax.post(Addr + "/torrents", TVXTools.serialize(d), {success: s, error: e}, {dataType : t ? "text" : "json"});
}
function Main(){
    var addr = "", rudi = TVXServices.storage.getBool("ts:russian", true);
    var keys = new Keys();
    this.handleData = function(d){
        switch(d.message){
            default: keys.key(d.data);
        }
    };
    this.handleRequest = function(i, d, f){
        var e = function(m){TVXInteractionPlugin.error(m); f();}
        if(i == "list") Trns({action: "list"}, function(d){

        }, e);
        else if((i = i.split(":", 2)).length < 2 || !i[1]) error("Bad request!", f);
        else switch(i[0]){
            case "ts":
                Addr = i[1];
                f({
                    name: "TorrServer Plugin",
                    version: "133.0.2",
                    reference: "request:interaction:list@" + window.location.href,
                    dictionary: rudi ? (window.location.href + "ru.json") : null
                });
                break;
            case "st": srch(i[1], f); break;
            case "th":
                Trns({action: "get", hash: i[1]}, function(s){

                }, e) 
                break;
            default: e("Bad request!");
        }
    };
}