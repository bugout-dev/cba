// #!/usr/bin/env node
"use strict";
const BugoutClient = require("@bugout/bugout-js").default;
const { version } = require("../package.json");
const v4 = require("uuid").v4;
const fs = require("fs");

class CreateBugoutApplication {
  constructor(_token, _api) {
    this.token = _token;
    this.api = _api;
    this.app = {};
    this.groupAdminUser = {};
    this.groupId = {};
    this.groupAdminPassword = "";
    this.groupAdminToken = "";
    this.bc = new BugoutClient(_api);
  }

  async createNewApp(name, description, groupId) {
    if (!groupId) {
      const newGroup = await this.bc.createGroup(
        this.token,
        `app-${name}-host`
      );
      this.groupId = newGroup.id;
    } else {
      this.groupId = groupId;
    }

    this.app = await this.bc.createApplication(
      this.token,
      name,
      description,
      this.groupId
    );

    this.groupAdminPassword = v4();

    this.groupAdminUser = await this.bc.createUser(
      `applicationAdmin-${this.app.id}`,
      `admin@${this.app.id}.apps.bugout.dev`,
      this.groupAdminPassword
    );

    await this.bc.setUserInGroup(
      this.token,
      this.groupId,
      "owner",
      this.groupAdminUser.username,
      this.groupAdminUser.email
    );
    this.groupAdminToken = await this.bc.createToken(
      this.groupAdminUser.username,
      this.groupAdminPassword
    );

    return this.app;
  }

  exportToEnviromentVariable(out, extraFields) {
    fs.writeFile(out, "", () => {});
    fs.appendFileSync(out, `export BUGOUT_APPLICATION_ID="${this.app.id}"\n`);
    fs.appendFileSync(out, `export BUGOUT_GROUP_ID="${this.groupId}"\n`, {});
    fs.appendFileSync(
      out,
      `export APPLICATION_ADMIN_USERID="${this.groupAdminUser.id}"\n`,
      {}
    );
    fs.appendFileSync(
      out,
      `export APPLICATION_ADMIN_TOKEN="${this.groupAdminToken.id}"\n`,
      {}
    );
    fs.appendFileSync(
      out,
      `export APPLICATION_ADMIN_PASSWORD="${this.groupAdminPassword}"\n`,
      {}
    );
    Object.keys(extraFields)?.map((key) => {
      fs.appendFileSync(out, `export ${key}="${extraFields[key]}"\n`, {});
    });
    console.log("done");
  }

  exportToJSON(out, extraFields) {
    let outputData = {
      applicationID: this.app.id,
      groupId: this.groupId,
      username: this.groupAdminUser.username,
      email: this.groupAdminUser.email,
      password: this.groupAdminPassword,
      token: this.groupAdminToken.id,
    };
    outputData = { ...outputData, ...extraFields };
    fs.writeFile(out, JSON.stringify(outputData), function (err) {
      if (err) throw err;
      console.log("Saved to output file!");
    });
  }

  printOut(extraFields) {
    console.log("************************************");
    console.log("Application created:");
    console.log("Application ID:", this.app.id);
    console.log("Application name", this.app.name);
    console.log("Group ID: ", this.groupId);
    console.log("Generated application admin user:");
    console.log("username:", this.groupAdminUser.username);
    console.log("email", this.groupAdminUser.email);
    console.log("password:", this.groupAdminPassword);
    console.log("Generated admin token", this.groupAdminToken.id);
    Object.keys(extraFields)?.map((key) => {
      console.log(`Additional key ${key} -> "${extraFields[key]}"\n`);
    });
    console.log("Don't forget to save admin token!");
    console.log("************************************");
  }
}
exports.default = CreateBugoutApplication;
