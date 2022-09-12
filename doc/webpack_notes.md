# Webpack

Webpack is a bundler, a program that provides a way
to transpile, transform then compile multiple objects (ts, js, html, css)
in independant packages.

## Concepts

- Entries
> Roots of dependency graph

- Outputs
> Build results

- Loaders
> Support file types typescript, svelte...

- Plugins
> Can modifie how the bundle is created in many ways

- Modes
> List of build profiles (development, production, ...)

- Browser compatibiliy
> It is possible to generate old js supported everywhere from recent code


## Webpack config structure

The file must be in `webpack.config.js` and look like

```js
import HtmlPlugin = require('html-webpack-plugin');

module.export = {
  entry: {
    main: './path/to/entry.js',
  }

  output: {
    filename: 'bundle.js'
  },
  
  module: {
    rules: [{ test: /.txt$/, use: 'raw-loader'}],
  },
  
  plugins: [new HtmlPlugin({template: './src/index.html'})],
  
  mode: 'production',
};
```

This config file and every property is optional as they have defaults

## Entries

A project can have multiple entries with dependency relations creating various bundles.
This is useful when ever only a part is wanted (ex: multiple pages site)
Webpack can smartly spilt the code in multiple bundles for optimal load speeds.
(see `optimization.splitChunks`)

## Outputs

Describe how to name (`filename`) bundles and in which folder (`path`).
When mutilple bundles/chunks are created one can use `subtitutions`.

## Loaders

Loaders are code that allows one to include other file types than js in
a project (typescript, svelte) that can be chained to create multiple effects.
They provide the information required for module resolution.

## Plugins

Plugins does everything else that loaders cannot do.
A plugin is js object that has an apply method that take the webpack compiler.
Plugins must be instanciated (use the `new` keyword).
Webpack it self is built out of plugins for itself

## Configuration

Inclusions are made using CommonJs packages (ie using `require(...)`)
Configuration can be written in many languages Js, Ts, CoffeeScript etc...

## Modules

Module express dependency relations with any kind of inclusions:
- ecmascript `import`
- commonjs `require`
- AMD `require`
- css/sass/less `@import`
- HTML `url(...)` or `<img src...>`
The resulting modules types are:
- Ecmascript
- commonjs
- AMD
- Assets
- WASM

Loaders than discribe what those inclusions do to the bundle

## Module resolution

Js import statements are highly customizable import are cusomized by
webpack using [enhanced-resolve](https://github.com/webpack/enhanced-resolve)
However by default you can consider 2 ways to import modules
- "Real" paths which can be relative or absolute (useful for your files)
- "Module" import registered modules