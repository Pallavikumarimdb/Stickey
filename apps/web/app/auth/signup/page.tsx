"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signIn } from "next-auth/react";
import { SignUp } from "server/signup"
import { toast } from "sonner"

export default function StudentRegisterPage() {
   const router = useRouter();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log(name, email, password)

    try {
      const values = { name, email, password };
      const res = await SignUp(values);
      console.log(res)
      if (!res.success) {
        setIsLoading(false)
        console.error("Server-side Signup Error:", res.error)
        setError(res.error || "Registration failed. Please try again.")
        return
      }
      const signInResult = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error(signInResult.error);
        return;
      }
      toast.success("Account created successfully")
      router.push("/");
      setIsLoading(false);
    } catch (err) {
      console.error("Client-side Signup Error:", err)
      toast.error("Registration failed. Please try again.")
      setIsLoading(false);
    }
  };


  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Registration</CardTitle>
          <CardDescription>

          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">

              <div className="space-y-2">
                <label htmlFor="name">Name</label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your name"
                  type="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required />
              </div>
              <div className="space-y-2">
                <label htmlFor="firstName">Email</label>
                <Input id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName">Password</label>
                <Input id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading ? true : false}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>

      </Card>
    </div>
  )
}