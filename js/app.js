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
var ListBtnHTML = '<a class="btn btn-success btn-sm" href="#" role="button"><i class="fas fa-eye"></i> Visualizar</a><a class="btn btn-warning btn-sm" href="#" role="button"><i class="fas fa-edit"></i> Editar</a><a class="btn btn-danger btn-sm" href="#" role="button"><i class="fas fa-trash"></i> Excluir</a>';
function renderItems(items) {
  var filesContainer = document.getElementById('file');
  items.forEach(function(item) {
    var li = document.createElement('tr');
    li.innerHTML = '<td>'+item.name+'</td>'+'<td>'+item.server_modified+'</td>'+'<td>'+ListBtnHTML+'</td>';
    filesContainer.appendChild(li);
  });
}

// Aqui estamos criando um arquivo .txt para salvar no dropbox
function makeFileText(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + utf8_encode(text));
  return element;
}

// Aqui estamos fazendo o upload do arquivo .txt para o dropbox
function uploadFile() {
  var ACCESS_TOKEN = getAccessTokenFromUrl();
  var dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN });
  dbx.filesUpload({path: '/' + 'hello5.text', contents: makeFileText("hello.txt","This is the content of my file :)")})
    .then(function(response) {
      var results = document.getElementById('results');
      results.appendChild(document.createTextNode('File uploaded!'));
      console.log(response);
    })
    .catch(function(error) {
      console.error(error);
    });
  return false;
}