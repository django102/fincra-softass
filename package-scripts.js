// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Windows: Please do not use trailing comma as windows will fail with token error
 */

const { glob } = require("glob");
const { series, rimraf, } = require("nps-utils");

module.exports = {
  scripts: {
    /**
         * Starts the builded app from the dist directory.
         */
    start: {
      script: "cross-env NODE_ENV=production node dist/app.js",
      description: "PROD: Starts the built app for prod from dist folder"
    },
    /**
         * Serves the current app and watches for changes to restart it
         */
    serve: {
      inspector: {
        script: series(
          "nps banner.serve",
          "nodemon --watch src --watch .env --inspect --ignore **/swagger.json"
        ),
        description: "DEV: Serves the current app for dev and watches for changes to restart it, you may attach inspector to it.",
        hiddenFromHelp: true
      },
      script: series(
        "nps setup",
        "nps banner.serve",
        "nodemon --watch src --watch .env --ignore **/swagger.json"
      ),
      description: "DEV: Serves the current app and watches for changes to restart it"
    },
    /**
         * Setup of the development environment
         */
    setup: {
      script: series(
        "yarn install",
        "nps db.migrate",
      ),
      description: "DEV: Setup`s the development environment (yarn & database)",
      hiddenFromHelp: true
    },
    /**
         * Creates the needed configuration files
         */
    config: {
      script: series(
        runFast("./commands/tsconfig.ts"),
      ),
      hiddenFromHelp: true
    },
    /**
         * Builds the app into the dist directory
         */
    build: {
      script: series(
        "nps banner.build",
        "nps config",
        "nps lint",
        "nps clean.dist",
        "nps transpile",
        "nps copy",
        "nps copy.tmp",
        "nps clean.tmp",
      ),
      description: "PROD: Builds the app into the dist directory"
    },
    /**
         * Runs ESLint over your project
         */
    lint: {
      script: eslint("./src"),
      hiddenFromHelp: true
    },
    /**
         * Transpile your app into javascript
         */
    transpile: {
      script: "tsc --project ./tsconfig.build.json",
      hiddenFromHelp: true
    },
    /**
         * Clean files and folders
         */
    clean: {
      default: {
        script: series(
          "nps banner.clean",
          "nps clean.dist"
        ),
        description: "Deletes the ./dist folder",
        hiddenFromHelp: true
      },
      dist: {
        script: rimraf("./dist"),
        hiddenFromHelp: true
      },
      tmp: {
        script: rimraf("./.tmp"),
        hiddenFromHelp: true
      }
    },
    /**
         * Copies static files to the build folder
         */
    copy: {
      default: {
        script: series(
          "nps copy.swagger",
          "nps copy.public"
        ),
        hiddenFromHelp: true
      },
      swagger: {
        script: copy(
          "./src/api/swagger.json",
          "./dist"
        ),
        hiddenFromHelp: true
      },
      public: {
        script: copy(
          "./src/public/*",
          "./dist"
        ),
        hiddenFromHelp: true
      },
      // ********************************************
      tmp: {
        script: copyDir(
          "./.tmp/src",
          "./dist"
        ),
        hiddenFromHelp: true
      }
      // tmp: {
      //   script: copyDir(
      //     "./.tmp",
      //     "./dist"
      //   ),
      //   hiddenFromHelp: true
      // }
    },
    /**
         * Database scripts
         */
    db: {
      migrate: {
        script: runIfDbEnabled(series(
          "nps banner.migrate",
          "nps config",
          runFast("./node_modules/migrate-mongo/bin/migrate-mongo.js up"))
        ),
        description: "Migrates the database to newest version available",
        hiddenFromHelp: true
      },
      revert: {
        script: runIfDbEnabled(series(
          "nps banner.revert",
          "nps config",
          runFast("./node_modules/migrate-mongo/bin/migrate-mongo.js down"))
        ),
        description: "Downgrades the database",
        hiddenFromHelp: true
      },
      seed: {
        script: runIfDbEnabled(series(
          "nps banner.seed",
          "nps config",
          runFast("./commands/seed.ts"))
        ),
        description: "Seeds generated records into the database",
        hiddenFromHelp: true
      },
      setup: {
        script: series(
          "nps db.drop",
          "nps db.migrate",
          "nps db.seed"
        ),
        description: "Recreates the database with seeded data",
        hiddenFromHelp: true
      }
    },
    /**
         * These run various kinds of tests. Default is all.
         */
    test: {
      default: {
        script: series(
          "cross-env NODE_ENV=test jest --verbose --runInBand --coverage --collectCoverageFrom=src/api/**/*.ts --forceExit"
        ),
        description: "DEV: Runs all tests"
      },
      unit: {
        default: {
          script: series(
            "nps test.unit.pretest",
            "nps test.unit.run"
          ),
          description: "Runs the unit tests",
          hiddenFromHelp: true
        },
        pretest: {
          script: eslint("./test/unit/**.ts"),
          hiddenFromHelp: true
        },
        run: {
          script: "cross-env NODE_ENV=test jest --runInBand --testPathPattern=unit",
          hiddenFromHelp: true
        },
        verbose: {
          script: "nps \"test --verbose\"",
          hiddenFromHelp: true
        },
        coverage: {
          script: "cross-env NODE_ENV=test jest  --runInBand --testPathPattern=unit --coverage",
          hiddenFromHelp: true
        }
      },
      integration: {
        default: {
          script: series(
            "nps banner.testIntegration",
            "nps test.integration.pretest",
            "nps test.integration.run"
          ),
          description: "Runs the integration tests",
          hiddenFromHelp: true
        },
        pretest: {
          script: eslint("./test/integration/**.ts"),
          hiddenFromHelp: true
        },
        run: {
          // -i. Run all tests serially in the current process, rather than creating a worker pool of child processes that run tests. This can be useful for debugging.
          script: "cross-env NODE_ENV=test jest --runInBand --testPathPattern=integration",
          hiddenFromHelp: true
        },
        verbose: {
          script: "nps \"test --verbose\"",
          hiddenFromHelp: true
        },
        coverage: {
          script: "cross-env NODE_ENV=test jest  --runInBand --testPathPattern=integration --coverage",
          hiddenFromHelp: true
        }
      },
      e2e: {
        default: {
          script: series(
            "nps banner.testE2E",
            "nps test.e2e.pretest",
            "nps test.e2e.run"
          ),
          description: "Runs the e2e tests",
          hiddenFromHelp: true
        },
        pretest: {
          script: eslint("./test/e2e/**.ts"),
          hiddenFromHelp: true
        },
        run: {
          // -i. Run all tests serially in the current process, rather than creating a worker pool of child processes that run tests. This can be useful for debugging.
          script: "cross-env NODE_ENV=test jest --testPathPattern=e2e -i --detectOpenHandles",
          hiddenFromHelp: true
        },
        verbose: {
          script: "nps \"test --verbose\"",
          hiddenFromHelp: true
        },
        coverage: {
          script: "cross-env NODE_ENV=test jest --testPathPattern=e2e --coverage",
          hiddenFromHelp: true
        }
      },
    },
    /**
         * This creates pretty banner to the terminal
         */
    banner: {
      build: banner("build"),
      serve: banner("serve"),
      testUnit: banner("test.unit"),
      testIntegration: banner("test.integration"),
      testE2E: banner("test.e2e"),
      migrate: banner("migrate"),
      seed: banner("seed"),
      revert: banner("revert"),
      clean: banner("clean")
    }
  }
};

function banner(name) {
  return {
    hiddenFromHelp: true,
    silent: true,
    description: `Shows ${name} banners to the console`,
    script: runFast(`./commands/banner.ts ${name}`),
  };
}
function isDbEnabled() {
  var files = glob("./src/database/migrations/*.ts", { sync: true });
  return files.length > 0;
}

if (!isDbEnabled()) {
  console.warn("No db migrations. Db actions disabled");
}

function runIfDbEnabled(scripts) {
  if (!isDbEnabled()) {
    return "";
  }
  else {
    return scripts;
  }
}

function copy(source, target) {
  return `copyfiles --up 1 ${source} ${target}`;
}

function copyDir(source, target) {
  return `ncp ${source} ${target}`;
}

function run(path) {
  return `ts-node ${path}`;
}

function runFast(path) {
  return `ts-node --transpile-only ${path}`;
}

function eslint(path) {
  return `eslint -c ./.eslintrc.js ${path} --format stylish --fix --ext .ts`;
}
