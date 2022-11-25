const express = require('express')
const upload = require('express-fileupload')


const app = express()

app.use(upload())

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  //res.end();
})


app.post('/', (req,res)=> {
    if(req.files){
        console.log(req.files)

    }
})


app.listen(3000)
/*
app.get('/about', (req, res)=> {
    res.send('<h1>about</h1> ');
    //res.end();
  });
*/

