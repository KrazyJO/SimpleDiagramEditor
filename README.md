# SimpleDiagramEditor.TS
Curse Software Engeneering 2 Project.

Will be plnkr with diagram editor, hopefully ;)


## install
Recomended is using yarn instead of npm.

```
npm install -g typescript
```

```
yarn
```

## develop
Webpack is configured to work with devserver.
Two bundles will be created and injected in demo html. Just run 

```
yarn run webpack:dev
```

## debugging in vscode
- install extension 'Debugger for Chrome' in vs code
- run npm:dev
- launch debug configuration 'Launch Chrome Debugger'

## Build
(not final yet)

```
yarn run webpack
```

## deployment
Project will be tested, built and deployed by gitlab ci.
You can see the result here:

https://se2-diagram-tools.gitlab.io/SE2_Otte_Joern/