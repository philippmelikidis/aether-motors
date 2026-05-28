# -----------------------------------------------------------------------------
# Aether Motors – MinIO init image.
#
# A tiny purpose-built image that has both the MinIO `mc` client AND a full
# shell toolchain (grep, sed, wget, ca-certificates). The official `minio/mc`
# image is built from `scratch` and contains only the `mc` binary, which is
# why the original seed.sh couldn't even run `grep`. This Dockerfile composes
# the two together.
#
# `seed.sh` and `seed-manifest.json` are mounted from the host at runtime via
# docker-compose, so changing them does NOT require rebuilding this image.
# -----------------------------------------------------------------------------
FROM alpine:3.20

RUN apk add --no-cache \
      bash \
      ca-certificates \
      coreutils \
      curl \
      grep \
      sed \
      wget

# Download a pinned mc release for the architecture of the build host.
# `linux-arm64` and `linux-amd64` are the only mainstream variants on
# Docker Desktop. The release is stable across the project's lifetime; bump
# the date by hand to upgrade.
ARG MC_RELEASE=RELEASE.2024-10-08T09-37-26Z
RUN ARCH="$(uname -m | sed -e 's/aarch64/arm64/' -e 's/x86_64/amd64/')" && \
    curl -fsSL "https://dl.min.io/client/mc/release/linux-${ARCH}/archive/mc.${MC_RELEASE}" \
      -o /usr/local/bin/mc && \
    chmod +x /usr/local/bin/mc

ENTRYPOINT ["/bin/sh", "/seed.sh"]
