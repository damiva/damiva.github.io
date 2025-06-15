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
function files(url, remove, trnAct, trnDat){
    var byName = function(a, b){return a.label < b.label ? -1 : a.label > b.label ? 1 : 0};
    var icon = function(v){return v ? "msx-white:toggle-on" : "toggle-off"};
    this.init = function(){if(!url) TVXInteractionPlugin.error("url is not set!")};
    this.handleData = function(d){
        if(typeof d.data == "object"){
            if(d.data.remove){
                if(remove) TVXServices.ajax.del(url + d.data.path + TVXTools.base64DecodeId(d.data.remove), {
                    success: function(){
                        TVXInteractionPlugin.executeAction("[cleanup|reload:context]");
                    },
                    error: function(e){
                        TVXInteractionPlugin.executeAction("cleanup");
                        TVXInteractionPlugin.error(e);
                    }
                }, {dataType: "text"});
                return true
            }else if(d.data.compress){
                TVXServices.storage.set("files:compress", d.data.compress);
                TVXInteractionPlugin.executeAction("[cleanup|reload:context]")
                return true
            }else if(d.data.order){
                TVXServices.storage.set("files:order", d.data.order);
                TVXInteractionPlugin.executeAction("[cleanup|reload:context]")
                return true
            }
        }
        return false;
    }
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
                                id: TVXTools.base64EncodeId(a),
                                icon: "msx-yellow:folder", label: l,
                                action: "interaction:request:" + id + a + "@" + window.location.href
                            });
                            break;
                        case "audio":
                            fs.push({
                                id: TVXTools.base64EncodeId(a),
                                icon: "msx-white-soft:audiotrack", label: l, playerLabel: l,
                                group: "{ico:audiotrack}",
                                action: "audio:" + url + id + a
                            });
                            break;
                        case "video":
                            fs.push({
                                id: TVXTools.base64EncodeId(a),
                                icon: "msx-white-soft:movie", label: l, playerLabel: l,
                                group: "{ico:movie}",
                                action: "video:resolve:request:interaction:" + url + id + a + "@http://msx.benzac.de/interaction/play.html"
                            });
                            break;
                        case "torrent": if(trnAct){
                            var t = {
                                id: TVXTools.base64EncodeId(a),
                                icon: "msx-yellow:offline-bolt", label: l, 
                                action: trnAct, data: trnDat ? {} : null
                            };
                            if(!trnDat) t.action = t.action.replace("{TORRENT}", url + id + a);
                            else if(typeof trnDat == "string") t.data[trnDat] = url + id + a;
                            else t.data = url + id + a;
                            ts.push(t);
                        }
                    }
                }
                d = TVXServices.storage.getBool("files:order", false);
                if(d) [ds,ts,fs].forEach(function(a){if(a.length > 1) a.sort(byName)});
                fs = ds.concat(ts, fs);
                ts = TVXServices.storage.getBool("files:compress", false);
                ds = id.substr(0, id.length - 1);
                cb({
                    type: "list", reuse: false, cache: false, restore: false, flag: ds, refocus: true, compress: ts,
                    headline: decodeURI(ds.substr(ds.lastIndexOf("/") + 1)), extension: "{ico:msx-white:folder} " + fs.length,
                    template: {
                        type: "control", layout: ts ? "0,0,16,1" : "0,0,12,1", 
                        progress: -1, live: {type: "playback", action: "player:show"},
                        properties: {"resume:key": "url", "trigger:complete": "[player:auto:next|resume:cancel]"},
                        options: {
                            caption: "{dic:caption:options|opt/menu}" 
                                    +(remove ? "{tb}{ico:msx-red:stop} {dic:launcher:caption:remove|Remove}" : "")
                                    +"{tb}{ico:msx-yellow:stop} {dic:label:reload|Reload}",
                            headline: "{dic:caption:options|opt/menu}",
                            template: {type: "control", layout: "0,0,8,1", action: "interaction:load:" + window.location.href},
                            items: [
                                {icon: "msx-red:stop", label: "{dic:launcher:caption:remove|Remove}", data: {remove: "{context:id}", path: id}, display: remove},
                                {icon: "msx-yellow", label: "{dic:label:reload|Reload}", action: "[cleanup|reload:content]"},
                                {icon: "compress", label: "{dic:launcher:label:compact_list|Compact List}", extensionIcon: icon(ts), data: {compress: !ts}},
                                {icon: "sort", label: "{dic:label:order:name|A{ico:arrow-forward}Z", extensionIcon: icon(d), data: {order: !d}},
                                {icon: "menu", label: "{dic:label:menu|Menu}", extensionIcon: "arrow-forward-ios", action: "[cleanup|menu]"}
                            ]
                        },
                    },
                    items: fs.length ? fs : [{type: "default", label: "{dic:playlist:headline:empty_folde|{ico:msx-blue:info} Empty Folder}", action: "reload:content"}],
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