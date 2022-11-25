const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");

const filesPayload = require('./middleware/filesPayload');
const fileExtLimiter = require('./middleware/fileExtLimiter');
const fs = require("fs");

const produce = require('./target');



const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post('/upload',
    fileUpload({ createParentPath: true }),
     filesPayload,
   fileExtLimiter(['.json','.csv']),

   
    (req,res) => { 
        
        const files = req.files
        console.log(files)

        Object.keys(files).forEach(key => {
            const filepath = path.join(__dirname, `./files/${req.body.filetype}`, files[key].name)
            files[key].mv(filepath, (err) => {
                if (err) return res.status(500).json({ status: "error", message: err })
            })
        })

        return res.json({status: 'logged' , message: 'logged'})
    }
)

app.post('/customer',
    fileUpload({ createParentPath: true }),
     filesPayload,
   fileExtLimiter('.json'),

   
    (req,res) => { 
        
        const file = req.files
        console.log(file)

        fs.writeFileSync(`files/${req.body.name}.json`, file);

        fs.readFile(`./files/${req.body.name}.json`,'UTF-8', (err,source) => {
            produce(mapping.csv,source);
        })

        return res.json({status: 'logged' , message: 'logged'})
    }
)




app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
