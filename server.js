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
    if (!email && !phoneNumber){
        res.status(400).json({"message" : "Either mail or phoneNumber must be provided"})
    } 
    try{
        const existingContacts = await prisma.Contact.findMany({
            where :{
                OR : [
                    {email } , {phoneNumber}
                ]
            }
        })

        if (existingContacts.length === 0){
            const primaryContact = await prisma.Contact.create({
                data:{
                    email ,
                    phoneNumber , 
                    linkPrecedence : "primary",
                }
            })

            return res.status(200).json({
                "contact":{
                    "primaryContatctId": primaryContact.id,
                    "emails": [primaryContact.email],
                    "phoneNumbers": [primaryContact.phoneNumber],
                    "secondaryContactIds": []
                }
            })
        }
    } catch(err){
        console.log(err)
    }
    res.status(200).json({email , phoneNumber})
});

server.listen(port , ()=>{
    console.log(`server running on port ${port}`)
})








