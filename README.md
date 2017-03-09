# groupComponentJS

*(The main purpose of this library is a demostration to build a web framework with [groupJS](https://github.com/mainnote/groupJS). You should be able to get the idea in 10 minutes. Happy coding :)*

## Examples
<http://groupcomponentjs.s3-website-us-east-1.amazonaws.com>


## Why do we need this library?
1. A library implements groupJS style programming pattern (*With groupJS, you will be free from javascript prototype inheritance complex*);
2. An easy way to use jQuery/javascript library and incorporate into a framework;
3. Use requirejs as module loader
4. Build your own framework instead of learning AngularJS, ReactJS or BackboneJS etc.;
5. Use bluebird promisable programming style.

## Overview
groupComponentJS bases on [groupJS](https://github.com/mainnote/groupJS) to perform inheritance and bind objects to be a group. Activities in browser are composited by individual "component". Components can be grouped together as a group component which can join another group. A group binds components and initialize their setup. However, as a convention, a group should not involve any actual response and activity.

Each UI component is structured to be Module-View-Controller (MVC) pattern. UI components extended from component.js module acts as Controller role to manage its views and model. It also interacts with other component inside a group.

UI component includes base function such as changing default options `setOpt()`, initializing local variable `init()`, rendering views `render()`, setup DOM events `setup()`, removing component `remove()` and setting accessory elements `setElements()` or `addElement()`. They usually take only one argument like opt or opt_xxxx at the convention. Also, it uses method `setAsync()` to convert asynchronous call to Promise style.

A model is simply a JSON object to provide data feed. It can be wrapped in entity.js as single entity interface and collection.js as entity list interface. request.js provides jQuery request to communicate with remote data source. The model usually attaches to UI Component member `.opt` as key `doc`.

View is defined in `/templates` folder which uses underscore.js template syntax. It attaches to as `.tpl` .

## Add new example

* create new example `cp -RP <original example path> <new example path>`
* update static/index.html
* update example/menu.json

## build
*Always check Gruntfile if there is any change*


## Installation

## Steps to use this library
1. Find a close component from the library or create your own component;
2. Create an instance of the component;
3. Customize your instance;
4. Render your component to to DOM.

## Convention
1. Always `setOpt(opt)`
2. `this.elem` will be presented the jQuery object template elements.
3. Only constant attributes/variable can be defined on object structure. attributes/variable must define in `init()` method like `this.myVar = null;`
4. minimum code in each group
5. prefer getMember(), upCall(), downCall() to self(), .group.group .......

## Components

### list.js
1. list_entities or collectionGrp will hold each item data;
2. Entity holds information of a single "row"; Item will connect to Entity and show the UI and events; Collection is a manager for entities; List is a manager of Item to lay down the items.

Entity <--------> Item
  ||               ||
Collection <----> List




## Q & A
1. Questions about requirejs path
