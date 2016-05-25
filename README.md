# Simple REST Website 
A simple website demonstrating CRUD + upload image, built using AngularJS, and powered by [Backand](https://www.backand.com).
You can upload image use base64 code in the text field or also store it in backand storage.

Hello again, this time i implemented upload image to backand, fork from simple-rest-website demo by backand.

## Prerequisites
You will need:
* [Git](http://git-scm.com/)
* [NodeJS and NPM](https://gist.github.com/isaacs/579814)

## Getting Started

1 - create an account in https://www.backand.com and create new app

2. use this following json model in the object model tab:
```json
[
  {
    "name": "items",
    "fields": {
      "name": {
        "type": "string"
      },
      "description": {
        "type": "text"
      },
      "avatarBase": {
      "type": "text"
      },
      "bigPictureUrl": {
      "type": "string"
      }
    }
  }
]

```

3 - create server side code for uploading bigger image,

a. in the object tab, click items tab, then click again actions tab.

b. create new on demand execute, name it otherFiles, event trigger = on demand, pick type = server side code.

c. in the parameters field, write input parameters with : filename, filedata

d. write this code in the javascript code field :

```
/* globals
$http - Service for AJAX calls 
CONSTS - CONSTS.apiUrl for Backands API URL
Config - Global Configuration
socket - Send realtime database communication
files - file handler, performs upload and delete of files
request - the current http request
*/

'use strict';

function backandCallback(userInput, dbRow, parameters, userProfile) {

console.log(userProfile); // gets the current user role and id that enables you to perform security restrictions

// upload file
if (request.method == "POST"){
    var url = files.upload(parameters.filename, parameters.filedata);
    return {"url": url};
}
// delete file
else if (request.method == "DELETE"){
    files.delete(parameters.filename);
    return {};    
}

}

```
for future research see this doc: http://docs.backand.com/en/latest/apidocs/files/index.html
  
4. Once the App is ready, run the following commands:

  ```bash
  git clone https://github.com/abdulMuhit/simple-rest-website.git
  cd simple-rest-website
  npm install -g serve
  serve public
  ```

5. Navigate to [localhost:3000](http://localhost:3000)

6. You can also host this web project in backand, use backand hosting.
Just go to Hosting Tab, the intruction there is very clear and helpfull.
and then go to your project link. it so easy and clear, i think you wont gonna miss it. :-)

7. Hooray! Now you can interact with the API! How simple was that?? & i say yes back& made it so simple. :-)

** To login use your Backand's username and password 
