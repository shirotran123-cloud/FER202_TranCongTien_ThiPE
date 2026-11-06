"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [authError, setAuthError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (val: string) => {
    if (!val.trim()) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (val: string) => {
    if (!val) return "Password is required";
    if (val.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const validateConfirmPassword = (val: string, passVal: string) => {
    if (!val) return "Confirm password is required";
    if (val !== passVal) return "Passwords do not match";
    return "";
  };

  const emailError = isSubmitted ? validateEmail(email) : "";
  const passwordError = isSubmitted ? validatePassword(password) : "";
  const confirmPasswordError = isSubmitted ? validateConfirmPassword(confirmPassword, password) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setAuthError("");
    setSuccessMessage("");

    const errEmail = validateEmail(email);
    const errPassword = validatePassword(password);
    const errConfirm = validateConfirmPassword(confirmPassword, password);

    if (errEmail || errPassword || errConfirm) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setAuthError(error.message);
      } else if (data?.user) {
        setSuccessMessage("Registration successful");
        // Clear inputs after successful registration
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setIsSubmitted(false);
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-65px)]">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Register for ShelfLife</CardTitle>
          <CardDescription>
            Create an account to start managing your personal bookshelf.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form data-testid="register-form" noValidate onSubmit={handleSubmit} className="space-y-4">
            {authError && (
              <div
                data-testid="error-auth"
                className="p-3 text-sm rounded bg-destructive/10 text-destructive border border-destructive/20 font-medium"
              >
                {authError}
              </div>
            )}

            {successMessage && (
              <div
                data-testid="form-success"
                className="p-3 text-sm rounded bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 font-medium"
              >
                {successMessage}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="register-email">Email</Label>
              <Input
                id="register-email"
                data-testid="register-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setAuthError("");
                }}
                placeholder="name@example.com"
              />
              {emailError && (
                <p data-testid="error-email" className="text-xs text-destructive font-medium">
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-password">Password</Label>
              <Input
                id="register-password"
                data-testid="register-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError("");
                }}
                placeholder="••••••••"
              />
              {passwordError && (
                <p data-testid="error-password" className="text-xs text-destructive font-medium">
                  {passwordError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">Confirm Password</Label>
              <Input
                id="register-confirm-password"
                data-testid="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setAuthError("");
                }}
                placeholder="••••••••"
              />
              {confirmPasswordError && (
                <p data-testid="error-confirm-password" className="text-xs text-destructive font-medium">
                  {confirmPasswordError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-testid="register-submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Already have an account?&nbsp;
          <Link href="/login" className="text-primary hover:underline font-medium">
            Login here
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
