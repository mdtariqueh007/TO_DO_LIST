//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const PORT = process.env.PORT || 3030;

const app = express();

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-tarique:Qq9geUkP5CyZ4eso@cluster0.2t4yvcc.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit the + buttin to add a new task"
});
const item3 = new Item({
  name: "<-- Hit this to delete a task"
});

const defualtItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

// Item.insertMany(defualtItems)
// .then(function(){
//   console.log("Items Inserted successfully");
// })
// .catch(function(err){
//   console.log(err);
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];


app.get("/", function (req, res) {

  // const day = date.getDate();

  Item.find()
    .then(function (foundItems) {

      if (foundItems.length === 0) {
        Item.insertMany(defualtItems)
          .then(function () {
            console.log("Items Inserted successfully");
          })
          .catch(function (err) {
            console.log(err);
          });
        res.redirect("/");
      }

      else {

        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }

    })
    .catch(function (err) {
      console.log(err);
    });



});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  const list = new List({
    name: customListName,
    items: defualtItems
  });
  // list.save();
  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defualtItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();

    res.redirect("/");

  }
  else {
    List.findOne({ name: listName })
      .then(function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch(function (err) {
        console.log(err);
      });
  }




  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;
  if(listName==="Today"){

    Item.findByIdAndRemove(checkedItemId)
      .then(function () {
        console.log("Deleted");
      })
      .catch(function (err) {
        console.log(err);
      });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name : listName},{$pull:{items:{_id:checkedItemId}}})
    .then(function(foundList){
      res.redirect("/"+listName);
    })
    .catch(function(err){
      console.log(err);
    });
  }
});




// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(PORT, function () {
  console.log("Server started on port ${PORT}");
});
