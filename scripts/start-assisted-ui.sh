#! /usr/bin/env bash

node_modules/.bin/concurrently \
  -n "start-lib,sync-to-ui,start-ui" \
  -c "magenta,cyan,yellow" \
  "yarn start" "yarn sync-to-ui" "cd ../assisted-ui; yarn start"


# [dchason@dchason assisted-ui]$ REACT_APP_API_URL=http://10.19.130.2:6000 yarn start
# [dchason@dchason assisted-ui-lib]$ yarn start
# [dchason@dchason assisted-ui-lib]$ yarn run sync-to-ui

