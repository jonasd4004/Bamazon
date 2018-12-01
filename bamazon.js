const inquirer = require("inquirer");
const mySQL = require("mysql");

const connection = mySQL.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "k01572307!",
    database: "bamazon_db"
})

connection.connect((err) => {
    if (err) {
        console.log(err);
    }
    showProducts();
})

const showProducts = () => {
    connection.query("SELECT * FROM products", (err, data) => {
        if (err) throw err;

        // console.log(data);
        data.forEach(product => {
            console.log(`Item ID: ${product.item_id}\n Name: ${product.product_name}\n Department: ${product.department_name}\n Price: ${product.price}\n Quantity: ${product.stock_quantity}`);
        })
        promptItem(data);
    })
}

const promptItem = (productData) => {
    inquirer.prompt([
        {
            name: "choice",
            type: "input",
            message: "Please enter the id of the product you wish to purchase:"
        }
    ]).then(answers => {
        // safe guard that they enter an exisiting ID
        var userChoice = parseInt(answers.choice);
        var chosenItem = checkInventory(userChoice, productData);

        if (chosenItem) {
            promptQuantity(chosenItem);
        }
        else {
            console.log("Sorry, we don't have this item in our inventory!")
            showProducts();
        }
    });
}

const checkInventory = (userChoice, productData) => {
    for (let i = 0; i < productData.length; i++) {
        if (productData[i].item_id === userChoice) {
            return productData[i];
        }
    } return null;
}

const promptQuantity = (chosenItem) => {
    inquirer.prompt([
        {
            name: "amount",
            type: "input",
            message: "How many would you like to purchase?"
        }
    ])
        .then(answers => {
            var userAmount = parseInt(answers.amount);
            if (userAmount > chosenItem.stock_quantity) {
                console.log('Insufficient Quanitity!');
                showProducts();
            }
            else {
                makePurchase(chosenItem, userAmount); //PURCHASE!
            }
        });
}

const makePurchase = (chosenItem, userAmount) => {
    connection.query(
        "update products set stock_quantity = stock_quantity - ? WHERE item_id = ?",
        [userAmount, chosenItem.item_id],
        function (err, data) {
            console.log(`successfully purchased ${userAmount} of ${chosenItem.product_name}`);
            console.log('Thanks for making a purchase!');
        })
};

