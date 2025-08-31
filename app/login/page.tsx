"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Validate callback URL to prevent open redirect attacks
  const validateCallbackUrl = (url: string | null): string => {
    if (!url) return "/dashboard";

    // Only allow relative paths (starting with /) to prevent open redirect attacks
    if (url.startsWith("/")) {
      // Additional validation: ensure it's a valid relative path
      try {
        new URL(url, window.location.origin);
        return url;
      } catch {
        // Invalid relative URL format
      }
    }

    // Default fallback for any external or invalid URL
    return "/dashboard";
  };

  const callbackUrl = validateCallbackUrl(searchParams.get("callbackUrl"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password, please try again");
      } else if (result?.ok) {
        // Login successful, redirect to callback URL
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError("Login failed, please try again later");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 p-4">
      <div className="w-full max-w-md space-y-8">
        <Card className="border-0 shadow-2xl bg-card backdrop-blur-sm ">
          <CardHeader className="space-y-1 pb-4 border-b-1">
            <CardTitle className="text-2xl font-semibold">Login to Account</CardTitle>
            <CardDescription className="text-base">
              Enter your email and password to access the dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 text-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 font-semibold text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                  </>
                )}
              </Button>
            </form>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">OR</span>
                </div>
              </div>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don&apos;t have an account?</span>
                <Link
                  href="/register"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors ml-1 cursor-pointer"
                >
                  Register now
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <p>By logging in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
