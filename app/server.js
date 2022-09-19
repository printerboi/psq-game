// server.js
const http = require('http');
const express = require('express');
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

console.log("preparing app...")

try{
  app.prepare().then(() => {
    console.log("launching the express server...")
    try{
      const server = express();

      console.log("express server was created");
  
      //server.use("/uploads", express.static(__dirname + "/public/uploads"));
    
      const httpServer = http.createServer(server);

      console.log("creating the http server...")

      server.all('*', (req, res) => {

        return handle(req, res)
      });
    
      httpServer.listen(port, (err) => {
        if(err){
          console.log(err);
        }
        console.log(`> HTTP Ready on port ${port}`)
      });
    }catch(e){
      console.log(e);
    }
  
  })
}catch(e){
  console.log(e);
}
