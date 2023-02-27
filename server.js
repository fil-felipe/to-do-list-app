const express = require("express");
const cors = require("cors");
const Firestore = require('@google-cloud/firestore');


const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

const db = new Firestore({
  projectId: 'my-project-375718',
//   keyFilename: 'application_default_credentials.json'
});

let defaul_collection_name = "default-to-do-list"

const task_collection = db.collection(defaul_collection_name)
const user_collection = db.collection("users");

async function readUserData(user_name) {
    const output = await user_collection.doc(user_name).get()
    const output_data = output.data()
    return output_data
}

async function readData() {
    const output = []
    const snapshot = await task_collection.get()
    snapshot.forEach(doc => {
        output.push({
            id: doc.id,
            content: doc.data()
        })
        })
    return output
}

async function readDataFromCollection(collection_name) {
    const collectionDb = db.collection(collection_name)
    const output = []
    const snapshot = await collectionDb.get()
    snapshot.forEach(doc => {
        output.push({
            id: doc.id,
            content: doc.data()
        })
        })
    return output
}



app.get("/user", async function(req,res) {
    const output = await readUserData("default_user");
    res.json(output);
})

app.get("/", function(req,res){
    // addData()
    // readData()
    res.send("Welcome in to-do-list-app");
});

app.get("/read-task/", function(req,res){
    readDataFromCollection(defaul_collection_name).then(response => (res.json(response)));
});

app.get("/read-task/:collection", function(req,res){
    readDataFromCollection(req.params.collection).then(response => (res.json(response)));
});

app.post("/add-task", async function(req,res) {
    const json_data = req.body;
    await task_collection.add(json_data);
    const output = await readDataFromCollection(defaul_collection_name);
    res.json(output);
})

app.post("/add-task/:collection", async function(req,res) {
    const collectionName = req.params.collection
    const collection = db.collection(collectionName)
    const json_data = req.body;
    await collection.add(json_data);
    const output = await readDataFromCollection(collectionName);
    res.json(output);
})

app.post("/delete-task", async function(req,res){
        const input_json = req.body;
        const current_data = await task_collection.doc(input_json.id).get();
        let updated_data = current_data.data();
        if (updated_data.deleted) {
            updated_data.deleted = false;
        } else {
            updated_data.deleted = true;
        }
        await task_collection.doc(input_json.id).set(updated_data);
        const output = await readData();
        res.json(output);
});

app.post("/delete-task/:collection", async function(req,res){
    const collectionName = req.params.collection
    const collection = db.collection(collectionName)
    const input_json = req.body;
    const current_data = await collection.doc(input_json.id).get();
    let updated_data = current_data.data();
    if (updated_data.deleted) {
        updated_data.deleted = false;
    } else {
        updated_data.deleted = true;
    }
    await collection.doc(input_json.id).set(updated_data);
    const output = await readDataFromCollection(collectionName);
    res.json(output);
});

app.delete("/delete-tasks", async function(req,res) {
    const actualTasks = await task_collection.get();
    await actualTasks.forEach(doc => {
            if (doc.data().deleted) {
                task_collection.doc(doc.id).delete();
            }
        });
    const output = await readData();
    res.json(output);
});

app.delete("/delete-tasks/:collection", async function(req,res) {
    const collectionName = req.params.collection
    const collection = db.collection(collectionName)
    const actualTasks = await collection.get();
    await actualTasks.forEach(doc => {
            if (doc.data().deleted) {
                collection.doc(doc.id).delete();
            }
        });
    const output = await readDataFromCollection(collectionName);
    res.json(output);
});

app.listen(PORT, () => {
    console.log(`server run on ${PORT}`);
})