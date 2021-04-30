FROM node:16-alpine

LABEL MAINTAINER="Arisu Team <contact@arisu.land>"
RUN apk update && apk add git ca-certificates

WORKDIR /opt/Arisu
COPY . .
RUN npm ci
RUN NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production npm run build
RUN rm -rf src

ENTRYPOINT [ "npm", "start" ]
