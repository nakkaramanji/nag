# E-commerce Category and Product Management Web App

This is a simple web application for managing product categories and products, including functionality to upload products from an Excel file.

## Project Structure

- `backend/`: Contains the Node.js/Express server, database logic, and API endpoints.
- `frontend/`: Contains the HTML, CSS, and JavaScript for the user interface.
- `schema.sql`: SQL script to create the database schema and insert sample data.
- `sample.xlsx`: An example Excel file for uploading products.
- `createSampleExcel.js`: A script to generate the `sample.xlsx` file.

## Setup and Installation

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the server:**
    ```bash
    node server.js
    ```
    The server will start on `http://localhost:8000`. It will automatically create and connect to a `db.sqlite` database file.

### Frontend Setup

1.  **Open the `index.html` file in your browser:**
    Navigate to the `frontend` directory and open the `index.html` file directly in your web browser (e.g., by double-clicking it).

## How to Use the Application

1.  **Manage Categories:**
    - Use the "Category Management" form to add new categories.
    - The table below the form will display all existing categories.

2.  **Upload Products via Excel:**
    - Use the "Upload Products from Excel" form to upload an `.xlsx` or `.xls` file.
    - The Excel file must have a sheet named "Products" with the following columns: `product_name`, `category_name`, `price`, and `stock`.
    - Ensure that the categories listed in the `category_name` column already exist in the database.

3.  **View and Edit Products:**
    - The "Products" table displays all products from the database.
    - Click the "Edit" button on any product row to open a modal where you can update the product's details.

## Excel File Format

- The Excel file must contain a sheet named `Products`.
- The `Products` sheet must have the following columns in any order:
    - `product_name`: The name of the product (e.g., "Laptop").
    - `category_name`: The name of an existing category (e.g., "Electronics").
    - `price`: The price of the product (e.g., 1200.00).
    - `stock`: The available stock quantity (e.g., 50).

You can generate a `sample.xlsx` file by running the following command from the project root:

```bash
node createSampleExcel.js
```

This will create a `sample.xlsx` file in the root directory that you can use for testing the upload functionality. 