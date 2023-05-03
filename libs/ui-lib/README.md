<h1 align="center">
  The Assisted Installer UI components library
</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@openshift-assisted/ui-lib"><img alt='NPM' src='https://img.shields.io/npm/v/@openshift-assisted/ui-lib.svg'></a>  
</p>

## Install

`yarn add @openshift-assisted/locales`  
`yarn add @openshift-assisted/ui-lib`

## Jest

The project uses
[conditional exports](https://nodejs.org/docs/latest-v16.x/api/packages.html#conditional-exports)
which are only supported in Jest >= v28.  
If your project uses an older Jest version add the following settings to Jest's configuration:

```json
{
  "moduleNameMapper": {
    "@openshift-assisted/ui-lib/cim": "<rootDir>/node_modules/@openshift-assisted/ui-lib/build/cim",
    "@openshift-assisted/locales/([a-z]{2,3}/translation.json)": "<rootDir>/node_modules/@openshift-assisted/locales/lib/$1/translation.json"
  }
}
```

Depending on your Jest configuration, you may need also to add this:

```json
{
  "transformIgnorePatterns": ["node_modules/(?!@openshift-assisted|lodash-es|@patternfly)"]
}
```

## License

Apache-2.0
