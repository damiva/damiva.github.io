var addr = "";
function ajax(){
    var d = null, s = null, t = null;
    for(var i = 1; i < arguments.length; i++) switch(typeof arguments[i]){
        case "string": t = {dataType: arguments[i]}; break;
        case "object": d = JSON.stringify(arguments[i]) ; break;
        case "function": if(s) s.error = arguments[i]; else s = {success: arguments[i], error: arguments[i]};
    }
    TVXServices.ajax[d ? "post" : "get"](addr + arguments[0], d || s, d ? s : t, d ? t : undefined);
}
function size(s){
    var i = s == 0 ? 0 : Math.floor(Math.log(s) / Math.log(1024));
    return (s / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
}
function opts(o, v, r, u){
    var r = {
        caption: "{dic:caption:options|opt/menu}", ready: r, underlay: u, items: [], template: {
        layout: "0,0,8,1", type: "control", enumerate: false, imagePreload: true, action: "interaction:load:" + window.location.href
    }};
    r.headline = r.caption + ":";
    if(v) r.caption += v;
    o.forEach(function(o){if(o){
        if(o.key){
            o.progress = 1;
            o.progressColor = "msx-" + o.key;
            if(!o.action) o.action = r.template.action;
            r.caption += "{tb}{col:" + o.progressColor + "}{ico:" + (o.icon ? (o.icon + "} " + o.label) : ((o.icon = "refresh") + "}"));
        }
        r.items.push(o);
    }})
    return r.items.length ? r : null;
}
function icon(v, r){return r 
    ? (v ? "msx-white:radio-button-on" : "radio-button-off") 
    : (v ? "msx-white:check-box" : "check-box-outline-blank");
}
function cati(c){return c == "movie" ? "movie" : c == "tv" ? "live-tv" : c == "music" ? "audiotrack" : "more-horiz"}
function catg(c){return "{ico:" + cati(c) + "}"}
function prms(k, c){
    var v = TVXServices.storage.getBool(k = "ts:" + k, false);
    if(c) TVXServices.storage.set(k, v = !v);
    return v;
}
function proxy(u, d){
    var g = d.data === undefined, s = {success: d.success, error: d.error}, t = d.dataType ? {dataType: d.dataType} : null;
    u = addr + "/msx/proxy?url=" + encodeURIComponent(u);
    if(d.header) u = u + "&" + Object.keys(d.header).map(function(k){return "header=" + encodeURIComponent(k + ":" + d.header[k])}).join("&");
    TVXServices.ajax[g ? "get" : "post"](u, g ? s : d.data, g ? t : s, g ? undefined : t);
};