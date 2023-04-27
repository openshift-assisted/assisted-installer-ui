FROM registry.access.redhat.com/ubi8/nodejs-14-minimal

ENV NODE_OPTIONS='--max-old-space-size=8192'

COPY --chown=1001:0 / $HOME

USER root
RUN INSTALL_PKGS="git rsync" && \
    microdnf --nodocs install $INSTALL_PKGS && \
    microdnf clean all && \
    rm -rf /mnt/rootfs/var/cache/* /mnt/rootfs/var/log/dnf* /mnt/rootfs/var/log/yum.*

USER 1001
RUN npm i -g corepack && \
    yarn install --immutable && \
    yarn build:all
