// Variáveis constantes
var CLIENT_ID = getClientID();
var WEB_SITE_URL = 'http://localhost/notesapp/';
// Analisa a url e obtém o token de acesso se estiver no hash de urls
function getAccessTokenFromUrl() {
  // Aqui estamos verificando se o usuário já fez uma autenticação.
  if(localStorage.getItem('token') != null){
    return localStorage.getItem('token');
  }
  // Se é a primeira vez que ele vai fazer a autenticação.
  else{
    return utils.parseQueryString(window.location.hash).access_token;
  }
}
function get_accountDBX(){
  return jQuery.ajax({
    url: 'https://api.dropboxapi.com/2/users/get_current_account',
    type: 'POST',
    headers: {
    "Authorization": "Bearer "+getAccessTokenFromUrl()
    },
    success: function (data) {
      /*console.log(data);*/
      myProfile(data);
    },
    error: function (error) {
      console.log(error);
    }
  })
}
function myProfile(data){
  var getUserInfo = data;
  /*console.log(getUserInfo);*/
  $('#myProfile-img').attr('src', getUserInfo.profile_photo_url);
  $('#myProfile-name').html(getUserInfo.name.display_name);
  $('#myProfile-email').html(getUserInfo.email);
}
// Se o usuário acabasse de ser redirecionado da autenticação, o hash da URL
// Tem o token de acesso.
function isAuthenticated() {
  return !!getAccessTokenFromUrl();
}
// Este exemplo mantém as sessões de autenticação e de não autênticados
// Aqui vemos se usuário está autênticado ou não
// Se ele estive autênticado nos ativamos a DIV
function showPageSection(elementId) {
  document.getElementById(elementId).style.display = 'block';
}
// Se ele estive autênticado ou isAuthenticated == True
if (isAuthenticated()) {
  // Se ele estive autênticado nos ativamos a DIV
  showPageSection('authed-section');
  // Aqui vamos salvar o token em uma session Storage para não precisar autenticar novamente.
  /*
  
  O objeto localStorage armazena os dados sem data de validade. 
  Os dados não serão excluídos quando o navegador estiver fechado e estarão disponíveis 
  no próximo dia, semana ou ano.

  */
  localStorage.setItem('token', getAccessTokenFromUrl());

  get_accountDBX();

  // Crie uma instância do Dropbox com o token de acesso e use-o para
  // procurar e processar os arquivos no diretório raiz dos usuários.
  var dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
  dbx.filesListFolder({path: ''})
    .then(function(response) {
      renderItems(response.entries);
    })
    .catch(function(error) {
      console.error(error);
    });

    function displayFiles(files) {
      var filesList = document.getElementById('file');
      var li;
      for (var i = 0; i < files.length; i++) {
        console.log('files');
        li = document.createElement('tr');
        li.appendChild(document.createTextNode(files[i].name));
        filesList.appendChild(li);
      }
    }
} else {
  // Se não estiver autênticado.
  showPageSection('pre-auth-section');
  // Defina o href das âncoras de login usando dbx.getAuthenticationUrl()
  var dbx = new Dropbox.Dropbox({ clientId: CLIENT_ID });
  var authUrl = dbx.getAuthenticationUrl(WEB_SITE_URL);
  document.getElementById('authlink').href = authUrl;
}

// Render a list of items to #files
function renderItems(items) {
  $('#file').html('');
  var filesContainer = document.getElementById('file');
  var filesItems = items.reverse();
  filesItems.forEach(function(item) {

    jQuery.ajax({
      url: 'https://api.dropboxapi.com/2/files/get_temporary_link',
      type: 'POST',
      data: JSON.stringify({path: item.path_display}),
      datatype : "application/json",
      contentType: "application/json",
      headers: {
      "Authorization": "Bearer "+getAccessTokenFromUrl()
      },
      success: function (data) {
        $.getJSON(data.link, function(result){
          console.log(result);


          var deleteFileClick = 'onclick="deleteFile('+String("'"+item.path_display+"'")+','+String("'"+item.name+"'")+')"';
          var ListBtnHTML = '<a class="btn btn-success btn-sm" href="#" role="button"><i class="fas fa-eye"></i> Visualizar</a><a class="btn btn-warning btn-sm" href="#" role="button"><i class="fas fa-edit"></i> Editar</a><a class="btn btn-danger btn-sm" href="#" role="button" '+deleteFileClick+'><i class="fas fa-trash"></i> Excluir</a>';
          var li = document.createElement('tr');
          $(li).attr('style', 'background-color: '+result.color+';');

          li.innerHTML = '<td>'+result.title+'</td>'+'<td>'+item.server_modified+'</td>'+'<td>'+ListBtnHTML+'</td>';
          filesContainer.appendChild(li);


        });
      },
      error: function (error) {
        console.log(error);
      }
    })

  });
}
function renderItemsUpdate(){
  jQuery.ajax({
    url: 'https://api.dropboxapi.com/2/files/list_folder',
    type: 'POST',
    data: JSON.stringify({path: ''}),
    datatype : "application/json",
    contentType: "application/json",
    headers: {
    "Authorization": "Bearer "+getAccessTokenFromUrl()
    },
    success: function (data) {
      renderItems(data.entries);
      /*console.log(data);*/
    },
    error: function (error) {
      console.log(error);
    }
  })
}
// Aqui estamos fazendo o upload do arquivo .txt para o dropbox
function uploadFile(data) {
  var ACCESS_TOKEN = getAccessTokenFromUrl();
  var dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN });
  dbx.filesUpload({path: '/' + getFileName(), contents: data})
    .then(function(response) {
      var results = document.getElementById('results');
      results.appendChild(document.createTextNode('File uploaded!'));
      console.log(response);
      renderItemsUpdate();
    })
    .catch(function(error) {
      console.error(error);
      renderItemsUpdate();
    });
  return false;
}

function deleteFile(filePath, FileName){
  $('#modalDeleteFile .modal-body').html('<p>Tem certeza de que quer excluir <b>'+FileName+'</b> do seu Dropbox?</p>');
  $('#btnDeleteFile').prop( "disabled", false );
  $('#modalDeleteFile').modal('show');

  $('#btnDeleteFile').click(function(event) {
    
    var restul = {
      path: filePath,
    }

    var deleteFileLog = jQuery.ajax({
      url: 'https://api.dropboxapi.com/2/files/delete',
      type: 'POST',
      data: JSON.stringify(restul),
      datatype : "application/json",
      contentType: "application/json",
      headers: {
      "Authorization": "Bearer "+getAccessTokenFromUrl()
      },
      success: function (data) {
        /*console.log(data);*/
        $('#modalDeleteFile').modal('hide');
        renderItemsUpdate();
      },
      error: function (error) {
        console.log(error);
      }
    });

    /*if(deleteFileLog.path_display == filePath){
      $('#modalDeleteFile').modal('hide');
    }
    else{
      $('#modalDeleteFile .modal-body').html('<p style="color: red;">Ocorreu um erro ao excluir o arquivo <b>'+FileName+'</b>, tente novamente mais tarde!</p>');
      $('#btnDeleteFile').prop( "disabled", true );
    }*/
    
  });
}

function getFileName() {
    var d = new Date();
    var n = d.getTime();
    n = n+'.json';
    return n;
}

$('#modalSaveFiles').click(function(event) {
  /* Act on the event */
  var errorInput = false;

  if($('#exampleFormControlInput1').val() == ''){
    $('#exampleFormControlInput1').attr('class', 'form-control is-invalid');
    errorInput = true;
  }else{
    $('#exampleFormControlInput1').attr('class', 'form-control is-valid');
  }

  if($('#exampleFormControlTextarea1').val() == ''){
    $('#exampleFormControlTextarea1').attr('class', 'form-control is-invalid');
    errorInput = true;
  }else{
    $('#exampleFormControlTextarea1').attr('class', 'form-control is-valid');
  }

  if(errorInput == false){
    var data = {
      title: $('#exampleFormControlInput1').val(),
      color: $('#exampleFormControlColor').val(),
      description: $('#exampleFormControlTextarea1').val(),
    }

    var jsonData = JSON.stringify(data);
    uploadFile(jsonData);

    $('#exampleModal').modal('hide');

    $('#exampleFormControlInput1').val('');
    $('#exampleFormControlInput1').attr('class', 'form-control');
    $('#exampleFormControlTextarea1').val(''); 
    $('#exampleFormControlTextarea1').attr('class', 'form-control');

    //console.log(jsonData);
  }else{
    console.log(errorInput);
  }
});