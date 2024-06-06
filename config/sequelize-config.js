const fs = require("fs");
const path = require("path");

module.exports = {
  local: {
    username: "postgres",
    password: "Avb@1221",
    database: "exchange",
    host: "localhost",
    dialect: "postgres",
  },
  //   development: {
  //     username: "redspace",
  //     password: "Admin@123",
  //     database: "exchange_db",
  //     host: "dev-exchange-crm-db.postgres.database.azure.com",
  //     dialect: "postgres",
  //     timezone: "utc",
  //     dialectOptions: {
  //       useUTC: false,
  //       timezone: "utc",
  //       ssl: {
  //         ca: fs
  //           .readFileSync(path.resolve(__dirname, "./exchangedbca.pem"))
  //           .toString(),
  //       },
  //     },
  //     port: 5432,
  //     ssl: true,
  //     pool: {
  //       max: 5,
  //       min: 0,
  //       acquire: 60000,
  //       idle: 20000,
  //     },
  //   },
};
