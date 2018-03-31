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
            createBasicStructure(url);
            localStorage.setItem('token', url);
            return url;
        }
    }
}
function createBasicStructure(token){
    console.log('Calling function createBasicStructure...');
    $.ajax({
        url: 'https://api.dropboxapi.com/2/files/list_folder',
        type: 'POST',
        data: JSON.stringify({path: ''}),
        datatype : "application/json",
        contentType: "application/json",
        headers: {
        "Authorization": "Bearer "+token
        },
    })
    .done(function(data) {
        if(data.entries.length == 0){
            create_folder('/annotations', token);
            create_folder('/myFiles', token);
            console.log('Creating the folders...');
        }else{
            console.log('Folders already exist!');
        }
    })
    .fail(function(error) {
        console.log('Create basic structure: error');
        console.log(error);
    });

    return false;
}
function create_folder(folder, token){
    $.ajax({
        url: 'https://api.dropboxapi.com/2/files/create_folder',
        type: 'POST',
        data: JSON.stringify({path: folder}),
        datatype : "application/json",
        contentType: "application/json",
        headers: {
        "Authorization": "Bearer "+token
        },
    }).done(function(data) {
        console.log('Folder "'+folder+'" created with success!');
    })
    .fail(function(error) {
        console.log('Create basic structure: error');
        console.log(error);
    });
    return false;
}
function isAuthenticated(){
    return !!getAccessToken();
}
$(document).ready(function() {
    if(isAuthenticated()){
        $('#login h1').html('Notesapp');
        $('#login .ui-content').html($('#loadAuthenticated').html());
        $('#loadAuthenticated').remove();
    }else{
        $('#loginForDropbox').attr('href', 'https://www.dropbox.com/1/oauth2/authorize?response_type=token&client_id=88mpcrjr1g5q8fo&redirect_uri='+window.location);
    }
});