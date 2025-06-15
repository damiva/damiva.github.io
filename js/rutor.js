function rutor(srv, act, dat, rus){
    var wrd = TVXServices.storage.getFullStr("search:words", ""), url = srv + "/search?query=",
        kbd = [[
            "й","ц","у","к","е","н","г","ш","щ","з","х",
            "ф","ы","в","а","п","р","о","л","д","ж","э",
            "я","ч","с","м","и","т","ь","б","ю","ъ"
        ],[
            "q","w","e","r","t","y","u","i","o","p","bracket_open",
            "a","s","d","f","g","h","j","k","l","semicolon","quote",
            "z","x","c","v","b","n","m","comma","period","bracket_close"
        ]];
    var aud = function(q){
        return (q = {
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
        }[q]) ? ("{ico:msx-white:audiotrack} " + q) : "";
    };
    var cat = function(c){
        if(c.indexOf("Movie") >= 0) c = {cat: "movie", ico: "movie"};
        else if(c.indexOf("Series") >= 0 || c.indexOf("TV") >= 0) c = {cat: "tv", ico: "live-tv"};
        else c = {cat: c, ico: "more-horiz"}
        return c == "Movie" ? {cat: "movie", ico: "movie"} : c == "Series" || c == "TVShow" ? {cat: "tv", ico: "live-tv"} : {cat: c, ico: ""}
    };
    this.init = function(){
        for(var n = 0; n < kbd.length; n++){
            var x = 0, y = 1;
            kbd[n] = kbd[n].map(function(k, i){
                k = {type: "button", label: k, data: k, key: n ? k : kbd[0][i], layout: x + "," + y + ",1,1"};
                if(++x > 10 - n) {x = 0; y++}
                return k;
            });
        }
        ["1","2","3","4","5","6","7","8","9","0"].forEach(function(k, i){
            k = {type: "button", label: k, data: k, key: k, layout: i + ",0,1,1"};
            for(var n = 0; n < kbd.length; n++) kbd[n].push(k);
        });
        [
            {icon: "backspace", key: "red|delete", data: "bs", progress: 1, progressColor: "msx-red"},
            {icon: "clear", key: "home|clear", data: "cl"},
            {icon: "language", key: "yellow|tab", data: "ck", progress: 1, progressColor: "msx-yellow"},
            {icon: "space-bar", key: "green|insert|end|space", data: " ", progress: 1, progressColor: "msx-green"}
        ].forEach(function(k, i){
            var x = i < 1 || i > 2 ? 1 : 0;
            k.type = "button";
            k.layout = (11 - x) + "," + i + "," + (1 + x) + ",1"
            for(var n = 0; n < kbd.length; n++) kbd[n].push(k);
        });
    };
    this.handleData = function(d){
        if(typeof d.data != "string") return false;
        switch(d.data){
            case " ":
            case "ck":
            case "cl":
            case "bs":
            default: 
        }
    };
    this.handleRequest = function(id, _, cb){
        var items = [], wait = new TVXBusyService();
        if(id.length < 1 || id[0] != "?") return false;
        if(id = id.substr(1)) TVXServices.storage.set("search:words", wrd = id);
        wait.start();
        if(!id) wait.stop();
        else TVXServices.ajax.get(url + encodeURIComponent(id), {
            success: function(d){
                items = d.map(function(t){
                    c = cat(t.Categories);
                    return {
                        id: t.Hash,
                        image: t.Poster = t.Poster || (t.IMDBID ? ("/msx/imdb/" + t.IMDBID) : ""),
                        icon: t.Poster ? null : "msx-white-soft:offline-bolt",
                        headline: t.Title,
                        text: aud(t.AudioQuality),
                        titleFooter: "{ico:msx-white:" + c.ico + "} " + t.Size,
                        group: c.cat,
                        stamp: "{tb}{ico:north} " + (t.Peer || 0) + " {ico:south} " + (t.Seed || 0),
                        magnet: t.Magnet
                    };
                });
                wait.stop();
            },
            error: function(e){
                TVXInteractionPlugin.error(e);
                wait.stop();
            }
        });
        wait.onReady(function(){cb({

        })});
    };
}