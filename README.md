# Transcendence

Welcome to our final assignement of 42's Transcendence


You can find a useful summary of the subject in the [wiki](https://github.com/DoomDuck/transcendence/wiki)

## Architecture

```
package.json      -> description of project package
package-lock.json -> dependency list with precise version

webpack.config.js -> webpack configuration (role ~ Makefile)

doc/              -> helpful notes

public/           -> directory to load from browser (ctrl+o)
      /index.html -> web page entry point

src/              -> page source code
   /index.ts      -> code entry point
   /App.svelte    -> svelte source entry point
   /*.svelte      -> all other components

build/            -> result `npm run build`
     /bundle.js   -> bundle of all code
     /styles.css  -> bundle of all styles
    
node_modules/     -> dependency storage
```

## How to use

```bash
# Setup (fecth all dependencies)
npm install

# To build project
npm run build

# To re-build on change
npm run build:dev

# Open the page on browser
open public/index.html
```

## Git hooks

```bash
# To add checks before each commit
./scripts/hooks/setup.sh

# To skip checks for a quick commit
git commit --no-verify

# To remove checks
./scripts/hooks/remove.sh
```
