# @openshift-assisted/types

This package provides general type definitions.

## Included:

### Based on OCM APIs:

- [**assisted-installer-service**](https://api.openshift.com/api/assisted-install/v2/openapi)
- [**accounts-management-service**](https://api.openshift.com/api/accounts_mgmt/v1/openapi)
  (non-comprehensive)

## Usage:

From the command-line execute:

```bash
$ yarn add -D @openshift-assisted/types
```

Now you can import types as following:

```ts
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
// or...
import { AccessTokenCfg } from '@openshift-assisted/types/accounts-management-service';
```

## Development:

The types for the `assisted-installer-service` are generated automatically.  
In order to update the types use the following script defined in the `package.json`:

```bash
$ yarn update-types:assisted-installer-service
```

The types for the `accounts-management-service` are not generated automatically (for now, maybe they
will in the future if there is a need to do so...).
