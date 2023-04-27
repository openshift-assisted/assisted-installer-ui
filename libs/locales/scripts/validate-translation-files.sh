#!/usr/bin/env bash
set -u

function print_retry_message {
  echo "Run 'yarn workspace @openshift-assisted/locales run process_new_strings' from the root workspace and commit the changes."
}

function main {
  yarn run process_new_strings

  en_translations_dir='./lib/en'
  changed_files="$(git status --short --untracked-files=no -- $en_translations_dir)"

  if [ -n "$changed_files" ]; then
    echo "$changed_files"
    echo "Some translations are not up-to-date."
    print_retry_message
    exit 1
  fi

  result=$(grep -r -v -h '^  "ai:' "$en_translations_dir" | grep -v "^[{|}]$") 
  if [ -n "$result" ]; then
    echo "$result"
    echo "Some entries do not contain the 'ai:' prefix."
    print_retry_message
    exit 1
  fi
}

main
