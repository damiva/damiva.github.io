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
function opts(o, h, v, e){
    var s = "refresh";
    h = h || "{dic:caption:options|opt/menu}";
    var r = {caption: h + (v || ""), headline: h + ":", items: [], template: {
        layout: "0,0,8,1", type: "control", enumerate: false, imagePreload: true, action: "interaction:load:" + window.location.href
    }};
    if(e) r.extension = e;
    o.forEach(function(o){if(o){
        if(o.key){
            o.progress = 1;
            o.progressColor = "msx-" + o.key;
            if(!o.action) o.action = r.template.action;
            if(!o.icon) o.icon = s;
            r.caption += "{tb}{col:" + o.progressColor + "}{ico:" + o.icon + "}" + (o.icon == s ? "" : (" " + o.label));
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
function prms(k, c){
    var v = TVXServices.storage.getBool(k = "ts:" + k, false);
    if(c) TVXServices.storage.set(k, v = !v);
    return v;
}