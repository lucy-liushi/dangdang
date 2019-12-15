const express = require('express')
const app = express()
app.use(express.static("static"))
app.use("/upload", express.static("upload"))

var ObjectID = require("mongodb").ObjectID

var url = 'mongodb://localhost:27017'
const MongoClient = require("mongodb").MongoClient

//图书列表页
app.get("/", (req, res) => {

    MongoClient.connect(url, (err, client) => {
        //连接数据库，找到集合
        var collection = client.db("dangdang").collection("books")
            //查找集合的数据放到数组里
        collection.find({}).toArray((err, result) => {
            result.forEach(item => {
                item.image = "http://localhost:3001/" + item.image.replace(/\\/g, '/')
            })
            res.writeHead(200, { "Content-Type": "application/json" })
            res.write(JSON.stringify(result))
            res.end()
        })
    })
})


//商品分类列表
app.get("/listtype", (req, res) => {
    MongoClient.connect(url, (err, client) => {
        //连接数据库，找到集合
        var collection = client.db("dangdang").collection("booksClassify")
            //查找集合的数据放到数组里
        collection.find({}).toArray((err, result) => {
            result.forEach(item => {
                item.image = "http://localhost:3001/" + item.image.replace(/\\/g, '/')
            })
            res.writeHead(200, { "Content-Type": "application/json" })
            res.write(JSON.stringify(result))
            res.end()
        })
    })
})

app.get("/detail", function(req, res) {
    console.log(req.query.id)
    var id = ObjectID(req.query.id)
    MongoClient.connect(url, (err, client) => {
        var collection = client.db("dangdang").collection("books")
        collection.findOne({ _id: id }, (err, result) => {
            console.log(result)
            result.image = "http://localhost:3001/" + result.image.replace(/\\/g, '/')
                // res.writeHead(200, { "Content-Type": "application/json" })
                // res.write(JSON.stringify(result))
                // res.end()
            res.json(result);
        })

    })
})



app.listen(3001, () => {
    console.log("3001 is running")
})