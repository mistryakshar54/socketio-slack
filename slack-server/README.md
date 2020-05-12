## Slack Server
Contains the Node Project in Typescript which implements the socket logic

## How to run this project?
* cd into the `slack-server` folder
* install the packages
* do `yarn start`

It is going to fire up `nodemon` which triggets index.ts.

Navigate to `localhost:4000` the app should start running.


## Folder Structure
```
|__ src
   |__ build (contains the prod built react app from Slack Client folder)
   |__ models (Typescript Model for Rooms and Namespaces)
   |__ index.ts (logic for handling socket)

```