var CLIENT_ID = getClientID();
// Parses the url and gets the access token if it is in the urls hash
function getAccessTokenFromUrl() {
 return utils.parseQueryString(window.location.hash).access_token;
}
// If the user was just redirected from authenticating, the urls hash will
// contain the access token.
function isAuthenticated() {
  return !!getAccessTokenFromUrl();
}
// Render a list of items to #files
function renderItems(items) {
  var filesContainer = document.getElementById('files');
  items.forEach(function(item) {
    var li = document.createElement('li');
    li.innerHTML = item.name;
    filesContainer.appendChild(li);
  });
}
// This example keeps both the authenticate and non-authenticated setions
// in the DOM and uses this function to show/hide the correct section.
function showPageSection(elementId) {
  document.getElementById(elementId).style.display = 'block';
}
if (isAuthenticated()) {
  showPageSection('authed-section');
  localStorage.setItem("token", getAccessTokenFromUrl());

  // Create an instance of Dropbox with the access token and use it to
  // fetch and render the files in the users root directory.
  var dbx = new Dropbox.Dropbox({ accessToken: getAccessTokenFromUrl() });
  dbx.filesListFolder({path: ''})
    .then(function(response) {
      renderItems(response.entries);
    })
    .catch(function(error) {
      console.error(error);
    });

    function displayFiles(files) {
      var filesList = document.getElementById('files');
      var li;
      for (var i = 0; i < files.length; i++) {
        li = document.createElement('li');
        li.appendChild(document.createTextNode(files[i].name));
        filesList.appendChild(li);
      }
    }
} else {
  showPageSection('pre-auth-section');
  // Set the login anchors href using dbx.getAuthenticationUrl()
  var dbx = new Dropbox.Dropbox({ clientId: CLIENT_ID });
  var authUrl = dbx.getAuthenticationUrl('http://localhost/notesapp/');
  document.getElementById('authlink').href = authUrl;
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + utf8_encode(text));
  /*element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);*/
  return element;
}

// Start file download.


function uploadFile() {
  var ACCESS_TOKEN = getAccessTokenFromUrl();
  var dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN });
  /*var fileInput = document.getElementById('file-upload');
  var file = fileInput.files[0];*/





  dbx.filesUpload({path: '/' + 'hello5.text', contents: download("hello.txt","This is the content of my file :)")})
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