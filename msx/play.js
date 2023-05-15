function Play(){
    var P = {
        html5x: ["HTML5X", "http://msx.benzac.de/plugins/html5x.html?url=", "panel:request:player:options"],
        hls:    ["HLS.js", "http://msx.benzac.de/plugins/hls.html?url=", ""],
        videojs:["Video.js", "http://msx.benzac.de/plugins/videojs.html?url=", ""],
        android:["Android", "http://msx.benzac.de/plugins/android.html?url=", ""],
        netcast:["Netcast", "", "system:netcast:menu"],
        tizen:  ["Tizen", "", "content:request:interaction:tizen:init"],
        samsung:["Samsung", "", ""],
        hbbtv:  ["HbbTV", "", ""]
    };
    var l = ["html5x", "hls", "videojs"], d = "html5x", t = null;
    this.handleData = function(v){
        if(d.message != "player") return false;
        TVXServices.storage.set("player", v.data);
        I.executeAction("[reload:panel|player:auto:goto:current]");
        return true;
    };
    this.handleRequest = function(i, _, f){
        if (i == "player") {
            var c = TVXServices.storage.getFullStr("player", d), a = P[c][2], r = {
                type: "list", reuse: false, cache: false, restore: false, headline: "{dic:caption:player|Player}:",
                template: {type: "control", layout: "0,0,8,1", action: "interaction:commit:message:player", data: "{context:id}"},
                items: this.l.map(function(p){return {id: p, label: P[p][0] || p, extensionIcon: "radio-button-o" + (p == c ? "n" : "ff")}})
            };
            for(i = 0; i < 5 - r.items.length; i++) r.items.push({type: "space"});
            r.items.push({
                icon: "build", 
                label: "{dic:caption:options|Options}", 
                action: "[cleanup|" + a + "]",
                enable: a ? true : false
            });
            f(r);
        } else if(i.indexOf("tizen:") == 0) {
            i = i.split(":", 2);
            t.handleRequest(i[0], i[1], f);
        } else {
            var c = TVXServices.storage.getFullStr("player", d),
                o = {"button:content:icon": "settings", "button:content:action": "panel:request:interaction:player@" + window.location.href};
            if(c = "html5x") o["html5x:cors"] = false;
            else if(c == "tizen") t.applyPreferences(o);
            f({url: P[c][1] ? ("plugin:" + P[c][1] + TVXTools.strToUrlStr(i)) : i, properties: o});
        }
        return true
    };
    switch(TVXSettings.PLATFORM){
        case "tizen": 
            t = new TizenPlayer();
            t.enableBufferSizes();
        case "samsung":
        case "netcast":
        case "hbbtv": 
            d = p;
        case "android":
            l.unshift(p);
    }
}
function Handler(){
    var bs = new TVXBusyService(), ps = [];
    this.init = function(){
        bs.start();
        TVXInteractionPlugin.onValidatedSettings(function(){
            ps = ps.map(function(p){return new p});
            bs.stop();
        });
    };
    this.handleEvent = function(d){bs.onReady(function(){
        for(var p = 0; p < ps.length; p++) if(ps[p].handleEvent) ps[p].handleEvent(d)
    })};
    this.handleData = function(d){bs.onReady(function(){
        for(var p = 0; p < ps.length; p++) if(ps[p].handleData(d)) break;
    })};
    this.handleRequest = function(i, d, f){bs.onReady(function(){
        for(var p = 0; p < ps.length; p++) if(ps[p].handleRequest(i, d, f)) break;
    })};
    for(var i = 0; i < arguments.length; i++) ps.push(arguments[i]);
    ps.push(Play);
}