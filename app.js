//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');
const app = express();
require('dotenv').config();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.URL);
let result
const itemschema = new mongoose.Schema({
  name:String
})

const Item = mongoose.model('Item',itemschema)

const item1 = new Item({
  name:"Welcome to your todolist"
})

const item2 = new Item({
  name:"Hit + button too add a new item"
})

const item3 = new Item({
  name:"<-- Hit this to delete an item"
})

const defaultitems = [item1,item2,item3]

const listschema = {
  name:String,
  item:[itemschema]
}
const List = mongoose.model('List',listschema)

const deletedocument = async(id) =>{
  await Item.findByIdAndRemove({_id:id})
}
app.get("/", function(req, res) {
  const getdocument = async() =>{
    result = await Item.find({})
    if (result.length===0){
      Item.insertMany(defaultitems)
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: 'Today', newListItems:result})
    }
  }
  getdocument()
});

app.post("/", function(req, res){
  const itemname = req.body.newItem;
  const listname = req.body.list
  const item = new Item({
    name:itemname
  })
  const fo = async (nam) =>{
  if (listname === "Today"){
    item.save()
    res.redirect("/");
  }
  else{
      const w = await List.findOne({name:nam})
      w.item.push(item)
      w.save()
      res.redirect("/"+listname)
    }
  }
  fo(listname)
});

app.post('/delete',function(req,res){
  const checkid = req.body.checkbox
  const listName = req.body.listName
  if (listName === "Today"){
    deletedocument(checkid)
    res.redirect("/");
  }
  else{
    const fou = async ()=>{
      const f = await List.findOneAndUpdate({name:listName},{$pull:{item:{_id:checkid}}})
      res.redirect('/'+listName)
  }
  fou()
}})

app.get("/:test",function(req,res){
  const listname = _.capitalize(req.params.test)
  const fo = async(nam) =>{
    const w = await List.findOne({name:nam})
    if (w){
      res.render('list',{listTitle: w.name, newListItems:w.item})
    }
    else{
      const list = new List({
        name:listname,
        item:defaultitems
      })
      list.save()
      res.redirect("/"+listname);
    }
    }
    fo(listname)
})

app.get("/about", function(req, res){
  res.render("about")
});

const hostname = '0.0.0.0'

let port = process.env.PORT
if (port == null || port == ""){
  port = 3000
}

app.listen(port,hostname,function() {
  console.log("Server started on port " + port);
});