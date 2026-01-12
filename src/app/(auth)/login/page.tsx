"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
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
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Builder AI</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            AI-powered tools built for home builders
          </h1>
          <p className="text-lg text-blue-100">
            Manage your communities, engage buyers with AI chatbots, generate marketing content, and grow your business.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <FeatureItem text="Website AI Chatbot" />
            <FeatureItem text="Marketing Writer" />
            <FeatureItem text="Sales Training" />
            <FeatureItem text="Competitor Intel" />
          </div>
        </div>

        <p className="text-sm text-blue-200">
          Trusted by home builders across the country
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Builder AI</span>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
              <CardDescription className="text-gray-500">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700">
                    Get started
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <p className="mt-6 text-center text-xs text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-white/90">
      <div className="h-1.5 w-1.5 rounded-full bg-blue-300" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
