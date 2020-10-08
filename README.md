# node-grpc-mutual-auth-example
Mutual auth with GRPC &amp; Node

Original blog: https://jsherz.com/grpc/node/nodejs/mutual/authentication/ssl/2017/10/27/grpc-node-with-mutual-auth.html


### Mutual auth with GRPC & Node: start to finish
Oct 7, 2020

Setting up mutual authentication can be a little daunting, especially when the docs for a library you’re using don’t always have a good example. Top it off with having to make your own certificates, and the whole process can be a real PITA! To make it easier, we’re going to be using a tool from the great people at Square, certstrap. If you’ve ever used the easyrsa utility bundled with OpenVPN, it will feel very familiar as it makes generating your own PKI much simpler than manually using OpenSSL.

#### Generating a root certificate authority
The client and server will both trust the same, private root certificate. We’re generating this manually for this example but you could alternatively use an existing PKI, for example from a MS Windows Server Domain Controller.

Find a release of certstrap for your operating system from their releases page. Once you’ve downloaded the binary, rename it to something more convenient and make it executable (if applicable).

```
wget https://github.com/square/certstrap/releases/download/v1.1.1/certstrap-v1.1.1-linux-amd64
mv certstrap-v1.1.1-linux-amd64 certstrap
chmod +x certstrap
```

Generate the certificate authority with a name that makes sense for your use case:

```
$ ./certstrap init --organization "Widgets Inc" \
                   --common-name "Snazzy Microservices"

Enter passphrase (empty for no passphrase):

Enter same passphrase again:

Created out/Snazzy_Microservices.key
Created out/Snazzy_Microservices.crt
Created out/Snazzy_Microservices.crl
```

Want to set more information, choose an expiration date or key size? See...
```
./certstrap init -h
```

As you can see above, we’ve now generated the main certificate that we’ll be trusting on both the client and the server (out/Snazzy_Microservices.crt).

#### Generating a server certificate
The hostname of the server’s certificate will be validated upon connection so ensure that the common name and DNS name match the hostname of your service. Generating a server certificate for your services is as easy as:

```
$ ./certstrap request-cert --common-name "login.services.widgets.inc" \
                           --domain "login.services.widgets.inc"

Enter passphrase (empty for no passphrase):

Enter same passphrase again:

Created out/login.services.widgets.inc.key
Created out/login.services.widgets.inc.csr
```

This will create the private key and certificate signing request, but not the certificate itself. We can sign the service’s certificate as follows:

```
$ ./certstrap sign --CA Snazzy_Microservices "login.services.widgets.inc"

Created out/login.services.widgets.inc.crt from out/login.services.widgets.inc.csr signed by out/Snazzy_Microservices.key
```

#### Generating a client certificate
Like the server, we also need to generate a certificate for the client. This time, we don’t need a DNS name and can use any common name we like:
```
$ ./certstrap request-cert --common-name "client-1010101"

Enter passphrase (empty for no passphrase):

Enter same passphrase again:

Created out/client-1010101.key
Created out/client-1010101.csr
```

```
$ ./certstrap sign --CA Snazzy_Microservices "client-1010101"

Created out/client-1010101.crt from out/client-1010101.csr signed by out/Snazzy_Microservices.key
```

Troubleshooting
If at any stage the above doesn’t work, try turning on verbose logging:

export GRPC_TRACE=all
export GRPC_VERBOSITY=DEBUG

node server
