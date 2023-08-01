var EMPTY = [{icon: "arrow-back", label: "{dic:empty|Nothing found}", action: "back"}];
function OPTIONS(r, g, y){
    var k = ["red", "green", "yellow"], o = {
        headline: "{dic:caption:options|Options}:", items: [],
        template: {enumerate: false, type: "control", layout: "0,0,8,1"}
    }
    o.caption = o.headline;
    for(var i = 0; i < arguments.length; i++) if(arguments[i]){
        arguments[i].key = k[i];
        arguments[i].icon = "msx-" + k[i] + ":stop";
        o.items.push(arguments[i]);
        o.caption += "{tb}{ico:" + arguments[i].icon + "} " + arguments[i].label;
    }
    return o.items.length ? o : null;
}
function GoOn(){
    var s = function(i){
        var l = TVXTools.deserialize(TVXServices.storage.getFullStr("goon", "[]"));
        if(!i){
            return l;
        }else if(typeof i != "string") {
            l = l.filter(function(e, n){return e[1] != i[1]});
            l.unshift(i);
            if(l.length > 6) l.pop();
        }else{
            l = i ? l.filter(function(e){return e[0] != i}) : [];
        }
        if(l.length == 0) TVXServices.storage.remove("goon");
        else TVXServices.storage.set("goon", TVXTools.serialize(l));
    };
    this.handleEvent = function(d){
        if(d.event == "video:load" && d.info.type == "video") s([
            d.info.id,
            d.info.id.length < 40 ? d.info.url.substr(28, d.info.url.lastIndexOf("/") - 27) : d.info.id.substr(0, 40),
            d.info.label,
            d.info.properties["info:image"] || "",
            d.info.number + "/" + d.info.count
        ]);
    };
    this.handleData = function(d){
        if(d.message != "goon") return false;
        s(d.data || "");
        TVXInteractionPlugin.executeAction("reload:content");
        return true;
    };
    this.handleRequest = function(i, _, f){
        if(i != "goon") return false;
        i = s();
        f({
            type: "list", reuse: false, cache: false, restore: false,
            template: {
                type: "control", layout: "0,0,12,1",
                data: "{context:id}", imageFiller: "height-center",
                properties: {"resume:key": "id"}, progress: -1,
                live: {type: "playback", action: "player:show", source: "id"},
                options: OPTIONS(
                    {label: "{dic:label:clear|Clear}", action: "interaction:commit:message:goon", data: ""},
                    null,
                    {label: "{dic:rem|Remove}", action: "interaction:commit:message:goon", data: "{context:id}"}
                )
            },
            items: i.length == 0 ? EMPTY : i.map(function(e){return {
                id: e[0],
                label: e[2],
                image: e[3] || undefined,
                icon: e[3] ? undefined : e[0].length < 40 ? "folder-open" : "bolt",
                extensionLabel: e[4],
                action: e[0].length < 40 
                    ? ("content:" + e[1] + ">" + e[0] + ">execute") 
                    : "execute:request:interaction:torrent"
            }})
        });
        return true;
    };
}