"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp, BookStatus } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BooksPage() {
  const router = useRouter();
  const { user, loading, books, addBook, advanceStatus, deleteBook } = useApp();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Form states
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [pages, setPages] = useState("");
  const [status, setStatus] = useState<string>("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookSuccess, setBookSuccess] = useState("");
  const [bookError, setBookError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Validation functions
  const validateTitle = (val: string) => {
    if (!val.trim()) return "Title is required";
    if (val.length > 80) return "Title must be at most 80 characters";
    return "";
  };

  const validateAuthor = (val: string) => {
    if (!val.trim()) return "Author is required";
    if (val.length > 60) return "Author must be at most 60 characters";
    return "";
  };

  const validatePages = (val: string) => {
    if (!val.trim()) return "Pages is required";
    // Check whole number from 1 to 5000
    if (!/^\d+$/.test(val.trim())) {
      return "Pages must be a whole number between 1 and 5000";
    }
    const num = Number(val.trim());
    if (num < 1 || num > 5000) {
      return "Pages must be a whole number between 1 and 5000";
    }
    return "";
  };

  const validateStatus = (val: string) => {
    if (!val) return "Please choose a status";
    if (val !== "To Read" && val !== "Reading" && val !== "Finished") {
      return "Please choose a status";
    }
    return "";
  };

  const errorTitle = isSubmitted ? validateTitle(title) : "";
  const errorAuthor = isSubmitted ? validateAuthor(author) : "";
  const errorPages = isSubmitted ? validatePages(pages) : "";
  const errorStatus = isSubmitted ? validateStatus(status) : "";

  // Handle Add Book
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setBookSuccess("");
    setBookError("");

    const errTitle = validateTitle(title);
    const errAuthor = validateAuthor(author);
    const errPages = validatePages(pages);
    const errStatus = validateStatus(status);

    if (errTitle || errAuthor || errPages || errStatus) {
      return;
    }

    setIsAdding(true);
    const res = await addBook({
      title: title.trim(),
      author: author.trim(),
      pages: parseInt(pages.trim(), 10),
      status: status as BookStatus,
    });

    setIsAdding(false);

    if (res.success) {
      setBookSuccess("Book added");
      setTitle("");
      setAuthor("");
      setPages("");
      setStatus("");
      setIsSubmitted(false);
    } else {
      setBookError(res.error || "Failed to add book");
    }
  };

  // Filtered books
  const filteredBooks = useMemo(() => {
    const cleanSearch = searchQuery.trim().toLowerCase();
    return books.filter((book) => {
      // Status filter
      if (statusFilter && book.status !== statusFilter) {
        return false;
      }
      // Search filter: title or author contains query (not case-sensitive)
      if (cleanSearch) {
        const titleMatch = book.title.toLowerCase().includes(cleanSearch);
        const authorMatch = book.author.toLowerCase().includes(cleanSearch);
        if (!titleMatch && !authorMatch) {
          return false;
        }
      }
      return true;
    });
  }, [books, statusFilter, searchQuery]);

  // Clear filters
  const handleClearFilters = () => {
    setStatusFilter("");
    setSearchQuery("");
  };

  // Summary calculations
  const totalBookCount = filteredBooks.length;
  const totalPagesCount = filteredBooks.reduce((sum, b) => sum + (b.pages || 0), 0);

  // Status breakdown calculation
  // Breakdown with one row per status that appears, most books first
  // Equal counts: To Read, then Reading, then Finished
  const breakdownRows = useMemo(() => {
    const counts: Record<BookStatus, number> = {
      "To Read": 0,
      Reading: 0,
      Finished: 0,
    };

    filteredBooks.forEach((book) => {
      if (counts[book.status] !== undefined) {
        counts[book.status] += 1;
      }
    });

    const priorityOrder: Record<BookStatus, number> = {
      "To Read": 1,
      Reading: 2,
      Finished: 3,
    };

    const statuses: BookStatus[] = ["To Read", "Reading", "Finished"];
    const activeStatuses = statuses.filter((s) => counts[s] > 0);

    activeStatuses.sort((a, b) => {
      if (counts[b] !== counts[a]) {
        return counts[b] - counts[a]; // most books first
      }
      return priorityOrder[a] - priorityOrder[b]; // tie-break: To Read -> Reading -> Finished
    });

    return activeStatuses.map((s) => ({
      name: s,
      count: counts[s],
    }));
  }, [filteredBooks]);

  // Loading or unauthenticated
  if (loading || !user) {
    return null;
  }

  return (
    <div data-testid="books-page" className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Add Book Form + Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Add Book Form Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Add a Book</CardTitle>
            </CardHeader>
            <CardContent>
              <form data-testid="book-form" noValidate onSubmit={handleAddBook} className="space-y-4">
                {bookError && (
                  <div
                    data-testid="error-book"
                    className="p-3 text-sm rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium"
                  >
                    {bookError}
                  </div>
                )}

                {bookSuccess && (
                  <div
                    data-testid="book-success"
                    className="p-3 text-sm rounded bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 font-medium"
                  >
                    {bookSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="input-title">Title</Label>
                  <Input
                    id="input-title"
                    data-testid="input-title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setBookError("");
                    }}
                    placeholder="e.g. The Great Gatsby"
                  />
                  {errorTitle && (
                    <p data-testid="error-title" className="text-xs text-destructive font-medium">
                      {errorTitle}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="input-author">Author</Label>
                  <Input
                    id="input-author"
                    data-testid="input-author"
                    value={author}
                    onChange={(e) => {
                      setAuthor(e.target.value);
                      setBookError("");
                    }}
                    placeholder="e.g. F. Scott Fitzgerald"
                  />
                  {errorAuthor && (
                    <p data-testid="error-author" className="text-xs text-destructive font-medium">
                      {errorAuthor}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="input-pages">Number of Pages</Label>
                  <Input
                    id="input-pages"
                    data-testid="input-pages"
                    type="number"
                    value={pages}
                    onChange={(e) => {
                      setPages(e.target.value);
                      setBookError("");
                    }}
                    placeholder="e.g. 218"
                  />
                  {errorPages && (
                    <p data-testid="error-pages" className="text-xs text-destructive font-medium">
                      {errorPages}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="select-status">Status</Label>
                  <select
                    id="select-status"
                    data-testid="select-status"
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setBookError("");
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Choose status</option>
                    <option value="To Read">To Read</option>
                    <option value="Reading">Reading</option>
                    <option value="Finished">Finished</option>
                  </select>
                  {errorStatus && (
                    <p data-testid="error-status" className="text-xs text-destructive font-medium">
                      {errorStatus}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  data-testid="btn-add-book"
                  className="w-full"
                  disabled={isAdding}
                >
                  {isAdding ? "Adding..." : "Add Book"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Shelf Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Total Books Shown:</span>
                <span data-testid="book-count" className="font-bold text-lg">
                  {totalBookCount}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm text-muted-foreground">Total Pages:</span>
                <span data-testid="total-pages" className="font-bold text-lg">
                  {totalPagesCount}
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-semibold">Status Breakdown:</span>
                <div data-testid="status-breakdown" className="space-y-1.5 pt-1">
                  {breakdownRows.map((row) => (
                    <div
                      key={row.name}
                      data-testid="breakdown-row"
                      className="flex justify-between items-center text-sm p-2 bg-slate-50 dark:bg-slate-900 rounded"
                    >
                      <span data-testid="breakdown-name" className="font-medium">
                        {row.name}
                      </span>
                      <span data-testid="breakdown-count" className="font-bold">
                        {row.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Filters + Book List */}
        <div className="lg:col-span-7 space-y-6">
          {/* Filter & Search Bar */}
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    data-testid="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by title or author..."
                  />
                </div>
                <div className="w-full sm:w-44">
                  <select
                    data-testid="filter-status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">All</option>
                    <option value="To Read">To Read</option>
                    <option value="Reading">Reading</option>
                    <option value="Finished">Finished</option>
                  </select>
                </div>
                <Button
                  data-testid="btn-clear-filters"
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Book List or Empty State */}
          {filteredBooks.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="py-12 text-center">
                <p data-testid="books-empty" className="text-muted-foreground text-lg font-medium">
                  No books found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div data-testid="book-list" className="space-y-4">
              {filteredBooks.map((book) => (
                <Card key={book.id} data-testid="book-item" className="shadow-sm">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <h3 data-testid="book-title" className="font-bold text-lg truncate">
                        {book.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        by <span data-testid="book-author" className="font-medium text-foreground">{book.author}</span>
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span data-testid="book-pages" className="text-xs font-medium text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {book.pages} pages
                        </span>
                        <Badge
                          data-testid="book-status"
                          variant={
                            book.status === "Finished"
                              ? "default"
                              : book.status === "Reading"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {book.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* Advance Status button: only rendered if NOT Finished */}
                      {book.status !== "Finished" && (
                        <Button
                          data-testid="btn-advance-status"
                          size="sm"
                          variant="outline"
                          onClick={() => advanceStatus(book.id, book.status)}
                        >
                          {book.status === "To Read" ? "Start Reading" : "Finish Book"}
                        </Button>
                      )}

                      <Button
                        data-testid="btn-delete-book"
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteBook(book.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
