import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "hfjdbo",

  reporter: 'mochawesome',

  env: {
    CYPRESS_RECORD_KEY: "668d3a3f-fbd2-443a-a71e-1069201eb3c6"
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
