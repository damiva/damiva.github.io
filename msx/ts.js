var Init = {name: "TorrServer Plugin", version: "0.1.133", reference: "request:interaction:menu@" + window.location.href};
//utils:
function Prms(k, c){
    var v = TVXServices.storage.getBool(k = "ts:" + k, false);
    if(c) TVXServices.storage.set(k, v = !v);
    return v;
}
function Cats(c, l){
    var h = "{dic:cat|Category}:";
    c = c || "All";
    c = h + " {dic:" + c + "|" + c + "}";
    l = l || ["Movie","Series","DocMovie","DocSeries","CartoonMovie","CartoonSeries","TVShow","Anime"];
    l.unshift("All", "");
    return {
        headline: h, caption: c, type: "list",
        template: {enumerate: false, type: "button", layout: "0,0,4,1", area: "0,1,8,5", action: "interaction:load:" + window.location.href},
        items: l.map(function(c, i){return c 
            ? {label: "{dic:" + c + "|" + c + "}", data: c, offset: i ? null : "-.5,0,4,0"}
            : {type: "space"}
        })
    }
}
//objects:
var Keys = {
    C: "", S: "", K: false,
    init: function(k){this.K = k; this.S = TVXServices.storage.getFullStr("ts:search", "")},
    data: function(d){
        A = TVXInteractionPlugin.executeAction;
        if(d.length > 2){
            C = C == "All" ? "" : C;
            A("reload:content");
        }else switch(d){
            case "ok":
                if(S){
                    TVXServices.storage.set("ts:search", S);
                    A("execute:request:interaction:trns", C);
                }
                break;
            case "ck":
                K = !K;
                A("reload:content");
                break;
            case "cl": S = "";
            case "bs":
                S = S ? S.substr(0, S.length - 1) : "";
                d = "";
            default: A("update:content:underlay:val", (S += d) ? (S + "{txt:msx-white-soft:_}") : "{txt:msx-white-soft:dic:input|Enter the word(s) to search}")
        }
    },
    request: function(f){
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
        if(this.K) k.push({type: "space"});
        for(var i = 2; i < 10; i++) k.push({label: i = TVXTools.strValue(i), key: i});
        if(this.K) k.push({type: "space"});
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
            {label: this.K ? "ё" : "'", key: K ? "accent" : "quote", offset: "-1,0,0,0"},
            {label: "{ico:backspace}", titleFooter: "{ico:fast-rewind}", key: "delete|red", data: "bs", progress: 1, progressColor: "msx-red", offset: l + ",0,1,0"},
            {type: "space"}
        );
        if(this.K) k.push({type: "space"});
        k.push(
            {label: "{ico:clear}", titleFooter: "{ico:skip-previous}", key: "home", data: "cl", offset: "0,0,1,0"}, {type: "space"},
            {label: "{ico:space-bar}", titleFooter: "{ico:fast-forward}", key: "insert|yellow", data: " ", progress: 1, progressColor: "msx-yellow", offset: "0,0,1,0"}, {type: "space"},
            {label: "{ico:language}", titleFooter: "{ico:skip-next}", key: "tab|end", data: "ck", offset: "0,0,1,0", id: "lang"}, {type: "space"}, {type: "space"}
        );
        if(this.K) k.push({type: "space"});
        k.push({label: "{ico:done}", key: "green", data: "ok", progress: 1, progressColor: "msx-green", offset: (-l-1) + ",0,1,0"});
        f({
            type: "list", reuse: false, cache: false, restore: false, wrap: true, extension: "rutor",
            ready: {action: "interaction:load:" + window.location.href, data: ""},
            underlay: {items:[{id: "val", type: "space", layout: "0,0,12,1", color: "msx-black-soft", label: ""}]},
            template: {
                type: "button", layout: "0,0,1,1", area: K ? "0,1,12,5" : "1,1,10,5", enumerate: false,
                action: "interaction:commit:message:key", data: "{context:label}"
            },
            options: Cats(C), items: k
        });
    }
}
var Tact = {
    data: function(d){
        if(typeof d.data == "string") d = {hash: d.data, action: d.message};
        else {d.save_to_db = true; d.action = "add"}
        TVXServices.ajax.post("/torrents", JSON.stringify(d), {
            success: function(){TVXInteractionPlugin.executeAction("[cleanup|reload:content]")},
            error: function(m){TVXInteractionPlugin.error(m)}
        }, {dataType: "text"});
    },
    request: function(d, f){
        var a = "interaction:commit:message:";
        if(!d.hash) f({action: a + "save", d});
        else {
            var i = [{
                type: "space", imageWidth: 1.4, imageFiller: "height", offset: "0,0,0,1",
                headline: d.title, stamp: "", stampColor: "", titleFooter: d.size,
                image: d.poster, icon: d.poster ? "" : "bookmark", id: d.hash,
                live: d.active ? {type: "setup", action: "execute:" + window.location.origin + "/msx/trn", data: "update:panel:" + d.hash} : null
            },{type: "space"},{type: "space"},{
                icon: "save-alt", label: "{dic:save|Save the torrent}", action: a + "save", data: {
                    hash: d.hash, title: d.title, poster: d.poster, category: d.category
                }
            },{
                icon: "stop", label: "{dic:stop|Stop the torrent}", action: a + "stop"
            },{
                icon: "delete", label: "{dic:rem|Remove the torrent}", action: a + "rem"
            }];
            TVXServices.ajax.get("/msx/trn?hash=" + d.hash, {
                success: function(t){i[3].enable = !t},
                complete: function(){
                    i[4].enable = d.active && !i[3].enable;
                    f({action: "panel:data", data: {
                        type: "list", headline: "{dic:trn|Torrent}:", items: i,
                        template: {type: "control", layout: "0,0,8,1", data: d.hash}
                    }});
                }
            });
        }
    }
}
//constructors:
function Menu(r){
    var menu = {
        logo: window.location.origin + "/logo.png", reuse: false, cache: false, restore: false,
        menu: [
            {icon: "bookmarks", label: "{dic:trns|My torrents}", data: "request:interaction:trns@" + window.location.href},
            {icon: "search", label: "{dic:srch|Search torrents}", data: "request:interaction:srch@" + window.location.href},
            {icon: "folder", label: "{dic:files|My files}", data: "request:interaction:access:" + window.location.host + "@http://nb.msx.benzac.de/interaction"},
            {type: "separator"},
            {icon: "settings", label: "{dic:label:settings|Settings}", data: {
                type: "list", reuse: false, 
                ready: {action: "data", data: [{action: "interaction:load:" + window.location.href}, {action: "interaction:commit:message:set", data: ""}]},
                template: {layout: "0,0,7,1", type: "control", action: "interaction:commit:message:set", data: "{context:id}"},
                items: [
                    {type: "space", headline: Init.name + " " + Init.version},
                    {type: "space", headline: "", id: "srv"},
                    {type: "space", headline: "", id: "app"},
                    {icon: "translate", label: r ? "Switch to english" : "Перевести на русский", id: "russian"},
                    {icon: "folder", label: "{dic:folders|Show folders in torrent}", id: "folders"},
                    {type: "space", text: "{ico:info} {dic:info|More settings can be done in a browser at}:{br}" + window.location.origin + "/msx/"}
                ]
            }}
        ]
    };
    this.data = function(d){
        var icn = function(v){return v ? "msx-white:toggle-on" : "toggle-off"};
        if(d){
            var v = Prms(d, true);
            if(d == "russian") TVXInteractionPlugin.executeAction("reload");
            else TVXInteractionPlugin.executeAction("update:content:" + d, {extensionIcon: icn(v)});
        } else {
            TVXInteractionPlugin.executeAction("update:content:folders", {extensionIcon: icn(Prms("folders"))});
            TVXInteractionPlugin.requestData("info:application", function(d){
                TVXInteractionPlugin.executeAction("update:content:app", {
                    headline: d.data.info.application.name + " " + d.data.info.application.version
                });
                TVXServices.ajax.get("/msx/start.json", {success: function(d){
                    TVXInteractionPlugin.executeAction("update:content:srv", {
                        headline: d.name + " " + d.version
                    });
                }});
            });
        }
    }
    this.request = function(f){
        TVXServices.ajax.post("/settings", '{action:"get"}', {
            success: function(d){menu.menu[1].enable = d.EnableRutorSearch},
            error: function(){menu.menu[1].enable = false},
            complete: function(){TVXServices.ajax.get("/files", {
                success: function(d){menu.menu[2].display = d ? true : false},
                error: function(){menu.menu[2].display = false},
                complete: function(){d(menu)}
            })}
        });
    };
}
function Trnt(){
    var T = null,
        G = function(d){
            if(!d.link) return "error:data.link is empty!";
            T = d;
            return "content:request:interaction:trnt";
        },
        L = function(d){TVXServices.ajax.get("/msx/trn?hash=" + d.hash, {success: function(t){
            d.indb = t === true;
        }, complete: function(){
            var fs = [], ds = [];

        }})};
    this.request = function(d, f){
        if(d && d.data) f({action: G(d.data)});
        else TVXServices.ajax.get(
            "/stream/?stat&" + Object.keys(T).map(function(k){return k + "=" + encodeURIComponent(T[k])}).join("&"),
            {success: function(d){f(L(d))}, error: function(e){TVXInteractionPlugin.error(e); f()}}
        )
    }
}

TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler({
        init: function(){
            var r = Prms("russian");
            Menu = new Menu(r);
            Trnt = new Trnr();
            Keys.init(r);
            if(r) Init.dictionary = window.location.origin + "/msx/russian.json";
        },
        handleData: function(d){
            if(d.message == "set") Menu.data(d.data);
            else if(d.message) Tact.data(d);
            else Keys.data(d.data);
        },
        handleRequest: function(i, d, f){switch(i){
            case "init": f(Init); break;
            case "keys": Keys.request(f); break;
            case "menu": Menu.request(f); break;
            case "tact": Tact.request(d, f); break;
            case "trnt": Trnt.request(d, f); break;
            case "trns": Trns.list(f); break;
            case "find": Trns.find(f); break;
            default: TVXInteractionPlugin.error("wrong request: " + i); f();
        }}});
        TVXInteractionPlugin.init();
});