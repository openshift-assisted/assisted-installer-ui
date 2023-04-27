FROM quay.io/openshift-assisted/assisted-installer-ui-repo-builder AS repo
ARG AIUI_APP_CLUSTER_PERMISSIONS
ARG AIUI_APP_IMAGE_REPO='N/A'
ARG AIUI_APP_API_ROOT='/api/assisted-install'
ARG AIUI_APP_GIT_SHA='N/A'
ARG AIUI_APP_VERSION='latest'
ENV AIUI_APP_CLUSTER_PERMISSIONS=$AIUI_APP_CLUSTER_PERMISSIONS
ENV AIUI_APP_IMAGE_REPO=$AIUI_APP_IMAGE_REPO
ENV AIUI_APP_API_ROOT=$AIUI_APP_API_ROOT
ENV AIUI_APP_GIT_SHA=$AIUI_APP_GIT_SHA
ENV AIUI_APP_VERSION=$AIUI_APP_VERSION
ENV NODE_OPTIONS='--max-old-space-size=8192'
ENV CI='true'
EXPOSE 4173
EXPOSE 5173
COPY --chown=1001:0 / "${APP_ROOT}/src"
RUN npm i -g corepack && \
    yarn install --immutable && \
    yarn build:all

FROM registry.access.redhat.com/ubi8/nginx-120 AS assisted-ui
COPY --from=repo /opt/app-root/src/apps/assisted-ui/build/ "${NGINX_APP_ROOT}/src/"
COPY --from=repo /opt/app-root/src/apps/assisted-ui/deploy/ /deploy/
CMD [ "/deploy/start.sh" ]
