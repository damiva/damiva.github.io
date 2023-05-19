function Torrents(){
    var R = false, 
        H = "@" + window.location.href,
        E = {icon: "back", label: "{dic:empty|Nothing found}", action: "back"}, 
        W = "", 
        O = "",
        A = TVXInteractionPlugin.executeAction;
    var I = function(v){return v ? "msx-white:toggle-on" : "toggle-off"};
    var M = function(d){
        var r = Stor("russian");
        if(typeof d == "object"){
            R = d.EnableRutorSearch;
            d = null;
        } else {
            R = false;
            d = {action: "error:" + d};
        }
        return {logo: "https://damiva.github.io/msx/ts.png", ready: d, menu: [
            {icon: "history", label: "{dic:goon|Continue playing}", data: "request:interaction:goon" + H},
            {icon: "bookmarks", label: "{dic:trns|My torrents}", data: "request:interaction:trns" + H},
            {icon: "search", label: "{dic:srch|Search torrents}", data: window.location.origin + "/msx/search." + (r ? "ru" : "en") + ".json", enable: R},
            {type: "separator"},
            {icon: "settings", label: "{dic:label:settings|Settings}", data: {
                type: "list", extension: "{ico:msx-white:settings}", ready: {action: "interaction:commit:message:info"},
                underlay: {items: [
                    {id: "tor", type: "space", headline: "TorrServer", text: "", layout: "0,0,4,1", alignment: "center", color: "msx-black-soft"},
                    {id: "plg", type: "space", headline: "Plugin", text: "", layout: "4,0,4,1", alignment: "center", color: "msx-black-soft"},
                    {id: "app", type: "space", headline: "MSX", text: "", layout: "8,0,4,1", alignment: "center", color: "msx-black-soft"},
                ]},
                template: {
                    type: "control", enumerate: false,
                    layout: "0,0,12,1", area: "0,1,12,5",
                    action: "interaction:commit:message:set", data: "{context:id}"
                },
                items: [
                    {id: "russian", icon: "translate", label: r ? "Switch to english" : "Первести на русский", extensionIcon: "msx-yellow:refresh"},
                    {id: "rutor", icon: "search", label: "{dic:srch|Search torrents}", extensionIcon: I(R)},
                    {id: "compress", icon: "compress", label: "{dic:compress|Smaller font in lists}", extensionIcon: I(Stor("compress"))},
                    {id: "folders", icon: "folder", label: "{dic:folders|Show folders in torrents}", extensionIcon: I(Stor("folders"))},
                    {id: "audiopic", icon: "wallpaper", label: "{dic:audiopic|Random picture in audio player}", extensionIcon: I(Stor("audiopic"))}
                ]
            }}
        ]};
    };
    var Q = function(q){
        q = {
            "1":"{dic:rutor:1|Author's}",
            "100":"{dic:rutor:100|Amateur one voice}",
            "101":"{dic:rutor:101|Amateur two voices}",
            "102":"{dic:rutor:102|Amateur many voices}",
            "103":"{dic:rutor:103|Amateur studio}",
            "200":"{dic:rutor:200|Prof. one voice}",
            "201":"{dic:rutor:201|Prof. two voices}",
            "202":"{dic:rutor:202|Prof. many voices}",
            "203":"{dic:rutor:203|Prof. studio}",
            "300":"{dic:rutor:300|Official}",
            "301":"{dic:rutor:301|Licese}" 
        }[TVXTools.strValue(q)];
        return q || "";
    };
    var D = function(t){return {
        id: t.hash,
        image: t.poster || undefined,
        headline: t.title,
        titleFooter: "{ico:msx-white:attach-file} " + Size(t.torrent_size),
        group: t.data && t.data.substr(0, 4) == "GRP:" ? t.data.substr(4) : null,
        stamp: t.stat < 5 ? ("{ico:north} " + (t.active_peers || 0) + " / " + (t.pending_peers || 0) + " / " + (t.total_peers || 0)) : "",
        stampColor: t.stat == 4 ? "msx-red" : t.stat == 3 ? "msx-green" : "msx-yellow",
    }};
    var S = function(t, i){return {
        id: i = TVXTools.strValue(i),
        image: t.Poster || undefined,
        headline: t.Title,
        text: Q(t.AudioQuality),
        group: "{dic:rutor:" + t.Categories + "|" + t.Categories + "}",
        stamp: "{ico:attch-file} " + t.Size + "{tb}{ico:north} " + t.Peer + " {ico:south} " + t.Seed,
        live: !t.Poster && t.IMDBID ? {type: "setup", action: "interaction:commit:message:imdb", data: {imdb: t.IMDBID, id: i}} : null,
        Magnet: t.Magnet,
        Poster: t.Poster || t.IMDBID
    }};
    var T = function(d, v){return {
        type: "list", compress: d.c = Stor("compress"), reuse: !v, restore: !v, cache: !v,
        headline: v ? "{dic:trns|My torrents}" : W,
        extension: "{ico:msx-white:" + (v ? "bookmarks" : "search") + "} " + d.length,
        template: {
            imageWidth: 1.3, imageFiller: "height", layout: d.c ? "0,0,8,2" : "0,0,6,2",
            action: "execute:request:interaction:trn" + H,
            data: v 
                ? {link: "{context:id}"}
                : {link: "{context:Magnet}", poster: "{context:Poster}", title: "{context:headline}"}
        },
        items: !d.length ? [E] : d.map(v ? D : S)
    }};
    var L = function(h, i, t, n, s){
        var l = TVXServices.storage.get("lastvideo", []);
        if(!h) return l;
        l = l.filter(function(i){return i.hash != h});
        if(i) l.unshift({hash: h, id: i, title: t, fname: n, total: s});
        if(l.length > 6) l.pop();
        TVXServices.storage.set("lastvideo", l);
    };
    var G = function(d){return {
        type: "list", reuse: false, retore: false, cache: false, extension: "{ico:msx-white:history} " + d.length,
        template: {
            type: "control", icon: "msx-green:movie", progress: -1, layout: "0,0,12,1", 
            live: {type: "playback", action: "player:show"}, properties: {"resume:key": "id"},
            action: "execute:request:interaction:trn"
        },
        items: !d.length ? [E] : d.map(function(i){return {
            id: i.hash + i.id,
            headline: i.title,
            titleFooter: i.name,
            extensionLabel: i.id + "/" + i.total,
            data: {link: i.hash, title: i.title, execute: i.id}
        }})
    }};
    this.handleEvent = function(d){
        if(d.video && d.video.info && d.video.info.type == "video") switch(d.event){
            case "video:load":
                L(d.video.info.id.substr(0, 40), d.video.info.number, d.video.info.customLabel, d.video.info.label, d.info.count);
                break;
            case "video:stop": L(d.video.info.id.substr(0, 40));
        }
    };
    this.handleData = function(d){switch(d.message){
        case "info":
            Ajax(Addr + "/echo", "", function(v){A("update:content:underlay:tor", {text: v})});
            TVXInteractionPlugin.requestData(
                "info:application", 
                function(d){A("update:content:underlay:app", {headline: d.info.application.name, text: d.info.application.version})}
            );
            TVXInteractionPlugin.requestData(
                "info:content", 
                function(d){A("update:content:underlay:plg", {headline: d.info.content.name, text: d.info.content.version})}
            );
            return true;
        case "imdb":
            Imdb(function(i){if(i){A("update:content:" + d.data.id, {image: i})}}, d.data.imdb);
            return true;
        case "drop":
        case "rem":
            Ajax(
                Addr + "/torrents",
                {action: d.message, hash: d.data},
                function(){A("reload:content")}
            );
            return true;
        case "set": switch (d.data){
            case "russian":
                Stor(d.data, true)
                A("reload");
                return true;
            case "rutor":
                TVXInteractionPlugin.startLoading();
                Ajax(Addr + "/settings", {action: "get"}, function(d){
                    d.EnableRutorSearch = !R;
                    Ajax(Addr + "/settings", {action: "set", sets: d}, function(){
                        A("reload:menu");
                        TVXInteractionPlugin.stopLoading();
                    });
                }, true);
                return true;
            default:
                A("update:content:" + d.data, {extensionIcon: I(Stor(d.data, true))});
                return true;
            }
        case "key": switch(d.data){
            case "ok":
                if(W != O) Ajax("", "");
                O = W;
                A("content:request:interaction:find");
                return true;
            case "ru":
            case "en":
                A("replace:content:keyboard:" + window.location.origin + "/msx/search." + d.data + ".json>lang");
                return true;
            case "cl":
                W = "";
            case "bs":
                W = W ? W.substr(0, W.length - 1) : "";
                d.data = "";
            default: 
                A("update:content:underlay:val", {label: (W += d.data) || "{txt:msx-white-soft:dic:words|Enter the word(s) to search}"});
                return true;
        }
        default: return false;
    }};
    this.handleRequest = function(i, _, f){switch(i){
        case "init":
            f({
                name: document.title,
                version: document.head.querySelector("meta[name=version]").content,
                reference: "request:interaction:menu" + H,
                dictionary: Stor("russian") ? (window.location.origin + "/msx/russian.json") : null,
            });
            return true;
        case "menu":
            var m = function(d){f(M(d))};
            Ajax(Addr + "/settings", {action: "get"}, m, m);
            return true;
        case "goon":
            f(G(L()));
            return true;
        case "find":
            Ajax(
                Addr + "/search/?query=",
                TVXTools.strToUrlStr(W),
                function(d){f(T(d))},
                function(e){TVXInteractionPlugin.error(e); f();}
            );
            return true;
        case "trns":
            Ajax(
                Addr + "/torrents",
                {action: "list"},
                function(d){f(T(d, true))},
                function(e){TVXInteractionPlugin.error(e); f();}
            );
            return true;
        default: return false;
    }};
}
