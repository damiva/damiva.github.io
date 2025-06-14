function files(url, exts, success, error){
  TVXServices.ajax.get(url, {success: function(d){
    var ds = [], fs = [], dp = new window.DOMParser();
    d = p.parseFromString(d, "text/html").getElementsByTagName("a");
    for(var i = 0; i < d.length; i++){
      var l = d[i].childNodes[0].nodeValue, a = d[i].getAttribute("href"), x = 0;
      if(a.length > 0){
        if(a[a.length - 1] == "/")
          ds.push({icon: "msx-yellow:folder", label: l, action: "interaction:request:" + id + a.action + "@" + window.location.href});
        else if(a = exts.item(a, addr+id+a, l)) fs.push(a);
      }
    }
    success(ds.concat(fs));
  }, error: error || success}, {dataType: "html"});
}
