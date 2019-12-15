const express = require('express')
const fs = require('fs')
const app = express()
const multiparty = require("multiparty")
const MongoClient = require("mongodb").MongoClient

const ejs = require('ejs')
app.engine("html", ejs.__express)
app.set("view engine", "html")
app.use(express.static("static"))
app.use("/upload", express.static("upload"))
var url = 'mongodb://localhost:27017'
var ObjectID = require("mongodb").ObjectID

const session = require("express-session")
app.use(session({
    secret: "sessionid",
    cookie: { maxAge: 6000 * 6000 }
}))


//检测是否登录，即是否使用了session
app.use((req, res, next) => {
    if (req.url == "/login" || req.url == "/doLogin") {
        next()
    } else {
        //  next()
        if (req.session.userInfo && req.session.userInfo.username != " ") {
            next()
        } else {
            res.redirect("/login")
        }
    }
})




//图书列表页
app.get("/", (req, res) => {
    MongoClient.connect(url, (err, client) => {
        //连接数据库，找到集合
        var collection = client.db("dangdang").collection("books")
            //查找集合的数据放到数组里
        collection.find({}).toArray((err, result) => {
            // console.log(result)
            if (err) {
                console.log("图书列表连接失败")
                return
            }
            //将数据发送到页面
            res.render("book/index", { result })
        })
    })
})


//商品增加
app.get("/add", (req, res) => {
    res.render("book/add")
})
app.post('/doadd', (req, res) => {
    var form = new multiparty.Form() //解析form表单
        //指定文件上传目录
    form.uploadDir = "upload"
        //fields为字段信息，files为文件信息
    form.parse(req, (err, fields, files) => {
        console.log(fields)
        let name = fields.name[0] //标题
        let desc = fields.desc[0] //内容
        var image = files.image[0].path //图片路径
        var youfei = fields.youfei[0] //邮费
        var price = fields.price[0] //价格
        MongoClient.connect(url, (err, client) => {
            //获取集合article
            var collection = client.db("dangdang").collection("books")
                //向集合中插入数据
            collection.insertOne({
                name,
                desc,
                image,
                youfei,
                price
            }, (err, result) => {
                if (err) {
                    console.log("添加失败")
                    return
                }
                res.send("<script>alert('添加成功');location.href='/'</script>")
            })
        })
    })
})


//商品编辑
app.get("/edit", (req, res) => {
    // console.log(req.query.id)
    var id = ObjectID(req.query.id)
    console.log(id)
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        var collection = client.db("dangdang").collection("books")
        collection.find({ _id: id }).toArray((err, result) => {
            console.log(result)
            if (err) {
                console.log("编辑出错")
                return
            }
            res.render("book/edit", { "result": result[0] })
        })
    })
})

app.post("/doedit", (req, res) => {
    var form = new multiparty.Form() //解析form表单
        //指定文件上传目录
    form.uploadDir = "upload"
        //fields为字段信息，files为文件信息
    form.parse(req, (err, fields, files) => {
        console.log(fields)
        var id = ObjectID(fields.id[0])
        let name = fields.name[0] //标题
        let desc = fields.desc[0] //内容
        let price = fields.price[0] //价格
        let youfei = fields.youfei[0] //原价
        var image = files.image[0].path //图片路径
        var originalFilename = files.image[0].originalFilename
        if (originalFilename == '') {
            var updateData = {
                name,
                desc,
                price,
                youfei
            }
        } else {
            var updateData = {
                name,
                desc,
                image,
                price,
                youfei
            }
        }
        //更新数据库
        MongoClient.connect(url, (err, client) => {
            //获取集合books
            var collection = client.db("dangdang").collection("books")
                //向集合中插入数据
            collection.updateOne({ _id: id }, { $set: updateData }, (err, result) => {
                if (err) {
                    console.log("修改失败")
                    return
                }
                res.send("<script>alert('修改成功');location.href='/'</script>")
            })
        })
    })
})


//删除商品
app.get("/delete", (req, res) => {
    var id = ObjectID(req.query.id)
    MongoClient.connect(url, (err, client) => {
        var collection = client.db("dangdang").collection("books")
        collection.findOne({ _id: id }, (err, result) => {
            // console.log(result)
            var image = result.image
            if (image) {
                fs.unlinkSync(image)
            }
        })
        collection.removeOne({ _id: id }, (err, result) => {
            if (err) {
                console.log(err)
                return
            }
            res.send("<script>alert('删除成功');location.href='/'</script>")
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
            console.log(result)
            if (err) {
                console.log("图书列表连接失败")
                return
            }
            //将数据发送到页面
            res.render("type/listtype", { result })
        })
    })
})

//编辑商品分类
app.get("/edittype", (req, res) => {
    // console.log(req.query.id)
    var id = ObjectID(req.query.id)
    console.log(id)
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
        var collection = client.db("dangdang").collection("booksClassify")
        collection.find({ _id: id }).toArray((err, result) => {
            console.log(result)
            if (err) {
                console.log("编辑出错")
                return
            }
            res.render("type/edittype", { "result": result[0] })
        })
    })
})

app.post("/doedittype", (req, res) => {
    var form = new multiparty.Form() //解析form表单
        //指定文件上传目录
    form.uploadDir = "upload"
        //fields为字段信息，files为文件信息
    form.parse(req, (err, fields, files) => {
        console.log(files)
        var id = ObjectID(fields.id[0])
        let name = fields.name[0] //标题
        var image = files.image[0].path //图片路径
        var originalFilename = files.image[0].originalFilename
        if (originalFilename == '') {
            var updateData = {
                name
            }
        } else {
            var updateData = {
                name,
                image
            }
        }
        //更新数据库
        MongoClient.connect(url, (err, client) => {
            //获取集合books
            var collection = client.db("dangdang").collection("booksClassify")
                //向集合中插入数据
            collection.updateOne({ _id: id }, { $set: updateData }, (err, result) => {
                if (err) {
                    console.log("修改失败")
                    return
                }

                res.send("<script>alert('修改成功');location.href='/listtype'</script>")
            })
        })
    })
})


//商品分类增加
app.get("/addtype", (req, res) => {
    res.render("type/addtype")
})
app.post('/doaddtype', (req, res) => {
    var form = new multiparty.Form() //解析form表单
        //指定文件上传目录
    form.uploadDir = "upload"
        //fields为字段信息，files为文件信息
    form.parse(req, (err, fields, files) => {
        console.log(fields)
        let name = fields.name[0] //标题
        var image = files.image[0].path //图片路径
        MongoClient.connect(url, (err, client) => {
            //获取集合article
            var collection = client.db("dangdang").collection("booksClassify")
                //向集合中插入数据
            collection.insertOne({
                name,
                image,
            }, (err, result) => {
                if (err) {
                    console.log("添加失败")
                    return
                }
                res.send("<script>alert('添加成功');location.href='/listtype'</script>")
            })
        })
    })
})

app.get("/deletetype", (req, res) => {
    var id = ObjectID(req.query.id)
    MongoClient.connect(url, (err, client) => {
        var collection = client.db("dangdang").collection("booksClassify")
        collection.findOne({ _id: id }, (err, result) => {
            // console.log(result)
            var image = result.image
            if (image) {
                fs.unlinkSync(image)
            }
        })
        collection.removeOne({ _id: id }, (err, result) => {
            if (err) {
                console.log(err)
                return
            }
            res.send("<script>alert('删除成功');location.href='/listtype'</script>")
        })

    })
})



//登录页
app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/doLogin", (req, res) => {
    var form = new multiparty.Form() //解析form表单
    form.parse(req, (err, fields) => {
        var username = fields.username[0]
        var password = fields.password[0]
        MongoClient.connect(url, (err, client) => {
            var collection = client.db("dangdang").collection("users")
            collection.findOne({ username, password }, (err, result) => {
                // console.log(result)
                if (result == null) {
                    res.send("<script>alert('您输入的用户名或密码错误，请重新登录');history.back()</script>")
                } else {
                    //登录成功，转跳到列表页，设置session
                    req.session.userInfo = result
                    app.locals['userInfo'] = result
                    res.redirect("/")
                }
            })
        })
    })
})


//退出登录
app.get("/loginOut", (req, res) => {
    req.session.userInfo = null
    res.render('login')
})
app.listen(3000, () => {
    console.log("server is running in 127.0.0.1:3000")
})