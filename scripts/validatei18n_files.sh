#!/bin/bash
yarn i18n
GIT_STATUS="$(git status --short --untracked-files=no -- locales/en dist/locales/en)"
if [ -n "$GIT_STATUS" ]; then
  echo "i18n files are not up to date. Run 'yarn i18n' and then commit changes."
  git diff
  exit 1
fi
result=$(grep -v -r '^  "ai:' ./locales/en | grep -v "{" | grep -v "}") 
if [ -n "$result" ]; then
   echo "i18n keys that not contains 'ai:' prefix are found. Please, review it and run 'yarn i18n' and then commit changes:"
   echo $result
   exit 1
fi