function search(K){
    var S = TVXServices.storage.getFullStr("ts:search:query", ""),
        A = TVXServices.storage.getBool("ts:search:accurate", false),
        O = TVXServices.storage.getNum("ts:search:order", 0),
        F = ["{dic:peers|Peers}", "{dic:size|Size}", "{dic:date|Date}"],
        I = ["north", "attach-file", "date-range"];
    var Y = [
        function(a, b){return a.pir < b.pir ? 1 : a.pir > b.pir ? -1 : 0},
        function(a, b){return a.createTime < b.createTime ? 1 : a.createTime > b.createTime ? -1 : 0},
        function(a, b){return a.size < b.size ? 1 : a.size > b.size ? -1 : 0}
    ]
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
    var Z = function(c){
        return opts([
            {icon: "filter-alt", label: "{dic:accurate|Accurate search}", extensionIcon: icon(A), data: true, id: "accurate"},
            {type: "space", label: "{dic:label:order|Order}: "},    
        ].concat(F.map(function(o, i){
            return {icon: I[i], label: o, extensionIcon: icon(O == i, true), data: i, id: "order" + i}
        })).concat(
            {type: "button", label: "{dic:label:" + (c ? "apply|Apply}" : "continue|Continue}"), action: "[cleanup" + (c ? "|reload:content]" : "]")}
        ), ":{tb}{dic:label:order|Order}:" + F[O] + (A ? "{tb}{dic:accurate|Accurate search}" : ""));
    };
    this.handleData = function(d){
        switch(typeof d.data){
            case "boolean":
                TVXServices.storage.set("ts:search:accurate", A = !A);
                TVXInteractionPlugin.executeAction("update:panel:accurate", {extensionIcon: icon(A)});
                return true;
            case "number":
                TVXServices.storage.set("ts:search:order", O = d.data);
                for(var i = 0; i < F.length; i++) TVXInteractionPlugin.executeAction("update:panel:order" + i, {extensionIcon: icon(O == i, true)});
                return true;
            case "string": switch(d.data){
            case "ok":
                if(S){
                    TVXServices.storage.set("ts:search:query", S);
                    TVXInteractionPlugin.executeAction("content:request:interaction:find");
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
                d.data = "";
            default: 
                TVXInteractionPlugin.executeAction(
                    "update:content:underlay:val",
                    {label: (S += d.data) ? (S + "{txt:msx-white-soft:_}") : "{col:msx-white-soft}{dic:input|Enter the word(s) to find}"}
                );
                return true;
            }
            default: return false;
        }
    };
    this.handleRequest = function(i, _, f){
        switch(i){
            case "search":
                f({
                    type: "list", reuse: false, cache: false, restore: false, wrap: true, items: X(),
                    ready: {action: "interaction:load:" + window.location.href, data: ""}, options: Z(),
                    underlay: {items:[{id: "val", type: "space", layout: "0,0,12,1", color: "msx-black-soft", label: ""}]},
                    template: {
                        type: "button", layout: "0,0,1,1", area: K ? "0,1,12,5" : "1,1,10,5", enumerate: false,
                        action: "interaction:commit", data: "{context:label}"
                    },
                });
                return true;
            case "find":
                proxy("https://torrs.ru/search?query=" + encodeURIComponent(S) + (A ? "&accurate" : ""), {
                    success: function(d){f({
                        type: "list", headline: "{ico:search} " + S, extension: "{ico:msx-white:search} " + d.length,
                        template: {layout: "0,0,12,1", stampColor: "msx-black"}, options: Z(true),
                        items: d.sort(Y[O]).map(function(t){return {
                            headline: t.title,
                            iamge: window.location.protocol + "//torrs.ru/img/ico/" + t.trackerName + ".ico",
                            group: t.trackerName,
                            stamp: "{ico:date-range} " + TVXDateFormatter.toDateStr(t.createTime) + "{tb}{ico:attach-file} " + t.sizeName + "{tb}{ico:north} " + t.pir + " {ico:south} " + t.sid,
                            action: "content:request:interaction:" + encodeURIComponent(t.magnet) + "@" + window.location.href
                        }})
                    })},
                    error: function(e){
                        TVXInteractionPlugin.error(e);
                        f();
                    }
                });
                return true;
            default: return false;
        }
    }
}
