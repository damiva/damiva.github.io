TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler(new function(){
        var R = TVXServices.storage.getBool("ts:russian", false),
            S = new search(R), P = new playlist();
        var M = {menu: [
            {icon: "bookmarks", label: "{dic:trns|My torrents}", data: "request:interaction:trns@" + window.location.href},
            {icon: "search", label: "{dic:srch|Search torrents}", data: "request:interaction:search@" + window.location.href},
            {icon: "folder", label: "{dic:fls|My files}", data: "request:interaction:/files/@" + window.location.href}
        ], options: opts([
            {key: "green", icon: "translate", label: R ? "Switch to english" : "Перевести на русский", data: {action: "russian"}},
            {key: "yellow", label: "{dic:refresh|Refresh} {dic:caption:menu|menu}", action: "[cleanup|reload:menu]"}
        ])};
        var L = function(d){return {
            type: "list", reuse: false, cache: false, restore: false, extension: "{ico:msx-white:bookmarks} " + d.length,
            template: {layout: "0,0,6,2", imageWidth: 1.3, imageFiller: "height"}, items: d.map(function(t){return {
                id: t.hash,
                headline: t.title,
                image: t.poster,
                icon: t.poster ? "" : "msx-white-soft:bookmark",
                group: "{ico:" + (t.category == "movie" ? "movie" : t.category == "tv" ? "live-tv" : t.category == "music" ? "audiotrack" : "more-horiz") + "}",
                titleFooter: "{ico:msx-white:attach-file} " + (t.torrent_size ? size(t.torrent_size) : "?"),
                stamp: t.stat < 5 ? ("{ico:north} " + (t.active_peers || 0) + " / " + (t.total_peers || 0) + " {ico:south} " + (t.connected_seeders || 0)) : "",
                stampColor: "msx-" + (t.stat == 4 ? "red" : t.stat == 3 ? "green" : "yellow"),
                options: opts([
                    {key: "red", icon: "delete",  label: "{dic:rem|Remove the torrent}", data: {action: "rem", hash: t.hash}},
                    t.stat < 5 ? {key: "green", icon: "close", label: "{dic:drop|Drop the torrent}", data: {action: "drop", hash: t.hash}} : null,
                    {key: "yellow", label: "{dic:refresh|Refresh} {dic:list|the list}", action: "[cleanup|reload:content]"}
                ]),
                action: "content:request:interaction:" + t.hash + "@" + window.location.href
            }})
        }};
        this.init = P.init();
        this.ready = function(){M.logo = addr + "/logo.png"};
        this.handleData = function(d){if(!S.handleData(d)) P.handleData(d)};
        this.handleRequest = function(i, d, f){
            switch(i){
                case "init":
                    ajax("/files", function(d){
                        M.menu[2].display = d ? true : false;
                        f(M);
                    }, function(){
                        M.menu[2].display = false;
                        f(M);
                    });
                    break;
                case "trns":
                    ajax("/torrents", {action: "list"}, function(d){
                        f(L(d));
                    }, function(e){
                        TVXInteractionPlugin.error(e);
                        f();
                    });
                    break;
                default: if(!S.handleRequest(i, d, f)) P.handleRequest(i, d, f);
            }
        };
    });
    TVXInteractionPlugin.init();
});
