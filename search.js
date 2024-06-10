function search(K){
    var S = TVXServices.storage.getFullStr("ts:search:query", ""),
        P = [TVXServices.storage.getNum("ts:search:engine", 0), TVXServices.storage.getNum("ts:search:order", 0)],
        L = false;
    var kbd = function(){
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
            {label: "{ico:backspace}", titleFooter: "{ico:fast-rewind}", key: "delete|red", data: {key: "bs"}, progress: 1, progressColor: "msx-red", offset: l + ",0,1,0"},
            {type: "space"}
        );
        if(K) k.push({type: "space"});
        k.push(
            {label: "{ico:clear}", titleFooter: "{ico:skip-previous}", key: "home", data: {key: "cl"}, offset: "0,0,1,0"}, {type: "space"},
            {label: "{ico:space-bar}", titleFooter: "{ico:fast-forward}", key: "space|insert|yellow", data: {key: " "}, progress: 1, progressColor: "msx-yellow", offset: "0,0,1,0"}, {type: "space"},
            {label: "{ico:language}", titleFooter: "{ico:skip-next}", key: "tab|end", data: {key: "ck"}, offset: "0,0,1,0", id: "lang"}, {type: "space"}, {type: "space"}
        );
        if(K) k.push({type: "space"});
        k.push({label: "{ico:done}", key: "green", data: {key: "ok"}, progress: 1, progressColor: "msx-green", offset: (-l-1) + ",0,1,0"});
        return k;
    };
    var key = function(d){
        switch(d){
            case "ok":
                if(S){
                    TVXServices.storage.set("ts:search:query", S);
                    TVXInteractionPlugin.executeAction("content:request:interaction:find@" + window.location.href);
                }
                break;
            case "ck":
                K = !K;
                TVXInteractionPlugin.executeAction("reload:content>lang");
                break;
            case "cl":
                S = "";
            case "bs":
                S = S ? S.substr(0, S.length - 1) : "";
                d = "";
            default: TVXInteractionPlugin.executeAction(
                "update:content:underlay:val",
                {label: (S += d) ? (S + "{txt:msx-white-soft:_}") : "{col:msx-white-soft}{dic:input|Enter the word(s) to find}"}
            );
        }
    };
    var opt = function(d){
        var o = d < 10 ? 0 : 1;
        TVXServices.storage.set("ts:search:" + ["engine", "order"][o], P[o] = d - o * 10);
        TVXInteractionPlugin.executeAction("[cleanup|reload:content]")
    };
    var pld = function(d){
        ajax(
            L ? "/torrents" : ("/stream/?preload&link=" + encodeURIComponent(d.preload), "text"),
            L ? {action: "drop", hash: d.id} : false,
            "text",
            function(){
                TVXInteractionPlugin.executeAction("data", [{
                    action: "update:panel:key", data: {label: L ? "{dic:drop|Drop the torrent}" : "{dic:load|Preload the torrent}"}
                }, L ? {
                    action: "update:panel:" + d.id, data: {stampColor: "default"}
                } : {
                    action: "execute:" + addr + "/msx/trn", data: "update:panel:" + d.id
                }]);
                L = !L;
            },
            function(e){
                TVXInteractionPlugin.error(e);
            }
        );
    };
    var ext = function(l){return "{ico:msx-white:search}" + (l !== undefined ? ((P[0] ? " Torrs: " : " Rutor: ") + l) : "")};
    var cat = function(c){return c == "Movie" ? "movie" : c == "Series" || c == "TVShow" ? "tv" : c};
    var quv = function(t){return {
        100: "720 WebDL",
        101: "720 BDRip",
        102: "720 HEVC BDRip",
        200: "1080 WebDL",
        201: "1080 BDRip",
        202: "1080 HEVC BDRip",
        203: "1080 BDRemux",
        300: "2160 SDR WebDL",
        301: "2160 HDR WebDL",
        302: "2160 DV WebDL",
        303: "2160 SDR BDRip",
        304: "2160 HDR BDRip",
        305: "2160 DV BDRip",
        306: "UHD SDR BDRemux",
        307: "UHD HDR BDRemux",
        308: "UHD DV BDRemux"
    }[t] || "-"}
    var qua = function(t){return {
        1: "Авторский",
        100: "Любит. одноголосый",
        101: "Любит. двухголосый",
        102: "Любит. многоголосый",
        103: "Любит. студия",
        200: "Проф. одноголосый",
        201: "Проф. двухголосый",
        202: "Проф. многоголосый",
        203: "Проф. студия",
        300: "Дубляж",
        301: "Лицензия"
    }[t] || "-"}
    var fnd = function(d){
        if(!TVXTools.isArray(d) || d.length == 0) d = null;
        else if(P[0] || P[1]){
            var k = P[0] ? ["size", "pir", "createTime"][P[1]] : ["", "Peer", "CreateDate"][P[1]];
            d.sort(function(a, b){return a[k] < b[k] ? 1 : a[k] > b[k] ? -1 : 0});
        }
        return {
            type: "list", headline: "{ico:search} " + S, extension: ext(d ? d.length : 0),
            header: d ? {items: [{
                headline: "{ico:sort} {dic:label:order|Order}:", type: "space",
                layout: "0,0,12,1", color: "msx-glass", centration: "text", offset: "-.1,-.1,.2,.2"
            },{
                icon: P[0] ? "attach-file" : "radar", label: P[0] ? "{dic:size|by size}" : "{dic:accuracy|by accuracy}", type: "control", layout: "3,0,3,1",
                extensionIcon: icon(P[1] == 0, true), data: {search: 10}, action: "interaction:load:" + window.location.href
            },{
                icon: "north", label: "{dic:peers|by peers}", type: "control", layout: "6,0,3,1",
                extensionIcon: icon(P[1] == 1, true), data: {search: 11}, action: "interaction:load:" + window.location.href
            },{
                icon: "date-range", label: "{dic:date|by date}", type: "control", layout: "9,0,3,1",
                extensionIcon: icon(P[1] == 2, true), data: {seach: 12}, action: "interaction:load:" + window.location.href},
            ]} : null,
            template: {layout: "0,0,12,1"},
            items: !d ? [{label: "{dic:empty|Nothing found}!", action: "[]"}] : d.map(function(t){
                t.act = "content:request:interaction:" + encodeURIComponent(t.Magnet || t.magnet) + "|" + encodeURIComponent(t.Title || t.title);
                if(!t.Hash){
                    t.Hash = t.magnet.substr(t.magnet.indexOf("xt=urn:btih:") + 12);
                    t.Hash = t.Hash.substr(0, t.Hash.indexOf("&"));
                }else{
                    t.Poster = t.Poster || (t.IMDBID ? (t.IMDBID = addr + "/msx/imdb/" + t.IMDBID) : "");
                    t.Link += "|" + encodeURIComponent(t.Poster) + "|" + t.encodeURIComponent(cat(t.Categories));            
                }
                return {
                    image: t.Poster, 
                    imageWidth: t.Poster ? 0.7 : undefined, imageFiller: t.Poster ? "height" : undefined,
                    text: "{col:msx-white}" + (t.Title = t.Title || t.title),
                    stamp: "{col:msx-white-soft}{ico:date-range} " + TVXDateFormatter.toDateStr(new Date(t.CreateDate || t.createTime))
                        + "{tb}{ico:attach-file} " + (t.Size || t.sizeName)
                        + "{tb}{ico:north} " + (t.Peer || t.pir) + " {ico:south} " + (t.Seed || t.sid),
                    action: t.act + "@" + window.location.href,
                    options: opts([
                        {type: "space", offset: "0,0,0,1", headline: t.Title},
                        {type: "space"},
                        {type: "space", text: "{col:msx-white}" + (t.Name || t.name)},
                        {
                            type: "space", offset: "0,0,0,1", id: t.Hash, progress: -1, stampColor: "",
                            text:
                                "{br}{ico:msx-white:theater-comedy} "   + (t.Categories || t.types.join(", ")) +
                                "{br}{ico:msx-white:video-settings} "   + (t.VideoQuality ? quv(t.VideoQuality) : (t.quality + " " + t.videotype)) +
                                "{br}{ico:msx-white:audiotrack} "       + (t.AudioQuality ? qua(t.AudioQuality) : t.voices.join(", ")),
                            titleFooter: "{ico:msx-white:attach-file} " + (t.Size || t.sizeName),
                            stamp: "{tb}{ico:north} " + (t.Peer || t.pir) + " {ico:south} " + (t.Seed || t.sid),
                        },
                        {type: "space"},
                        {
                            id: "key",
                            type: "button", label: !t.Hash ? "{dic:label:ok|OK}" : L ? "{dic:drop|Drop the torrent}" : "{dic:load|Preload the torrent}",
                            data: {preload: t.Magnet || t.magnet, id: t.Hash}, action: t.Hash ? undefined : "cleanup"
                        }
                    ], "{dic:info|Torrent's info}", "", "{idc:msx-white:bolt} " + (t.Tracker || t.trackerName))
                };        
            }) 
        };
    };
    this.handleData = function(d){
        var r = false;
        if(r = typeof d.data.key == "string") key(d.data.key);
        else if (r = typeof d.data.search == "number") opt(d.data.seach);
        else if (r = typeof d.data.preload == "string") pld(d.data);
        return r;
    };
    this.handleRequest = function(i, _, f){
        switch(i){
            case "search":
                ajax("/settings", {action: "get"}, function(d){
                    if(!(d = d.EnableRutorSearch === true) && !P[0]) P[0] = 1;
                    d = [
                        ["{dic:rutor|in Rutor (embeded)}", "rutor.png"],
                        ["{dic:torrs|in Torrs}", "torrs.png"],
                        ["{dic:torrs|in Torrs} ({dic:accurate|accurate})", "torrs.png"]
                    ].map(function(o, i){return {
                        label: o[0], image: window.location.origin + "/img/" + o[1], extensionIcon: icon(P[0] == i, true), data: {opt: i}, display: !i || d
                    }});
                    f({
                        type: "list", reuse: false, cache: false, restore: false, wrap: true, extension: ext(), items: kbd(),
                        ready: {action: "interaction:load:" + window.location.href, data: {key: ""}},
                        options: opts(d, "{dic:find|Search}", " " + d[P[0]].label),
                        underlay: {items:[{id: "val", type: "space", layout: "0,0,12,1", color: "msx-black-soft", label: ""}]},
                        template: {
                            type: "button", layout: "0,0,1,1", area: K ? "0,1,12,5" : "1,1,10,5", enumerate: false,
                            action: "interaction:commit", data: {key: "{context:label}"}
                        },
                    });
                });
                return true;
            case "find":
                var s = encodeURIComponent(S);
                ajax(
                    P[0] ? (
                        "/msx/proxy?url=" + encodeURIComponent("https://torrs.ru/search?query=" + s + (P[0] == 2 ? "&accurate" : ""))
                    ) : (
                        "/search/?query=" + s
                    ),
                    function(d){f(fnd(d))},
                    function(e){TVXInteractionPlugin.error(e);f();}
                );
                return true;
            default: return false;
        }
    }
}