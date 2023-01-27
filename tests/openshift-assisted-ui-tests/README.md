#### Assisted UI tests

This folder contains the integration test suites run by the Vertical Markets UI team for the [Assisted Installer UI Lib](https://github.com/openshift-assisted/assisted-ui-lib).

Due to the nature of the Assisted Installer, each individual test in this suite depends on the previous tests having completed correctly.

In order to run the tests fast and not to depend on HW infrastructure, the API is mocked.
It's important to mock the API accurately to avoid having passing UI tests that would fail with a real API.
# How to use this repo
- Clone the project.

- Install npm dependencies
  yarn install

- Define the environment variables in the section below

- Start the standalone Assisted Installer UI application running in the specified `baseUrl`


# Environment variables configuration:

Most of the environment variables defaults on `assisted-ui/cypress.json`should be valid and need no further explanation.

To change the configuration based on your environment, create a file named `assisted-ui/cypress.env.json`, and add the variables you need to overwrite from the base configuration.

- `API_BASE_URL`: Required, URL of the API service that the Assisted Installer UI application talks to

- `DEV_FLAG`, `REMOTE_USER` and `REMOTE_HOST` when using a remote server (not needed for mocked tests).

Example:

```
cypress.env.json
{
  "API_BASE_URL": "http://A.B.C.D:6000",
  "REMOTE_USER": "root",
  "REMOTE_HOST": "edge-AB.edge.lab.eng.rdu2.redhat.com",
  "REMOTE_SSH_ID_FILE": "~/.ssh/id_ed25519"
}
```

# How to run the tests

The project defines two ways to run the tests:

`integration-tests:run`: Runs the tests within headless mode Cypress
`integration-tests:open`: Opens the Cypress UI and lets you select which tests to run


# Linting
TODO
