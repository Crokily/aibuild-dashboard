"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  // Password strength validation
  const isPasswordValid = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Client-side validation
    if (!isPasswordValid) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!doPasswordsMatch) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(data.error || "Registration failed, please try again later");
      }
    } catch (error) {
      setError("Network error, please try again later");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 p-4">
        <div className="w-full max-w-md space-y-8">
          <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm text-center">
            <CardContent className="space-y-6 pt-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-green-600">Registration Successful!</h2>
                <p className="text-muted-foreground">
                  Your account has been created successfully. You will be redirected to the login page in 3 seconds.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/login">Login Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 p-4">
      <div className="w-full max-w-md space-y-8">

        <Card className="border-0 shadow-2xl bg-card backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4 border-b-1">
            <CardTitle className="text-2xl font-semibold">Register Account</CardTitle>
            <CardDescription className="text-base">
              Fill in the information below to create your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Name <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="h-11 text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-red-500">*</span>
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
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
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
                {password && (
                  <div className="text-xs">
                    <span className={isPasswordValid ? "text-green-600" : "text-red-500"}>
                      {isPasswordValid ? "✓" : "✗"} Password must be at least 6 characters
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 text-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="text-xs">
                    <span className={doPasswordsMatch ? "text-green-600" : "text-red-500"}>
                      {doPasswordsMatch ? "✓" : "✗"} Passwords match
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 font-semibold text-base"
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Account
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
                  <span className="bg-card/50 px-2 text-muted-foreground">OR</span>
                </div>
              </div>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account?</span>
                <Link
                  href="/login"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors ml-1"
                >
                  Login now
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          <p>By registering, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
