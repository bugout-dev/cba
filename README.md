```
yarn cba -t <bugout_token> -n <NAME> -d <DESCRIPTION> -o <OUTPUT_FILE> -g <OPTIONAL: GROUP_ID> -isENV <optional: true>
```

This will create bugout application

If you specify group id it will use it, otherwise it will generate new group.

This script will also generate bugout user, add it to the group, and will make this user role as group owner

```
username: `applicationAdmin-${this.app.id}`,
email:  `admin@${this.app.id}.apps.bugout.dev`,
```

It will also generate access token for that user.

If you specify `-o <output file> -isEnv true` - output file will be stored as .env
if you specify `-o <output file>` you will get json format
if you don't specify `-o` script will print resulted app data in console.

Let the stream be with you!
