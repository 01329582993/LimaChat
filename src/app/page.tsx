import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl">
        ChatForm
      </h1>
      <p className="mt-6 text-xl text-muted-foreground max-w-2xl">
        The easiest way to create and collect responses via a chat-based interface.
        Powered by AI for a seamless respondent experience.
      </p>
      <div className="mt-10 flex gap-4">
        <a
          href="/dashboard"
          className="rounded-full bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
