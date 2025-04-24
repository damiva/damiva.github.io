function search(){
    const P = "Peer", D = "CreateDate";
    var K = new keyboard("replace:main:request:interaction:{VAL}@" + window.location.href, "ts:search", DRus);
        S = "",
        C = function(c){c == "Movie" ? "movie" : c == "Series" || c == "TVShow" ? "tv" : c},
        Q = function(t){
            t = {
                1: "Авторский",
                100: "Любит. одноголосый",
                101: "Любит. двухголосый",
                102: "Любит. многоголосый",
                103: "Любит. студия",
                200: "Проф. одноголосый",
                201: "Проф. двухголосый",
                202: "Проф. многоголосый",
                203: "Проф. студия",
                300: "Дубляж",
                301: "Лицензия"
            }[t];
            return t ? ("{ico:msx-white:ausiotrack}" + t) : "";
        };
    this.handleData = function(d){
        if(d.message == "sort"){
            S = d.data == "Peer" || d.data == "CreateDate" ? d.data : "";
            TVXInteractionPlugin.executeAction("reload:content");
            return true;
        }
        return K.handleData(d);
    };
    this.handleRequest = function(i, _, f){
        if(i.charAt(0) != "?") return false;
        TVXServices.ajax.get(
            Addr + "/search/?query=" + encodeURIComponent(i = i.substr(1)), 
            {success: function(d){
                var p = S == P, c = S == D;
                if(S) d.sort(function(a, b){return a[S] < b[S] ? 1 : a[S] > b[S] ? -1 : 0});
                f(Trns(
                    d.map(function(t){return Filter.dsp(t.Categories = C(t.Categories)) ? {
                        data: {
                            link: t.Magnet, 
                            title: t.Title, 
                            poster: t.Poster || t.IMDB, 
                            category: t.Categories
                        },
                        image: t.Poster || t.IMDB && (addr + "/msx/imdb/" + t.IMDBID) || null,
                        icon: t.Poster ? null : "msx-white-soft:swap-vert-circle",
                        headline: t.Title,
                        text: Q(t.AudioQuality),
                        titleFooter: Filter.icn(t.Categories) + " " + t.Size,
                        stamp: "{ico:date-range}" + TVXDateTools.getFormattedDateStr(new Date(t.CreateDate), "dd.mm.yyyy")
                            + " {ico:north}" + t.Peer + " {ico:south}" + t.Seed
                    } : {display: false}}),
                    "{ico:search} " + i,
                    [
                        {icon: (!p ? "msx-white-soft" : "") + "north", data: p ? "" : P, action: "interaction:commit:message:sort"},
                        {icon: (!c ? "msx-white-soft" : "") + "date-range", data: d ? "" : D, action: "interaction:commit:message:sort"}
                    ]
                ));
            }, error: function(e){
                TVXInteractionPlugin.error(e);
                f();
            }}
        );
        return true;
    };
}