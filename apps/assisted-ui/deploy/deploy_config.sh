#!/usr/bin/env bash
set -euo pipefail

# This tool prepares the UI deployment yaml, by taking in a template and replacing the assisted-service URL and
# UI image that were supplied in the command line

usage() {
  echo "Usage: $0 [ -t deployment-template ] [ -u ASSISTED-SERVICE-URL ] [ -i UI_IMAGE_NAME ] [ -n NAMESPACE ]" 1>&2
}

DIRECTORY=$(dirname "$0")
INPUT_TEMPLATE="${DIRECTORY}/deployment-template.yaml"

ASSISTED_SERVICE_URL="http://assisted-service.__NAMESPACE__.svc.cluster.local:8090"
IMAGE=${IMAGE:-"quay.io/edge-infrastructure/assisted-installer-ui:latest"}
NAMESPACE="assisted-installer"

while getopts ":u:i:t:n:h" opt; do
  case $opt in
    u)
      ASSISTED_SERVICE_URL="$OPTARG"
      ;;
    t)
      INPUT_TEMPLATE="$OPTARG"
      ;;
    i)
      IMAGE="$OPTARG"
      ;;
    n)
      NAMESPACE="$OPTARG"
      ;;
    h)
      usage
      exit 0
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      usage
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      usage
      exit 1
      ;;
  esac
done

ASSISTED_SERVICE_URL=$(echo ${ASSISTED_SERVICE_URL} | sed "s#__NAMESPACE__#${NAMESPACE}#g")

sed "s#__IMAGE__#${IMAGE}#g;
     s#__ASSISTED_SERVICE_URL__#${ASSISTED_SERVICE_URL}#g;
     s#__NAMESPACE__#${NAMESPACE}#g" "${INPUT_TEMPLATE}"
