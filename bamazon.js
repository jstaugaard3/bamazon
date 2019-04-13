var mysql = require("mysql");
var inquirer = require("inquirer");
var productID = [];

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "********", //took out password before uploading
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function (err) {
  if (err) throw err;
  start();
});

function start() {
  //Display list of all products
  connection.query("SELECT * FROM products", function (err, res) {
    console.log("------------------------------------");
    for (var i = 0; i < res.length; i++) {
      productID.push(res[i].item_id);
      console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].price);

    }
    console.log("-----------------------------------");

    //Ask which product to buy
    inquirer
      .prompt({
        name: "IDBuy",
        type: "list",
        choices: productID,
        message: "Would product would you like to purchase?",
      })
      .then(function (IDanswer) {

        //Ask quantity
        inquirer
          .prompt({
            name: "quantity",
            type: "input",
            message: "How many would you like to buy?",
          })
          .then(function (Quantanswer) {
            var sql = "SELECT * FROM products WHERE item_id='" + IDanswer.IDBuy + "'";
            connection.query(sql, function (err, results) {
              if (err) throw err;

              //Check to see if enough available
              if (Quantanswer.quantity <= results[0].stock_quantity) {
                
                //If enough available, execute order and update quantity
                var newQuantity = results[0].stock_quantity - Quantanswer.quantity;
                var sqlUpdate = "UPDATE products SET stock_quantity = '" + newQuantity + "' WHERE item_id = '" + IDanswer.IDBuy + "'";
                var itemPrice = results[0].price;
                var totalPrice = itemPrice * Quantanswer.quantity;
                var productName = results[0].product_name;

                connection.query(sqlUpdate, function (err, results) {
                  if (err) throw err;
                  console.log("-----CUSTOMER RECEIPT-------------");
                  //console.log("Updated, "+newQuantity+" remaining.");
                  console.log("Item : " + productName);
                  console.log("Quantity : " + Quantanswer.quantity);
                  console.log("Price Per : " + itemPrice);
                  console.log("TOTAL PRICE : " + totalPrice);
                  console.log("------------------------------------");

                  //Check to see if more buying is needed
                  buyAgain();
                })
              } //closed off If statement
              else {
                console.log("");
                console.log("Insufficient quantity available!");
                console.log("");
                buyAgain();
              }

            }) //close off connection
          }) //close then statement
      }) // close other then statement
  }) // close connection
}//close function

function buyAgain() {

  inquirer
    .prompt({
      name: "buyMore",
      type: "confirm",
      message: "Would you like to buy something else?",
    })
    .then(function (response) {
      if (response.buyMore) {
        start();
      }
      else {
        connection.end();
      }
    });

}