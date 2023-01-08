#!/bin/bash

yarn i18n

GIT_STATUS="$(git status --short --untracked-files=no -- locales/en dist/locales/en)"
if [ -n "$GIT_STATUS" ]; then
  echo "i18n files are not up to date. Run 'yarn i18n' and then commit the changes."
  git diff
  exit 1
fi

result=$(grep -r -v -h '^  "ai:' locales/en | grep -v "^[{|}]$")
if [ -n "$result" ]; then
   echo "Found some i18n keys missing the 'ai:' prefix."
   echo "Please, review the output, run 'yarn i18n' and then commit the changes."
   echo "$result"
   exit 1
fi