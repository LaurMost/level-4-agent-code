"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

// Define Zod schema for the signup form
const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupFormData = z.infer<typeof signupSchema>

export default function SignupPage() {
  const { signUp, setActive } = useSignUp()
  const router = useRouter()
  const [signupError, setSignupError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  })

  const onSubmit = async (data: SignupFormData) => {
    setSignupError(null)
    try {
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password
      })

      if (result.status === "complete") {
        // Set the active session and redirect to dashboard
        setActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else {
        // If additional verification is required, redirect to a verification page
        router.push("/verify-email")
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      setSignupError(error.errors ? error.errors[0].message : "Signup failed. Please try again.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-6 bg-card rounded-md shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
            <Input id="confirmPassword" type="password" placeholder="Confirm Your Password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {signupError && <p className="text-red-500 text-sm">{signupError}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
      </div>
    </div>
  )
}
