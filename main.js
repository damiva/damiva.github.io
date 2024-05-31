var addr = "";
function ajax(){
    var u = addr, d = null, s = {};
    for(var i = 0; i < arguments.length; i++) switch(typeof arguments[i]){
        case "object": d = arguments[i]; break;
        case "string": u += arguments[i]; break;
        case "boolean": s.dataType = arguments[i] ? "text" : "json"; break;
        case "function": if(s.success){
            s.error = arguments[i];
        }else{
            s.success = arguments[i];
            s.error = arguments[i];
        }
    }
    TVXServices.ajax[d ? "post" : "get"](u, d ? JSON.stringify(d) : s, d ? s : undefined);
}
function opts(h, o){
    var r = {
        caption: h = h || "{dic:caption:options|opt/menu}", headline: h + ":",
        template: {layout: "0,0,8,1", type: "control", enumerate: false}, items: []
    }
    o.forEach(function(i){if(i){
        if(i.key){
            i.progress = 1;
            i.progressColor = "msx-" + i.key;
            if(!i.icon) i.icon = "refresh";
            r.caption += "{tb}{col:" + i.progressColor + "}{ico:" + i.icon + "}";
            if(i.key == "red") i.label = "{dic:label:reload|Reload} " + i.label;
            else r.caption += " " + i.label;
        }else if(i.enable === false){
            r.caption += ": " + i.label;
            r.template = {type: "button", layout: "0,0,4,1", area: "0,1,8,5", action: "interaction:commit"};
        }
        r.items.push(i);
    }});
    return r.items.length ? r : null;
}
function size(s){
    var i = s == 0 ? 0 : Math.floor(Math.log(s) / Math.log(1024));
    return (s / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}
function stor(k, c){
    var v = TVXServices.storage.getBool(k = "ts:" + k, false);
    if(c) TVXServices.storage.set(k, v = !v);
    return v;
}
function icon(v){return v ? "msx-white:check-box" : "check-box-outline-blank"}
function torrents(){
    var B = function(l){return l.map(function(t){return {
        id: t.hash,
        headline: t.title,
        image: t.poster || "", icon: t.poster ? "" : "msx-white-soft:bookmark",
        titleFooter: "{ico:msx-white:attach-file} " + size(t.torrent_size),
        group: "{ico:" + (t.category == "movie" ? "movie" : t.category == "tv" ? "live-tv" : t.category == "music" ? "audiotrack" : "more-horiz") + "}",
        live: t.stat < 5 ? {type: "setup", action: "execute:" + addr + "/msx/trn", data: "update:content:" + t.hash} : null,
        options: opts("", [
            {key: "red", label: "{dic:label:caontent|Content}", action: "[cleanup|reload:content]"},
            t.stat > 4 ? null : {key: "green", icon: "stop", label: "{dic:drop|Drop the torrent}", data: {action: "drop", hash: "{context:id}"}, action: "execute:request:interaction:trns@" + window.location.href},
            {key: "yellow", icon: "delete", label: "{dic:rem|Remove the torrent}", data: {action: "rem", hash: "{context:id}"}, action: "execute:request:interaction:trns@" + window.location.href},
        ])
    }})};
    var Q = function(q){
        var qs = {
            0:    "",
            1:    "Author's}",
            100:  "Amateur one voice",
            101:  "Amateur two voices",
            102:  "Amateur many voices",
            103:  "Amateur studio",
            200:  "Prof. one voice",
            201:  "Prof. two voices",
            202:  "Prof. many voices",
            203:  "Prof. studio",
            300:  "Official",
            301:  "License"
        }
        return (qs = qs[q]) ? ("{ico:msx-white:audiotrack} {dic:a" + q + "|" + qs + "}{br}") : "";
    };
    var F = function(l, c){
        var r = [];
        l.forEach(function(t){if(!c || t.Categories == c) r.push({
            headline: t.Title,
            image: t.Poster = t.Poster || t.IMDBID && (addr + "/msx/imdb/" + t.IMDBID) || "",
            icon: t.Poster ? "" : "msx-white-soft:search",
            titleFooter: Q(t.AudioQuality),
            stamp: "{ico:attach-file} " + t.Size + "{tb}{ico:north} " + t.Peer + " {ico:south} " + t.Seed,
            magnet: t.Magnet,
            group: "{dic:" + t.Categories + "|" + t.Categories + "}",
            cat: t.Categories == "Movie" ? "movie" : t.Categories == "Series" || t.Categories == "TVShow" ? "tv" : t.Categories
        })});
        return r;
    };
    var H = function(l, h, c){return {
        type: "list", cache: !!h, reuse: !!h, restore: !!h, items: l,
        headline: h ? ("{ico:search} " + h) : "",
        extension: c
            ? ("{ico:msx-white:filter-list} {dic:cat|Category}: " + "{dic:" + c + "|" + c + "}")
            : ("{ico:msx-white:" + (h ? "search" : "bookmarks") + "} " + l.length),
        template: {
            layout: "0,0,6,2", imageWidth: 1.3, imageFiller: "height", action: "execute:request:interaction:trnt",
            data: h 
                ? {link: "{context:magnet}", title: "{context:headline}", poster: "{context:image}", category: "{context:cat}"}
                : {link: "{context:id}"},
        },
        options: h ? opts("", [{key: "yellow", icon: "arrow-back", label: "{dic:label:cancel|Cancel}", action: "[cleanup|back]"}]) : null
    }};
    this.handleRequest = function(d, f){
        var r = !d || !d.data;
        d = r ? {action: "list"} : d.data;
        if (d.action) ajax(
            "/torrents", {action: "list"}, !r,
            r ? function(l){f(H(B(l)))} : function(){f({action: "[cleanup|reload:content|success]"})},
            r ? function(e){TVXInteractionPlugin.error(e); f()} : function(e){f({action: "error:" + e})}
        );
        else if (!d.find) f({action: "warn:{dic:empty|Nothing found}"});
        else ajax(
            "/search/?query=" + encodeURIComponent(d.find),
            function(l){
                l = F(l, d.cat = d.cat == "All" ? "" : d.cat);
                f(l.length
                    ? {action: "content:data", data: H(l, d.find, d.cat)}
                    : {action: "warn:{dic:empty|Nothing found}"}
                );
            },
            function(e){f({action: "error:" + e})}
        );
    }
}
function search(K){
    var S = TVXServices.storage.getFullStr("ts:search", ""), C = "All";
    var X = function(){
        var k = [{label: "1", key: "1", offset: K ? "1,0,0,0" : undefined}], l = K ? 1 : 0,
            e = [
                ["q","w","e","r","t","y","u","i","o","p","bracket_open","bracket_close"],
                ["a","s","d","f","g","h","j","k","l","semicolon","quote"],
                ["z","x","c","v","b","n","m","comma","period"]
            ],
            r = [
                ["й","ц","у","к","е","н","г","ш","щ","з","х","ъ"],
                ["ф","ы","в","а","п","р","о","л","д","ж","э"],
                ["я","ч","с","м","и","т","ь","б","ю"]
            ];
        if(K) k.push({type: "space"});
        for(var i = 2; i < 10; i++) k.push({label: i = TVXTools.strValue(i), key: i});
        if(K) k.push({type: "space"});
        k.push({label: "0", key: "0", offset: K ? "-1,0,0,0" : undefined});
        for(var y = 0; y < 3; y++){
            var b = K ? r : e, s = 10 + l * 2 - y * 1 - (y < 2 ? 1 : 2);
            for(var x = 0; x < s + 1; x++){
                var o = y == 1 ? .5 : y == 2 && x == 0 ? 1 : 0;
                if(y == 1 && x == s || y == 2 && x == 1) k.push({type: "space"});
                k.push({label: b[y][x], key: e[y][x], offset: (x == s ? "-" : "") + o + ",0,0,0"});
            }
        }
        k.push(
            {type: "space"},
            {label: K ? "ё" : "'", key: K ? "accent" : "quote", offset: "-1,0,0,0"},
            {label: "{ico:backspace}", titleFooter: "{ico:fast-rewind}", key: "delete|red", data: "bs", progress: 1, progressColor: "msx-red", offset: l + ",0,1,0"},
            {type: "space"}
        );
        if(K) k.push({type: "space"});
        k.push(
            {label: "{ico:clear}", titleFooter: "{ico:skip-previous}", key: "home", data: "cl", offset: "0,0,1,0"}, {type: "space"},
            {label: "{ico:space-bar}", titleFooter: "{ico:fast-forward}", key: "space|insert|yellow", data: " ", progress: 1, progressColor: "msx-yellow", offset: "0,0,1,0"}, {type: "space"},
            {label: "{ico:language}", titleFooter: "{ico:skip-next}", key: "tab|end", data: "ck", offset: "0,0,1,0", id: "lang"}, {type: "space"}, {type: "space"}
        );
        if(K) k.push({type: "space"});
        k.push({label: "{ico:done}", key: "green", data: "ok", progress: 1, progressColor: "msx-green", offset: (-l-1) + ",0,1,0"});
        return k;
    };
    this.handleData = function(d){
        if (d.data.length > 2) {
            C = d.data;
            TVXInteractionPlugin.executeAction("[cleanup|reload:content]");
        } else switch(d.data) {
            case "ok":
                if (S) {
                    TVXServices.storage.set("ts:search", S);
                    TVXInteractionPlugin.executeAction("execute:request:interaction:trns", {find: S, cat: C});
                }
                break;
            case "ck":
                K = !K;
                TVXInteractionPlugin.executeAction("[cleanup|reload:content]");
                break;
            case "cl":
                S = "";
            case "bs":
                S = S ? S.substr(0, S.length - 1) : "";
                d.data = "";
            default: TVXInteractionPlugin.executeAction(
                "update:content:underlay:search",
                {label: (S += d.data) ? (S + "{txt:msx-white-soft:_}") : "{txt:msx-white-soft:dic:input|Enter the word(s) to search}"}
            );
        }
    };
    this.handleRequest = function(_, f){f({
        type: "list", reuse: false, wrap: true, extension: "{ico:msx-white:search} rutor", items: X(),
        ready: {action: "interaction:load:" + window.location.href, data: ""},
        underlay: {items:[{id: "search", type: "space", layout: "0,0,12,1", color: "msx-black-soft", label: ""}]},
        template: {
            type: "button", layout: "0,0,1,1", area: K ? "0,1,12,5" : "1,1,10,5",
            action: "interaction:commit", data: "{context:label}", enumerate: false,
        }, options: opts("{dic:cat|Category}", ["All","","Movie","Series","DocMovie","DocSeries","TVShow","CartoonMovie","CartoonSeries","Anime"].map(function(c,i){
            return !c 
                ? {type: "space"}
                : {label: "{dic:" + c + "|" + c + "}", data: c, enable: c != C, offset: i ? undefined : "0,-.5,4,0"};
        }))
    })};
}
function torrent(){
    var X = [
        ["3g2","3gp","aaf","asf","avchd","avi","drc","flv","m2ts","ts","m2v","m4p","m4v","mkv","mng","mov","mp2","mp4","mpe","mpeg","mpg","mpv","mxf","nsv","ogg","ogv","qt","rm","rmvb","roq","svi",".vob","webm","wmv","yuv"],
        ["aac","aiff","ape","au","flac","gsm","it","m3u","m4a","mid","mod","mp3","mpa","pls","ra","s3m","sid","wav","wma","xm"]
    ];
    var D = null;
    var O = [["compress", "compress", "List"], ["folders", "folder-open"], "Show", ["viewed", "last-page", "Autofocus last"]].map(function(k){return {
        icon: k[1], label: "{dic:" + k[0] + "|" + k[2] + " " + k[0] + "}", data: k[0], action: "execute:request:interaction:menu@" + window.location.href
    }});
    this.handleRequest = function(d, f){
        if(!d || !d.data) ajax(
            "/stream/?stat" + ["link", "title", "poster", "category"].map(function(k){
                return D[k] ? ("&" + k + "=" + encodeURIComponent(D[k])) : "";
            }).join(""),
            function(t){ajax("/msx/trn?hash=" + t.hash, function(s){
                var ds = [], fs = [], sf = stor("folders"), cm = stor("compress"),
                    u = addr + "/stream/?play&link=" + encodeURIComponent(D.link) + "&index=";
                t.file_stats.forEach(function(f){
                    var t = f.path.lastIndexOf(".");
                    if(t >= 0){
                        var x = f.path.substr(t + 1).toLowerCase();
                        if(x) for(t = 0; t < X.length; t++) if(X[t].indexOf(x) >= 0) break;
                        else t = -1;
                    }
                    if(t < 0 || t > 1) return;
                    f.path = f.path.split("/");
                    f.name = f.path.pop();
                    if(f.path.length > 0) f.path.shift();
                    if((f.path = f.path.length ? f.path.join("/") : "") && (!ds.length || ds[ds.length - 1].label != f.path)){
                        ds.push({label: f.path, action: "[cleanup|focus:" + f.id + "]"});
                        if(sf) fs.push({type: "space", label: "{col:msx-yellow}" + f.path})
                    }
                    fs.push({
                        id: TVXTools.strValue(f.id),
                        icon: t ? "audiotrack" : "movie",
                        label: f.path[0],
                        group: "{ico:" + (t ? "audiotrack}" : "movie}"),
                        folder: f.path ? ("{ico:msx-yellow:folder} " + f.path + "{br}") : "",
                        extensionLabel: size(f.length),
                        action: t ? ("audio:" + u + f.id) : ("video:resolve:request:interaction:" + u + f.id + "@http://msx.benzac.de/interaction/play.html")
                    });
                });
                if(ds.length > 1) O.unshift({icon: "folder", key: "yellow", label: "{dic:folder|Select folder}", action: "panel:data", data: {
                    type: "list", headline: "{dic:folder|To folder}:", compress: true, items: ds,
                    template: {layout: "0,0,10,1", type: "control", icon: "msx-yellow:folder"}
                }});
                if(s !== true) O.unshift({
                    icon: "bookmark-add", key: "green", label: "{dic:save|Save the torrent}",
                    action: "execute:request:interaction:trns@" + window.location.href, data: {
                        action: "add", save_to_db: true, poster: t.poster, title: t.title, category: t.category
                    }
                })
                O.unshift({key: "red", label: "{dic:label:content|Content}", action: "[cleanup|reload:content]"})
                return {
                    type: "list", headline: t.title, compress: cm, items: fs,
                    ready: fs.length > 1 && stor("viewed") ? {action: "execute:request:interaction:trnt@" + window.location.href, data: t.hash} : null,
                    overlay: {items: {id: t.hash, type: "space", color: "none", stamp: "", stampColor: "", live: {
                        type: "setup", action: "execute:" + addr + "/msx/trn", data: "update:content:overlay:" + t.hash
                    }}},
                    template: {layout: cm ? "0,0,16,1" : "0,0,12,1", type: "control", progress: -1, playerLabel: t.title, properties: {
                        "info:text": "{context:folder}{ico:{context:icon}} {context:label}",
                        "info:image": d.poster || "default",
                        "control:type": "extended",
                        "resume:key": "url",
                        "trigger:complete": "[player:auto:next|resume:cancel]"
                    }}
                }
            })},
            function(e){
                TVXInteractionPlugin.error(e);
                f();    
            }
        );
        else if(typeof d.data == "string") ajax("/viewed", {action: "list", hash: d.data}, function(l){
            var i = 1;
            if(typeof l == "object") l.forEach(function(f){if(f.file_index > i) i = f.file_index});
            f({action: "focus:" + i});
        });
        else if(d.data.link){
            D = d.data;
            f({action: "content:request:interaction:trnt"});
        }else f({action: "request link is not set"});
    };
}
//initial menu:
TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler(new function(){
        addr = TVXServices.storage.getFullStr("ts:server", "");
        var R = TVXServices.storage.getBool("ts:russian");
        var P = {trns: new torrents(), find: new search(R), trnt: new torrent()};
        var M = {menu: [
            {icon: "bookmarks", label: "{dic:trns|My torrents}", data: "request:interaction:trns@" + window.location.href},
            {icon: "search", label: "{dic:srch|Search torrents}", data: "request:interaction:find@" + window.location.href},
            {icon: "folder", label: "{dic:fls|My files}", data: "request:interaction:access:" + addr + "@" + window.location.protocol + "//nb.msx.benzac.de/interaction"}
        ], options: opts("", [
            {key: "red", label: "{dic:caption:menu|menu}", action: "[cleanup|reload:menu]"},
            {key: "yellow", icon: "translate", label: R ? "Switch to english" : "Перевести на русский", action: "[execute:request:interaction:menu@" + window.location.href + "|reload]", data: "russian"}
        ]), logo: (addr = window.location.protocol + "//" + addr) + "/logo.png"};
        this.handleData = P.find.handleData;
        this.handleRequest = function(i, d, f){
            if (P[i] ) P[i].handleRequest(d, f);
            else if(d && d.data) stor(d.data, true);
            else ajax("/settings", {action: "get"}, function(d){
                M.menu[1].enable = d.EnableRutorSearch === true;
                if(typeof d == "string") TVXInteractionPlugin.error(d);
                ajax("/files", function(d){
                    M.menu[2].display = d ? true : false;
                    f(M);
                }, function(e){
                    M.menu[2].display = false;
                    f(M);
                });
            });
        };
    });
    TVXInteractionPlugin.init();
});
