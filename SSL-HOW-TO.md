# SSL How-To
Setting yourself up with SSL can be difficult, and there seems to be a lacking of complete guides on how to do it, so here it is

## Prerequisites
This tutorial is meant to be run on a linux machine with openssl. It'll probably work on OS X as well, but it's untested. It you're on Windows, I'm sorry for you, make the jump to linux.

**NOTE**: All the files you generate here need to be kept super secure!

## Steps
### #1
First we need to generate a private RSA key. That's simple enough:
```bash
openssl genrsa -des3 -out server.key 4096
```
You'll need to type in a password to encrypt the key. From this you'll get `server.key`.

### #2
Now we need to generate a CSR (Certificate Signing Request) from the private key:
```bash
openssl req -new -key server.key -out server.csr
```
You'll get a prompt that looks a little like this:
```
Country Name (2 letter code) [AU]:
State or Province Name (full name) [Some-State]:
Locality Name (eg, city) []:
Organization Name (eg, company) [Internet Widgits Pty Ltd]:
Organizational Unit Name (eg, section) []:
Common Name (e.g. server FQDN or YOUR name) []:
Email Address []:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:
```

Fill in "Country Name" and "State or Province Name" with your information.

"Common Name" is very important! What you put here must be the address that all LU clients will refer to the server as. 

If Lock-Up server's (LAN) address is `10.0.0.23` and your LU clients will only ever connect from the same LAN, put `10.0.0.23` as the "Common Name".

If LU server's [FQDN](https://en.wikipedia.org/wiki/Fully_qualified_domain_name) is `lu.example.com` and your LU clients will connect from both LAN or WAN, put the LU servers FQDN as the "Common Name"

From this you'll get `server.csr`

### #3
Now we need to remove the encryption from the private key. First let's back up the original key:
```bash
cp server.key server.key.original
```
Then We'll remove the encryption:
```bash
openssl rsa -in server.key.org -out server.key
```

From this you'll get a new, decrypted `server.key`

**Note**: This is the most venerable file of them all! KEEP THIS CRAZY SECURE!

### #4
Now we have to create a self-signed certificate:
```bash
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```
See the 365? That's how long (in days) the certificate will be valid. As far as I know, there is no limit to how long it can be valid, so you may save yourself some trouble later by raising this number.

*Note: Once the certificate expires, you're gonna have to create another certificate using this step, and replace all instances of the old certificate with this new one.*

### #5
Make certain you're secure.

The decrypted key (`server.key`) needs to reside on only your Lock-Up server, and the certificate (`server.crt`) needs to reside on both your Lock-Up server and your Lock-Up clients.

All other files created should be put somewhere safe and kept handy just in case.