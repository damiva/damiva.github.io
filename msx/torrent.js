var Addr = window.location.origin,
    Exts = [
        ["dif","dv","fli","mp4","mpeg","mpg","mpe","mpv","mkv","ts","m2ts","mts","ogv","webm","vob","avi","qt","mov"],
        ["aac","dsd","dsf","dff","flac","mpga","mpega","mp2","mp3","m4a","oga","ogg","opus","spx","opus","weba","ape","wav"]
    ];
function Stor(k, c){
    var v = TVXServices.storage.getBool(k, false);
    if(c) TVXServices.storage.set(k, v = !v);
    return v;
}
function Size(s){
    var i = s == 0 ? 0 : Math.floor(Math.log(s) / Math.log(1024));
    return (s / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}
function Opts(r, g, y){
    var k = ["red", "green", "yellow"],
        o = {headline: "{dic:caption:options|Options}:", template: {enumerate: false, type: "control", layout: "0,0,8,1"}, items: []};
    o.caption = o.headline;
    for(var i = 0; i < k.length && i < arguments.length; i++) if(arguments[i]) {
        arguments[i].key = k[i];
        arguments[i].icon = "msx-" + k[i] + ":stop";
        o.items.push(arguments[i]);
        o.caption += "{tb}{ico:" + arguments[i].icon + "} " + arguments[i].label;
    }
    return o.items.length ? o : null;
}
function Ajax(u, d, s, e){
    var x = {success: s, error: typeof e == "function" ? e : TVXInteractionPlugin.error},
        t = {dataType: e ? "json" : "text"},
        s = typeof d == "string";
    TVXServices.ajax[s ? "get" : "post"](u + (s ? d : ""), s ? x : TVXTools.serialize(d), s ? t : x, s ? undefined : t);
}
function Imdb(f, i){Ajax("/msx/?img&imdb=", i, f, function(){f()})};
function Torrent(){
    var D = null,
        H = "@" + window.location.href,
        B = window.location.origin + "/msx/?img=" + TVXSettings.SCREEN_WIDTH + "x" + TVXSettings.SCREEN_HEIGHT;
    var T = function(d, a){
        var fs = [], ds = [], ct = Stor("compress"), sf = Stor("folders"), ap = Stor("audiopic"), is = 0;
        d.file_stats.forEach(function(f){
            var b = f.path.indexOf("/"), e = f.path.lastIndexOf("/");
            f.path = [f.path.substr(e + 1), b > 0 && e > b ? f.path.substr(b + 1, e - b - 1) : ""];
            if((e = f.path[0].lastIndexOf(".")) < 0 || !(e = f.path[0].substr(e + 1))) return;
            for(b = 0; b < Exts.length; b++) if(Exts[b].indexOf(e) >= 0) break;
            if(b < Exts.length) b = [{i: "movie", t: "video"}, {i: "audiotrack", t: "audio", a: true}][b];
            else return;
            if(f.path[1] && (ds.length == 0 || ds[ds.length - 1].label != f.path[1])){
                ds.push({label: f.path[1], action: "[cleanup|focus:" + d.hash + f.id + "]"});
                if(sf) fs.push({type:"space", label: "{col:msx-yellow}{ico:folder} " + f.path[1]});
            }
            is++;
            fs.push({
                id: d.hash + f.id,
                icon: "msx-green:" + b.i,
                label: f.path[0],
                extensionLabel: Size(f.length),
                group: "{dic:label:" + b.t + "|" + b.t + "}",
                background: b.a && ap ? B : undefined,
                focus: D.focus && D.focus == f.id,
                execute: D.execute && D.execute == f.id,
                folder: f.path[1] ? ("{ico:msx-yellow:folder} " + f.path[1] + "{br}") : "",
                action: b.t + ":" + (b.a ? [Addr, "play", d.hash, f.id].join("/") : ("resolve:request:interaction:" + [Addr, "play", d.hash, f.id].join("/") + H))
            });
        });
        return {
            type: "list", headline: d.title, extension: "{ico:msx-white:list} " + is, compress: ct, items: fs, flag: "torrent",
            options: Opts(null,
                a ? {label: "{dic:save|Save the torrent}", action: "[cleanup|interaction:commit:message:save]"} : null,
                ds.length > 1 ? {label: "{dic:folder|Select folder}", action: "[cleanup|panel:data]", data: {
                    type: "list", headline: "{dic:folder|Select folder}:", compress: true, items: ds,
                    template: {type: "control", icon: "folder", layout: "0,0,10,1"}
                }} : null
            ),
            template: {
                type: "control", layout: ct ? "0,0,16,1" : "0,0,12,1", playerLabel: d.title, progress: -1,
                live: {type: "playback", action: "player:show"},
                properties: {
                    "info:text": "{context:folder}{ico:{context:icon}} {context:label}",
                    "info:image": d.poster || "default",
                    "control:type": "extended",
                    "resume:key": "id",
                    "trigger:complete": "[player:auto:next|resume:cancel]"
                }
            }
        };
    };
    this.handleData = function(d){switch(d.message){
        case "save":
            D.action = "get";
            D.save_to_db = true;
            Ajax(Addr + "/torrents", D, function(d){
                D = {link: d.hash}
                TVXInteractionPlugin.executeAction("replace:content:torrent:request:interaction:trn@" + window.location.href);
            }, true);
            return true;
        case "goon":
            Ajax(Addr + "/viewed", {action: "list", hash: d.data}, function(l){
                var i = 0;
                l.forEach(function(f){if(f.file_index > i) i = f.file_index});
                if(i > 0) TVXInteractionPlugin.executeAction("focus:" + d.data + "." + i);
            }, function(){});
            return true;
        default: return false;
    }}
    this.handleRequest = function(i, d, f){
        if(i != "trn") return false;
        else if(d && d.data) {
            var r = function(i){
                D.poster = i || "";
                f({action: "content:request:interaction:trn"});
            }
            D = d.data;
            if(D.poster && D.poster.substr(0, 2) == "tt") Imdb(r, D.poster);
            else r(D.poster);
        } else Ajax(
            Addr + "/stream/?stat&",
            ["link", "title", "poster"].map(function(k){return k + "=" + TVXTools.strToUrlStr(D[k])}).join("&"),
            function(t){f(T(t, typeof D.save_to_db != "boolean" || D.save_to_db))},
            function(e){TVXInteractionPlugin.error(e); f();}
        )
        return true;
    };
    Addr = TVXServices.urlParams.getFullStr("addr", Addr);
}