const express = require("express");
const Firestore = require('@google-cloud/firestore');


const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());

const db = new Firestore({
  projectId: 'my-project-375718',
  keyFilename: 'application_default_credentials.json'
});

const task_collection = db.collection('users')

app.get("/api", function(req,res){
    // addData()
    // readData()
    res.json({message: "test from backend"});
});

app.get("/read-task", function(req,res){
    async function readData() {
        const snapshot = await task_collection.get();
        const output = []
        snapshot.forEach(doc => {
            output.push({
                id: doc.id,
                content: doc.data()
            })
            })
        return res.json(output)
    }
    readData()
});

app.post("/add-task", function(req,res){
    async function addData(json_data) {
        try {
            const new_data = await task_collection.add(json_data);
            console.log("Data added")
        } catch {
            console.log("something went wrong in function addData")
        } 
    }
        addData(req.body)
        res.send("Data added to db")
})

app.post("/delete-task", function(req,res){
    async function updateData(input_json) {
        try {
            const current_data = await task_collection.doc(input_json.id).get();
            const updated_data = current_data.data();
            if (updated_data.deleted) {
                updated_data.deleted = false;
            } else {
                updated_data.deleted = true;
            }
            const new_data = await task_collection.doc(input_json.id).set(updated_data);
        } catch {
            console.log("something went wrong in function deleteTask")
        }
    }
    updateData(req.body)
        res.send("Data updated")
})

app.listen(PORT, () => {
    console.log(`server run on ${PORT}`);
})