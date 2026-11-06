"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export type BookStatus = "To Read" | "Reading" | "Finished";

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  pages: number;
  status: BookStatus;
  created_at: string;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  books: Book[];
  setBooks: React.Dispatch<React.SetStateAction<Book[]>>;
  fetchBooks: () => Promise<void>;
  addBook: (bookData: { title: string; author: string; pages: number; status: BookStatus }) => Promise<{ success: boolean; error?: string }>;
  advanceStatus: (id: string, currentStatus: BookStatus) => Promise<{ success: boolean; error?: string }>;
  deleteBook: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);

  const fetchBooksForUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching books:", error);
      } else {
        setBooks((data as Book[]) || []);
      }
    } catch (err) {
      console.error("Unexpected error fetching books:", err);
    }
  };

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          await fetchBooksForUser(currentUser.id);
        } else {
          setBooks([]);
        }
      } catch (e) {
        console.error("Error getting session:", e);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchBooksForUser(currentUser.id);
      } else {
        setBooks([]); // Clean memory on logout
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBooks([]);
  };

  const fetchBooks = async () => {
    if (user) {
      await fetchBooksForUser(user.id);
    }
  };

  const addBook = async (bookData: { title: string; author: string; pages: number; status: BookStatus }) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      const { data, error } = await supabase
        .from("books")
        .insert([
          {
            user_id: user.id,
            title: bookData.title.trim(),
            author: bookData.author.trim(),
            pages: bookData.pages,
            status: bookData.status,
          },
        ])
        .select();

      if (error) {
        return { success: false, error: error.message };
      }

      if (data && data.length > 0) {
        const newBook = data[0] as Book;
        // Most recently added first: add at the beginning
        setBooks((prev) => [newBook, ...prev]);
        return { success: true };
      }

      return { success: false, error: "Failed to add book" };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
    }
  };

  const advanceStatus = async (id: string, currentStatus: BookStatus) => {
    let nextStatus: BookStatus | null = null;
    if (currentStatus === "To Read") {
      nextStatus = "Reading";
    } else if (currentStatus === "Reading") {
      nextStatus = "Finished";
    }

    if (!nextStatus) return { success: false, error: "Already finished" };

    try {
      const { error } = await supabase
        .from("books")
        .update({ status: nextStatus })
        .eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update state immediately
      setBooks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: nextStatus as BookStatus } : b))
      );

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to update status" };
    }
  };

  const deleteBook = async (id: string) => {
    try {
      const { error } = await supabase.from("books").delete().eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Remove from state immediately
      setBooks((prev) => prev.filter((b) => b.id !== id));
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : "Failed to delete book" };
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        signOut,
        books,
        setBooks,
        fetchBooks,
        addBook,
        advanceStatus,
        deleteBook,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
