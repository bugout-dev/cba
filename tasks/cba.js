// #!/usr/bin/env node
"use strict";
const BugoutClient = require("@bugout/bugout-js").default;
const { version } = require("../package.json");
const v4 = require("uuid").v4;
const fs = require("fs");
const CreateBugoutApplication = require("../src/CreateBugoutApplication").default;


const main = async () => {
  const ArgumentParser = require("argparse").ArgumentParser;

  const parser = new ArgumentParser({
    description: "Create bugout application",
  });

  const DEFAULT_API = "https://auth.bugout.dev";

  parser.add_argument("-v", "--version", { action: "version", version });
  parser.add_argument("-t", "--token", { help: "Your access token to bugout" });
  parser.add_argument("-g", "--group", {
    help: "If specificed - groupd id that wil own the app. New group will be created otherwise",
    required: false,
  });
  parser.add_argument("-n", "--name", {
    help: "name of your application",
    required: true,
  });
  parser.add_argument("-d", "--description", {
    help: "describe your application",
    required: true,
  });
  parser.add_argument("-a", "--api", {
    help: "use this argument to specify api endpoint url",
  });
  parser.add_argument("-o", "--out", { help: "Output file" });
  parser.add_argument("-e", "--isEnv"), { help: "Generate output as env file" };

  const { token, group, name, description, api, out, isEnv } =
    parser.parse_args();
  const _api = api ?? DEFAULT_API;

  const cba = new CreateBugoutApplication(token, _api);
  try {
    await cba.createNewApp(name, description, group);
    if (out) {
      if (isEnv) {
        cba.exportToEnviromentVariable(out);
      } else {
        cba.exportToJSON(out);
      }
    } else {
      cba.printOut();
    }
  } catch (err) {
    let message = err.response?.data?.detail || err.message || "Unknown Error";
    let status = err?.response?.status || err?.statusCode || err?.status || 500;
    console.log("***************************");
    console.log("catched an error:", status);
    console.log(message);
    console.log("***************************");
  }
};

main();

// exports.default = CreateBugoutApplication;
// export default CreateBugoutApplication;
