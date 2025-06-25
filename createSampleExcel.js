const xlsx = require('xlsx');
const fs = require('fs');

// Sample data for the 'Products' sheet
const productsData = [
    { product_name: 'New Laptop', category_name: 'Electronics', price: 1500, stock: 30 },
    { product_name: 'Wireless Mouse', category_name: 'Electronics', price: 45, stock: 200 },
    { product_name: 'Learning JavaScript', category_name: 'Books', price: 40, stock: 100 },
    { product_name: 'Hoodie', category_name: 'Clothing', price: 60, stock: 150 },
    { product_name: 'Invalid Category Product', category_name: 'Toys', price: 20, stock: 50 }, // This category doesn't exist
];

// Create a new workbook
const workbook = xlsx.utils.book_new();

// Create the 'Products' sheet
const productsSheet = xlsx.utils.json_to_sheet(productsData);

// Add the sheet to the workbook
xlsx.utils.book_append_sheet(workbook, productsSheet, 'Products');

// Define the output file path
const outputFilePath = 'sample.xlsx';

// Write the workbook to a file
xlsx.writeFile(workbook, outputFilePath);

console.log(`'${outputFilePath}' created successfully.`); 