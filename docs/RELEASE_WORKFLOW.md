# Release workflow (maintainers only)

Releasing a new version involves publishing the following packages to npmjs.com and creating a
container image containing a stand-alone version of the UI app (see
[apps/assisted-ui](https://github.com/openshift-assisted/assisted-installer-ui/tree/master/apps/assisted-ui)):

- [@openshift-assisted/ui-lib](https://www.npmjs.com/package/@openshift-assisted/ui-lib)
- [@openshift-assisted/locales](https://www.npmjs.com/package/@openshift-assisted/locales)
- https://quay.io/repository/edge-infrastructure/assisted-installer-ui?tab=tags

1. Create a new branch from `master` in this repo, called `release/v<some-semver-string>`.
2. [Draft a new release through GitHub's interface](https://github.com/openshift-assisted/assisted-installer-ui/releases/new).
3. Fill the form with the following details:
   1. Tag: `v<some-semver-string>`
   2. Target branch: `release/v<some-semver-string>` (same as in step 2 above).
   3. Title: `v<some-semver-string>`
   4. Description: Generate the release notes automatically (or edit the field manually)
