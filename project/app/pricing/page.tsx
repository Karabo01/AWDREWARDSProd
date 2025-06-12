'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Basic",
      description: "Perfect for small businesses starting their rewards program",
      price: "R250",
      period: "per month",
      features: [
        "Up to 10 employees",
        "Customer rewards tracking",
        "Basic analytics",
        "Email support",
        "Standard reports",
      ],
      button: {
        text: "Get Started",
        variant: "outline" as const,
      },
    },
    {
      name: "Premium",
      description: "Best for growing businesses with more rewards needs",
      price: "R450",
      period: "per month",
      features: [
        "Up to 35 employees",
        "Advanced analytics",
        "Priority support",
        "Custom rewards",
        "Detailed reports",
        "API access",
        "Email + Phone support",
      ],
      button: {
        text: "Get Premium",
        variant: "default" as const,
      },
      featured: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-600">
          Choose the plan that&apos;s right for your business
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative ${
              plan.featured
                ? "border-2 border-blue-600 shadow-lg"
                : "border border-gray-200"
            }`}
          >
            {plan.featured && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-600 ml-2">{plan.period}</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant={plan.button.variant}
                className={`w-full ${
                  plan.featured ? "bg-blue-600 hover:bg-blue-700" : ""
                }`}
                asChild
              >
                <Link href="/auth/register">{plan.button.text}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Need a custom plan?</h2>
        <p className="text-gray-600 mb-6">
          Contact us for a custom solution that&apos;s tailored to your business needs
        </p>
        <Button variant="outline" asChild>
          <Link href="/contact">Contact Sales</Link>
        </Button>
      </div>
    </div>
  );
}