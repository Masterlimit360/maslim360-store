'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 text-primary hover:underline mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Link>
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: January 15, 2024
            </p>
          </div>

          <Card>
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing and using MasLim360 Store ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Permission is granted to temporarily download one copy of the materials on MasLim360 Store for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display</li>
                  <li>attempt to reverse engineer any software contained on the website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Product Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We strive to provide accurate product information, descriptions, and images. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Product colors may appear slightly different on your screen due to monitor settings. We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Pricing and Payment</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All prices are subject to change without notice. We reserve the right to modify or discontinue any product or service at any time without prior notice.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Payment must be received before we ship your order. We accept various payment methods as displayed during checkout. By providing payment information, you represent and warrant that you are authorized to use the payment method.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Shipping and Delivery</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We will make every effort to ship your order within the timeframes specified. However, delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers or other factors beyond our control.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Risk of loss and title for products purchased pass to you upon delivery to the carrier. You are responsible for filing any claims with carriers for damaged or lost shipments.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Returns and Refunds</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We offer a 30-day return policy for most items. Items must be returned in their original condition with all tags and packaging intact. Some items are not eligible for return due to hygiene or safety reasons.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Refunds will be processed to the original payment method within 5-10 business days after we receive and inspect the returned item. Return shipping costs are the responsibility of the customer unless the item was defective or incorrect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Prohibited Uses</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You may not use our service:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                  <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                  <li>To submit false or misleading information</li>
                  <li>To upload or transmit viruses or any other type of malicious code</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  In no event shall MasLim360 Store, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be interpreted and governed by the laws of Ghana, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="font-medium">MasLim360 Store</p>
                  <p>Email: legal@maslim360.com</p>
                  <p>Phone: +233244222411</p>
                  <p>Address: 123 Store Street, Accra, Ghana</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

