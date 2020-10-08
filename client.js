const fs = require("fs");
const path = require("path");
const protoLoader = require("@grpc/proto-loader");
const grpc = require("grpc");

const packageDefinition = protoLoader.loadSync("helloworld.proto");
const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

const options = {
  'grpc.ssl_target_name_override' : 'login.services.widgets.inc',
  'grpc.default_authority': 'login.services.widgets.inc'
};

function main() {
  let client;

  const certsDir = path.join(process.cwd(), "client-certs");

  client = new hello_proto.Greeter(
    "localhost:50051",
    grpc.credentials.createSsl(
      fs.readFileSync(path.join(certsDir, "Snazzy_Microservices.crt")),
    ),
    options
  );

  client.sayHello({ name: "John" }, function(err, response) {
    err && console.error(err);

    console.log("Greeting:", response.message);
  });

  client.sayHelloAgain({ name: "John" }, function(err, response) {
    err && console.error(err);

    console.log("Greeting:", response.message);
  });
}

main();
