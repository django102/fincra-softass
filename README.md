# fincra-softass

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE.)
&nbsp;
[![Version: v0.0.0](https://img.shields.io/badge/typescript_template-v0.0.0-blue?style=flat&logo=money)](CHANGELOG.md)
&nbsp;


&nbsp;

### Fincra Software Assessment

&nbsp;

## License
This respository is available as open source under the terms of the [Apache 2.0 License](https://opensource.org/licenses/Apache-2.0).


&nbsp;

## Environment Variables Required to bootstrap this project

| Key                      | Environment Variable  | Default                                                             |
| ------------------------ | --------------------- | ------------------------------------------------------------------- |
| `NODE_ENV`               | ` `                   | `local`                                                             |
| ` `                      | ` `                   | ` `                                                                 |
| `# Application`          | ` `                   | ` `                                                                 |
| `APP_SCHEMA`             | ` `                   | `http`                                                              |
| `APP_HOST`               | ` `                   | `localhost`                                                         |
| `PORT`                   | ` `                   | `80`                                                                |
| `APP_EXPOSED_PORT`       | ` `                   | `80`                                                                |
| ` `                      | ` `                   | ` `                                                                 |
| `# Logging`              | ` `                   | ` `                                                                 |
| `LOG_LEVEL`              | ` `                   | `debug`                                                             |
| `LOG_OUTPUT`             | ` `                   | `dev`                                                               |
| ` `                      | ` `                   | ` `                                                                 |
| `# MySQL Database`       | ` `                   | ` `                                                                 |
| `TYPEORM_CONNECTION`     | ` `                   | `mysql`                                                             |
| `TYPEORM_USERNAME`       | ` `                   | ` `                                                                 |
| `TYPEORM_PASSWORD`       | ` `                   | ` `                                                                 |
| `TYPEORM_HOST`           | ` `                   | `localhost`                                                         |
| `TYPEORM_PORT`           | ` `                   | `3306`                                                              |
| `TYPEORM_DATABASE`       | ` `                   | ` `                                                         |
| ` `                      | ` `                   | ` `                                                                 |
| `# MongoDB`              | ` `                   | ` `                                                                 |
| `DB_CONNECTION`          | ` `                   | `mongodb`                                                           |
| `DB_USERNAME`            | ` `                   | ` `                                                                 |
| `DB_PASSWORD`            | ` `                   | ` `                                                                 |
| `DB_HOST`                | ` `                   | `localhost`                                                         |
| `DB_PORT`                | ` `                   | `27017`                                                             |
| `DB_DATABASE`            | ` `                   | ` `                                                         |
| ` `                      | ` `                   | ` `                                                                 |
| `# Path Structure`       | ` `                   | ` `                                                                 |
| `DB_SYNCHRONIZE`         | ` `                   | `false`                                                             |
| `DB_LOGGING`             | ` `                   | `error`                                                             |
| `DB_LOGGER`              | ` `                   | `advanced-console`                                                  |
| `DB_MIGRATIONS`          | ` `                   | `src/database/migrations/**/*.ts`                                   |
| `DB_MIGRATIONS_DIR`      | ` `                   | `src/database/migrations`                                           |
| `DB_ENTITIES`            | ` `                   | `src/api/models/**/*.ts`                                            |
| `DB_ENTITIES_DIR`        | ` `                   | `src/api/models`                                                    |
| `DB_DISABLED`            | ` `                   | `true`                                                              |
| ` `                      | ` `                   | ` `                                                                 |
| `TYPEORM_SYNCHRONIZE`    | ` `                   | `false`                                                             |
| `TYPEORM_LOGGING`        | ` `                   | `error`                                                             |
| `TYPEORM_LOGGER`         | ` `                   | `advanced-console`                                                  |
| `TYPEORM_MIGRATIONS`     | ` `                   | `src/database/migrations/mysql/**/*.ts`                             |
| `TYPEORM_MIGRATIONS_DIR` | ` `                   | `src/database/migrations/mysql`                                     |
| `TYPEORM_ENTITIES`       | ` `                   | `src/api/models/mysql/**/*.ts`                                      |
| `TYPEORM_ENTITIES_DIR`   | ` `                   | `src/api/models/mysql`                                              |
| `TYPEORM_DISABLED`       | ` `                   | `false`                                                             |
| ` `                      | ` `                   | ` `                                                                 |
| `# Swagger`              | ` `                   | ` `                                                                 |
| `SWAGGER_ENABLED`        | ` `                   | `true`                                                              |
| `SWAGGER_ROUTE`          | ` `                   | `/swagger`                                                          |
| `SWAGGER_FILE`           | ` `                   | `api/swagger.json`                                                  |
| `SWAGGER_STATS_ROUTE`    | ` `                   | `/swagger-stats/ui`                                                 |
|                          |                       |                                                                     |
| `# Constants`            | ` `                   | ` `                                                                 |
| `JWT_HASHER`             | ` `                   | `Yab&D4wmpPFZF$QU@C9E*YmDSZ58jnHCZSZx64z%op8oxew*R47p82h#b%obuvGW`  |
| ` `                      | ` `                   | ` `                                                                 |




### Dependencies
- Node >=20.10.0
- Mongo 4.4.0
- MySQL 8

&nbsp;

## Cloning the Repository
Open your Terminal, and type:
`$ git clone https://github.com/django102/fincra-softass.git`


## Commands
1. `yarn` - Installs all dependencies
2. `yarn test` - Run all tests currently available in the [test](test) folder
3. `yarn build` - Generates all JavaScript files from the TypeScript sources
4. `yarn serve` - run the application for development in the local development environment. It starts the application using Nodemon which restarts the server each time a change is made to a file
5. `yarn lint` - Runs linting.



### Database Migrations
You don't necessarily need to write your own scripts as running the `create-migration` script will create the database scripts based on the models. But you'll have to look through and ensure your scripts work as they should

- `create-migration`: generate generate a new migration file
  - You will need to supply a name for your migration, e.g. `npm run create-migration --name=name-of-script`
- `migrate`: run outstanding migrations for the database configured. `npm run migrate`
- `revert-migration`: rollback one database migration


&nbsp;

### Pushing Code
- This repo has pre-commit hooks that run a lint process over the codebase. So you might need to run `git add .` and `git commit -m "message here"` more than once to have all your commits + the linted code committed.
- Always create a new branch from the `main` branch, and create your PRs against both the `staging` and `main` branches.


&nbsp;

### Running

- `cd` into your new `typescript-template` directory
- Install the peer dependencies

  ```bash
  npm install yarn -g
  $ yarn
  ```

- Install dependencies

&nbsp;

### Configuration
Copy and rename `env.example` to `.env` and `.env.test`. Configure the remainder of variables as required.

&nbsp;

### Usage/Development

To build the application:
```bash
$ yarn build
```

Or to enable hot module reloading, install nodemon:
```bash
$ yarn add -g nodemon
```
and run `yarn serve` to start the application

To run your tests, run the command:
```bash
$ yarn test
```

&nbsp;

### See [here](README_LIBRARIES.md) for a list of important Libraries.