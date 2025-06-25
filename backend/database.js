const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "db.sqlite";

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      console.error(err.message);
      throw err;
    } else {
        console.log('Connected to the SQLite database.');
        const createCategoryTable = `
            CREATE TABLE IF NOT EXISTS Category (
                category_id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_name VARCHAR(255) NOT NULL UNIQUE,
                description TEXT
            );
        `;
        const createProductsTable = `
            CREATE TABLE IF NOT EXISTS Products (
                product_id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_name VARCHAR(255) NOT NULL,
                category_id INTEGER,
                price DECIMAL(10, 2) NOT NULL,
                stock INTEGER NOT NULL,
                FOREIGN KEY (category_id) REFERENCES Category(category_id)
            );
        `;
        
        db.run(createCategoryTable, (err) => {
            if (err) {
                console.log("Error creating Category table", err)
            }
        });
        
        db.run(createProductsTable, (err) => {
            if (err) {
                console.log("Error creating Products table", err)
            }
        });
    }
});

module.exports = db; 