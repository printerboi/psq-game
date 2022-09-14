const express = require('express')
const next = require('next')
const http = require("http")
const https = require("https")
const fs = require("fs")
    
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
let port = 3000;

if (!dev){
    port = 80;
}

let httpsOptions = {};
if(!dev){
    httpsOptions = {
        key: fs.readFileSync("./.certificates/privkey.pem"),
        cert: fs.readFileSync("./.certificates/cert.pem"),
    };
}
    
app.prepare()
.then(() => {
  const server = express();
  if(!dev){
    server.enable('trust proxy');
  }

  server.use("/uploads", express.static(__dirname + "/public/uploads"));
    
  server.all('*', (req, res) => {
    if (!dev && !req.secure) {
        return res.redirect("https://" + req.headers.host + req.url);
    }
    return handle(req, res)
  });
    

  const httpServer = http.createServer(server);

  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`> HTTP Ready on port ${port}`)
  });

  if(!dev){
    const httpsServer = https.createServer(httpsOptions, server);

    httpsServer.listen(443, (err) => {
        if (err) throw err
        console.log(`> HTTP Ready on port ${443}`)
      });
  }
})
.catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})