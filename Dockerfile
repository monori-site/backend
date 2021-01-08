FROM alpine:latest

LABEL MAINTAINER="Arisu Team <contact@arisu.land>"

# Install JDK 11
RUN apk add openjdk11 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community
