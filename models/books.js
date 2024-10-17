// Array of books with ISBN, title, and price
const books = [
  {
    isbn: "9781638087809",
    title: "Things We Hide from the Light",
    price: 11.66,
  },
  { isbn: "9781638089162", title: "Things We Left Behind", price: 10.08 },
  { isbn: "9781945631832", title: "Things We Never Got Over", price: 11.2 },
];

// Function to return the entire array of books
function getBooks() {
  return books;
}

// Function to find a book by its ISBN
function findBookByISBN(isbn) {
  return books.find((book) => book.isbn === isbn);
}
// export functions
module.exports = { getBooks, findBookByISBN };
