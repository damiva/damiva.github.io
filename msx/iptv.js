function IPTV(){
    var url = "https://raw.githubusercontent.com/blackbirdstudiorus/LoganetXIPTV/main/LoganetX",
        tvn = ["Fav", "Movie", "Info", "Sport", "Melody", "Kids"],
        tvt = ["Избранное", "Фильмы и сериалы", "Информация", "Спорт", "Музыка", "Детям"],
        icn = ["msx-yellow:favorite", "local-movies", "info", "sports", "audiotrack", "cruelty-free"],
        opf = {
            headline: "{dic:caption:options}:",
            caption: "{dic:caption:options}:{tb}{ico:msx-red:stop} Удалить{tb}{ico:msx-green:stop} Программа{tb}{ico:msx-yellow:stop} Задать программу",
            template: {enumerate: false, layout: "0,0,8,1", type: "control"},
            items: [
                {
                    icon: "msx-red:stop", label: "Удалить", key: "red",
                    action: "interaction:commit:message:remchan", data: "{context:id}"
                }, {
                    icon: "msx-green:stop", label: "Программа", key: "green",
                    action: "interaction:commit:message:epg:{context:epg}:{context:headline}"
                }, {
                    icon: "msx-yellow:stop", label: "Задать программу", key: "yellow",
                    action: "interaction:commit:message:setchan", data: "{context:id}"
                }
            ]
        },
        opo = {
            headline: "{dic:caption:options}:",
            caption: "{dic:caption:options}:{tb}{ico:msx-green:stop} Программа{tb}{ico:msx-yellow:stop} В избранное",
            template: {enumerate: false, layout: "0,0,8,1", type: "control"},
            items: [
                {
                    icon: "msx-green:stop", label: "Программа", key: "green",
                    action: "interaction:commit:message:epg:{context:epg}:{context:headline}"
                }, {
                    icon: "msx-yellow:stop", label: "В избранное", key: "yellow",
                    action: "interaction:commit:message:addchan",
                    data: {t: "{context:headline}", e: "{context:epg}", a: "{context:action}", i: "{context:image}"}
                }
            ]
        },
        tvs = {
            type: "list", compress: true,
            extension: "{ico:msx-white:today} {now:date:D, dd.mm.yyyy} {ico:msx-white:access-time} {now:time:hh:mm}",
            header: {items:[{
                layout: "4,0,8,1", type: "control", icon: "filter-list", label: "Категория:", 
                action: "panel:data", data: {
                    headline: "Категория:", extension: "{ico:filter-list}", compress: true,
                    template: {
                        layout: "0,0,5,1", type: "button", 
                        action: "interaction:commit:message:group", data: "{context:label}"
                    }
                }
            }]},
            template: {
                layout: "0,0,8,2", imageFiller: "height-right", imageHeight: 1,
                progress: -1, text: "", stamp: "",
                live: {
                    type: "setup", action: "interaction:commit:message:epg", 
                    data: {i: "{context:id}", e: "{context:epg}"}
                },
                properties: {
                    "button:restart:display": "fasle",
                    "button:rewind:display": "fasle",
                    "button:play_pause:action": "interaction:commit:message:epg:{context:epg}:{context:headline}",
                    "button:play_pause:icon": "info",
                    "button:forward:display": "fasle",
                    "button:speed:display": "false,",
                    "trigger:complete": "player:auto:restart",
                    "trigger:play": "interaction:commit:message:epg:{context:epg}",
                    "trigger:player": "interaction:commit:message:epg:{context:epg}",
                    "progress:type": "difference:time:{hh:mm}",
                }
            }
        };
    var m3u = function(i, id, ic, f){
        TVXServices.ajax.get("/proxy?url=" + TVXTools.strToUrlStr(url + i + ".m3u"), {
            success: function(d){
                tvs.flag = i;
                tvs.template.options = opo;
                tvs.headline = tvt[tvn.indexOf(i)];
                tvs.items = [];
                tvs.ready = TVXTools.isFullStr(ic) ? {action: "error:" + ic} : undefined;
                var g = "", t = "", x = 0, gs = [];
                d.split("\n").forEach(function(l){
                    if(l.indexOf("#EXTINF:") == 0){
                        t = (l = l.substr(8).split(",", 2))[1].trim();
                        g = (l[1] = l[0].indexOf("group-title=")) > 0 ? l[0].substr(l[1]).split('"', 3)[1] : "";
                    } else if(l.length > 1 && l.substr(0, 1) != "#") {
                        var e = id && id[t] || "";
                        tvs.items.push({
                            id: i + x, headline: t, playerLabel: t, group: g,
                            epg: e, image: e && ic[e] || undefined,
                            action: "video:resolve:request:interaction:" + l.trim()
                        });
                        if(g && gs.indexOf(g) < 0) gs.push(g);
                        x++;
                    }
                });
                tvs.header.display = gs.length > 0;
                tvs.header.items[0].extensionLabel = "ВСЕ";
                tvs.header.items[0].data.items = gs.map(function(g){return {label: g}});
                tvs.header.items[0].data.items.unshift({label: "ВСЕ", data: "", offset: "2,0,1,0"}, {type: "space"});
                f(tvs);
            }, 
            error: function(e){TVXInteractionPlugin.error(e); f();}
        }, {dataType: "text"});
    };
    var chs = function(i, f){
        epg(null, true, function(id, ic){
            if(TVXTools.isFullStr(id)) m3u(i, null, id, f);
            else m3u(i, id, ic, f);
        });
    };
    var fav = function(f){
        var l = TVXTools.deserialize(TVXServices.storage.getFullStr("iptv:fav", "[]"));
        switch(typeof f){
            case "function":
                tvs.headline = tvt[0];
                tvs.template.options = opf;
                tvs.header.display = false;
                tvs.flag = "fav";
                tvs.items = l.map(function(e, i){return{
                    id: TVXTools.strValue(i),
                    headline: e.t,
                    image: e.i,
                    playerLabel: e.t,
                    epg: e.e,
                    action: e.a
                }});
                if(tvs.items.length == 0) tvs.items = [{label: "Пусто", icon: "arrow-back", action: "back", type: "control", offset: "0,0,8,0"}];
                f(tvs);
                break;
            case "string":
                f = f.split(":", 3);
                if((f[0] = TVXTools.strToNum(f[0])) >= 0) switch(f.length){
                    case 3: l[f[0]].i = TVXTools.base64DecodeId(f[2]);
                    case 2: l[f[0]].e = f[1];
                }
                f = -1;
            case "number":
                if(f >= 0) l.splice(f, 1);
                f = null;
            default:
                if(f) l.push(f);
                if(l.length == 0) TVXServices.storage.remove("iptv:fav");
                else TVXServices.storage.set("iptv:fav", TVXTools.serialize(l));
                return l.length;
        }
    };
    var epg = function(id, all, f){
        if(id === null) TVXServices.ajax.get("/proxy?url=https://epg.iptvx.one/api/channels.json", {
            success: all ? function(d){
                var id = {}, ic = {};
                d.channels.forEach(function(c){
                    c.chan_names.split(" • ").forEach(function(n){
                        id[n] = c.chan_id;
                    });
                    ic[c.chan_id] = c.chan_icon;
                });
                f(id, ic);
            } : f,
            error: f
        });
        else if(!id) f();
        else TVXServices.ajax.get("/proxy?url=https://epg.iptvx.one/api/id/" + id + ".json", {
            success: function(d){
                var r = {i: -1, n: TVXDateTools.getNow(), p: []};
                d.ch_programme.every(function(p, i){
                    p.start = p.start.split("-");
                    p.start = Date.parse([p.start[1], p.start[0], p.start[2]].join("/") + ":00 +0300");
                    if(p.start <= r.n){
                        r.i = i;
                        if(all || r.p.length == 0) r.p.push(p);
                        else r.p[0] = p;
                        return true;
                    } else {
                        r.p.push(p);
                        return all;
                    }
                });
                f(r);
            }, 
            error: f
        });
    };
    this.handleData = function(d){
        if(d.message == "group"){
            for(var i = 0; i < tvs.items.length; i++) tvs.items[i].display = !d.data || d.data == tvs.items[i].group;
            tvs.header.items[0].extensionLabel = d.data;
            TVXInteractionPlugin.executeAction("[cleanup|reload:content]");
        }else if(d.message == "setchan")
            if(TVXTools.isFullStr(d.data)) epg(null, false, function(r){
                if(TVXTools.isFullStr(r)) TVXInteractionPlugin.error(r);
                else TVXInteractionPlugin.executeAction("panel:data", {
                    type: "list", headline: "Задать программу", compress: true,
                    template: {
                        type: "control", layout: "0,0,10,1", action: "interaction:commit:message:setchan",
                        data: {id: d.data, epg: "{context:id}", img: "{context:image}"}
                    },
                    items: r.channels.map(function(c){return {
                        id: TVXTools.base64EncodeId(c.chan_id),
                        image: c.chan_icon,
                        label: c.chan_names.split(" • ", 2)[0],
                        extensionLabel: c.chan_id
                    }})
                });
            });
            else TVXInteractionPlugin.executeAction("[cleanup|reload:content]", fav(
                [d.data.id, TVXTools.base64DecodeId(d.data.epg), TVXTools.base64EncodeId(d.data.img)].join(":")
            ))
        else if(d.message == "addchan") TVXInteractionPlugin.success("Добавлен канал №" + fav(d.data));
        else if(d.message == "remchan") TVXInteractionPlugin.executeAction("reload:content", fav(TVXTools.strToNum(d.data, -1)));
        else if((d.message = d.message.split(":", 3))[0] != "epg") return false;
        else if(d.message.length > 2) epg(d.message[1], true, function(r){
            if(!d) TVXInteractionPlugin.info("Программа не найдена");
            else if(typeof r == "string") TVXInteractionPlugin.error(r);
            else TVXInteractionPlugin.executeAction("content:data", {
                type: "list", headline: d.message[2], extension: tvs.extension, compress: true, flag: "info",
                underlay: {items:[{id: "inf", layout: "9,0,7,8", alignment: "center", type: "space", headline: "", text: ""}]},
                template: {layout: "0,0,9,1", action: "close:info", color: "transparent", offset: "0,0,0,.1"},
                items: r.p.map(function(p, i){return {
                    group: TVXDateTools.getFormattedDateStr(p.start, "dd.mm.yyyy"),
                    text: [
                        i < r.i ? "" : i > r.i ? "{col:msx-white}" : "{col:msx-yellow}",
                        TVXDateTools.getFormattedTimeStr(p.start, "hh:mm"),
                        " ",
                        p.title
                    ],
                    focus: i == r.i,
                    selection: {
                        action: "update:content:underlay:inf",
                        data: {headline: p.title, text: p.description}
                    }
                }})
            });
        });
        else if(d.message.length > 1) epg(d.message[1], false, function(d){
            if(typeof d == "string") TVXInteractionPlugin.error(d);
            else if(d) TVXInteractionPlugin.executeAction(
                "[player:label:content:" + d.p[0].title +
                "|player:video:position:" + ((d.n - d.p[0].start) / 1000) +
                "|player:video:duration:" + ((d.p[1].start - d.p[0].start) / 1000) + "]"
            );
        });
        else if(d.data) epg(d.data.e, false, function(r){
            console.log(r);
            if(r) TVXInteractionPlugin.executeAction("update:content:" + d.data.i, typeof r == "string"
                ? {titleFooter: "{col:msx-red}{ico:warn} " + r}
                : {live: {
                    type: "schedule", from: r.p[0].start, to: r.p[1].start,
                    over: {action: "interaction:commit:message:epg", data: d.data},
                    stamp: "-{countdown:time:hh:mm}",
                    text:
                        "{ico:msx-white:play-arrow} {txt:msx-white:from:time:hh:mm} " + r.p[0].title +
                        "{br}{ico:msx-white:skip-next} {txt:msx-white:to:time:hh:mm} " + r.p[1].title
                }}
            );
        }); 
        return true;
    };
    this.handleRequest = function(i, _, f){
        if(i == "init") f({
            type: "list",
            template: {type: "control", layout: "0,0,8,1", area: "2,0,8,6", extensionIcon: "live-tv"},
            items: tvn.map(function(n, i){return {
                icon: icn[i],
                label: tvt[i],
                action: "content:request:interaction:" + n
            }})
        });
        else if(tvn.indexOf(i) < 0) return false;
        else if(i == "Fav") fav(f);
        else if(tvs.flag == i) f(tvs);
        else chs(i, f);
        return true;
    };
}