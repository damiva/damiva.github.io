var addr = window.location.protocol + "//";
var menu = [
    {icon: "bookmarks", label: "{dic:trns|My torrents}",    data: "request:interaction:trns@" + window.location.href},
    {icon: "search",    label: "{dic:srch|Search torrents}",data: "request:interaction:keys@" + window.location.href},
    {icon: "folder",    label: "{dic:files|My files}",      data: "request:interaction:access:{SERVER}@http://nb.msx.benzac.de/interaction"}
]
var trns = {
    l: function(l){},
    f: function(l, c){},
    h: function(l, s){},
    c: function(f, e, d){
        var t = this;
        if(d) TVXServices.ajax.get(addr + "/search/?query=" + encodeURIComponent(d.find), {
            success: function(l){
                if((l = t.f(l, d.cat)).length) f(t.h(l, d.find));
                else f({action: "warn:{dic:empty|Nothing found}"});
            },
            error: e
        });
        else TVXServices.ajax.post(addr + "/torrents", '{"action":"list"}', {
            success: function(l){f(t.h(t.l(l)))},
            error: e
        })
    }
}
var trnt = {
    d: {},
    c: function(f, e, d, i){
        var t = this;
        if(d){
            t.d = d;
            f({action: "content:request:interaction:" + i});
        } else TVXServices.ajax.get(
            addr + "/stream/?stat&" + ["link", "title", "poster", "category"].map(function(k){return k + "=" + encodeURIComponent(t.d[k])}).join("&"),
            {success: function(d){

            }, error: e}
        );
    }
}
function keys(i, r){
    var ks = [false, true].map(function(K){
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
    });
    this.d = function(d){

    };
    this.c = function(f){
        
    }
}
function init(f, e){TVXServices.ajax.post(addr + "/settings", '{"action":"get"}', {
    success: function(d){
        M.menu[1].enable = d.EnableRutorSearch;
        TVXServices.ajax.get(A + "/files", {
            success: function(d){M.menu[2].display = d ? true : false},
            error: function(){M.menu[2].display = false},
            complete: function(){f({logo: A + "/logo.png", menu: menu})}
        });
    },
    error: e
})}
function acts(f, d){TVXServices.ajax.post(addr + "/torrents", JSON.stringify(d), {
    success: function(){f({action: "[cleanup|reload:content|success]"})},
    error: function(e){f({action: "error:" + e})},
    dataType: "text"
})}
function opts(){
    var k = ["red", "green", "yellow"];
    var o = {headline: "{dic:caption:options|Opts}:", items: [], template: {
        enumerate: false, layout: "0,0,8,1", type: "control", action: "execute:request:interaction:act"
    }};
    o.caption = o.headline;
    for(var i = 0; i < arguments.length && i < k.length; i++) if(arguments[i]){
        arguments[i].key = k[i];
        arguments[i].icon = "msx-" + k[i] + ":stop";
        o.items.push(arguments[i]);
        o.caption += "{tb}{ico:" + arguments[i].icon + "} " + arguments[i].label
    }
    return o.items.length ? o.items : null;
}
function size(s){
    var i = s == 0 ? 0 : Math.floor(Math.log(s) / Math.log(1024));
    return (s / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
};

TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler(new function(){
        var b = new TVXBusyService(), k = {};
        this.ready = function(){
            var h = TVXServices.urlParams.get("host");
            addr += h;
            menu[2].data.replace("{SERVER}", h);
            b.start();
            TVXInteractionPlugin.requestData("info:dictionary", function(d){
                k = new keys("trns", d.data.info.dictionary.name == "Русский");
                b.stop();
            })
        };
        this.handleData = function(d){b.onReady(function(){k.d(d.data)})};
        this.handleRequest = function(i, d, f){b.onReady(function(){
            var e = function(m){TVXInteractionPlugin.error(m); f()};
            switch(i){
                case "init": init(f, e); break;
                case "keys": k.c(f); break;
                case "trns": trns.c(f, e, d && d.data); break;
                case "trn": trnt.c(f, e, d && d.data, i); break;
                case "act": acts(f, d && d.data); break;
                default: e("wrong request id: " + i);
            }
        })}
    })
    TVXInteractionPlugin.init();
})