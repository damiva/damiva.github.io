function Torrents(P){
    var R = false, K = SETS("russian"), S = "",
        I = function(v){return v ? "msx-white:toggle-on" : "toggle-off"};
    this.init = function(w){
        AJAX("/settings", {action: "get"}, function(d){
            R = d.EnableRutorSearch;
            w.stop();
        }, function(e){
            P.error(e);
            w.stop();
        });
    };
    this.handleRequest = function(i, f, e){
        var c = SETS("compress"), a = null;
        vonsole.log(i);
        switch(i){
            case "menu":
                f({logo: ADDR + "/logo.png", menu: [
                    {icon: "bookmarks", label: "{dic:trns|My torrents}", data: "request:interaction:trns"},
                    {icon: "search", label: "{dic:find|Search torrents}", data: "request:interaction:keys", enable: R},
                    {icon: "settings", label: "{dic:label:settings|Settings}", data: "request:interaction:sets"}
                ]});
                return true;
            case "sets":
                var w = new TVXBusyService(), v = "TorrServer ", r = SETS("russian");
                w.start();
                AJAX("/echo", "", function(d){v += d});
                w.onReady(function(){f({
                    type: "list", extension: v,
                    template: {enumerate: false, type: "control", action: "interaction:commit:message:set", data: "{context:id}", layout: "0,0,12,1"},
                    items: [
                        {id: "russian", icon: "translate", label: r ? "Switch to english" : "Перевести на русский", extensionIcon: "msx-red:restart-alt"},
                        {id: "rutor", icon: "search", label: "{dic:find|Search torrents} (rutor)", extensionIcon: I(R)},
                        {id: "compress", icon: "compress", label: "{dic:comprtess|Smaller font in lists}", extensionIcon: I(c)},
                        {id: "folders", icon: "folder", label: "{dic:folders|Show folders in torrents}", extensionIcon: I(SETS("folders"))},
                        {id: "backgrgound", icon: "image", label: "{dic:background|Random image for audio player}", extensionIcon: I(SETS("background"))},
                        {icon: "logout", label: "{dic:label:exit|Exit}", action: "exit"}
                    ]
                })});
                return true
            case "keys":
                var l = K ? 12 : 10, is = [], ks = [[
                    ["q","w","e","r","t","y","u","i","o","p","bracket_open","bracket_close"],
                    ["a","s","d","f","g","h","j","k","","l","semicolon","quote"],
                    ["z","","x","c","v","b","n","m","","comma","period","accent"],
                ],[
                    ["й","ц","у","к","е","н","г","ш","щ","з","х","ъ"],
                    ["ф","ы","в","а","п","р","о","л","","д","ж","э"],
                    ["я","","ч","с","м","и","т","ь","","б","ю","ё"]
                ]];
                ["1","2","3","4","5","6","7","8","9","0"].forEach(function(k, i){
                    if(i == 9 && K) is.push({type: "space"});
                    is.push({label: k, key: k, offset: K && i == 0 ? "1,0,0,0" : K && i == 9 ? "-1,0,0,0" : undefined});
                    if(i == 0 && K) is.push({type: "space"});
                });
                for(var y = 0; y < 4; y++) for(var x = 0; x < l; x++){
                    var k = ks[K ? 1 : 0][y][x];
                    is.push(!k
                        ? {type: "space"} : k == "comma" ? {label: "'", key: "quote"}
                        : {label: k, key: ks[0][y][x], offset: y == 1 && x > 7 ? "-.5,0,0,0" : y == 2 && x == 0 ? "1,0,0,0" : y == 2 && x > 6 ? "-1,0,0,0" : y == 1 ? ".5,0,0,0" : undefined}
                    );
                }
                is.push(
                    {label: "{ico:backspace}", key: "delete|red", data: "bs", offset: "0,0,1,0", progress: 1, progressColor: "msx-red"},
                    {type: "space"},
                    {label: "{ico:clear}", key: "home", data: "cl", offset: "0,0,1,0"}, 
                    {type: "space"},
                    {label: "{ico:space-bar", key: "insert|yellow", data: " ", offset: "0,0," + (l - 9) + ",0", progress: 1, progressColor: "msx-yellow"},
                    {type: "space"}, {type: "space"}
                );
                if(K) is.push({type: "space"}, {type: "space"});
                is.push(
                    {label: "{ico:language}", key: "tab", data: "ck", offset: "-1,0,1,0"}, {type: "space"},
                    {label: "{ico:done}", key: "end|green", data: "ok", offset: "-1,0,1,0", progress: 1, progressColor: "msx-green"}
                );
                f({
                    type: "list", extension: "rutor", items: is,
                    underlay: {items:[{type: "space", color: "msx-black-soft", headline: S, id: "val", layout: "0,0,12,1", text: "", alignment: "center"}]},
                    template: {type: "button", action: "interaction:commit:message:key", data: "{context:label}", layout: "0,0,1,1", area: "0,1," + l + ",5"}
                });
                return true;
            case "find":
                a = function(q){
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
            case "trns":
                AJAX(!a ? "/torrents" : "/search/?query=", !a ? {action: "list"} : encodeURIComponent(S), function(d){f({
                    type: "list", headline: "{ico:search} " + S, extension: "{ico:msx-white:list} " + d.length,
                    compress: c, reuse: !!a, cache: !!a, restore: !!a,
                    template: {
                        imageWidth: 1.3, imageFiller: "height", layout: c ? "0,0,8,1" : "0,0,6,1",
                        action: "interaction:commit:message:" + (i ? "get" : "add"),
                        data: i ? {link: "{context:id}"} : {link: "{context:magnet}", title: "{context:headline}", poster: "{context:image}", group: "{context:group}"},
                        options: a ? null : OPTS(
                            {label: "{dic:rem|Remove the torrent}", action: "rem", data: "{context:id}"}, null,
                            {label: "{dic:drop|Drop the torrent}", action: "drop", data: "{context:id}"}
                        )
                    },
                    items: d.map(!a ? function(t){return {
                        id: t.hash,
                        image: t.poster,
                        headline: t.title,
                        group: t.data && t.data.substr(0, 4) == "GRP:" ? t.data.substr(4) : "",
                        stamp: "{ico:attach-file} " + SIZE(t.torrent_size) + (t.stat > 4 ? "" : ("{tb}{ico:north} " + (t.active_peers || 0) + " · " + (t.pending_peers || 0) + " / " + (t.total_peers || 0))),
                        stampColor: t.stat > 4 ? "" : t.stat == 4 ? "msx-red" : t.stat == 3 ? "msx-green" : "msx-yellow"
                    }} : function(t){return {
                        image: t.Poster,
                        headline: t.Title,
                        group: "{dic:rutor:" + t.Categories + "|" + t.Categories + "}",
                        titleFooter: a(t.AudioQuality),
                        stamp: "{ico:attach-file} " + t.Size + "{tb}{ico:north} " + t.Peer + " {ico:south} " + t.Seed,
                        magnet: t.Magnet
                    }})
                })}, e);
                return true;
            default: return false
        }
    }
    this.handleData = function(d){
        switch(d.message){
            case "rem":
            case "drop":
                AJAX("/torrents", {action: d.message, hash: d.data}, function(){P.executeAction("[cleanup|reload:content]")});
                return true;
            case "set":
                switch(d.data){
                    case "russian":
                        SETS(d.data, true);
                        P.executeAction("reload");
                        break;
                    case "rutor":
                        AJAX("/settings", {action: "get"}, function(s){
                            s.EnableRutorSearch = !R;
                            s.action = "set";
                            AJAX("/settings", s, function(){
                                R = !R;
                                P.executeAction("reload:menu");
                            });
                        }, P.error);
                        break;
                    default: P.executeAction("update:content:" + d.data, {extensionIcon: I(SETS(d.data, true))});
                }
                return true;
            case "key":
                switch(d.data){
                    case "ok":
                        P.showContent("request:interaction:find");
                        break;
                    case "ck":
                        K = !K;
                        P.executeAction("reload:content");
                        break;
                    case "cl":
                        S = "";
                    case "bs":
                        S = S ? S.substr(0, S.length - 1) : "";
                        d.data = "";
                    default: 
                        if(d.data == " ") AJAX("/search/?query=", encodeURIComponent(S), function(d){
                            P.executeAction("update:content:underlay:val", {text: "{dic:found|Found}: " + d.length});
                        });
                        P.executeAction("update:content:underlay:val", {headline: S += d.data, text: ""});
                }
                return true;
            default: return false;
        }
    };
}