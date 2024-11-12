const express = require("express");
const bodyParser = require("body-parser");
const { engine } = require("express-handlebars");
const { getBooks, findBookByISBN } = require("./models/books");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Set up Handlebars view engine
app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Display all books on the home page
app.get("/", (req, res) => {
  const books = getBooks(); // Retrieve the books list from the model
  res.render("books", {
    books,
    authorName: "Author Name",
  });
});

// Middleware to extract parameters from the form
function extractParams(req, res, next) {
  const { isbn, copies } = req.body;
  req.isbn = isbn;
  req.copies = Number(copies);
  next();
}

// Middleware to validate the ISBN and number of copies
function validateParams(req, res, next) {
  const { isbn, copies } = req;
  if (isbn === "none") {
    return res.end("<h1>Must select a book.</h1>");
  }
  if (!copies || isNaN(copies) || copies < 1) {
    return res.end("<h1>Must purchase at least one copy!</h1>");
  }
  if (!Number.isInteger(copies)) {
    return res.end("<h1>Number of copies must be a whole number!</h1>");
  }
  next();
}

// Middleware to retrieve book details
function retrieveBook(req, res, next) {
  const book = findBookByISBN(req.isbn);
  if (!book) {
    return res.end("<h1>Book not found.</h1>");
  }
  req.book = book;
  next();
}

// Middleware to compute total cost with tax
function computeTotal(req, res, next) {
  const { book, copies } = req;
  req.total = book.price * copies * 1.0175;
  next();
}

// Send the receipt as the response
function sendReceipt(req, res) {
  const { book, copies, total } = req;
  res.render("receipt", {
    title: "Order Receipt",
    book,
    copies,
    total: total.toFixed(2),
    authorName: "Author Name",
  });
}

// Route for the order form page
app.get("/order", (req, res) => {
  const books = getBooks(); // Pass books for the dropdown
  res.render("order", {
    title: "Order Book",
    books,
    authorName: "Author Name",
  });
});

// Route to handle form submission and display receipt
app.post(
  "/order",
  extractParams,
  validateParams,
  retrieveBook,
  computeTotal,
  sendReceipt
);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).end("File Not Found");
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).end("Server Error");
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
