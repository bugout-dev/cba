"use strict";
const ArgumentParser = require("argparse").ArgumentParser;
const CreateBugoutApplication =
  require("../src/CreateBugoutApplication").default;
const BugoutClient = require("@bugout/bugout-js").default;
const { version } = require("../package.json");
const v4 = require("uuid").v4;
const fs = require("fs");
const axios = require("axios");

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

const { token, group, name, description, api, out, isEnv, contracts } =
  cmaParser.parse_args();

const _api = api ?? DEFAULT_API;
const bc = new BugoutClient(_api);

const http = (config) => {
  const authorization = {};
  const defaultHeaders = config.headers ?? {};
  const options = {
    ...config,
    headers: {
      ...defaultHeaders,
      ...authorization,
    },
  };

  return axios(options);
};

const main = async () => {
  try {
    const MOONSTREAM_APP_ID = "e1b6321a-5e68-4f9d-ba0c-d87e37d9e7a9";
    const cba = new CreateBugoutApplication(token, api);
    const app = await cba.createNewApp(name, description, group);

    const registerData = new URLSearchParams();

    registerData.append("username", `terminusAdmin-${app.id}`);
    registerData.append("email", `admin@${app.id}.apps.bugout.dev`);
    registerData.append("password", cba.groupAdminPassword);

    const AUTH_URL = `https://api.moonstream.to/users`;

    console.log("attempt to register user...");

    await http({
      method: "POST",
      url: `${AUTH_URL}/`,
      data: registerData,
    });

    console.log("atempt to generate user token");
    const tokenResponse = await http({
      method: "POST",
      url: `${AUTH_URL}/token`,
      data: registerData,
    });

    if (out) {
      if (isEnv) {
        cba.exportToEnviromentVariable(out, {
          MOONSTREAM_ACCESS_TOKEN: tokenResponse.data.id,
        });
      } else {
        cba.exportToJSON(out, {
          MoonstreamToken: tokenResponse.data.id,
        });
      }
    } else {
      cba.printOut({
        MOONSTREAM_ACCESS_TOKEN: tokenResponse.data.id,
      });
    }
  } catch (err) {
    console.dir(err);
    let message = err.response?.data?.detail || err.message || "Unknown Error";
    let status = err?.response?.status || err?.statusCode || err?.status || 500;
    console.log("***************************");
    console.log("catched an error:", status);
    console.log(message);
    console.log("***************************");
  }
};

main();
