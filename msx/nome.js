var Addr = "", DRus = false, Srch = null, Fold = null, 
    Filter = {
        cur: "",
        cat: ["movie", "tv", "music", "other"],
        icn: {movie: "movie", tv: "live-tv", music: "audiotrack", other: "more-horiz"},
        dsp: function(c){return !c || !this.cur || c == this.cur}
    };
function Opts(m){
    var o = {
        headline: "{dic:caption:options}",
        template: {type: "control", layout: "0,0,8,1"},
        items: [{icon: "msx-yellow:stop", label: "{dic:ts:up|Go up}", action: "[cleanup|focus:index:0]"}]
    }
    if(m) o.items.unshift(
        {icon: "msx-red:stop", label: "{dic:ts:remove|Remove}", action: "execute:request:interaction:rem", data: "{context:hash}"},
        {icon: "msx-green:stop", label: "{dic:ts:stop|Stop}", action: "execute:request:interaction:reset", data: "{context:hash}"}
    );
    o.caption = o.headline;
    o.items.forEach(function(e){o.caption += "{tb}{ico:" + e.icon + "} " + e.label});
    for(var i = m.lengthl; i < 4; i++) o.items.push({type: "space"});
    o.items.push(
        {icon: "menu", label: "{dic:label:menu|Menu}", action: "menu"},
        {icon: "translate", label: DRus ? "Switch to english" : "Перевести на русский", action: "execute:request:interaction:lang"}
    );
}
function Trns(d, h, s){
    var z = s ? 2 : h ? 0 : 1;
        m = [{icon: "bookmarks", action: "replace:content:main:request:interaction:ts", layout: "0,0,1,1", progress: z == 1 ? 1 : -1}];
    if(Srch) m.push({icon: "search", action: "interaction:commit:message:kbd", layout: "1,0,1,1", progress: z == 2 ? 1 : -1});
    if(Fold) m.push({icon: "folder", action: "replace:content:main:request:interaction:/", layout: m.length + ",0,1,1", progress: !z ? 1 : -1});
    for(var i = 0; i < 2; i++) m.push(
        {type: "button", enable: false, offset: "1,0,0,0", layout: (i * 3 + 4) + ",0," + (i * 2 + 2) + ",1", display: z == 2 - i}
    );
    if(s) s.forEach(function(e, i){
        e.layout = (5 + i) + ",0,1,1";
        m.push(e);
    });
    if(z) Filter.cat.forEach(function(c, i){
        var d = Filter.dsp(c);
        m.push({{icon: (d ? "" : "msx-white-soft") + Filter.icn[c], action: "interaction:commit:message:fltr", data: d ? "" : c, layout: (8 + i) + ",0,1,1"}});
    });
    return {
        type: "list", flag: "main", items: d,
        headline: h || "{ico:bookmarks} {dic:ts:torrents|My Torrents}",
        extension: (!s ? "" : (h = s.find(function(e){return !e.data})) ? s.icon : "") + " " + (Filter.cur ? Filter.icn[Filter.cur] : "") + "{tb}{now:time:hh:mm}",
        template: {
            layout: !s && h ? "0,0,12,1" :  "0,0,6,2",
            imageWidth: 1.3, imageFiller: "height",
            options: s == 1 ? Opts(true) : null,
        },
        header: {action: "interaction:load:" + window.location.href, items: m},
        options: s != 1 ? Opts() : null
    };
}
function DB(){}
function main(){
    var A = TVXServices.storage.getFullStr("ts:server", ""),
        U = TVXTools.strTruncate(window.location.href, window.location.href.lastIndexOf("/") + 1),
        K = null, S = null, F = null,
        W = new TVXBusyService();
    var Q = function(d, s, e, t){
        if(!Addr) e("Server is not defined!");
        else TVXServices.ajax.post(Addr + "/torrents", JSON.stringify(d), {success: s, error: e}, {dataType: t ? "text" : "json"});
    };
    this.ready = function(){
        DRus = TVXServices.storage.getBool("ts:russian", false);
        if(Addr = TVXServices.storage.getFullStr("ts:server", TVXServices.urlParams.getFullStr("server", ""))){
            W.start();
            TVXServices.ajax.get(Addr + "/msx/inf", {
                success: function(d){
                    if(d.EnableRutorSearch){
                        K = new keyboard("replace:main:request:interaction:{VAL}", "ts:search", DRus ? true : false);
                        Srch = new search();
                    }
                    if(d.Files) Fold = new files(d.Files);
                    W.stop();
                }, 
                error: function(m){
                    W.stop();
                }
            });
        }else TVXInteractionPlugin.error("Server is not set!");
    };
    this.handleData = function(d){};
    this.handleRequest = function(i, d, f){W.onReady(function(){
        var e = function(m){
            if(!d) TVXInteractionPlugin.error(m);
            f(d ? {action: "error:" + m} : null);
        }
        if(i.length == 0) e("Wrong request id!");
        if(!d) switch(i.charAt(0)){
            case "*": 
                Q({action: "list"}, function(d){f(TS(DB(d)))}, e);
                break;
            case "#":
                G(i.substr(1), f, e);
                break;
            case "/":
                if(F) F.path(i, Trns);
                else e("Media folder is not set on the server side!");
            case "?": 
                if(K) K.show();
                else e("EnableRutorSearch option is off on the server side");
                break;
            default:
                if(S) S.find(i);
                else e("EnableRutorSearch option is off on the server side");
        } else if(typeof d.data == "string") {
            Q({action: i, hash: d.data}, function(){f({action: "success:OK"})}, e);
        } else if(d.data.link){
            d.data.action = "add";
            Q(d.data, function(d){f({action: "content:request:interaction:#" + d.hash + "@" + window.location.href})}, e);
        } else e("Wrong request!");
    })};
}