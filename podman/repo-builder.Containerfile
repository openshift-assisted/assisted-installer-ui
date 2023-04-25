FROM registry.access.redhat.com/ubi8/nodejs-16-minimal AS repo-builder
USER root
RUN INSTALL_PKGS="git rsync" && \
    microdnf --nodocs --setopt=install_weak_deps=0 install $INSTALL_PKGS && \
    microdnf clean all && \
    rm -rf /mnt/rootfs/var/cache/* /mnt/rootfs/var/log/dnf* /mnt/rootfs/var/log/yum.*
USER 1001
