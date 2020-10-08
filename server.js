const fs = require("fs");
const path = require("path");
const protoLoader = require("@grpc/proto-loader");
const grpc = require("grpc");

const packageDefinition = protoLoader.loadSync("helloworld.proto");
const hello_proto = grpc.loadPackageDefinition(packageDefinition).helloworld;

function sayHello(call, callback) {
  callback(null, { message: "Hello " + call.request.name });
}

function sayHelloAgain(call, callback) {
  callback(null, { message: "Hello again, " + call.request.name });
}

function main() {
  var server = new grpc.Server();
  server.addService(hello_proto.Greeter.service, {
    sayHello: sayHello,
    sayHelloAgain: sayHelloAgain
  });

  const certsDir = path.join(process.cwd(), "server-certs");

  server.bind(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createSsl(
      fs.readFileSync(
        path.join(certsDir, "Snazzy_Microservices.crt")
      ),
      [{
          private_key: fs.readFileSync(
            path.join( certsDir, "login.services.widgets.inc.key" )
          ),
          cert_chain: fs.readFileSync(
            path.join( certsDir, "login.services.widgets.inc.crt" )
          )
      }],
      false
    )
  );
  server.start();
  console.log("Server started");
}

main();
