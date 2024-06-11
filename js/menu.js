TVXPluginTools.onReady(function() {
    TVXInteractionPlugin.setupHandler(new function(){
        var R = TVXServices.storage.getBool("ts:russian", false),
            S = new search(R), P = new playlist(),
            G = "";
        var M = {menu: [
            {icon: "bookmarks", label: "{dic:my|My} {dic:trns|torrents}", data: "request:interaction:trns@" + window.location.href},
            {icon: "search", label: "{dic:find|Search} {dic:trns|torrents}", data: "request:interaction:search@" + window.location.href},
            {icon: "folder", label: "{dic:my|My} {dic:fls|files}", data: "request:interaction:/files/@" + window.location.href}
        ], options: opts([
            {key: "green", icon: "translate", label: R ? "Switch to english" : "Перевести на русский", data: "russian"},
            {key: "yellow", label: "{dic:refresh|Refresh} {dic:caption:menu|menu}", action: "[cleanup|reload:menu]"}
        ])};
        var L = function(d){
            var c = prms("smallfont"), 
                l = d.length, e = typeof d == "string";
                o = [
                    {key: "yellow", label: "{dic:refresh|Refresh} {dic:list|the list}", action: "[cleanup|reload:content]"},
                    {icon: "format-size", label: "{dic:compress|Compress} {dic:font|the font}", extensionIcon: icon(c), data: "smallfont"}    
                ];
            if(!e && TVXTools.isArray(d)) d = d.map(function(t){return (t.category = cati(t.category)) != G && G ? {display: false, n: l--} : {
                id: t.hash,
                headline: c ? undefined : t.title, text: c ? ("{col:msx-white}" + t.title) : undefined,
                image: t.poster,
                icon: t.poster ? "" : "msx-white-soft:bookmark",
                group: "{ico:" + t.category + "}",
                titleFooter: "{ico:msx-white:attach-file} " + (t.torrent_size ? size(t.torrent_size) : "?"),
                stamp: t.stat < 5 ? ("{ico:north} " + (t.active_peers || 0) + " / " + (t.total_peers || 0) + " {ico:south} " + (t.connected_seeders || 0)) : "",
                stampColor: "msx-" + (t.stat == 4 ? "red" : t.stat == 3 ? "green" : "yellow"),
                options: opts([
                    {key: "red", icon: "delete", label: "{dic:rem|Remove the torrent}", action: "panel:data", data: {
                        type: "list", headline: "{dic:rem|Remove the torrent}?",
                        overlay: {items: [{type: "space", headline: t.title, layout: "0,0,8,4"}]},
                        template: {type: "button", layout: "0,0,8,1", area: "0,4,8,2", enumerate: false},
                        items: [
                            {label: "{dic:label:no|No}", action: "cleanup"},
                            {label: "{dic:label:yes|Yes}", action: "interaction:load:" + window.location.href, data: {action: "rem", hash: t.hash}}
                        ]
                    }},
                    t.stat < 5 ? {key: "green", icon: "close", label: "{dic:drop|Drop the torrent}", data: {action: "drop", hash: t.hash}} : null
                ].concat(o)),
                action: "content:request:interaction:" + t.hash + "@" + window.location.href
            }});
            return {
                type: "list", reuse: false, cache: false, restore: false,
                extension: e ? "{ico:msx-yellow:warning}" : l == d.length ? ("{ico:msx-white:bookmarks} " + d.length) : ("{ico:msx-white:filter-alt} " + l + "/" + d.length),
                header: e ? null : {items: [
                    {type: "space", layout: "3,0,2,1", headline: (G ? "" : "{col:msx-white-soft}") + "{ico:filter-alt}{tb}{dic:filter|Filter}:", centration: "text"}
                ].concat(["movie", "live-tv", "audiotrack", "more-horiz"].map(function(g, i){return {
                    type: "button", layout: (i + 5) + ",0,1,1", icon: g, progress: G == g ? 1 : -1, progressColor: "msx-white",
                    data: g, action: "execute:request:interaction:trns@" + window.location.href
                }})), options: opts(o)},
                template: {layout: "0,0,6,2", imageWidth: 1.3, imageFiller: "height"}, 
                items: e ? [{headline: "{dic:label:data_load_error|Load data error}: " + d, icon: "refresh", action: "reload:content"}] : d 
            };
        };
        this.init = P.init();
        this.ready = function(){M.logo = addr + "/logo.png"};
        this.handleData = function(d){
            if(!S.handleData(d) && !P.handleData(d) && d.data.action) ajax(
                "/torrents", d.data, "text", 
                function(){TVXInteractionPlugin.executeAction("[cleanup|reload:content]")},
                function(e){TVXInteractionPlugin.error(e)}
            );
        };
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
                    if (d) {
                        G = G == d.data ? "" : (d.data || "");
                        f({action: "reload:content"});
                    } else ajax("/torrents", {action: "list"}, function(d){
                        f(L(d));
                    }, function(e){
                        f(L(e));
                        TVXInteractionPlugin.error(e);
                    });
                    break;
                default: if(!S.handleRequest(i, d, f)) P.handleRequest(i, d, f);
            }
        };
    });
    TVXInteractionPlugin.init();
});
