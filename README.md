# chuck ![license](https://img.shields.io/github/license/mitmadness/chuck.svg?style=flat-square)

chuck is a webservice that converts various 3D file-formats to Unity3D AssetBundles.

From the [documentation](https://docs.unity3d.com/Manual/AssetBundlesIntro.html):

> AssetBundles are files which you can export from Unity to contain Assets of your choice, [that] can be loaded on demand by your application. This allows you to stream content, such as models, Textures, audio clips, or even entire Scenes [...].

----------------

 - [Requirements & Installation](#requirements--installation)
 - [Development](#development)

----------------

## Requirements & Installation

 - [Node.js](https://nodejs.org/en/) v.7 or higher ;
 - [yarn](https://yarnpkg.com/en/) dependency manager ;
 - A running [MongoDB](https://www.mongodb.com/) server.

Run `yarn install` to install dependencies.

## Development

The workflow is based on npm scripts:

  - `yarn start`: starts the production, compiled version of the server ;
  - `yarn nodemon-server`: starts the server and restarts it when the compiled files change (production or development, but for production you could use [pm2](http://pm2.keymetrics.io/)) ;
  - `yarn watch`: watch source files and compiles them on change ;
  - `yarn build`: compiles the server.
  
So, basically, to start a development session, run in a terminal:

```
yarn install
yarn watch
```

In a terminal aside of the first one, run:

```
yarn nodemon-server
```

You can also create an `.env` file at the project root to override the default environment variables in `.env.defaults`. 
