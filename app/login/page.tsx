"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSignIn } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

// Define Zod schema for the login form
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { signIn } = useSignIn()
  const router = useRouter()
  const [signInError, setSignInError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    setSignInError(null)
    try {
      if (!signIn) {
        setSignInError("Sign in is not available")
        return
      }
      const result = await signIn.create({
        identifier: data.email,
        password: data.password
      })

      if (result.status === "complete") {
        router.push("/dashboard")
      } else {
        setSignInError("Sign in not complete. Please check your email for further instructions.")
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      setSignInError(error.errors ? error.errors[0].message : "Sign in failed. Please try again.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6 bg-card rounded-md shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input id="email" type="email" placeholder="Your Email" {...register("email")} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <Input id="password" type="password" placeholder="Your Password" {...register("password")} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          {signInError && <p className="text-red-500 text-sm">{signInError}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  )
}
