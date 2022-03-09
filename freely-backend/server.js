import express from "express";
import mongoose from 'mongoose';
import Messages from './dbMessages.js';
import Pusher from "pusher";
import cors from "cors";
/*
Here we are creating an API

There are Different requests : 
GET: when frontend requests to get something to server.
POST: when frontend requests to push something to server.
DELETE: when frontend requests to delete something to server.
*/

//app config
const app=express();
const port=process.env.PORT||9000;

const pusher = new Pusher({
    appId: "1357348",
    key: "7f070354213b2162dd1b",
    secret: "a8ea2ce02101ea7a723b",
    cluster: "eu",
    useTLS: true
  });

//middleware
app.use(express.json());
app.use(cors())

/*
//To make it secure
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","*");
    next();
})
*/

//db config
const connection_url='mongodb+srv://raghavsharma775:QLnJ5i3Z3SKiGixi@cluster0.d3aki.mongodb.net/freelydb?retryWrites=true&w=majority'
mongoose.connect(connection_url,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});

const db =mongoose.connection
db.once("open",()=>{
    console.log("DB connected");
    const msgCollection=db.collection("messagecontents");
    const changeStream=msgCollection.watch();

    changeStream.on("change",(change)=>{
        console.log("A Change occured",change);

        if(change.operationType==="insert") {
            const messageDetails=change.fullDocument;
            pusher.trigger("messages","inserted",{
                name:messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                received:messageDetails.received,
            });
        }
            else{
                console.log("Error triggering Pusher");
            }
    })
})
//api routes
app.get("/",(req,res)=>res.status(200).send('hello world'));

app.get('/messages/sync',(req,res)=>{
    Messages.find((err,data)=>{
        if(err) { //500 :internal Server Error
            res.status(500).send(err)
        }
        else
        {   //200: ok
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new',(req,res)=>{
    const dbMessage=req.body;

    Messages.create(dbMessage,(err,data) =>{
        if(err) { //500 :internal Server Error
            res.status(500).send(err)
        }
        else
        {   //201:created ok
            res.status(201).send(data)
        }
    })
});

//listen
app.listen(port,()=>console.log(`Listening on localhost:${port}`));

