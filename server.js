const express = require('express')
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser')
const connection = require('./src/config/db')
const { PrismaClient } = require('@prisma/client')
const port = 3000

const server = express()


server.use(cors())
server.use(bodyParser.json())
const prisma = new PrismaClient();
server.get('/' , (req , res)=>{
    return res.status(200).json({"message" : "Hello Bitespeed"}) 
})

//identify endpoint
server.post('/identify' , async (req , res)=>{
    const {email , phoneNumber} = req.body
    console.log(email , phoneNumber)
    res.status(200).json({email , phoneNumber})
})

server.listen(port , ()=>{
    console.log(`server running on port ${port}`)
})








