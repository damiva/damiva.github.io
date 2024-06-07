function search(K){
    var S = TVXServices.storage.getFullStr("ts:search:query", ""),
        P = [TVXServices.storage.getNum("ts:search:engine", 0), TVXServices.storage.getNum("ts:search:order", 0)];
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
    var ext = function(l){return "{ico:msx-white:search}" + (l !== undefined ? ((P[0] ? " Torrs: " : " Rutor: ") + l) : "")}
    var cat = function(c){return c == "Movie" ? "movie" : c == "Series" || c == "TVShow" ? "tv" : c};
    var itm = function(t, d, l, m, p, s, c, i){ return {
        image: i || undefined, imageWidth: i ? 0.7 : undefined, imageFiller: i ? "height" : undefined,
        text: "{col:msx-white}" + t,
        stamp: "{col:msx-white-soft}{ico:date-range} " + TVXDateFormatter.toDateStr(new Date(d))
            + "{tb}{ico:attach-file} " + l 
            + "{tb}{ico:north} " + p + " {ico:south} " + s,
        group: c ? catg(c) : null,
        action: "content:request:interaction:" 
            + [m, t, i, c].map(function(v){return encodeURIComponent(v || "")}).join("|") 
            + "@" + window.location.href
    }};
    var trs = function(t){return itm(t.title, t.createTime, t.sizeName, t.magnet, t.pir, t.sid)};
    var rtr = function(t){return itm(t.Title, t.CreateDate, t.Size, t.Magnet, t.Peer, t.Seed, cat(t.Categories), t.IMDBID ? (addr + "/msx/imdb/" + t.IMDBID) : "")};
    var fnd = function(d, f){
        if(!TVXTools.isArray(d) || d.length == 0) d = null;
        else if(P[0] || P[1]){
            var k = [["", "Peer", "CreateDate"], ["size", "pir", "createTime"]][P[0]][P[1]];
            d.sort(function(a, b){return a[k] < b[k] ? 1 : a[k] > b[k] ? -1 : 0});
        }
        return {
            type: "list", headline: "{ico:search} " + S, extension: ext(d.length),
            header: d ? {items: [{
                headline: "{ico:sort} {dic:label:order|Order}:", type: "space",
                layout: "0,0,12,1", color: "msx-glass", centration: "text", offset: "-.1,-.1,.2,.2"
            },{
                icon: "attach-file", label: P[0] ? "{dic:size|by size}" : "{dic:label:no|No}", type: "control", layout: "3,0,3,1",
                extensionIcon: icon(P[1] == 0, true), data: {opt: 10}, action: "interaction:load:" + window.location.href
            },{
                icon: "north", label: "{dic:peers|by peers}", type: "control", layout: "6,0,3,1",
                extensionIcon: icon(P[1] == 1, true), data: {opt: 11}, action: "interaction:load:" + window.location.href
            },{
                icon: "date-range", label: "{dic:date|by date}", type: "control", layout: "9,0,3,1",
                extensionIcon: icon(P[1] == 2, true), data: {opt: 12}, action: "interaction:load:" + window.location.href},
            ]} : null,
            template: {layout: "0,0,12,1"}, items: d ? d = d.map(f) : [{label: "{dic:empty|Nothing found}!", action: "[]"}]
        };
    };
    this.handleData = function(d){
        if(typeof d.data.key == "string") switch(d = d.data.key){
            case "ok":
                if(S){
                    TVXServices.storage.set("ts:search:query", S);
                    TVXInteractionPlugin.executeAction("content:request:interaction:find@" + window.location.href);
                }
                return true;
            case "ck":
                K = !K;
                TVXInteractionPlugin.executeAction("reload:content>lang");
                return true;
            case "cl":
                S = "";
            case "bs":
                S = S ? S.substr(0, S.length - 1) : "";
                d = "";
            default: TVXInteractionPlugin.executeAction(
                "update:content:underlay:val",
                {label: (S += d) ? (S + "{txt:msx-white-soft:_}") : "{col:msx-white-soft}{dic:input|Enter the word(s) to find}"}
            );
            return true;
        } else if (typeof d.data.opt == "number") {
            var o = d.data.opt < 10 ? 0 : 1;
            TVXServices.storage.set("ts:search:" + ["engine", "order"][o], P[o] = d.data.opt - o * 10);
            TVXInteractionPlugin.executeAction("[cleanup|reload:content]")
            return true;
        }
        return false;
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
                        options: opts(d, "{dic:find|Search}", ": " + d[P[0]].label),
                        underlay: {items:[{id: "val", type: "space", layout: "0,0,12,1", color: "msx-black-soft", label: ""}]},
                        template: {
                            type: "button", layout: "0,0,1,1", area: K ? "0,1,12,5" : "1,1,10,5", enumerate: false,
                            action: "interaction:commit", data: {key: "{context:label}"}
                        },
                    });
                });
                return true;
            case "find":
                var e = function(e){TVXInteractionPlugin.error(e);f();}
                if(P.engine) proxy(
                    "https://torrs.ru/search?query=" + encodeURIComponent(S) + (P.engine == 2 ? "&accurate" : ""),
                    {success: function(d){f(fnd(d, trs))}, error: e}
                );
                else ajax("/search/?query=" + encodeURIComponent(S), function(d){f(fnd(d, rtr))}, e);
                return true;
            default: return false;
        }
    }
}
