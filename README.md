## MEW DNS Watcher

Tool to check dns nameservers for proper address resolution.

### Getting Started

##### clone the repo

##### run npm install

$ npm install
- this installs the dependencies for both the server and the embedded vue website

##### Add a .env file
$ touch .env

##### Include the status the server will be running in
(use your preferred text editor)
nano .env

##### add the line 
STATUS=development

##### or
STATUS=production

##### Start the server

$ npm start

##### Navigate to 
https://localhost:3000

**NOTE:** The list of correct or incorrect dns servers is not immediately available the first time the servers starts as it 
needs to build the list.  The list becomes available after runner completes its first run. 



### Development

##### clone the repo

##### run npm install
$ npm install
- this installs the dependencies for both the server and the embedded vue website


