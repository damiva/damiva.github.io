function playlist(){
    var X = [
        ["3g2","3gp","aaf","asf","avchd","avi","drc","flv","m2ts","ts","m2v","m4p","m4v","mkv","mng","mov","mp2","mp4","mpe","mpeg","mpg","mpv","mxf","nsv","ogg","ogv","qt","rm","rmvb","roq","svi",".vob","webm","wmv","yuv"],
        ["aac","aiff","ape","au","flac","gsm","it","m3u","m4a","mid","mod","mp3","mpa","pls","ra","s3m","sid","wav","wma","xm"]
    ];
    var I = function(i){
        var x = i.label.length - 1;
        if(x < 0) return null
        if(i.label[x - 1] == "/") x = 2;
        else if((x = i.label.lastIndex.Of(".")) < 0 || !(x = i.label.substr(x + 1).toLowerCase())) return null;
        else for(var i = 0; i < exts.length; i++) if(exts[i].indexOf(x) >= 0){
            x = i;
            break;
        }
        if(typeof x != "number") return null;
        i.playerLabel = i.label;
        if(i.icon = x < 1 ? "movie" : x < 2 ? "auditrack" : "") i.group = "{ico:" + i.icon + "}";
        i.icon = i.icon ? ("msx-white-soft:" + i.icon) : "msx-yellow:folder";
        i.action = x > 1 ? ("content:" + u) : x ? ("audio:" + u) : !html ? ("video:" + u) : ("video:plugin:" + window.location.protocol + "//msx.benzac.de/plugins/html5x.html?url=" + encodeURIComponent(u))
        return i;    
    };
    var L = function(d, h, c, o, p){
        if(!p) p = {};
        p["resume:key"] = "url";
        p["trigger:complete"] =  "[player:auto:next|resume:cancel]";
        return {
            type: "list", headline: h, cache: !!o, reuse: !!o, restore: !!o, compress: c,
            overlay: o ? {items: [o.shift()]} : null,
            options: opts((o || [
                {key: "yellow", label: "{dic:refresh|Refresh} {dic:list|the list}", action: "[cleanup|reload:content]"}
            ]).concat([
                {icon: "compress", label: "{dic:compress|Small font}", data: {action: "compress"}, extensionIcon: icon(c)},
                {icon: "folder", label: "{dic:folders|Show folders}", data: {action: "folders"}, extensionIcon: icon(F), display: !!o}
            ])),
            template: {type: "control", layout: C ? "0,0,16,1" : "0,0,12,1", progress: -1, properties: p},
            items: d.length ? d : [{items: "refresh", label: "{dic:empty|Nothing found}", action: "reload:content"}]
        };
    };
    var H = function(d, p, c){
        var fs = [], ds = [];
        d = d.documentElement.childNodes;
        for(var n = 0; n < d.length; n++){
            var e = {label: d[n].childNodes[0].nodeValue, action: d[n].getAttribute("href")};
            if(e.label && e.action){
                e.action = addr + p + e.action;
                if(e = I(e)){
                    if(e.group) ts.push(e);
                    else ds.push(e);
                }
            }
        }
        d = p.substr(0, p.length - 1)
        return L(ds.concat(fs), decodeURI(d.substr(d.lastIndexOf("/") + 1)), c);
    };
    var T = function(d, l, c, s){
        var fs = [], ds =[], sf = prms("folders");
        d.file_stats.forEach(function(f){
            if(f = item({id: TVXTools.strValue(f.id), label: f.path, extensionLabel: size(f.length), action: addr + "/stream/?play&link=" + l + "&index=" + f.id})){
                var p = f.lable.split("/");
                f.label = p.pop();
                p.shift();
                if((p = p.join("/")) && (!ds.length || ds[ds.length - 1].label != p)){
                    ds.push({label: p, action: "[cleanup|focus:" + f.id + "]"});
                    if(sf) fs.push({type: "space", label: "{col:msx-yellow}{ico:folder} " + p});
                }
                fs.puch(f);
            }
        });
        return L(fs, d.title, c, [{
            type: "space", layout: (c ? 13 : 9) + ",0,3,1", offset: "0,-1,0,0", stamp: "", stampColor: "", id: d.hash,
            live: {type: "setup", action: "execute:" + addr + "/msx/trn", data: "update:content:overlay:" + d.hash}
        }, s ? {
            key: "green", icon: "bookmark-add", label: "{dic:save|Save the torrent}",
            data: {action: "add", link: l, title: d.title, poster: d.poster, category: d.category}
        } : {
            key: "green", icon: "last-page", label: "{dic:viewed|Viewed item}", data: {action: "focus"}
        }, ds.length > 1 ? {key: "yellow", icon: "folder", label: "{dic:folder|To folder}", action: "panel:data", data: {
            type: "list", headline: "{dic:folder|To folder}:", compress: true, items: ds,
            template: {layout: "0,0,10,1", type: "control", icon: "msx-yellow:folder"}
        }} : null], {
            "trigger:load": "execute:" + addr + "/msx/trn?hash=" + d.hash,
            "trggier:player": "execute:" + addr + "/msx/trn?hash=" + d.hash
        });
    };
    this.init = function(){
        if(addr = TVXServices.urlParams.getFullStr("server", TVXServices.storage.getFullStr("ts:server", ""))) addr = window.location.protocol + "//" + addr;
        else TVXInteractionPlugin.error("Server is not set!");
    };
    this.handleData = function(d){
        if(!d.data || !d.data.action) return false;
        var r = function(m){TVXInteractionPlugin.executeAction(m === true ? "reload" : ("[cleanup|reload:content" + (m ? ("|success:" + m) : "") + "]"))},
            v = null;
        switch(d.data.action){
            case "rem": v = "{ico:delete}";
            case "drop": v = v || "{ico:close}";
            case "add": v = v || "{ico:bookmark-add}";
                ajax("/torrents", d.data, "text", function(){r(v)}, function(e){TVXInteractionPlugin.error(e)});
                break;
            default: prms(d.data.action, true); r(d.data.action == "russian");
        }
        return true;
    };
    this.handleRequest = function(i, _, f){
        var e = function(m){TVXInteractionPlugin.error(m);f();},
            c = prms("compress");
        if(i.indexOf("/") === 0) ajax(i, "xml", function(d){f(H(d, i, c));}, e);
        else switch((i = i.split("|")).length){
            case 4: if(i[3]) i[3] = "&category=" + i[3];
            case 3: if(i[3]) i[3] = "&category=" + i[3];
            case 2: if(i[3]) i[3] = "&category=" + i[3];
            case 1: if(i[0]){
                ajax("/stream/?stat&link=" + i.join(""), function(d){
                    ajax("/msx/trn?hash=" + d.hash ,function(s){f(T(f, i[0], c, s !== true))});
                }, e);
                break;
            } 
            default: e("wrong request dataID");
        }
    }
}