const express = require("express");
const bodyParser = require("body-parser");
const { findBookByISBN } = require("./models/books");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Extract ISBN and number of copies from the request
function extractParams(request, response, next) {
  const { isbn, copies } = request.body;
  request.isbn = isbn;
  request.copies = copies;
  next();
}

//Validate the ISBN and number of copies
function validateParams(request, response, next) {
  const { isbn, copies } = request;

  if (isbn === "none") {
    return response.end("<h1>Must select a book.</h1>");
  }
  if (!copies || isNaN(copies) || copies < 1) {
    return response.end("<h1>Must purchase at least one copy!</h1>");
  }

  next();
}

// Retrieve book information using the ISBN
function retrieveBook(request, response, next) {
  const book = findBookByISBN(request.isbn);
  if (!book) {
    return response.end("<h1>Book not found.</h1>");
  }
  // Attach book details to the request object for the next middleware
  request.book = book;
  next();
}

// Compute the total cost of the order (1.75% tax included)
function computeTotal(request, response, next) {
  const { book, copies } = request;
  const total = book.price * copies * 1.0175;
  // Attach the total cost to the request object for the next middleware
  request.total = total;
  next();
}

//Send the receipt
function sendReceipt(request, response) {
  const { book, copies, total } = request;

  // HTML receipt string
  const receipt = `
    <h1>Order Receipt</h1>
    <p>Book Title: ${book.title}</p>
    <p>Price per Copy: $${book.price}</p>
    <p>Number of Copies: ${copies}</p>
    <p>Total Cost (including tax): $${total.toFixed(2)}</p>
    <p>Thank you for your purchase!</p>
    <p><i>Copyright <b>Mamatha Bugata</i></b></p>
  `;
  //send the receipt as the final output
  response.end(receipt);
}

// Route to handle form submission
app.post(
  "/order",
  extractParams,
  validateParams,
  retrieveBook,
  computeTotal,
  sendReceipt
);

// Route to display the form
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/form.html");
});

// Error handling for unknown pages
app.use((request, response) => {
  response.status(404).end("File Not Found");
});
// handle any other server error
app.use((err, request, response, next) => {
  response.status(500).end("Server Error");
});
// error for any other invalid route

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
