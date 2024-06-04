var menu = [
        {icon: "bookmarks", label: "{dic:trns|My torrents}", data: "request:interaction:torrents@" + window.location.href},
        {icon: "search", label: "{dic:srch|Search torrents}", data: "request:interaction:keyboard@" + window.location.href},
        {icon: "folder", label: "{dic:fls|My files}", data: "request:interaction:/@" + window.location.href}
];
function size(s){
    var i = s == 0 ? 0 : Math.floor(Math.log(s) / Math.log(1024));
    return (s / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}
function opts(){
    var o = {caption: "{dic:caption:options|opt/menu}", template: {enumerate: false, type: "control", layout: "0,0,8,1"}, items: []};
    o.headline = o.caption + ":";
    for(var i = 0; i < arguments.length; i++) if(arguments[i]){
        if(arguments[i].key){
            var r = !arguments[i].icon;
            arguments[i].progress = 1;
            arguments[i].progressColor = "msx-" + arguments[i].key;
            if(r) arguments[i].icon = "refresh";
            o.caption += "{tb}{col:" + arguments[i].progressColor + "}{ico:" + arguments[i].icon + "}" + (r ? "" : (" " + arguments[i].label));
        }
        o.items.push(arguments[i]);
    }
    return o.items.length ? o : null;
}
function torrents(d){return {
    type: "list", cache: false, reuse: false, restore: false, extension: "{ico:msx-white:bookmarks} " + d.length,
    template: {layout: "0,0,6,1", imageWidth: 1.3, imageFiller: "height"}, items: d.map(function(t){return {
        id: t.hash,
        headline: t.title,
        image: t.poster,
        icon: t.poster ? "" : "msx-white-soft:bookmark",
        titleFooter: "{ico:msx-white:attach-file} " + size(t.torrent_size),
        stamp: t.stat > 4 ? "" : ("{ico:north} " + (t.active_peers || 0) + " / " + (t.total_peers || 0) + " {ico:south} " + (t.connected_seeders || 0)),
        stampColor: "msx-" + (t.stat == 4 ? "red" : t.stat == 3 ? "green" : "yellow"),
        action: "content:request:interaction:" + t.hash + "@" + window.location.href,
        options: opts(
            {key: "red", icon: "delete", label: "{dic:rem|Remove the torrent}", data: {action: "rem", hash: t.hash}, action: "interaction:load:" + window.location.href},
            t.stat < 5 ? {key: "green", icon: "stop", label: "{dic:drop|Drop the torrent}", data: {action: "drop", hash: t.hash}, action: "interaction:load:" + window.location.href} : null,
            {key: "yellow", label: "{dic:refresh|Refresh} {dic:list|the list}", action: "[cleanup|reload:content]"}
        )
    }})
}}
function found(d, h){return {
    type: "list", headline: "{ico:search} " + h,
    template: {layout: "0,0,12,1", imageWidth: 0.3, imageFiller: "width-middle"},
    items: d.map(function(t){return {
        headline: t.title,
        iamge: window.location.protocol + "//torrs.ru/img/ico/" + t.trackerName + ".ico",
        titleFooter: "{tb}{txt:msx-blue:" + t.trackerName + "}{tb}{ico:msx-white} " + t.sizeName,
        stamp: "{ico:north} " + t.pir + " {ico:south} " + t.sid,
        action: "content:request:interaction:" + t.magnet + "@" + window.location.href
    }})
}}
function files(){}
function torrent(){}
function keyboard(K){
    var S = TVXServices.storage.getFullStr("ts:search", "");
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
            {label: "{ico:space-bar}", titleFooter: "{ico:fast-forward}", key: "insert|yellow", data: " ", progress: 1, progressColor: "msx-yellow", offset: "0,0,1,0"}, {type: "space"},
            {label: "{ico:language}", titleFooter: "{ico:skip-next}", key: "tab|end", data: "ck", offset: "0,0,1,0", id: "lang"}, {type: "space"}, {type: "space"}
        );
        if(K) k.push({type: "space"});
        k.push({label: "{ico:done}", key: "green", data: "ok", progress: 1, progressColor: "msx-green", offset: (-l-1) + ",0,1,0"});
        return k;
    };
    this.data = function(d){
        switch(d){
            case "ok":
                if(S){
                    TVXServices.storage.set("ts:search", S);
                    TVXInteractionPlugin.executeAction("execute:request:interaction:torrents", S);
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
    this.request = function(f){
        f({
            type: "list", reuse: false, cache: false, restore: false, wrap: true, items: X(), extension: "{ico:msx-white:search} rutor",
            ready: {action: "interaction:commit:message:key", data: ""},
            underlay: {items:[{id: "val", type: "space", layout: "0,0,12,1", color: "msx-black-soft", label: ""}]},
            template: {
                type: "button", layout: "0,0,1,1", area: K ? "0,1,12,5" : "1,1,10,5", enumerate: false,
                action: "interaction:commit:message:key", data: "{context:label}"
            }
        }); 
    }
}
function main(){
    var A = TVXServices.storage.getFullStr("ts:server"),
        S = {
            russian: TVXServices.storage.getBool("ts:russian", false),
            compress: TVXServices.storage.getBool("ts:compress", false),
            folders: TVXServices.storage.getBool("ts:folders", false),
            change: function(k){if(this[k] !== undefined) TVXServices.storage.set("ts:" + k, this[k] = !this[k])}
        };
    var X = function(){
        var d = null, s = null, t = null;
        for(var i = 1; i < arguments.length; i++) switch(typeof arguments[i]){
            case "object": d = JSON.stringify(arguments[i]); break;
            case "string": t = {dataType: arguments[i]}; break;
            case "function": if(s) s.error = arguments[i]; else s = {success: arguments[i], error: arguments[i]};
        }
        TVXServices.ajax[d ? "post" : "get"](A + arguments[0], d || s, d ? s : t, d ? t : undefined);
    };
    this.ready = function(){
        if(A){
            A = window.location.protocol + "//" + A;
            menu = {lgog: A + "/logo.png", menu: menu, options: opts(
                {key: "green", icon: "translate", label: S.russian ? "Switch to english" : "Перевести на русский", action: "[interaction:load:" + window.location.href + "|reload]", data: "russian"},
                {key: "yellow", label: "{dic:refresh|Refresh} {dic:caption:menu|menu}", action: "[cleanup|reload:menu]"},
            )};
            keyboard = new keyboard(S.russian);
        }else TVXServices.error("Server is not set!");
    };
    this.handleData = function(d){
        if(typeof (d = d.data) == "string")
            if(d.length > 2) S.change(d);
            else keyboard.data(d);
        else X(
            "/torrents",
            JSON.stringify(d),
            function(){TVXInteractionPlugin.executeAction("[cleanup|reload:content|success:OK]")},
            function(e){TVXInteractionPlugin.executeAction("error:" + e)},
            "text"
        );
    };
    this.handleRequest = function(i, d, f){
        var e = function(m){TVXInteractionPlugin.error(e);f();};
        if(i[0] == "/") X("/files" + i, function(d){f(files(d, i, S))}, e, "xml");
        else switch(i){
            case "init":
                X("/settings", {action: "get"}, function(d){
                    menu.menu[1].display = d.EnableRutorSearch === true;
                    X("/files", function(d){
                        menu.menu[2].display = d ? true : false;
                        f(menu);
                    }, function(){
                        menu.menu[2].display = false;
                        f(menu);
                    });
                });
                break;
            case "keyboard": 
                keyboard.request(f);
                break;
            case "torrents":
                if(!d) X("/torrents", {action: "list"}, function(d){f(torrents(d))}, e);
                else if(!d.data) f({action: "warn:{dic:empty|Nothing found}"});
                else X(
                    "/msx/proxy?url=" + encodeURIComponent("http://torrs.ru/search?query=" + encodeURIComponent(d.data)),
                    function(j){f({action: "content:data", data: found(j, d.data, S)})},
                    e
                );
                break;
            default: d = "/stream/?stat"; switch((i = i.split("|")).length){
                case 4: d += "&category=" + i[3];
                case 3: d += "&poster=" + i[2];
                case 2: d += "&title=" + i[1];
                case 1: d += "&link=" + i[0];
                    X(d, function(d){X("/msx/trn?hash=" + d.hash, function(s){f(torrent(d, i[0], s !== true, S))})}, e);
                    break;
                default: e("wrong request");
            }
        }
    }
}
TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler(new main());
    TVXInteractionPlugin.init();
});