function Play(){
    var PS = [
        {
            i: "html5x", n: "HTML5X", u: "http://msx.benzac.de/plugins/html5x.html?url=", 
            m: function(f){TVXInteractionPlugin.requestPlayerResponse("options", function(d){f(d.response.items)})},
            o: function(o){o["html5x:cors"] = false}
        },
        {i: "hls", n: "HLS.js", u: "http://msx.benzac.de/plugins/hls.html?url="},
        {i: "videojs", n: "Video.js", u: "http://msx.benzac.de/plugins/videojs.html?url="}
    ];
    var D = 0, C = 0, T = null, B = new TVXBusyService();
    var S = function(c){
        h = TVXServices.storage.getBool("tizen:subtitle:hidden", true);
        if(c) TVXServices.storage.set("tizen:subtitle:hidden", h = !h);
        TVXInteractionPlugin.executeAction("player:commit:message:tizen:subtitle:hidden:" + (h ? "true" : "false"));
        TVXInteractionPlugin.executeAction("player:button:speed:setup", {
            icon: "subtitles" + (h ? "" : "-off"), action: "interaction:commit:message:subtitles"
        });
    };
    var PM = function(m){
        m = typeof m == "string" 
            ? [{icon: "build", label: "{dic:label:options|Opptions}", action: m, focus: true}]
            : m || [];
        m.unshift({
            icon: "smart-display", label: "{dic:label:player|Player}", 
            extensionLabel: PS[C].n, action: "panel:data", data: {
                cache: false, reuse: false, restore: true,
                type: "list", headline: "{dic:label:player|Player}:",
                template: {
                    type: "control", layout: "0,0,8,1",
                    action: "interaction:commit:message:player"
                },
                items: PS.map(function(p, i){return {
                    data: i, label: p.n, focus: C == i,
                    icon: "radio-button-o" + (C == i ? "n" : "ff"),
                    extensionLabel: D == i ? "{dic:label:default|Default}" : "",
                }})
            }
        });
        return {
            cache: false, reuse: false, restore: true,
            type: "list", headline: "{dic:label:player|Player} {dic:label:settings|Settings}",
            template: {enumerate: false, type: "control", layout: "0,0,8,1"}, items: m
        };
    };
    //interface:
    this.ready = function(){
        B.start();
        TVXInteractionPlugin.requestData("info:base", function(d) {
            var o = {}, p = d.info.platform;
            switch(p){
            case "tizen": 
                T = new TizenPlayer();
                T.enableBufferSizes();
                o = {n: "Tizen", o: function(o){
                    T.applyPreferences(o);
                    o["trigger:load"] = "interaction:commit:message:subtitle";
                }, m: "content:request:interaction:tizen"};
                break;
            case "netcast":
                o.m = "system:netcast:menu";
            case "hbbtv": 
                p = p.replace("tv", "TV");
            case "samsung":
            case "android":
                o.n = p.charAt(0).toUpperCase() + p.substr(1);
                D++;
            }
            if(o.n) PS.unshift(o);
            C = TVXServices.storage.getNum("player", D);
            B.stop();
        });
    };
    this.handleData = function(d){
        switch(d.message){
            case "player":
                TVXServices.storage.set("player", C = TVXTools.isNum(d.data) ? d.data : D);
                TVXInteractionPlugin.executeAction("[cleanup|player:auto:goto:current|player:button:play_pause:focus]");
                break;
            case "subtitles":
                S(true);
                break;
            case "subtitle":
                S();
                break;
            default: if(T) T.handleData("tizen", d);
        }
    };
    this.handleRequest = function(i, _, f){
        B.onReady(function(){switch(i){
            case "player":
                if(typeof PS[C].m == "function") PS[C].m(function(d){f(PM(d))});
                else f(PM(PS[C].m));
                break;
            case "tizen":
                if(T) T.handleRequest("tizen", "init", f);
                else f();
                break;
            default:
                var o = {
                    "button:content:icon": "settings",
                    "button:content:action": "panel:request:interaction:player@" + window.location.href
                };
                if(PS[C].o) PS[C].o(o);
                f({url: PS[C].u ? ("plugin:" + PS[C].u + TVXTools.strToUrlStr(i)) : i, properties: o});
        }})
    };
}
function Handler(){
    var hr = {},
        ps = Array.prototype.slice.call(arguments).map(function(a){return new a()}),
        hf = function(f, p){return function(){
            var a = Array.prototype.slice.call(arguments);
            p.every(function(o){return o[f].apply(o, a) !== true});
        }};
    ["init", "ready", "handleEvent", "handleData", "handleRequest", "onError"].forEach(function(f){
        var p = ps.filter(function(p){return typeof p[f] == "function"});
        if(p.length > 0) hr[f] = hf(f, p);
    });
    return hr;
}