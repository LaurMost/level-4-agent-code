"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface ContactFormData {
  name: string
  email: string
  message: string
}

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ContactFormData>();

  const onSubmit = (data: ContactFormData) => {
    console.log("Form Submitted:", data);
    alert("Message sent successfully!");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-4">
          <label htmlFor="name" className="block mb-1 font-medium">Name</label>
          <Input
            id="name"
            placeholder="Your Name"
            {...register("name", { required: "Name is required." })}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 font-medium">Email</label>
          <Input
            id="email"
            type="email"
            placeholder="Your Email"
            {...register("email", {
              required: "Email is required.",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Invalid email address."
              }
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="block mb-1 font-medium">Message</label>
          <Textarea
            id="message"
            placeholder="Your Message"
            {...register("message", { required: "Message is required." })}
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
          )}
        </div>

        <div className="mt-6">
          <Button type="submit">Send Message</Button>
        </div>
      </form>
    </div>
  );
}
