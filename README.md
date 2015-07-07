# Simple REST Website 
A simple website demonstrating CRUD, built using AngularJS, and powered by [Backand](https://www.backand.com).

## Prerequisites
You will need:
* [Git](http://git-scm.com/)
* [NodeJS and NPM](https://gist.github.com/isaacs/579814)

## Getting Started
1. Create new App in Backand with the following model:
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
      }
    }
  }
]

```
  
2. Once the App is ready, run the following commands:

  ```bash
  git clone git@github.com:backand/simple-rest-website.git
  cd simple-rest-website
  sudo npm install -g serve
  serve public
  ```

3. Navigate to [localhost:3000](http://localhost:3000)

4. Hooray! Now you can interact with the API! How simple was that??

** To login use your Backand's username and password 
