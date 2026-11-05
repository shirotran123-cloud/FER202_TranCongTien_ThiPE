import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">FER202 Environment Ready</CardTitle>
          <CardDescription>
            Next.js App Router, Tailwind CSS, ShadCN UI & Supabase are pre-configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            You can start building your project pages, components, and contexts.
          </p>
          <Button className="w-full">Get Started</Button>
        </CardContent>
      </Card>
    </main>
  );
}
