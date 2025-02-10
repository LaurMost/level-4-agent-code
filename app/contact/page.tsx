"use server"

import ContactForm from "@/components/ui/contact-form"

export default async function ContactPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
      <ContactForm />
    </div>
  )
}
