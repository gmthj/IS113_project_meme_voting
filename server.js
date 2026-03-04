const express = require('express')
const path = require('path')

const server = express()

server.use(express.urlencoded( { extended : true} ) )
server.use(express.static(path.join(__dirname, "public")))

server.set("view engine", "ejs");

// =======================================================



const home = require('./routes/home')
server.use('/home', home)

const account = require('./routes/account')
server.use('/account', account)

const user = require('./routes/user')
server.use('/user', user)

const upload = require('./routes/upload')
server.use('/upload', upload)

const fullpost = require('./routes/fullpost')
server.use('/fullpost', fullpost)

const deleteItem = require('./routes/delete')
server.use('/delete', deleteItem)

const vote = require('./routes/vote')
server.use('/vote', vote)



server.get("/", (req, res) => {
    res.redirect("/home")
})    



// =======================================================

const hostname = 'localhost'
const port = 8000
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
    // console.log(`dirname: ${__dirname}`)
} )