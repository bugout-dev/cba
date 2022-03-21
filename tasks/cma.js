"use strict";
const ArgumentParser = require("argparse").ArgumentParser;
const CreateBugoutApplication =
  require("../src/CreateBugoutApplication").default;
const BugoutClient = require("@bugout/bugout-js").default;
const { version } = require("../package.json");
const v4 = require("uuid").v4;
const fs = require("fs");

const DEFAULT_API = "https://auth.bugout.dev";

const cmaParser = new ArgumentParser({
  description: "Create terminus application",
});

cmaParser.add_argument("-v", "--version", { action: "version", version });
cmaParser.add_argument("-t", "--token", {
  help: "Your access token to bugout",
});
cmaParser.add_argument("-n", "--name", {
  help: "name of your application",
  required: true,
});
cmaParser.add_argument("-d", "--description", {
  help: "describe your application",
  required: true,
});
cmaParser.add_argument("-a", "--api", {
  help: "use this argument to specify api endpoint url",
});
cmaParser.add_argument("-o", "--out", { help: "Output file" });
cmaParser.add_argument("-addr", "--address", {
  help: "Terminus contract address",
});
cmaParser.add_argument("-e", "--isEnv", {
  help: "Generate output as env file",
});

cmaParser.add_argument("-c", "--contracts", {
  help: "compiled contracts directory ",
});

const { token, group, name, description, api, out, isEnv, contracts } =
  cmaParser.parse_args();

const _api = api ?? DEFAULT_API;
const bc = new BugoutClient(_api);

const main = async () => {
  try {
    const cba = new CreateBugoutApplication(token, api);
    const app = await cba.createNewApp(name, description, group);
    await bc.createUser(
      `applicationAdmin-${app.id}`,
      `admin@${app.id}.apps.bugout.dev`,
      cba.groupAdminPassword,
      "",
      "",
      app.id
    );
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
