const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readBooks, writeBooks } = require("../utils/fileOperations");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /books - List all books with optional search and pagination
router.get("/", async (req, res) => {
  try {
    const { genre, page = 1, limit = 10, search } = req.query;
    let books = await readBooks();

    // Filter by genre if provided
    if (genre) {
      books = books.filter((book) =>
        book.genre.toLowerCase().includes(genre.toLowerCase())
      );
    }

    // Search functionality (search in title, author, or genre)
    if (search) {
      const searchTerm = search.toLowerCase();
      books = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm) ||
          book.genre.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const pageNum = Number.parseInt(page);
    const limitNum = Number.parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedBooks = books.slice(startIndex, endIndex);

    const totalBooks = books.length;
    const totalPages = Math.ceil(totalBooks / limitNum);

    res.status(200).json({
      books: paginatedBooks,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBooks,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({
      error: "Internal server error while fetching books",
    });
  }
});

// GET /books/search - Search books by genre
router.get("/search", async (req, res) => {
  try {
    const { genre } = req.query;

    if (!genre) {
      return res.status(400).json({
        error: "Genre parameter is required",
      });
    }

    const books = await readBooks();
    const filteredBooks = books.filter((book) =>
      book.genre.toLowerCase().includes(genre.toLowerCase())
    );

    res.status(200).json({
      books: filteredBooks,
      count: filteredBooks.length,
      searchTerm: genre,
    });
  } catch (error) {
    console.error("Error searching books:", error);
    res.status(500).json({
      error: "Internal server error while searching books",
    });
  }
});

// GET /books/:id - Get book by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const books = await readBooks();

    const book = books.find((b) => b.id === id);
    if (!book) {
      return res.status(404).json({
        error: "Book not found",
      });
    }

    res.status(200).json({ book });
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({
      error: "Internal server error while fetching book",
    });
  }
});

// POST /books - Add a new book
router.post("/", async (req, res) => {
  try {
    const { title, author, genre, publishedYear } = req.body;

    // Validation
    if (!title || !author || !genre || !publishedYear) {
      return res.status(400).json({
        error: "Title, author, genre, and publishedYear are required",
      });
    }

    if (
      typeof publishedYear !== "number" ||
      publishedYear < 0 ||
      publishedYear > new Date().getFullYear()
    ) {
      return res.status(400).json({
        error: "Published year must be a valid year",
      });
    }

    const books = await readBooks();

    const newBook = {
      id: uuidv4(),
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      publishedYear,
      userId: req.user.userId,
    };

    books.push(newBook);
    await writeBooks(books);

    res.status(201).json({
      message: "Book added successfully",
      book: newBook,
    });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({
      error: "Internal server error while adding book",
    });
  }
});

// PUT /books/:id - Update a book by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, genre, publishedYear } = req.body;

    const books = await readBooks();
    const bookIndex = books.findIndex((b) => b.id === id);

    if (bookIndex === -1) {
      return res.status(404).json({
        error: "Book not found",
      });
    }

    const book = books[bookIndex];

    // Check if user owns the book
    if (book.userId !== req.user.userId) {
      return res.status(403).json({
        error: "You can only update books that you added",
      });
    }

    // Validation
    if (
      publishedYear &&
      (typeof publishedYear !== "number" ||
        publishedYear < 0 ||
        publishedYear > new Date().getFullYear())
    ) {
      return res.status(400).json({
        error: "Published year must be a valid year",
      });
    }

    // Update book
    books[bookIndex] = {
      ...book,
      title: title ? title.trim() : book.title,
      author: author ? author.trim() : book.author,
      genre: genre ? genre.trim() : book.genre,
      publishedYear: publishedYear || book.publishedYear,
    };

    await writeBooks(books);

    res.status(200).json({
      message: "Book updated successfully",
      book: books[bookIndex],
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({
      error: "Internal server error while updating book",
    });
  }
});

// DELETE /books/:id - Delete a book by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const books = await readBooks();

    const bookIndex = books.findIndex((b) => b.id === id);
    if (bookIndex === -1) {
      return res.status(404).json({
        error: "Book not found",
      });
    }

    const book = books[bookIndex];

    // Check if user owns the book
    if (book.userId !== req.user.userId) {
      return res.status(403).json({
        error: "You can only delete books that you added",
      });
    }

    books.splice(bookIndex, 1);
    await writeBooks(books);

    res.status(200).json({
      message: "Book deleted successfully",
      deletedBook: book,
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({
      error: "Internal server error while deleting book",
    });
  }
});

module.exports = router;
