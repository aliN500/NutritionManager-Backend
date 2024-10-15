const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const app = express();
const port = 7000;

app.listen (port,()=>{
    console.log('Server Port is :' +port);  
})