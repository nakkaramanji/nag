const express = require("express");
const cors = require("cors");
const db = require("./database.js");
const multer = require("multer");
const xlsx = require("xlsx");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Category Management
app.post("/api/categories", (req, res) => {
    const { category_name, description } = req.body;
    if (!category_name) {
        return res.status(400).json({ "error": "Missing category_name" });
    }
    const sql = 'INSERT INTO Category (category_name, description) VALUES (?,?)';
    const params = [category_name, description];
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { category_id: this.lastID, category_name, description },
        });
    });
});

app.get("/api/categories", (req, res) => {
    const sql = "select * from Category";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.delete("/api/categories/:id", (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM Category WHERE category_id = ?", [id], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: "Category deleted", changes: this.changes });
    });
});

// Product Management
app.get("/api/products", (req, res) => {
    const sql = `
        SELECT p.product_id, p.product_name, c.category_name, p.price, p.stock 
        FROM Products p
        JOIN Category c ON p.category_id = c.category_id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

app.put("/api/products/:id", (req, res) => {
    let { product_name, category_id, price, stock } = req.body;
    price = Number(price);
    stock = Number(stock);
    if (!product_name || !category_id || price === undefined || stock === undefined) {
        return res.status(400).json({ error: "All fields are required." });
    }
    if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: "Price must be greater than 0." });
    }
    if (isNaN(stock) || stock < 0) {
        return res.status(400).json({ error: "Stock must be 0 or greater." });
    }
    // Check if category exists
    db.get('SELECT * FROM Category WHERE category_id = ?', [category_id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(400).json({ error: "Category does not exist." });
        }
        const sql = `
            UPDATE Products set 
                product_name = ?, 
                category_id = ?, 
                price = ?, 
                stock = ? 
            WHERE product_id = ?
        `;
        const params = [product_name, category_id, price, stock, req.params.id];
        db.run(sql, params, function(err, result) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            res.json({ message: "success", changes: this.changes });
        });
    });
});

// Excel Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames.find(name => name.toLowerCase() === 'products');
        if (!sheetName) {
            return res.status(400).json({ error: 'Products sheet not found in the Excel file.' });
        }
        const worksheet = workbook.Sheets[sheetName];
        const products = xlsx.utils.sheet_to_json(worksheet);

        db.all("SELECT * FROM Category", [], (err, categories) => {
            if (err) {
                return res.status(500).json({ "error": err.message });
            }

            const categoryMap = categories.reduce((map, cat) => {
                map[cat.category_name.toLowerCase()] = cat.category_id;
                return map;
            }, {});

            const errors = [];
            const validProducts = [];

            products.forEach((product, index) => {
                const { product_name, category_name, price, stock } = product;
                const categoryId = categoryMap[category_name?.toLowerCase()];

                if (!product_name || !category_name || price === undefined || stock === undefined) {
                    errors.push(`Row ${index + 2}: Missing required fields.`);
                } else if (!categoryId) {
                    errors.push(`Row ${index + 2}: Category '${category_name}' does not exist.`);
                } else if (price <= 0) {
                    errors.push(`Row ${index + 2}: Price must be greater than 0.`);
                } else if (stock < 0) {
                    errors.push(`Row ${index + 2}: Stock must be 0 or greater.`);
                } else {
                    validProducts.push([product_name, categoryId, price, stock]);
                }
            });

            if (errors.length > 0) {
                return res.status(400).json({ error: "Validation failed", details: errors });
            }

            const sql = 'INSERT INTO Products (product_name, category_id, price, stock) VALUES (?, ?, ?, ?)';
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");
                const stmt = db.prepare(sql);
                validProducts.forEach(product => {
                    stmt.run(product, (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            return res.status(500).json({ error: "Failed to insert products", details: err.message });
                        }
                    });
                });
                stmt.finalize();
                db.run("COMMIT", (err) => {
                    if (err) {
                        return res.status(500).json({ error: "Failed to commit transaction", details: err.message });
                    }
                    res.json({ message: 'Products uploaded successfully!' });
                });
            });
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to process the file.' });
    } finally {
        const fs = require('fs');
        fs.unlinkSync(filePath); // Clean up uploaded file
    }
});


const HTTP_PORT = 8000;
app.listen(HTTP_PORT, () => {
    console.log(`Server running on port ${HTTP_PORT}`);
}); 