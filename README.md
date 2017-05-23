<img src="https://github.com/mitmadness/chuck/raw/master/chuck.png" alt="chuck webservice logo" align="right">

# chuck ![license](https://img.shields.io/github/license/mitmadness/chuck.svg?style=flat-square)

chuck is a webservice that converts files that Unity understands to Unity3D AssetBundles. We've also added [IFC](https://en.wikipedia.org/wiki/Industry_Foundation_Classes) support in the pipeline thanks to [IfcOpenShell](http://ifcopenshell.org/).

From the Unity3D [documentation](https://docs.unity3d.com/Manual/AssetBundlesIntro.html):

> AssetBundles are files which you can export from Unity to contain Assets of your choice, [that] can be loaded on demand by your application. This allows you to stream content, such as models, Textures, audio clips, or even entire Scenes [...].

----------------

 - [Requirements](#requirements)
 - [Installation](#installation)
 - [Configuration](#configuration)
 - [Public REST API](#public-rest-api)
 - [Command Line Interface (CLI)](#command-line-interface)
 - [Development & Contributing](#development--contributing)

----------------

## Requirements

 - **[Node.js](https://nodejs.org/en/)** v.7 or higher ;
 - **[yarn](https://yarnpkg.com/en/)** dependency manager, for development or standalone installation ;
 - An Azure account where chuck will send its generated asset bundles (limitation) ;
 - A running **[MongoDB](https://www.mongodb.com/)** server ;
 - A running **[Redis](https://redis.io/)** server ;
 - :warning: **An _activated_ installation of Unity on the machine** :warning:
   - If Unity is not installed in the standard path, configure the path via the [Configuration](#configuration)
   - You must activate Unity if not already done, even with a free plan, read [Unity activation](https://github.com/mitmadness/AssetBundleCompiler#unity-activation) from AssetBundleCompiler
 - An installation of **[IfcConvert (IfcOpenShell)](http://ifcopenshell.org/ifcconvert.html)** available as `IfcConvert` via the `PATH`, but only if you are converting IFC files.

## Installation

Chuck can be installed in two ways, either:

 - **"Standalone" mode**: use this to deploy chuck directly without integrating it to another application (except API communication of course)
 - **"Embedded mode"** (recommended): use this when deploying chuck inside/aside of your own application, or any other reason (including philosophical ones) that would necessitate using chuck as an npm package rather than a raw Git clone.

Please note that chuck is not a pure library, nor a reusable Express middleware. It's a standalone application with its own logging, database, etc. But it can be installed via an npm package and exposes a public JavaScript API as well, for writing plugins or configuring and boot it.

<details>
<summary>Documentation for the standalone mode</summary>

### Standalone installation

As explained above, use this when using chuck as a standalone app. This is the simple method.

#### 1. Install the application and dependencies

```
$ git clone git@github.com:mitmadness/chuck.git && cd chuck
$ yarn install
$ yarn build
```

#### 2. Configure Chuck

Create a blank `.env` file at the root.

Look at the `.env.defaults` file (don't delete it, it's part of the application), it contains key/value pairs of environment variables.

You can now override values from `.env.defaults` to match your own environment when the default values are incorrect.

You can also, of course, set environment variables by hand with your preferred method (exports, inline variables when launching the command...).

#### 3. Run it

Run `yarn start`. That's it.
</details>

<details>
<summary>Documentation for the embedded mode</summary>

### Embedded installation

@todo
</details>

## Configuration

@todo

## Public REST API

@todo

## Command Line Interface

@todo

## Development & Contributing

The workflow is based on npm scripts:

  - `yarn watch`: starts the TypeScript compiler in watch mode ;
  - `yarn build`: compile TypeScript sources ;
  - `yarn start`: (run `watch` or `build` before!) starts the server and restarts it when the compiled files change (production or development, but for production you could use [pm2](http://pm2.keymetrics.io/) with `yarn standalone`) ;
  - `yarn cli`: shortcut to chuck's CLI (usage: `yarn cli -- command --arg1 --arg2`) ;
  - `yarn standalone`: starts the Express server without nodemon ;
  - `yarn lint`: checks code style on the TypeScript sources (recommended: install typescript and tslint extensions for your editor).
  
So, basically, to start a development session, run in a terminal:

```
yarn install
yarn watch
```

In a terminal aside of the first one, run:

```
yarn start
```

You can also create an `.env` file at the project root to override the default environment variables in `.env.defaults`. 
