const express=require('express')

const app=express();

app.route("/",(req,res)=>{
    res.send("Hello World")
})

module.exports=app;