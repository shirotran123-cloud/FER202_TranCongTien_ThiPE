import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen, TrendingUp, Search } from "lucide-react";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center space-y-4 mb-12">
        <h1 data-testid="home-title" className="text-4xl md:text-5xl font-extrabold tracking-tight">
          ShelfLife
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A small web app where each person keeps a list of the books they want to read, are reading or have finished, and sees how much they have on their shelf.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <CardTitle>Add books</CardTitle>
            <CardDescription>
              Keep track of titles, authors, and page numbers of all books you own or plan to read.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Add books with status To Read, Reading, or Finished in seconds.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <CardTitle>Track your progress</CardTitle>
            <CardDescription>
              Advance your reading status step by step from To Read to Reading and Finished.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Monitor your total pages read and breakdown of statuses on your personal shelf.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Search className="w-5 h-5" />
            </div>
            <CardTitle>Search your shelf</CardTitle>
            <CardDescription>
              Easily filter by reading status and instantly search by book title or author.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fast, real-time filtering so you always find the right book at the right time.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
