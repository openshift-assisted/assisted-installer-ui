# Assisted Installer UI

Web UI for OpenShift Assisted Installer — helps users deploy OpenShift clusters.

## Quick context

**Tech stack:** React + TypeScript, PatternFly components, Yarn v3 monorepo  
**Consumed by:** Red Hat Console (OCM/uhc-portal), OpenShift Console (ACM/MCE/CIM)

## Monorepo structure

```
apps/
  assisted-ui/               # Stand-alone UI (dev mode)
  assisted-disconnected-ui/  # Disconnected environment variant
  assisted-chatbot/          # AI chatbot integration
libs/
  ui-lib/                    # Main reusable components (consumed by OCM, ACM)
  types/                     # Generated TypeScript types from assisted-service API
  sdks/                      # Generated OpenAPI clients
  locales/                   # i18n catalogs (English + translations)
  chatbot/                   # Chatbot library
  ui-lib-tests/              # Cypress integration tests
```

**Integration model:** `libs/ui-lib` is published to consuming apps (uhc-portal, stolostron/console) via yalc during local dev, or as a package in production.

## Project conventions

Additional project-specific conventions and guidance are documented in **`.cursor/rules/`** (code style, API patterns, UX guidelines, translation workflows, etc.).

## Key workflows

**Before committing:**
```bash
# From the workspace you changed (e.g. libs/ui-lib, apps/assisted-ui):
yarn fix-code-style
yarn check_types

# Or from repo root if touching multiple packages:
yarn fix-code-style:all
yarn check:types:all
```

**Updating API types** (when assisted-service API changes):
```bash
yarn workspace @openshift-assisted/types run update:assisted-installer-service
```

**Regenerating SDKs** (when OpenAPI specs change):
```bash
yarn workspace @openshift-assisted/sdks run generate-sdk:all
```

**Translation strings** (after adding/changing `t('ai:...')` calls):
```bash
yarn process_new_strings
```

**Local development:**
```bash
yarn build:all                    # Initial build
yarn start:assisted_ui            # Stand-alone mode → http://localhost:5173
yarn start:watch_mode             # Watch mode for yalc integration (OCM/ACM dev)
```

## Common gotchas

- **Don't edit generated files directly** — `libs/sdks/lib/**` and `libs/types/assisted-installer-service.d.ts` are scripted. Use the generate commands above.
- **libs/ui-lib/lib/ocm/** — No `t('ai:...')` translation calls here; uses plain English or props.
- **Translation file edits** — Don't hand-edit `libs/locales/lib/*/translation.json`. Use `yarn process_new_strings` workflow.

## Testing

**Unit tests:** Vitest  
```bash
yarn test:unit
```

**Integration tests:** Cypress (in `libs/ui-lib-tests`)  
```bash
yarn test:run         # Headless
yarn test:open        # Interactive
```

**Type checking:**
```bash
yarn check:types:all
```

## Documentation

- [Development setup](docs/DEVELOPMENT.md) — detailed prerequisites, local dev, OCM/ACM integration
- [Contributing guide](docs/CONTRIBUTING.md)
- [I18N documentation](docs/I18N.md)
- [Release workflow](docs/RELEASE_WORKFLOW.md)

## External references

- **Back-end API setup:** [assisted-test-infra](https://github.com/openshift/assisted-test-infra)
- **OCM integration:** [uhc-portal](https://github.com/RedHatInsights/uhc-portal) + [assisted-installer-app](https://github.com/openshift-assisted/assisted-installer-app)
- **ACM/MCE integration:** [stolostron/console](https://github.com/stolostron/console)
- **PatternFly UX guidelines:** https://www.patternfly.org/ux-writing/capitalization/
