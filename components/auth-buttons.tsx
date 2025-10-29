"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AuthButtons() {
  const { isSignedIn, user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (isSignedIn && user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <User className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <UserButton afterSignOutUrl="/" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <Button variant="ghost" size="sm">
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Sign Up
        </Button>
      </SignUpButton>
    </div>
  );
}

// Simplified version for hero section
export function HeroAuthButtons() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <div className="h-12 w-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-12 w-32 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="text-base px-8 py-3">
          <Link href="/dashboard">
            <User className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <SignUpButton mode="modal">
        <Button size="lg" className="text-base px-8 py-3">
          <UserPlus className="mr-2 h-5 w-5" />
          Get Started
        </Button>
      </SignUpButton>
      <SignInButton mode="modal">
        <Button variant="outline" size="lg" className="text-base px-8 py-3">
          <LogIn className="mr-2 h-5 w-5" />
          Sign In
        </Button>
      </SignInButton>
    </div>
  );
}