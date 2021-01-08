# Arisu
![Stars](https://img.shields.io/github/stars/monori-site/backend?style=flat-square) 
![Workflow Status](https://github.com/monori-site/backend/workflows/ktlint/badge.svg)

> 👻✏️ **Translation made with simplicity, yet robust. Made with <3 in Kotlin.**

## Features
- All multi-lingual translation content in one place, but not required to be in one place.
- No telemetry bullshit, none.
- Requests to edit translation content, more contributions!
- Free, and open source!
  - All components are FoSS content under MIT.

## Installation
### Requirements
- Docker (optional)
- Sentry (optional)
- Java 11
- PostgreSQL
- Redis
- [Emi](#) installed

### Process (Locally)
Coming soon.

### Process (Docker, locally)
Coming soon.

## Configuration
> Note: This section is in pure alpha stage, do not run Arisu at this time.

Arisu uses the "HOCON" structure Ktor provides, you can specify a custom path by:

```sh
$ java -jar ./path/to/arisu.jar -config=path/to/config
```

You can change other configurations unrelated to Arisu, a default config can be listed [here](/application.default.conf).
For a list of the configuration options, read ["Available Configuration Parameters"](https://ktor.io/docs/configurations.html#available-config).

## License
**Arisu** is released under the MIT License, read [here](/LICENSE) for more information.
