"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, ListFilter, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-x-12">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 text-xl font-black">
                                C
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-foreground">
                                ChatForm
                            </span>
                        </Link>

                        <div className="hidden lg:flex lg:gap-x-1">
                            <Link
                                href="/dashboard"
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${pathname === "/dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link
                                href="/my-forms"
                                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${pathname === "/my-forms" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                            >
                                <ListFilter className="h-4 w-4" />
                                My Forms
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-x-4">
                        <Button asChild size="sm" className="hidden rounded-full font-bold sm:flex shadow-md shadow-primary/20">
                            <Link href="/forms/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Form
                            </Link>
                        </Button>
                        <div className="h-8 w-[1px] bg-muted mx-2 hidden sm:block" />
                        <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9 border-2 border-white shadow-sm" } }} />
                    </div>
                </div>
            </div>
        </nav>
    );
}
