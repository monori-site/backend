<div align='center'>
  <h2>☔ Arisu</h2>
  <blockquote>Translation made with simplicity, yet robust. Made with 💖 using <a href='https://typescriptlang.org'><strong>TypeScript</strong></a>, <a href='https://reactjs.org'><strong>React</strong></a> using <a href='https://nextjs.org'><strong>Next.js</strong></a>.</blockquote>
</div>

<br />

<div align='center'>
  <img src='https://img.shields.io/github/stars/arisuland/Arisu?style=flat-square' alt='stars' />
  <img src='https://img.shields.io/github/workflow/status/arisuland/Arisu/ESLint/master?style=flat-square' alt='arisu.land status' />
  <img src='https://img.shields.io/github/workflow/status/arisuland/Arisu/ESLint/staging?style=flat-square' alt='staging.arisu.land status' />
</div>

<hr />

## Features
- :octo: **Open Source and Free** — Arisu is 100% free and open source, so you can host your own instance if you please!
- 🏘️ **Housed in a place** — Arisu plans to be a special housing for your translations into one place.
- 🔍 **User Friendly UI** — Arisu plans to give a UI/UX design that is simple to the end user, yet modern.
- ✨ **Multi Projects** — House a monorepo with ease without any complex UI/UX designs.
- ⚡ **Robust** — Arisu makes your workflow way easier and manageable without any high latency.

...and much more!

## Projects
> Some other subprojects you can checkout that help Arisu how you see it today. :D
>
> If the projects return a **`404`** status code, it means that the project is not yet ready for public use.

|Name|Description|Status|
|----|-----------|------|
|☔ [arisu](https://github.com/arisuland/Arisu)|Frontend UI of Arisu, made with React|![status](https://img.shields.io/github/workflow/status/arisuland/Arisu/ESLint/master?style=flat-square)|
|🖋️ [bell](https://github.com/arisuland/bell)|Automation bot for GitHub to push translations into Arisu or vice versa.|
|⛴ [cli](https://github.com/arisuland/cli)|A command-line interface to automate the process of handling translations, merging translations, etc.|
|🐳 [docs](https://github.com/arisuland/docs)|Documentation site for Arisu, showcasing the REST API and other stuff|
|🎋 [fern](https://github.com/arisuland/fern)|Microservice to provide audit logs and webhooks|
|🥀 [tsubaki](https://github.com/arisuland/Tsubaki)|Backend infrastructure for Arisu, all the magic begins here~ (You're here!)|![status](https://img.shields.io/github/workflow/status/arisuland/Tsubaki/ktlint/master?style=flat-square)|
|📃 [translations](https://github.com/arisuland/translations)|Translation monorepo for Arisu|
|📜 [themes](https://github.com/arisuland/themes)|Customizable themes for Arisu, so style however you want to!|

## Self-hosting
Before we get started, I recommend learn how to run Node.js projects before you install Arisu. The Arisu Team **will** not help you if you don't understand how to run a Node.js project. :)

> :warning: **Arisu is not ready for production yet! So be cautious before running (un)stable releases.**

### Prerequisites
Before we can get started, you need to have the following things installed:

- [**Node.js** v14+](https://nodejs.org/en/) **~** Runtime engine to run the project.
- [**Tsubaki**](https://github.com/arisuland/Tsubaki) **~** Core infrastructure for Arisu.
- [**Git** v2.31+](https://git-scm.com) **~** A version control system to get updates of Arisu easily.

#### Optional Tools
There are tools you can use to enhance the experience, but the following is not recommended in most cases:

- [**Docker**](https://docker.com) **~** A containerization tool to run Arisu.
- [**Sentry**](https://sentry.io) **~** A error-reporting tool to track down bugs or errors in Arisu.
- [**Bell**](https://github.com/arisuland/Bell) **~** GitHub bot to push translations into Arisu or vice versa with GitHub. View the [documentation](https://github.com/arisuland/bell) for more information.
- [**fern**](https://github.com/arisuland/fern) **~** Microservice to handle audit logs and webhooks. (View the [fern docs](https://github.com/arisuland/fern/blob/master/README.md) for more information)

### Installation
You wish to use Docker, I recommend reading the [Docker](#installation-docker) section below.

```sh
# 1. Clone the repository from GitHub
$ git clone https://github.com/arisuland/Arisu.git && cd Arisu

# 2. Install the local and global dependencies
$ npm i --global typescript eslint stylelint
$ npm install

# 3. Running the project
# This requires Tsubaki running before continuing.
$ npm start
```

> Open a new browser session and go to `http://localhost:17093/` to see Arisu in action.

### Installation (Docker)
You can run Arisu with Docker, but you will need to have Docker installed on your machine before getting started.

|Branch|Image|
|------|------|
|`master`|`arisuland/arisu:latest`|
|`staging`|`arisuland/arisu:staging`|

```sh
# 1. Pull the image from Docker
$ docker pull arisuland/arisu:<branch>

# 2. Run the image
$ docker run -d -p 9999:17093 arisuland/arisu:<branch> /
  --env 'NODE_ENV=production'                          /
  --volume './config.yml:/opt/Arisu/config.yml'        /
  --name 'arisu'                                       /
  arisuland/arisu:<branch>
```

> Open a new browser session and go to `http://localhost:9999/` to see Arisu in action.

## Configuration
The configuration file is located at `./config.yml`. It is a YAML file that contains all the configurations for Arisu.

Be warned that the configuration file is **not** checked for errors. If you have any issues with the configuration file, please open an [issue](https://github.com/arisuland/Arisu/issues); labeled **Configuration**.

```yml
# The hostname of Arisu, default is "localhost".
host: localhost

# Tsubaki configuration for Arisu
tsubaki:
  graphql: false # Whether to use GraphQL with Tsubaki or not
  host: http://localhost:9965 # Tsubaki host to connect with

# Bell configuration for Arisu
bell:
  projects: # List of projects to push translations to, e.g. ["owner/repo1", "owner/repo2"]. Use `true` to enable it for all projects.
    - owner/repo1
    - owner/repo2
  enabled: false # Enables Bell into the project

# Prometheus metrics (disabled by default)
prometheus:
  metrics: false  # Enable Prometheus metrics into Arisu
  host: 127.0.0.1 # Host to expose Prometheus metrics

# fern configuration for Arisu (disabled by default)
fern:
  webhooks: false     # Enable webhooks into every project or a list of projects by `owner/repo`.
  enabled: false      # Enable fern into this project
  events:             # Events to listen for when using audit logs
    - setting.changed # When a setting has changed
    - contribution    # When a contribution by a user is made
    - comment         # When a comment on a contribution is made
    - push            # When a contribution is pushed into the project
```

## Contributing
> Refer to the [Contributing](#) section for more details.

## License
**Arisu** is released under the **GPL-3.0** License. <3
