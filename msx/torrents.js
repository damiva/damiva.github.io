var KEYBOARD = {
    en: [
        {"label": "1", "key": "1"},
        {"label": "2", "key": "2"},
        {"label": "3", "key": "3"},
        {"label": "4", "key": "4"},
        {"label": "5", "key": "5"},
        {"label": "6", "key": "6"},
        {"label": "7", "key": "7"},
        {"label": "8", "key": "8"},
        {"label": "9", "key": "9"},
        {"label": "0", "key": "0"},

        {"label": "q", "key": "q"},
        {"label": "w", "key": "w"},
        {"label": "e", "key": "e"},
        {"label": "r", "key": "r"},
        {"label": "t", "key": "t"},
        {"label": "y", "key": "y"},
        {"label": "u", "key": "u"},
        {"label": "i", "key": "i"},
        {"label": "o", "key": "o"},
        {"label": "p", "key": "p"},

        {"label": "a", "key": "a", "offset": ".5,0,0,0"},
        {"label": "s", "key": "s", "offset": ".5,0,0,0"},
        {"label": "d", "key": "d", "offset": ".5,0,0,0"},
        {"label": "f", "key": "f", "offset": ".5,0,0,0"},
        {"label": "g", "key": "g", "offset": ".5,0,0,0"},
        {"label": "h", "key": "h", "offset": ".5,0,0,0"},
        {"label": "j", "key": "j", "offset": ".5,0,0,0"},
        {"label": "k", "key": "k", "offset": ".5,0,0,0"},
        {"type": "space"},
        {"label": "l", "key": "l", "offset": "-.5,0,0,0"},

        {"label": "z", "key": "z", "offset": "1,0,0,0"},
        {"type": "space"},
        {"label": "x", "key": "x"},
        {"label": "c", "key": "c"},
        {"label": "v", "key": "v"},
        {"label": "b", "key": "b"},
        {"label": "n", "key": "n"},
        {"label": "m", "key": "m"},
        {"type": "space"},
        {"label": "'", "key": "quote", "offset": "-1,0,0,0"},

        {"label": "{ico:msx-blue:backspace}", "key": "delete|red", "data": "bs", "offset": "0,0,1,0", "progress": 1, "progressColor": "msx-red"},
        {"type": "space"},
        {"label": "{ico:msx-blue:clear}", "key": "home", "data": "cl", "offset": "0,0,1,0"},
        {"type": "space"},
        {"label": "{ico:msx-blue:space-bar}", "key": "insert|yellow", "data": " ", "offset": "0,0,1,0", "progress": 1, "progressColor": "msx-yellow"},
        {"type": "space"},
        {"label": "{ico:msx-blue:language}", "key": "tab|end", "data": "ru", "offset": "0,0,1,0"},
        {"type": "space"},
        {"type": "space"},
        {"label": "{ico:msx-blue:done}", "key": "green", "data": "ok", "offset": "-1,0,1,0", "progress": 1, "progressColor": "msx-green"}
    ],
    ru: [
        {"label": "1", "key": "1", "offset": "1,0,0,0"},
        {"type": "space"},
        {"label": "2", "key": "2"},
        {"label": "3", "key": "3"},
        {"label": "4", "key": "4"},
        {"label": "5", "key": "5"},
        {"label": "6", "key": "6"},
        {"label": "7", "key": "7"},
        {"label": "8", "key": "8"},
        {"label": "9", "key": "9"},
        {"type": "space"},
        {"label": "0", "key": "0", "offset": "-1,0,0,0"},

        {"label": "й", "key": "q"},
        {"label": "ц", "key": "w"},
        {"label": "у", "key": "e"},
        {"label": "к", "key": "r"},
        {"label": "е", "key": "t"},
        {"label": "н", "key": "y"},
        {"label": "г", "key": "u"},
        {"label": "ш", "key": "i"},
        {"label": "щ", "key": "o"},
        {"label": "з", "key": "p"},
        {"label": "х", "key": "bracket_open"},
        {"label": "ъ", "key": "bracket_close"},

        {"label": "ф", "key": "a", "offset": ".5,0,0,0"},
        {"label": "ы", "key": "s", "offset": ".5,0,0,0"},
        {"label": "в", "key": "d", "offset": ".5,0,0,0"},
        {"label": "а", "key": "f", "offset": ".5,0,0,0"},
        {"label": "п", "key": "g", "offset": ".5,0,0,0"},
        {"label": "р", "key": "h", "offset": ".5,0,0,0"},
        {"label": "о", "key": "j", "offset": ".5,0,0,0"},
        {"label": "л", "key": "k", "offset": ".5,0,0,0"},
        {"label": "д", "key": "l", "offset": ".5,0,0,0"},
        {"label": "ж", "key": "semicolon", "offset": ".5,0,0,0"},
        {"type": "space"},
        {"label": "э", "key": "quote", "offset": "-.5,0,0,0"},

        {"label": "я", "key": "z", "offset": "1,0,0,0"},
        {"type": "space"},
        {"label": "ч", "key": "x"},
        {"label": "с", "key": "c"},
        {"label": "м", "key": "v"},
        {"label": "и", "key": "b"},
        {"label": "т", "key": "n"},
        {"label": "ь", "key": "m"},
        {"label": "б", "key": "comma"},
        {"label": "ю", "key": "period"},
        {"type": "space"},
        {"label": "ё", "key": "accent|backslash", "offset": "-1,0,0,0"},

        {"label": "{ico:msx-blue:backspace}", "key": "delete|red", "data": "bs", "titleFooter":"{ico:fast-rewind}", "offset": "1,0,1,0", "progress": 1, "progressColor": "msx-red"},
        {"type": "space"},
        {"type": "space"},
        {"label": "{ico:msx-blue:clear}", "key": "home", "data": "cl", "titleFooter":"{ico:skip-previous}", "offset": "0,0,1,0"},
        {"type": "space"},
        {"label": "{ico:msx-blue:space-bar}", "key": "insert|yellow", "data": " ", "titleFooter":"{ico:fast-forward}", "offset": "0,0,1,0", "progress": 1, "progressColor": "msx-yellow"},
        {"type": "space"},
        {"label": "{ico:msx-blue:language}", "key": "tab|end", "data": "en", "titleFooter":"{ico:skip-next}", "offset": "0,0,1,0"},
        {"type": "space"},
        {"type": "space"},
        {"type": "space"},
        {"label": "{ico:msx-blue:done}", "key": "green", "data": "ok", "offset": "-2,0,1,0", "progress": 1, "progressColor": "msx-green"}
    ]
};
function Torrents(){
    var W = new TVXBusyService(), S = "", O = "", K = "ru";
    var AQ = function(q){
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
    var MT = function(t){return {
        id: t.hash,
        image: t.poster || "default",
        headline: t.title,
        titleFooter: "{ico:msx-white} " + SIZE(t.torrent_size),
        stamp: t.stat < 5 ? PEERS(t) : "",
        stampColor: t.stat > 4 ? "default" : t.stat == 4 ? "msx-red" : t.stat == 3 ? "msx-green" : "msx-yellow",
    }};
    var FT = function(t, i){return {
        id: i = TVXTools.strValue(i),
        image: t.Poster,
        headline: t.Title,
        text: AQ(t.AudioQuality),
        group: "{dic:" + t.Categories + "|" + t.Categories + "}",
        stamp: "{ico:attach-file} " + t.Size + "{tb}{ico:north} " + t.Peer + " {ico:south} " + t.Seed,
        live: !t.Poster && t.IMDBID ? {type: "setup", action: "interaction:commit:message:imdb", data: {imdb: t.IMDBID, id: i}} : null,
        Magnet: t.Magnet,
        Poster: t.Poster || t.IMDBID || ""
    }};
    var TS = function(l, w){return {
        type: "list", reuse: false, cache: false, restore: false,
        headline: w  ? ("{ico:search} " + w) : undefined,
        extension: w ? ("{ico:msx-white:search} " + l.length) : undefined,
        template: {
            imageWidth: 1.3, imageFiller: "height",
            icon: "msx-glass:" + (w ? "search" : "bookmark"),
            layout: "0,0,6,2",
            action: "execute:request:interaction:torrent", data: !w
                ? "{context:id}"
                : {link: "{context:Magnet}", title: "{context:headline}", poster: "{context:Poster}"},
            options: w ? null : OPTIONS(
                {label: "{dic:rem|Remove}", action: "interaction:commit:message:rem", data: "{context:id}"},
                null,
                {label: "{dic:drop|Drop}", action: "interaction:commit:message:drop", data: "{context:id}"}
            )
        },
        items: l.length ? l.map(w ? FT : MT) : EMPTY
    }};
    this.handleData = function(d){
        switch(d.message){
            case "imdb":
                IMDB(d.data.imdb, function(i){
                    if(i) TVXInteractionPlugin.executeAction("update:content:" + d.data.id, {image: i});
                    console.log(i);
                });
                return true;
            case "drop":
            case "rem": 
                TVXServices.ajax.post(
                    ADDR + "/torrents", '{"action":"' + d.message + '","hash":"' + d.data + '"}',
                    {
                        success: function(){TVXInteractionPlugin.executeAction("[cleanup|reload:content]")},
                        error: TVXInteractionPlugin.error
                    },
                    {dataType: "text"}
                );
                return true;
            case "key": switch(d.data){
                case "ok":
                    if(S != O) IMDB();
                    O = S;
                    TVXInteractionPlugin.executeAction("execute:request:interaction:find", S);
                    return true;
                case "ru":
                case "en":
                    K = d.data;
                    TVXInteractionPlugin.executeAction("reload:content");
                    return true;
                case "cl":
                    S = "";
                case "bs":
                    S = S ? S.substr(0, S.length - 1) : "";
                    d.data = "";
                default: 
                    S += d.data;
                    var l = d.data == " " ? (S + "{txt:msx-white-soft:_}") : S;
                    TVXInteractionPlugin.executeAction(
                        "update:content:underlay:val", 
                        {label: l || "{txt:msx-white-soft:dic:input|Enter the word(s) to search}"}
                    );
                    return true;
            }
            default: return false;
        }
    };
    this.handleRequest = function(i, d, f){
        switch(i){
            case "init":
                f({
                    name: "TorrServer Plugin",
                    version: "0.1.1",
                    reference: "request:interaction:menu@" + B,
                    dictionary: TVXServices.storage.getBool("russian", true) ? (B + "/msx/russian.json") : null
                });
                return true;
            case "menu":
                var r = false;
                W.start();
                TVXServices.ajax.post(ADDR + "/settings", '{"action":"get"}', {
                    success: function(s){r = s.EnableRutorSearch; W.stop()},
                    error: function(e){TVXInteractionPlugin.error(e); W.stop()}
                });
                W.onReady(function(){f({label: "TorrServer", menu:[
                    {icon: "history", label: "{dic:goon|Continue to see}", data: "request:interaction:goon@" + B},
                    {icon: "bookmarks", label: "{dic:trns|My torrents}", data: "request:interaction:trns@" + B},
                    {
                        icon: "search", label: "{dic:srch|Search torrents}", enable: r,
                        data: B + "/msx/kbd" + (TVXServices.storage.getBool("russian", true) ? "ru" : "en") + ".json"
                    },
                ]})});
                return true;
            case "trns":
                TVXServices.ajax.post(ADDR + "/torrents", '{"action":"list"}', {
                    success: function(l){f(TS(l))},
                    error: function(e){TVXInteractionPlugin.error(e); f();}
                });
                return true;
            case "srch":
                f({
                    type: "list", flag: "kbd", wrap: true, items: KEYBOARD[K],
                    underlay: {items: [{id: "val", label: "", color: "msx-glass", layout: "0,0,12,1", type: "space"}]},
                    ready: {action: "interaction:commit:message:key", data: ""},
                    template: {
                        type: "button", layout: "0,0,1,1", area: K == "en" ? "1,1,10,5" : "0,1,12,5", enumerate: false,
                        action: "interaction:commit:message:key", data: "{context:label}"
                    }
                });
            case "find":
                var m = function(e){f({action: e ? ("error:" + e) : "info:{dic:empty|Nothing found}"})};
                if(!d || !d.data) m();
                else TVXServices.ajax.get(ADDR + "/search/?query=" + TVXTools.strToUrlStr(d.data), {
                    success: function(l){
                        if(l.length) f({action: "content:data", data: TS(l, d.data)});
                        else m();
                    },
                    error: function(e){f({action: "error:" + e})}
                });
                return true;
            default: return false;
        }
    }
}