var ADDR = window.location.origin;
function IMDB(id, f){
    TVXServices.ajax.get("/imdb?id=" + (id || ""), {success: f, error: f ? function(){f()} : undefined});
}
function SIZE(s){
    var i = s == 0 ? 0 : Math.floor(Math.log(s) / Math.log(1024));
    return (s / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}
function PEERS(t){
    return "{ico:north} " + (t.active_peers || 0) + " · " + (t.pending_peers || 0) + " / " + (t.total_peers || 0);
}
function Torrent(){
    var X = {
        e: [
            ["aac","aiff","ape","au","flac","gsm","it","m3u","m4a","mid","mod","mp3","mpa","pls","ra","s3m","sid","wav","wma","xm"],
            ["3g2","3gp","aaf","asf","avchd","avi","drc","flv","m2ts","ts","m2v","m4p","m4v","mkv","mng","mov","mp2","mp4","mpe","mpeg","mpg","mpv","mxf","nsv","ogg","ogv","qt","rm","rmvb","roq","svi","vob","webm","wmv","yuv"]
        ],
        x: function(n){
            var d = n.indexOf("/"), b = n.lastIndexOf("/"), e = n.lastIndexOf("."), i = 0;
            if(e < 0 || e == n.length - 1) return null;
            else e = n.substr(e + 1).toLowerCase();
            for(i = 0; i < this.e.length; i++) if(this.e[i].indexOf(e) >= 0) break;
            return i == this.e.length ? null : {d: d < b ? n.substr(d + 1, b - d - 1) : "", n: n.substr(b + 1), t: i};
        }
    };
    var B = new TVXBusyService();
    var U = function(o){
        return Object.keys(o).map(function(k){
            return typeof o[k] != "boolean" ? (k + "=" + TVXTools.strToUrlStr(o[k])) : o[k] ? k : "";
        }).join("&");
    };
    var P = function(t, b){
        return "{VALUE}{tb}" + (typeof t == "string"
            ? ("{col:msx-red}{ico:warning} " + t)
            : ("{col:msx-green}" + PEERS(t))
        );
    };
    this.handleData = function(d){
        if(d.message.indexOf("torrent:") != 0) return false;
        var r = function(m){TVXInteractionPlugin.executeAction("player:label:position:" + m)};
        TVXServices.ajax.post(ADDR + "/torrents", '{"action":"get","hash":"' + d.message.substr(8) + '"}', {
            success: function(t){r(P(t))},
            error: function(e){r(P(e))}
        });
        return true
    };
    this.handleRequest = function(i, d, f){
        if(i != "torrent")
            return false;
        else if(!d || !d.data || (d.save = typeof d.data != "string") && !d.data.link)
            f({action: "error:Wrond data!"});
        else {
            if(d.save) d.save = d.save && !d.data.save;
            else {
                d.exec = TVXTools.strToNum(d.data.substr(40), null);
                d.data = {link: d.data.substr(0, 40)};
            }
            B.start();
            if(d.poster && d.poster.indexOf("tt") == 0) IMDB(d.poster, function(i){d.poster = i; B.stop()});
            else B.stop();
            B.onReady(function(){TVXServices.ajax.get(ADDR + "/stream/?stat&" + U(d.data), {
                success: function(t){
                    var ds = [], fs = [];
                    t.file_stats.forEach(function(f){
                        if(f.path = X.x(f.path)){
                            if(f.path.d && (ds.length == 0 || ds[ds.length - 1].label != f.path.d))
                                ds.push({label: f.path.d, action: "[cleanup|focus:" + t.hash + f.id + "]"});
                            f.u = [ADDR, "play", t.hash, f.id].join("/");
                            fs.push({
                                id: t.hash + f.id,
                                icon: "msx-white-soft:" + ["audiotrack", "local-movies"][f.path.t],
                                group: ["{dic:label:audio|Audio}", "{dic:label:video|Video}"][f.path.t],
                                label: f.path.n,
                                Dir: f.path.d ? ("{ico:msx-yellow:folder} " + f.path.d + "{br}") : "",
                                extensionLabel: SIZE(f.length),
                                execute: d.exec === f.id, 
                                focus: d.exec === f.id,
                                action: f.path.t ? ("video:resolve:request:interaction:" + f.u) : ("audio: " + f.u)
                            });
                        }
                    });
                    if(d.save) d.data.save = true;
                    f({action: "content:data", data: {
                        type: "list", headline: t.title, items: fs.length ? fs : EMPTY,
                        extension: "{ico:msx-white:list} " + fs.length + "/" + t.file_stats.length,
                        ready: d.data.save & !d.save ? {action: "success:{dic:save|Save the torrent}"} : null,
                        options: OPTIONS(
                            null,
                            d.save ? {
                                label: "{dic:save|Save the torrent}", 
                                action: "[release:content|execute:request:interaction:torrent]", data: d.data
                            } : null,
                            ds.length ? {label: "{dic:folder|Select folder}", action: "panel:data", data: {
                                type: "list", headline: "{dic:folder|Select folder}:", compress: true, items: ds,
                                template: {icon: "msx-yellow:folder", type: "control", layout: "0,0,10,1"}
                            }} : null
                        ),
                        template: {
                            type: "control", layout: "0,0,12,1", playerLabel: t.title,
                            live: {type: "playback", action: "player:show"}, progress: -1,
                            properties: {
                                "info:text": "{context:Dir}{ico:{context:icon}} {context:label}",
                                "info:image": t.poster || "default",
                                "control:type": "extended",
                                "resume:key": "id",
                                "trigger:complete": "[player:auto:next|resume:cancel]",
                                "trigger:player": "interaction:commit:message:torrent:" + t.hash,
                                "trigger:play": "interaction:commit:message:torrent:" + t.hash,
                            }
                        }
                    }});
                },
                error: function(e){f({action: "error:" + e})}
            })});
        }
        return true;
    }
}