function size(s){
    var i = s == 0 ? 0 : Math.floor(Math.log(s) / Math.log(1024));
    return (s / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}
function opts(h){
    var o = {headline: h, caption: h, template: {layout: "0,0,8,1", type: "control", enumerate: false}, items: []};
    for(i = 1; i < arguments.length; i++) if(arguments[i]){
        if(arguments[i].key){
            arguments[i].icon = "msx-" + arguments[i].key + ":stop";
            o.caption += "{tb}{ico:" + arguments[i].icon + "} " + (arguments[i].key == "yellow" ? "{ico:refresh}" : arguments[i].label);
        }else if(arguments[i].enable === false){
            o.caption += " " + arguments[i].label;
            o.template.type = "button";
            o.template.enumerate = true;
        }
        o.items.push(arguments[i]);
    }
    return o.items.length ? o : null;
}
function menu(S, A, R){
    var M = {logo: A + "/logo.png", menu: [
        {icon: "bookmarks", label: "{dic:trns|My torrents}", data: "request:interaction:trns@" + window.location.href},
        {icon: "search", label: "{dic:srch|Search torrents}", data: "request:interaction:find@" + window.location.href},
        {icon: "folder", label: "{dic:fls|My files}", data: "request:interaction:access:" + S + "@" + window.location.protocol + "//nb.msx.benzac.de/interaction"},
    ], options: opts(
            "{dic:caption:options|Opts}:",
            {key: "red", label: R ? "Switch to english" : "Перевести на русский", action: "[execute:request:interaction:menu@" + window.location.href + "|reload]"},
            {key: "yellow", label: "{dic:label:reload|Reload} {dic:caption:menu|menu}", action: "[cleanup|reload:menu]"}
        )
    };
    this.request = function(d, f){
        if(d) TVXServices.storage.set("ts:russian", !R);
        else TVXServices.ajax.post(A + "/settings", '{"action":"get"}', {
            success: function(d){
                M.menu[1].display = d.EnableRutorSearch;
                TVXServices.ajax.get(A + "/files", {
                    success: function(d){
                        M.menu[2].display = d ? true : false;
                        f(M);
                    },
                    error: function(e){
                        M.menu[2].display = false;
                        TVXInteractionPlugin.error(e)
                        f(M);
                    }
                })
            },
            error: function(e){TVXInteractionPlugin.error(e);f();}
        });
    };
}
function trns(A){
    var B = function(l){return l.map(function(t){return {
        id: t.hash,
        headline: t.title,
        image: t.poster,
        icon: t.poster ? "" : "msx-white-soft:bookmark",
        titleFooter: "{ico:msx-whit:attach-file} " + size(t.torrent_size),
        live: t.stat < 5 ? {type: "setup", action: "execute:" + A + "/msx/trn", data: "update:content:" + t.hash} : null
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
    }
    var F = function(l, c){
        var r [];
        l.forEach(function(t){if(!c || c == "All" || t.Categories == c) r.push({
            headline: t.Title,
            image: t.Poster = t.Poster || t.IMDBID && (A + "/msx/imdb/" + t.IMDBID) || "",
            icon: t.Poster ? "" : "msx-white-soft:search",
            text: Q(t.AudioQuality),
            titleFooter: "{ico:msx-whit:attach-file} " + t.Size,
            stamp: "{ico:north} " + t.Peer + " {ico:south} " + t.Seed,
            magnet: t.Magnet
        });
        return r;
    })};
    var L = function(l, h, c){
        l = h ? F(l, c) : B(l);
        return {
            type: "list", cache: h ? true : false, reuse: h ? true : false, restore: h ? true : false,
            headline: h ? ("{ico:search} " + s) : "", extension: (h ? "{ico:search} " : "{ico:bookmarks} ") + l.length,
            template: {
                layout: l.length ? "0,0,6,2" : "0,0,12,1", imageWidth: 1.3, imageFiller: "height", 
                action: "execute:request:interaction:trn@" + window.location.href, 
                data: h ? {link: "{context:magnet}", title: "{context:headline}", poster: "{context:image}", category: "{context:category}"} : "{content:id}",
                options: h || !l.length ? null : opts(
                    "{dic:caption:options|Opts}:",
                    {key: "red", label: "{dic:rem|Remove the torrent}", action: "request:interaction:trns@" + window.location.href, data: {action: "rem", hash: "{context:id"}},
                    {key: "green", label: "{dic:drop|Drop the torrent}", action: "request:interaction:trns@" + window.location.href, data: {action: "drop", hash: "{context:id"}},
                    {key: "yellow", label: "{dic:label:reload|Reload} {dic:label:content|Content}", action: "[cleanup|reload:content]"}
                )
            },
            items: l.length ? l : [{icon: h ? "west" : "refresh", label: "{dic:empty|Nothing found}", action: h ? "back" : "reload:content"}]
        }
    };
    this.request = function(d, f){
        if(!(d = d && d.data)) d = {action: "list"};
        if(d.action) TVXServices.ajax.post(A + "/torrents", JSON.stringify(d), {
            success: d.hash
                ? function(){f({action: "[cleanup|reload:content|success"})} 
                : function(l){f(L(l))},
            error: d.hash
                ? function(e){f({action: "error:" + e})}
                : function(e){TVXInteractionPlugin.error(e); f();},
            dataType: d.hash ? "text" : "json"
        });
        else TVXServices.ajax.get(A + "/search/?query=" + encodeURIComponent(d.find), {
            success: function(l){f(L(l, d.find, f.cat))},
            error: function(e){f({action: "error:" + e})}
        });
    };
}
function find(R){
    var S = TVXServices.storage.getFullStr("ts:search"), C = "All",
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
    [true, false].forEach(function(K){
        var k = [{label: "1", key: "1", offset: K ? "1,0,0,0" : undefined}], l = K ? 1 : 0;
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
            {label: "{ico:space-bar}", titleFooter: "{ico:fast-forward}", key: "insert|yellow", data: " ", progress: 1, progressColor: "msx-yellow", offset: "0,0,1,0"}, {type: "space"},
            {label: "{ico:language}", titleFooter: "{ico:skip-next}", key: "tab|end", data: "ck", offset: "0,0,1,0", id: "lang"}, {type: "space"}, {type: "space"}
        );
        if(K) k.push({type: "space"});
        k.push({label: "{ico:done}", key: "green", data: "ok", progress: 1, progressColor: "msx-green", offset: (-l-1) + ",0,1,0"});
        if(K) r = k;
        else e = k;
    });
    this.data = function(d){
        var a = TVXInteractionPlugin.executeAction;
        if(d.data.length > 2){
            C = d.data;
            a("reload:content");
        }else switch(d.data){
            case "ok":
                if(S){
                    TVXServices.storage.set("ts:search", S);
                    a("execute:request:interaction:trns", {find: S, cat: C});
                }
                break;
            case "ck":
                R = !R;
                a("reload:content");
                break;
            case "cl":
                S = "";
            case "bs":
                S = S ? S.substr(0, S.length - 1) : "";
                d.data = "";
            default: a("update:content:underlay:s", {label: (S += d.data) ? (S + "{txt:msx-white-sfot:_") : "{txt:msx-white-soft:dic:input|Enter the word(s) to search}"});
        }
    };
    this.request = function(_, f){f({
        type: "list", extension: "rutor", items: R ? r : e,
        ready: {action: "interaction:load:" + window.location.href, data: ""},
        underlay: {items: [{id: "s", type: "space", color: "msc-black-soft", label: ""}]},
        template: {type: "button", layout: "0,0,1,1", area: R ? "0,1,12,5" : "1,1,10,5", action: "interaction:commit", data: "{context:label}"},
    })};
}
function trn(A){
    var L = {};
    this.request = function(d, f){
        if(!d){
            var e = function(m){TVXInteractionPlugin.error(e);f();};
            TVXServices.ajax.get(
                A + "/stream/?stat&" + ["link", "title", "poster", "category"].map(function(k){return k + "=" + encodeURIComponent(L[k])}).join("&"),
                {success: function(t){
                    TVXInteractionPlugin.ajax.get(A + "/msx/trn?hash=" + t.hash, {success: function(s){
                        
                    }, error: e});
                }, error: e}
            );
        }else if(d.data){
            L = typeof d.data == "object" ? d.data : {link: d.data};
            f({action: "content:request:interaction:trn@" + window.location.href});
        }else f({action: "error:data is not set"});
    }
}
TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler(new function(){
        var s = TVXServices.storage.getFullStr("ts:server", ""),
            r = TVXServices.storage.getBool("ts:russian", true),
            p = {
                menu: new menu(s, s = window.location.protocol + "//" + s, r),
                find: new find(r),
                trns: new trns(s),
                trn: new trn(s)
            };
        this.handleData = p.srch.data;
        this.handleRequest = function(i, d, f){
            if(p[i]) p[i].request(d, f);
            else {
                TVXInteractionPlugin.error("wrong request id: " + i);
                f();
            }
        };
    });
    TVXInteractionPlugin.init();
});
