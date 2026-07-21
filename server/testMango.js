require("dotenv").config();
const { MongoClient } = require("mongodb");

async function test() {

 const client = new MongoClient(process.env.MONGO_URI);

 try {
   await client.connect();

   console.log("Mongo connected");

   await client.db("admin").command({
     ping:1
   });

   console.log("Ping successful");

 } catch(error){
   console.error(error);
 }

 finally{
   await client.close();
 }
}

test();