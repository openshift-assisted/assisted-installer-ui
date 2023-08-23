# Release workflow

Releasing a new version involves publishing packages to the NPM public registry and creating a
container image containing a stand-alone version of the UI app (see
[apps/assisted-ui](https://github.com/openshift-assisted/assisted-installer-ui/tree/master/apps/assisted-ui)).
The [release.yaml](../.github/workflows/release.yaml) workflow contains the scripts for producing
and publishing the final artifacts.

## How JS libraries are selected for publishing by the CI

The library's `package.json` must contain the following section in order to be selected by the CI.

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

## Instructions

1. Make sure you have been granted the `maintaner` role in the project settings.
2. Create a new branch from `master` and name it following this pattern:
   `releases/v<some-semver-string>`.
3. [Draft a new release through GitHub's interface](https://github.com/openshift-assisted/assisted-installer-ui/releases/new).
4. Fill the form with the following details:
   1. Tag: `v<some-semver-string>`
   2. Target branch: `releases/v<some-semver-string>` (the same as in the previous step).
   3. Title: `v<some-semver-string>` (again, the same as in the previous step).
   4. Description: Generate the release notes automatically (recommended), or edit the field
      manually.

## List of publicly available artifacts

- [@openshift-assisted/ui-lib](https://www.npmjs.com/package/@openshift-assisted/ui-lib)
- [@openshift-assisted/types](https://www.npmjs.com/package/@openshift-assisted/types)
- [@openshift-assisted/locales](https://www.npmjs.com/package/@openshift-assisted/locales)
- https://quay.io/repository/edge-infrastructure/assisted-installer-ui?tab=tags
