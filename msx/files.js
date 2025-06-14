function files(addr){
  this.handleRequest = function(i, _, f){
    if(i[i.length - 1] != "/") return false;
    TVXServices.ajax.get(addr + i, {
      success: function(d){
        d = 
      },
      error: function(e){
        TVXInteractionPlugin.error(e);
        f();
      }
    }, {dataType: "html"});
    return true;
  };
}
