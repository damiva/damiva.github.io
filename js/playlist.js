function playlist(){
    var X = [
        ["3g2","3gp","aaf","asf","avchd","avi","drc","flv","m2ts","ts","m2v","m4p","m4v","mkv","mng","mov","mp2","mp4","mpe","mpeg","mpg","mpv","mxf","nsv","ogg","ogv","qt","rm","rmvb","roq","svi",".vob","webm","wmv","yuv"],
        ["aac","aiff","ape","au","flac","gsm","it","m3u","m4a","mid","mod","mp3","mpa","pls","ra","s3m","sid","wav","wma","xm"]
    ];
    var S = false;
    var I = function(i){
        var x = i.label.length - 1;
        if(x < 0) return null
        if(i.label[x] == "/"){i.label = i.label.substr(0, x); x = 2;}
        else if((x = i.label.lastIndexOf(".")) < 0 || !(x = i.label.substr(x + 1).toLowerCase())) return null;
        else for(var n = 0; n < X.length; n++) if(X[n].indexOf(x) >= 0){
            x = n;
            break;
        }
        if(typeof x != "number") return null;
        i.playerLabel = i.label;
        if(i.icon = x < 1 ? "movie" : x < 2 ? "auditrack" : "") i.group = "{ico:" + i.icon + "}";
        i.icon = i.icon ? ("msx-white-soft:" + i.icon) : "msx-yellow:folder";
        i.action = 
            x > 1 ? ("content:request:interaction:" + i.action + "@" + window.location.href) 
            : x ? ("audio:" + addr + i.action) 
            : ("video:resolve:request:interaction:" + addr + i.action + "@http://msx.benzac.de/interaction/play.html")
        return i;    
    };
    var L = function(d, h, c, o, p, f){
        var s = o ? null : prms("fileorder");
        if(s === true) d.sort(function(a, b){return !a.group && b.group ? -1 : a.group && !b.group ? 1 : a.label < b.label ? -1 : a.label > b.label ? 1 : 0});
        if(!p) p = {};
        p["resume:key"] = o ? "id" : "url";
        p["trigger:complete"] =  "[player:auto:next|resume:cancel]";
        return {
            type: "list", headline: h, cache: !!o, reuse: !!o, restore: !!o, compress: c, 
            extension: o ? " " : ("{ico:msx-white:folder} " + d.length),
            overlay: o ? {items: [o.shift()]} : null,
            options: opts((o || [
                {key: "yellow", label: "{dic:refresh|Refresh} {dic:list|the list}", action: "[cleanup|reload:content]"},
                {icon: "sort-by-alpha", label: "{dic:label:order|Order} {dic:name|by name}", extensionIcon: icon(s), data: "fileorder"}
            ]).concat([
                {icon: "compress", label: "{dic:compress|Compress} {dic:list|the list}", data: "compress", extensionIcon: icon(c)},
                {icon: "folder", label: "{dic:folders|Show folders}", data: "folders", extensionIcon: icon(f), display: f !== undefined}
            ])),
            template: {type: "control", layout: c ? "0,0,16,1" : "0,0,12,1", progress: -1, live: {type: "playback", action: "player:show"}, properties: p},
            items: d && d.length ? d : [{items: "refresh", label: "{dic:empty|Nothing found}", action: "reload:content"}]
        };
    };
    var H = function(d, p, c){
        var fs = [], ds = [];
        d = new window.DOMParser().parseFromString(d, "text/xml").getElementsByTagName("a");
        for(var i = 0; i < d.length; i++){
            var a = {label: d[i].childNodes[0].nodeValue, action: d[i].getAttribute("href")};
            if(a.action){
                a.action = p + a.action;
                if(a = I(a))
                    if(a.group) fs.push(a);
                    else ds.push(a);
            }
        }
        d = p.substr(0, p.length - 1);
        return L(ds.concat(fs), decodeURI(d.substr(d.lastIndexOf("/") + 1)), c);
    };
    var T = function(d, l, c, s){
        var fs = [], ds =[], sf = prms("folders");
        d.file_stats.forEach(function(f){
            if(f = I({id: d.hash + f.id, label: f.path, extensionLabel: size(f.length), action: "/stream/?play&link=" + l + "&index=" + f.id})){
                var p = f.label.split("/");
                f.label = p.pop();
                p.shift();
                if((p = p.join("/")) && (!ds.length || ds[ds.length - 1].label != p)){
                    ds.push({label: p, action: "[cleanup|focus:" + f.id + "]"});
                    if(sf) fs.push({type: "space", label: "{col:msx-yellow}{ico:folder} " + p});
                }
                fs.push(f);
            }
        });
        return L(fs, d.title, c, [{
            type: "space", layout: (c ? 13 : 9) + ",0,3,1", offset: "0,-1,0,0", stamp: "", stampColor: "", id: d.hash, color: "none",
            live: {type: "setup", action: "execute:" + addr + "/msx/trn", data: "update:content:overlay:" + d.hash}
        }, s ? {
            key: "green", icon: "bookmark-add", label: "{dic:save|Save the torrent}", data: "save"
        } : fs.length > 1 ? {
            key: "green", icon: "last-page", label: "{dic:viewed|To viewed item}", data:  d.hash
        } : null, ds.length > 1 ? {key: "yellow", icon: "folder", label: "{dic:folder|To folder}", action: "panel:data", data: {
            type: "list", headline: "{dic:folder|To folder}:", compress: true, items: ds,
            template: {layout: "0,0,10,1", type: "control", icon: "msx-yellow:folder"}
        }} : null], {
            "trigger:load":   "execute:" + addr + "/msx/trn?hash=" + d.hash,
            "trigger:player": "execute:" + addr + "/msx/trn?hash=" + d.hash
        }, sf);
    };
    this.init = function(){
        if(addr = TVXServices.urlParams.getFullStr("server", TVXServices.storage.getFullStr("ts:server", ""))) addr = window.location.protocol + "//" + addr;
        else TVXInteractionPlugin.error("Server is not set!");
    };
    this.handleData = function(d){
        if(!d.data || typeof d.data != "string") return false;
        if(d.data.length > 20) ajax("/viewed", {action: "list", hash: d.data}, function(l){
            var i = 0;
            if(l && typeof l == "object") l.forEach(function(n){if(n.file_index > i) i = n.file_index});
            if(i > 0) TVXInteractionPlugin.executeAction("[cleanup|focus:" + d.data + i + "]");
        });
        else {
            if(d.data == "save") S = true;
            else prms(d.data, true);
            TVXInteractionPlugin.executeAction(d.data == "russian" ? "reload" : "[cleanup|reload:content]");
        }
        return true;
    };
    this.handleRequest = function(i, _, f){
        var e = function(m){TVXInteractionPlugin.error(m);f();},
            c = prms("compress");
        if(i.indexOf("/") === 0) ajax(i, "html", function(d){f(H(d, i, c))}, e);
        else switch((i = i.split("|")).length){
            case 4: if(i[3]) i[3] = "&category=" + i[3];
            case 3: if(i[2]) i[2] = "&poster=" + i[2];
            case 2: if(i[1]) i[1] = "&title=" + i[1];
            case 1: if(i[0]){
                ajax("/stream/?stat&link=" + i.join("") + (S ? "&save" : ""), function(d){
                    ajax("/msx/trn?hash=" + d.hash ,function(s){f(T(d, i[0], c, s !== true))});
                    if(S) TVXInteractionPlugin.success("{dic:saved|Torrent added in} {col:msx-white}{dic:my|My} {dic:trns|torrents}", S = false);
                }, e);
                break;
            } 
            default: e("wrong request dataID");
        }
    }
}