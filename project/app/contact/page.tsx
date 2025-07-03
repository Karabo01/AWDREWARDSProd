'use client';

import { useRef } from 'react';
import emailjs from '@emailjs/browser';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ContactPage() {
  const form = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.current) return;

    // Always send to sales@awdrewards.co.za
    const formData = new FormData(form.current);
    formData.set('to_email', 'sales@awdrewards.co.za');

    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        Object.fromEntries(formData.entries()),
        {
          publicKey: process.env.NEXT_PUBLIC_EMAILJS_USER_ID!,
        }
      )
      .then(
        () => {
          toast.success('Message sent successfully!');
          form.current?.reset();
        },
        (error) => {
          toast.error('Failed to send message');
          console.error('EmailJS error:', error.text);
        }
      );
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/27730915386', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600">
              Get in touch with our team for any inquiries or support
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Reach out through any of these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href="mailto:sales@awdrewards.co.za" 
                      className="text-blue-600 hover:underline"
                    >
                      sales@awdrewards.co.za
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <a 
                      href="tel:+27827955760" 
                      className="text-blue-600 hover:underline"
                    >
                      +27 82 795 5760
                    </a>
                  </div>
                </div>

                <div>
                  <Button
                    onClick={openWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat on WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  We&apos;ll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form ref={form} onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="user_name" placeholder="Your name" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="user_email"
                      type="email" 
                      placeholder="your@email.com" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      name="message"
                      placeholder="How can we help?" 
                      rows={4} 
                      required 
                    />
                  </div>

                  <input type="hidden" name="to_email" value="sales@awdrewards.co.za" />

                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-gray-600">
            <p>
              Business Hours: Monday - Friday, 9:00 AM - 5:00 PM SAST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
