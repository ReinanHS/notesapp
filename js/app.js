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
            saveAccountLocalStorage(url);
            localStorage.setItem('token', url);
            return url;
        }
    }
}
function getCurrentAccount(){
    //console.log('Getting current account....');
    if(localStorage.getItem('account') === null){
        saveAccountLocalStorage(getAccessToken());
        return JSON.parse(localStorage.getItem('account'));
    }else{    
        return JSON.parse(localStorage.getItem('account'));
    }
}
function saveAccountLocalStorage(token){
    $.ajax({
        url: 'https://api.dropboxapi.com/2/users/get_current_account',
        type: 'POST',
        headers: {
        "Authorization": "Bearer "+token,
        },
    })
    .done(function(data) {
        //console.log('Get current account success!');
        localStorage.setItem('account', JSON.stringify(data));
    })
    .fail(function(error) {
        //console.log('Get current account error!');
        //console.log(error);
    });
    return false;
}
function createBasicStructure(token){
    //console.log('Calling function createBasicStructure...');
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
            //console.log('Creating the folders...');
        }else{
            //console.log('Folders already exist!');
        }
    })
    .fail(function(error) {
        //console.log('Create basic structure: error');
        //console.log(error);
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
        //console.log('Folder "'+folder+'" created with success!');
    })
    .fail(function(error) {
        //console.log('Create basic structure: error');
        //console.log(error);
    });
    return false;
}
function getAnnotations(){
    ////console.log('Search the annotations...');
    localStorage.setItem('annotations', '');
    $.ajax({
        url: 'https://api.dropboxapi.com/2/files/list_folder',
        type: 'POST',
        data: JSON.stringify({path: '/annotations'}),
        datatype : "application/json",
        contentType: "application/json",
        headers: {
        "Authorization": "Bearer "+getAccessToken()
        },
    }).done(function(annotations) {
        //console.log(annotations.entries.length+' files find with success!');
        for (var i = 0; i < annotations.entries.length; i++){
            ////console.log(annotations.entries[i]);
            if(annotations.entries[i].path_display.slice(annotations.entries[i].path_display.indexOf("."),annotations.entries[i].path_display.length) == '.json'){
                loadAnnotationAJAX(annotations.entries[i], i);
            }else{
                //console.log('The file "'+annotations.entries[i].path_display+'" not is a json');
            }
        }
        addViewAnnotation();
    })
    .fail(function(error) {
        //console.log('Error on search the annotations!');
        //console.log(error);
    });
    return false; 
}
function loadAnnotationAJAX(annotation, index){
    $.ajax({
        url: 'https://api.dropboxapi.com/2/files/get_temporary_link',
        type: 'POST',
        data: JSON.stringify({path: annotation.path_display}),
        datatype : "application/json",
        contentType: "application/json",
        headers: {
        "Authorization": "Bearer "+getAccessToken()
        },
    }).done(function(data) {
        $.getJSON(data.link, function(result){
            var file = {
                id: annotation.id,
                name: annotation.name,
                path: annotation.path_display,
                data: annotation.server_modified,
                link: data.link,
                result: result,
            }

            addAnnotations(file, index);
            addViewAnnotation();
        });
    })
    .fail(function(error) {
        //console.log('Error on getting link of annotation!');
        //console.log(error);
    });
}
function addAnnotations(annotation, index){
    //console.log('Adding the annotation "'+annotation.path+'" in LocalStorage!');
    if(localStorage.getItem('annotations') === null || localStorage.getItem('annotations') == ''){
        var annotations = [];
        annotations[0] = annotation;
        localStorage.setItem('annotations', JSON.stringify(annotations));
    }else{
        var annotations = JSON.parse(localStorage.getItem('annotations'));
        annotations[index] = annotation;
        localStorage.setItem('annotations', JSON.stringify(annotations));
    }
}
function addAnnotationsForUpalod(annotation, index){
    //console.log('Adding the annotation for upalod: "'+annotation.path+'" in LocalStorage!');
    if(localStorage.getItem('annotationsForUpalod') === null || localStorage.getItem('annotationsForUpalod') == ''){
        var annotations = [];
        annotations[0] = annotation;
        localStorage.setItem('annotationsForUpalod', JSON.stringify(annotations));
    }else{
        var annotations = JSON.parse(localStorage.getItem('annotationsForUpalod'));
        annotations[index] = annotation;
        localStorage.setItem('annotationsForUpalod', JSON.stringify(annotations));
    }
}
function addAnnotationsForDelete(annotation){
    console.log('Adding the annotation for delete: "'+annotation+'" in LocalStorage!');
    if(localStorage.getItem('addAnnotationsForDelete') === null || localStorage.getItem('addAnnotationsForDelete') == 'null'){
        var annotations = [];
        annotations[0] = annotation;
        localStorage.setItem('addAnnotationsForDelete', JSON.stringify(annotations));
    }else{
        var annotations = JSON.parse(localStorage.getItem('addAnnotationsForDelete'));
        annotations[annotations.length+1] = annotation;
        localStorage.setItem('addAnnotationsForDelete', JSON.stringify(annotations));
    }
}
function createAnnotation(annotation){
    //console.log('Creating annotation....');
    $.ajax({
        url: 'https://content.dropboxapi.com/2/files/alpha/upload',
        type: 'POST',
        data: JSON.stringify(annotation),
        datatype : "application/octet-stream",
        contentType: "application/octet-stream",
        headers: {
        "Authorization": "Bearer "+getAccessToken(),
        "Dropbox-API-Arg": JSON.stringify({path: annotation.path}),
        },
    }).done(function(data) {
        //console.log('annotation create with success!');
    })
    .fail(function(error) {
        //console.log('Error on getting link of annotation!');
        //console.log(error);
    });
    return false;   
}
function deleteAnnotation(annotation){
    console.log('Deleting annotation....');
    $.ajax({
        url: 'https://api.dropboxapi.com/2/files/delete_v2',
        type: 'POST',
        data: JSON.stringify({path: annotation}),
        datatype : "application/json",
        contentType: "application/json",
        headers: {
        "Authorization": "Bearer "+getAccessToken(),
        },
    }).done(function(data) {
        console.log(data);
        console.log('annotation delete with success!');
    })
    .fail(function(error) {
        console.log('Error on delet annotation!');
        console.log(error);
    });
    return false;    
}
function addViewAnnotation(){
    
    if(localStorage.getItem('annotations') != ""){
        $('#login .ui-content').html('');
        var annotations = JSON.parse(localStorage.getItem('annotations'));
        var months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
        var debug = 0;
        for (var i =  0; i <= annotations.length; i++) {
            $('#loadAuthenticated h3').html(annotations[i].result.title);
            $('#byName').html('BY '+annotations[i].result.name);
            $('#CardDescription').html(annotations[i].result.annotation.replace(/<\/?[^>]+(>|$)/g, ""));
            $('#cardData').html('<strong>'+annotations[i].result.date+'</strong>');
            $('#login .ui-content').append('<div id="'+i+'" onclick="setView(this);"></div>');
            $('#'+i).html($('#loadAuthenticated').html());
        }
    }else{
        $('#login .ui-content').html($('#createAnnotationInfo').html());
    }

}
function updateAll(){
    if(navigator.onLine){
        if(localStorage.getItem('annotationsForUpalod') === null || localStorage.getItem('annotationsForUpalod') == ''){
            console.log('annotationsForUpalod is Null');
        }
        else{
            var upload = JSON.parse(localStorage.getItem('annotationsForUpalod'));
            for (var i =  0; i < upload.length; i++) {
                createAnnotation(upload[i]);
            }
            localStorage.setItem('annotationsForUpalod', '');
        }


        if(localStorage.getItem('addAnnotationsForDelete') === null || localStorage.getItem('addAnnotationsForDelete') == 'null'){
            console.log('annotationsForDelete is Null');
        }
        else{
            var annotationDelete = JSON.parse(localStorage.getItem('addAnnotationsForDelete'));
            for (var i =  0; i < annotationDelete.length; i++) {
                console.log('delete');
                deleteAnnotation(annotationDelete[i]);
            }
            localStorage.setItem('addAnnotationsForDelete', null);
        }
        getAnnotations();
    }else{
        $('#login .ui-content').html($('#login .ui-content').html()+$('#offline-info').html());
        addViewAnnotation();
    }
    return false;
}
function getFileName(){
    //console.log('Getting name of annotation');
    var date = new Date();
    var annotation = JSON.parse(sessionStorage.getItem('newAnnotation'));
    if(annotation == null){
        //console.log('Name of annotation is '+('/annotations/'+date.getTime()+'.json'));
        return ('/annotations/'+date.getTime()+'.json');
    }else{
        var name = annotation.title;
        name = name.split(' ').join('');
        name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        name = '/annotations/'+name+'-'+date.getTime()+'.json';
        //console.log('Name of annotation is '+name);
        return name;
    }
}
function getDate(){
    var d = new Date();
    var CreateDate = {
        year: d.getUTCFullYear(),
        month: d.getMonth(),
        day: d.getDay(),
        hours: d.getHours(),
        minutes: d.getMinutes(),
        seconds: d.getSeconds(), 
    };
    return CreateDate;
}
function setView(index){
    var id = $(index).attr('id');
    var annotations = JSON.parse(localStorage.getItem('annotations'));
    sessionStorage.setItem('newAnnotation', JSON.stringify(annotations[id]));
    if(annotations[id].result.type == 'choice-1'){
        $('#viewCard .ui-content').html(annotations[id].result.annotation);
        $('#editNormal').show();
        $('#editLatex').hide();
        $('#trumbowyg-demo').trumbowyg('html', annotations[id].result.annotation);
    }else if(annotations[id].result.type == 'choice-2'){
        $('#viewCard .ui-content').html('<div lang="latex">'+annotations[id].result.annotation+'</div>');
        $('#editNormal').hide();
        $('#editLatex').show();
        $('#trumbowyg-latex').trumbowyg('html', annotations[id].result.annotation);
    }
    sessionStorage.setItem('indexAnnotation', id);
    sessionStorage.setItem('newAnnotation', JSON.stringify(annotations[id]));
    sessionStorage.setItem('actionType', 'edit');
}
function deleteListAnnotation(){
    var annotations = JSON.parse(localStorage.getItem('annotations'));
    delete annotations[sessionStorage.getItem('indexAnnotation')];
    localStorage.setItem('annotations', JSON.stringify(annotations));
    addViewAnnotation();
}
function isAuthenticated(){
    return !!getAccessToken();
}
$(document).ready(function() {
    if(isAuthenticated()){
        $('#login h1').html('Notesapp');
        $('#login .ui-content').html('');
        $('#btnCreateAnnotation').show();
        $('#btnReloadAnnotation').show();
    }else{
        $('#loginForDropbox').attr('href', 'https://www.dropbox.com/1/oauth2/authorize?response_type=token&client_id=88mpcrjr1g5q8fo&redirect_uri='+window.location);
    }

    if(navigator.onLine){
        updateAll();
    }else{
        $('#login .ui-content').html($('#login .ui-content').html()+$('#offline-info').html());
        addViewAnnotation();
    }

    $('#formCreateAnnotation').submit(function(event) {
        /* Act on the event */
        sessionStorage.clear('newAnnotation');
        sessionStorage.setItem('actionType', 'create');
        var userName = getCurrentAccount();
        if(userName == null){
            userName = getCurrentAccount();
        }

        var d = new Date();
        var CreateDate = {
            year: d.getUTCFullYear(),
            month: d.getMonth(),
            day: d.getDay(),
            hours: d.getHours(),
            minutes: d.getMinutes(),
            seconds: d.getSeconds(), 
        };

        var annotation = {
            title: $('#un').val().replace(/<\/?[^>]+(>|$)/g, ""),
            date: $('#date').val(),
            name: userName.name.display_name,
            type: $( "#formCreateAnnotation input[type='radio']:checked" ).val(),
            path: getFileName(),
            createDete: CreateDate,
        }
        sessionStorage.setItem('newAnnotation', JSON.stringify(annotation));

        if(annotation.type == 'choice-1'){
            $('#editNormal').show();
            $('#editLatex').hide();
        }else if(annotation.type == 'choice-2'){
            $('#editNormal').hide();
            $('#editLatex').show();
        }

        $.mobile.changePage( "#editCard", { transition: "slideup", changeHash: false });
        return false;
    });

    $('#trumbowyg-demo').trumbowyg({
        lang: 'pt',
        btns: [
            ['viewHTML'],
            ['formatting'],
            ['strong', 'em', 'del'],
            ['superscript', 'subscript'],
            ['insertImage'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['unorderedList', 'orderedList'],
        ],
    });

    $('#trumbowyg-latex').trumbowyg({
        lang: 'pt',
        btns: [
            ['fullscreen'],
        ],
    });

    $('#btnSaveAnnotation').click(function(event) {
        var annotation = JSON.parse(sessionStorage.getItem('newAnnotation'));
        if(sessionStorage.getItem('actionType') == 'create'){
            if(annotation == null){
                alert('Error ao salvar');
            }else{
                if(annotation.type == "choice-1"){
                    annotation.annotation = $('#trumbowyg-demo').trumbowyg('html');
                }else if(annotation.type == "choice-2"){
                    annotation.annotation = $('#trumbowyg-latex').trumbowyg('html');
                }
                sessionStorage.setItem('newAnnotation', JSON.stringify(annotation));

                if(localStorage.getItem('annotations') === null || localStorage.getItem('annotations') == ''){
                    //addAnnotations(JSON.parse(sessionStorage.getItem('newAnnotation')), 0);
                    addAnnotationsForUpalod(JSON.parse(sessionStorage.getItem('newAnnotation')), 0);
                    sessionStorage.clear('newAnnotation');
                }else{
                    var annotations = JSON.parse(localStorage.getItem('annotations'));
                    //addAnnotations(JSON.parse(sessionStorage.getItem('newAnnotation')), (annotations.length+1));
                    addAnnotationsForUpalod(JSON.parse(sessionStorage.getItem('newAnnotation')), (annotations.length+1));
                    sessionStorage.clear('newAnnotation');
                }
            }
            $.mobile.changePage( "#login", { transition: "slideup", changeHash: false });
            updateAll();
        }else if(sessionStorage.getItem('actionType') == 'edit'){
            if(annotation == null){
                alert('Error ao salvar');
            }else{
                if(localStorage.getItem('annotations') === null || localStorage.getItem('annotations') == ''){
                    addAnnotationsForDelete(annotation.path);
                    //addAnnotationsForUpalod(JSON.parse(sessionStorage.getItem('newAnnotation')), 0);
                    sessionStorage.clear('newAnnotation');
                }else{
                    var annotations = JSON.parse(localStorage.getItem('annotations'));
                    addAnnotationsForDelete(annotation.path);
                    //addAnnotationsForUpalod(JSON.parse(sessionStorage.getItem('newAnnotation')), (annotations.length+1));
                    sessionStorage.clear('newAnnotation');
                }

            }
            $.mobile.changePage( "#login", { transition: "slideup", changeHash: false });
            updateAll();
        }
    });

    $('#btnDeleteAnnotation').click(function(event) {
        var annotation = JSON.parse(sessionStorage.getItem('newAnnotation'));
        addAnnotationsForDelete(annotation.path);
        deleteListAnnotation();
        //$.mobile.changePage( "#login", { transition: "slideup", changeHash: false });
    });
});