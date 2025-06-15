var fileTypes = {
    torrent: ["torrent"],
    audio: ["aac","aiff","ape","au","flac","gsm","it","m3u","m4a","mid","mod","mp3","mpa","pls","ra","s3m","sid","wav","wma","xm"],
    video: ["3g2","3gp","aaf","asf","avchd","avi","drc","flv","m2ts","ts","m2v","m4p","m4v","mkv","mng","mov","mp2","mp4","mpe","mpeg","mpg","mpv","mxf","nsv","ogg","ogv","qt","rm","rmvb","roq","svi",".vob","webm","wmv","yuv"],
    get: function(pth){
        if(!pth.length) return "";
        if(pth[pth.length - 1] == "/") return "/";
        var x = pth.lastIndexOf(".");
        if(x >= 0 && (x = pth.substr(x + 1).toLowerCase())){
            var t = ["torrent", "audio", "video"];
            for(var i = 0; i < t.length; i++) if(this[t[i]].indexOf(x) >= 0) return t[i];
        }
        return "";
    }
}
function files(url, cmp, grp, trnAct){
    this.init = function(){if(!url) TVXInteractionPlugin.error("url is not set!")};
    this.handleRequest = function(id, _, cb){
        if(id.length == 0 || id[0] != "/" || id[id.length - 1] != "/") return false;
        TVXServices.ajax.get(url + id, {
            success: function(d){
                var ds = [], ts = [], fs = [];
                d = (new window.DOMParser()).parseFromString(d, "text/html").getElementsByTagName("a");
                for(var i = 0; i < d.length; i++){
                    var l = d[i].childNodes[0].nodeValue, a = d[i].getAttribute("href");
                    switch(fileTypes.get(a)){
                        case "/": 
                            ds.push({
                                icon: "msx-yellow:folder", label: l, 
                                action: "interaction:request:" + id + a + "@" + window.location.href
                            });
                            break;
                        case "audio":
                            fs.push({
                                icon: "msx-white-soft:audiotrack", label: l, playerLabel: l,
                                group: grp ? "{ico:audiotrack}" : null,
                                action: "audio:" + url + id + a
                            });
                            break;
                        case "video":
                            fs.push({
                                icon: "msx-white-soft:movie", label: l, playerLabel: l,
                                group: grp ? "{ico:movie}" : null,
                                action: "video:resolve:request:interaction:" + url + id + a + "@http://msx.benzac.de/interaction/play.html"
                            });
                            break;
                        case "torrent": if(trnAct) ts.push({
                            icon: "msx-yellow:offline-bolt", label: l,
                            action: trnAct.replace("{torrent}", url + id + a)
                        });
                    }
                }
                d = id.substr(0, id.length - 1);
                fs = ds.concat(ts).concat(fs);
                ds = typeof cmp == "string" ? TVXServices.storage.getBool(cmp, false) : cmp ? true : false;
                f({
                    type: "list", reuse: false, cache: false, restore: false, flag: d, refocus: 2, compress: ds,
                    headline: decodeURI(d.substr(d.lastIndexOf("/") + 1)), extension: "{ico:msx-white:folder} " + fs.length,
                    template: {
                        type: "control", layout: ds ? "0,0,16,1" : "0,0,12,1", 
                        progress: -1, live: {type: "playback", action: "player:show"},
                        properties: {"resume:key": "url", "trigger:complete": "[player:auto:next|resume:cancel]"}
                    },
                    items: fs.length ? fs : [{type: "default", label: "{dic:playlist:headline:empty_folde|N{ico:msx-blue:info} Empty Folder}", action: "reload:content"}]
                });
            },
            error: function(e){
                TVXInteractionPlugin.error(e);
                f();
            }
        }, {dataType: "html"});
        return true;
    };
}