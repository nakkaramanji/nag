-- Create Category Table
CREATE TABLE IF NOT EXISTS Category (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Create Products Table
CREATE TABLE IF NOT EXISTS Products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name VARCHAR(255) NOT NULL,
    category_id INTEGER,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Category(category_id)
);

-- Insert Sample Categories
INSERT INTO Category (category_name, description) VALUES ('Electronics', 'Devices and gadgets');
INSERT INTO Category (category_name, description) VALUES ('Books', 'Printed and digital books');
INSERT INTO Category (category_name, description) VALUES ('Clothing', 'Apparel and accessories');

-- Insert Sample Products
INSERT INTO Products (product_name, category_id, price, stock) VALUES ('Laptop', 1, 1200.00, 50);
INSERT INTO Products (product_name, category_id, price, stock) VALUES ('Smartphone', 1, 800.00, 150);
INSERT INTO Products (product_name, category_id, price, stock) VALUES ('The Great Gatsby', 2, 15.99, 200);
INSERT INTO Products (product_name, category_id, price, stock) VALUES ('T-Shirt', 3, 25.50, 500); 