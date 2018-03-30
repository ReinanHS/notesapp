function getAccessToken() {
    if(localStorage.getItem('token') != null){
        return localStorage.getItem('token');
      }
      // Se é a primeira vez que ele vai fazer a autenticação.
    else{
        url = window.location.hash.slice(0, window.location.hash.indexOf("&"));
        url = url.slice(url.indexOf("=")+1);
        if(url == ''){
            return false;
        }else{
            localStorage.setItem('token', url);
            return url;
        }
    }
}
function isAuthenticated(){
    return !!getAccessToken();
}

$(document).ready(function() {
    if(isAuthenticated()){
        $.mobile.changePage( "#authentic", { transition: "slideup", changeHash: false });
    }else{
        $('#loginForDropbox').attr('href', 'https://www.dropbox.com/1/oauth2/authorize?response_type=token&client_id=88mpcrjr1g5q8fo&redirect_uri='+window.location);
        $.mobile.changePage( "#login", { transition: "slideup", changeHash: false });
    }
});