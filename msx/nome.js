var Addr = "", DRus = false, Srch = null, Fold = null, 
    Filter = {
        cur: 0,
        cat: ["movie", "tv", "music", "other"],
        icn: {movie: "movie", tv: "live-tv", music: "audiotrack", other: "more-horiz"},
        //dsp: function(c){return !c || !this.cur || ((cthis.cat.indexOf(c) + 1) ? 4 :)}
    };
function Trns(d, h, s){}
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