//import { http } from 'C:\Users\Admin\AppData\Roaming\npm\node_modules\http';
import * as http from "http";
import * as fs from "fs";
//import { fs } from 'C:\Users\Admin\AppData\Roaming\npm\node_modules\fs';
//import http = require('http');

//app.use('*.js', (req, res, next) => {
//    res.set('Content-Type', 'text/javascript')
//    next();
//})


fs.readFile('./index.html', function (err, html) {
    if (err) {
        throw err; 
    }       
    http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();  
    }).listen(3000);
});