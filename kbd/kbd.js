function keyboard(act, str, kbd, url){
    if(!url) url = window.location.origin + "/kbd/";
    if(typeof kbd == "string") kbd = kbd == "rus" || kbd == "123" ? kbd : "eng";
    else kbd = kbd ? "rus" : "eng";
    var s = str && typeof str == "string",
        h = s ? TVXServices.storage.getFullStr(str, "") : "",
        v = "", o = "";
    this.handleData = function(k){
        if(typeof k == "object") switch(k.message){
            case "kbd": TVXInteractionPlugin.showPanel(url + kbd + ".json"); return true;
            case "key": switch(k = k.data){
                case "eng":
                case "rus":
                case "123":
                    TVXInteractionPlugin.executeAction("replace:panel:keyboard:" + url + (kbd = k) + ".json");
                    return true;
                case "ok":
                    if(v) {
                        TVXInteractionPlugin.executeAction("[close:keyboard|" + TVXTools.strReplace(act, "{VAL}", v) + "]");
                        if(str) h = v;
                        if(s) TVXServices.storage.set(str, h = v);
                        v = "";
                    }else if(h) {
                        v = h;
                        break;
                    }
                    return true;
                case "bs":
                    if(v) v = TVXTools.strTruncate(v, v.length - 1);
                    break;
                default: if(k) v += k;
            }
            k = null;
            if(v && o != "done") k = o = "done";
            else if(!v && h && o != "history") k = o = "history";
            else if(!v && !h && o) k = o = "";
            if(k !== null) TVXInteractionPlugin.executeAction("update:panel:OK", {icon: o});
            TVXInteractionPlugin.executeAction("update:panel:VAL", {label: v + "{col:msx-white-soft}" + (v ? "_" : h)});
            return true;        
        }
        return false;
    };
}