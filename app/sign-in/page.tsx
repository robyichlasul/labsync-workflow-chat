"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function SignInPage() {
    const { theme } = useTheme();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Labsync Chat
                    </h1>
                    <p className="text-muted-foreground">
                        Platform komunikasi laboratorium
                    </p>
                </div>
                <SignIn
                    appearance={{
                        baseTheme: theme === "dark" ? dark : undefined,
                        elements: {
                            formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
                            footerActionLink: "text-primary hover:text-primary/90",
                        },
                    }}
                    redirectUrl="/dashboard"
                />
            </div>
        </div>
    );
}