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
- :octocat: **Open Source and Free** — Arisu is 100% free and open source, so you can host your own instance if you please!
- 🏘️ **Housed in a place** — Arisu plans to be a special housing for your translations into one place.
- 🔍 **User Friendly UI** — Arisu plans to give a UI/UX design that is simple to the end user, yet modern.
- ✨ **Multi Projects** — House a monorepo with ease without any complex UI/UX designs.
- ⚡ **Robust** — Arisu makes your workflow way easier and manageable without any high latency.

...and much more!

## Projects
This repository is split into a few projects, each with their own purpose.

- [frontend](./frontend/README.md) — The frontend of Arisu, built with [React](https://reactjs.org/).
- [backend](./backend/README.md) — The backend of Arisu, this is where the API is hosted.
- [github-bot](./github-bot/README.md) — A bot that automatically syncs your translations with GitHub.
- [tools/licenses](./tools/licenses/README.md) — A tool to generate a license at the top of each file in the sub-projects.
- [tools/releases](./tools/release/README.md) — A tool to generate releases for the sub-projects.

There are other projects within the Arisu ecosystem, but they are split into different repositories under the **arisuland** organization.

If the projects return a **`404`** status code, it means that the project is not yet ready for public use.

|Name|Description|Status|
|----|-----------|------|
|⛴ [cli](https://github.com/arisuland/cli)|A command-line interface to automate the process of handling translations, merging translations, etc.|
|🐳 [docs](https://github.com/arisuland/docs)|Documentation site for Arisu, showcasing the REST API and other stuff|
|📃 [translations](https://github.com/arisuland/translations)|Translation monorepo for Arisu|
|📜 [themes](https://github.com/arisuland/themes)|Customizable themes for Arisu, so style however you want to!|

## Self-hosting
Before we get started, I recommend learn how to run Node.js projects before you install Arisu. The Arisu Team **will** not help you if you don't understand how to run a Node.js project. :)

> :warning: **Arisu is not ready for production yet! So be cautious before running (un)stable releases.**

### Prerequisites
Before we can get started, you need to have the following things installed:

- [**PostgresSQL** v11+](https://postgresql.org) **~** Main database thats Arisu utilizes.
- [**Node.js** v14+](https://nodejs.org/en/) **~** Runtime engine to run the project.
- [**Redis** v6.2+](https://redis.io) **~** In-memory data store for Arisu.
- [**Git** v2.31+](https://git-scm.com) **~** A version control system to get updates of Arisu easily.

#### Optional Tools
There are tools you can use to enhance the experience, but the following is not recommended in most cases:

- [**Docker**](https://docker.com) **~** A containerization tool to run Arisu.
- [**Sentry**](https://sentry.io) **~** A error-reporting tool to track down bugs or errors in Arisu.
- [**Bell**](https://github.com/arisuland/Bell) **~** GitHub bot to push translations into Arisu or vice versa with GitHub. View the [documentation](https://github.com/arisuland/bell) for more information.

### Installation
You wish to use Docker, I recommend reading the [Docker](#installation-docker) section below.

```sh
# Clone the repository from GitHub
$ git clone https://github.com/arisuland/Arisu.git && cd Arisu
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

Be warned that the configuration file is **not** checked for errors. If you have any issues with the configuration file, please open an [issue](https://github.com/arisuland/Arisu/issues).

```yml
# soon:tm:
```

## Contributing
> Refer to the [Contributing](.github/CONTRIBUTING.md) section for more details.

## License
**Arisu** is released under the **GPL-3.0** License. <3
