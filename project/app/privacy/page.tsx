'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
                        <p className="text-center text-gray-600 mt-2">Last Updated: December 31, 2025</p>
                    </CardHeader>
                    <CardContent className="prose prose-gray max-w-none space-y-6">
                        <section>
                            <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Welcome to AWD Rewards (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy 
                                and ensuring the security of your personal information. This Privacy Policy explains how we 
                                collect, use, disclose, and safeguard your information when you use our customer loyalty and 
                                rewards management platform.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                By using AWD Rewards, you agree to the collection and use of information in accordance with 
                                this policy. If you do not agree with our policies and practices, please do not use our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
                            
                            <h3 className="text-xl font-semibold mb-2 mt-4">2.1 Personal Information</h3>
                            <p className="text-gray-700 leading-relaxed mb-2">
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Account Information:</strong> Name, email address, phone number, business name, and password</li>
                                <li><strong>Customer Data:</strong> Information about your customers including names, contact details, purchase history, and loyalty points</li>
                                <li><strong>Business Information:</strong> Company details, business type, subscription plan, and payment information</li>
                                <li><strong>Profile Information:</strong> Any additional information you choose to provide in your profile</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Automatically Collected Information</h3>
                            <p className="text-gray-700 leading-relaxed mb-2">
                                When you access our services, we automatically collect:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Usage Data:</strong> Information about how you use our platform, including page visits, features used, and time spent</li>
                                <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                                <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to track activity and store preferences</li>
                                <li><strong>Transaction Data:</strong> Records of rewards issued, redeemed, and customer visit history</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-2 mt-4">2.3 Information from Third Parties</h3>
                            <p className="text-gray-700 leading-relaxed">
                                We may receive information about you from third-party services you connect to your AWD Rewards 
                                account, such as payment processors or authentication providers.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
                            <p className="text-gray-700 leading-relaxed mb-2">
                                We use the information we collect for various purposes, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Providing Services:</strong> To deliver, maintain, and improve our loyalty and rewards platform</li>
                                <li><strong>Account Management:</strong> To create and manage your account, authenticate users, and provide customer support</li>
                                <li><strong>Processing Transactions:</strong> To process payments, issue rewards, and track customer loyalty points</li>
                                <li><strong>Analytics and Improvement:</strong> To analyze usage patterns, optimize features, and develop new services</li>
                                <li><strong>Communications:</strong> To send service updates, promotional materials, and respond to inquiries</li>
                                <li><strong>Security:</strong> To detect, prevent, and address fraud, security issues, and technical problems</li>
                                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                                <li><strong>Personalization:</strong> To customize your experience and provide relevant content and features</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">4. Data Sharing and Disclosure</h2>
                            <p className="text-gray-700 leading-relaxed mb-2">
                                We do not sell your personal information. We may share your information in the following circumstances:
                            </p>
                            
                            <h3 className="text-xl font-semibold mb-2 mt-4">4.1 With Your Consent</h3>
                            <p className="text-gray-700 leading-relaxed">
                                We may share information when you explicitly authorize us to do so.
                            </p>

                            <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Service Providers</h3>
                            <p className="text-gray-700 leading-relaxed">
                                We may share information with third-party vendors who perform services on our behalf, such as:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Cloud hosting and storage providers</li>
                                <li>Payment processing services</li>
                                <li>Email and communication services</li>
                                <li>Analytics and monitoring tools</li>
                            </ul>

                            <h3 className="text-xl font-semibold mb-2 mt-4">4.3 Business Transfers</h3>
                            <p className="text-gray-700 leading-relaxed">
                                If we are involved in a merger, acquisition, or sale of assets, your information may be 
                                transferred as part of that transaction.
                            </p>

                            <h3 className="text-xl font-semibold mb-2 mt-4">4.4 Legal Requirements</h3>
                            <p className="text-gray-700 leading-relaxed">
                                We may disclose information when required by law, to respond to legal process, protect our 
                                rights, or ensure the safety of our users.
                            </p>

                            <h3 className="text-xl font-semibold mb-2 mt-4">4.5 Multi-Tenant Architecture</h3>
                            <p className="text-gray-700 leading-relaxed">
                                AWD Rewards operates on a multi-tenant architecture. Each business&apos;s data is logically separated 
                                and secured. We do not share customer data between different business accounts.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">5. Data Security</h2>
                            <p className="text-gray-700 leading-relaxed mb-2">
                                We implement robust security measures to protect your information:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols</li>
                                <li><strong>Access Controls:</strong> We implement strict access controls and authentication mechanisms</li>
                                <li><strong>Password Protection:</strong> Passwords are hashed and salted using bcrypt</li>
                                <li><strong>Regular Audits:</strong> We conduct regular security audits and vulnerability assessments</li>
                                <li><strong>Data Backup:</strong> Regular backups ensure data recovery in case of system failures</li>
                                <li><strong>Employee Training:</strong> Our team is trained on data protection best practices</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-3">
                                While we strive to protect your information, no method of transmission over the internet or 
                                electronic storage is 100% secure. We cannot guarantee absolute security.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">6. Data Retention</h2>
                            <p className="text-gray-700 leading-relaxed">
                                We retain your information for as long as necessary to provide our services, comply with legal 
                                obligations, resolve disputes, and enforce our agreements. When you delete your account, we will 
                                delete or anonymize your personal information within a reasonable timeframe, unless we are 
                                required to retain it for legal or regulatory purposes.
                            </p>
                            <p className="text-gray-700 leading-relaxed mt-3">
                                Transaction records and audit logs may be retained for longer periods as required by law or 
                                legitimate business purposes.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">7. Your Rights and Choices</h2>
                            <p className="text-gray-700 leading-relaxed mb-2">
                                Depending on your location, you may have certain rights regarding your personal information:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                                <li><strong>Objection:</strong> Object to certain processing activities</li>
                                <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-3">
                                To exercise these rights, please contact us using the information provided in the Contact section.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">8. Cookies and Tracking Technologies</h2>
                            <p className="text-gray-700 leading-relaxed mb-2">
                                We use cookies and similar tracking technologies to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>Remember your preferences and settings</li>
                                <li>Maintain your login session</li>
                                <li>Analyze usage patterns and improve our services</li>
                                <li>Provide personalized content and features</li>
                            </ul>
                            <p className="text-gray-700 leading-relaxed mt-3">
                                You can control cookies through your browser settings. However, disabling cookies may affect 
                                the functionality of our services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">9. Children&apos;s Privacy</h2>
                            <p className="text-gray-700 leading-relaxed">
                                AWD Rewards is not intended for use by children under the age of 13 (or the minimum age in 
                                your jurisdiction). We do not knowingly collect personal information from children. If you 
                                believe we have collected information from a child, please contact us immediately, and we 
                                will take steps to delete such information.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">10. International Data Transfers</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Your information may be transferred to and processed in countries other than your country of 
                                residence. These countries may have different data protection laws. When we transfer information 
                                internationally, we implement appropriate safeguards to protect your data in accordance with 
                                applicable laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">11. Third-Party Links</h2>
                            <p className="text-gray-700 leading-relaxed">
                                Our services may contain links to third-party websites or services. We are not responsible for 
                                the privacy practices of these third parties. We encourage you to review the privacy policies 
                                of any third-party sites you visit.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">12. Changes to This Privacy Policy</h2>
                            <p className="text-gray-700 leading-relaxed">
                                We may update this Privacy Policy from time to time to reflect changes in our practices or 
                                legal requirements. We will notify you of significant changes by posting the updated policy 
                                on our website and updating the &quot;Last Updated&quot; date. Your continued use of our services after 
                                such changes constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">13. California Privacy Rights</h2>
                            <p className="text-gray-700 leading-relaxed">
                                If you are a California resident, you have additional rights under the California Consumer 
                                Privacy Act (CCPA), including:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li>The right to know what personal information we collect, use, and disclose</li>
                                <li>The right to request deletion of your personal information</li>
                                <li>The right to opt-out of the sale of personal information (we do not sell personal information)</li>
                                <li>The right to non-discrimination for exercising your privacy rights</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">14. GDPR Compliance</h2>
                            <p className="text-gray-700 leading-relaxed">
                                If you are located in the European Economic Area (EEA), we process your personal information 
                                in accordance with the General Data Protection Regulation (GDPR). Our legal basis for processing 
                                includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-700">
                                <li><strong>Contract Performance:</strong> To provide services you have requested</li>
                                <li><strong>Legitimate Interests:</strong> To improve our services and prevent fraud</li>
                                <li><strong>Legal Obligations:</strong> To comply with applicable laws</li>
                                <li><strong>Consent:</strong> Where you have provided explicit consent</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-3">15. Contact Us</h2>
                            <p className="text-gray-700 leading-relaxed mb-3">
                                If you have questions, concerns, or requests regarding this Privacy Policy or our data 
                                practices, please contact us:
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <p className="text-gray-700"><strong>AWD Rewards</strong></p>
                                <p className="text-gray-700">Email: <a href="mailto:privacy@awdrewards.com" className="text-blue-600 hover:underline">privacy@awdrewards.com</a></p>
                                <p className="text-gray-700">Support: <a href="mailto:support@awdrewards.com" className="text-blue-600 hover:underline">support@awdrewards.com</a></p>
                                <p className="text-gray-700">Contact Form: <Link href="/contact" className="text-blue-600 hover:underline">www.awdrewards.com/contact</Link></p>
                            </div>
                            <p className="text-gray-700 leading-relaxed mt-3">
                                We will respond to your inquiries within a reasonable timeframe, typically within 30 days.
                            </p>
                        </section>

                        <section className="border-t pt-6 mt-8">
                            <p className="text-sm text-gray-600 italic">
                                By using AWD Rewards, you acknowledge that you have read and understood this Privacy Policy 
                                and agree to its terms. This policy is effective as of the date stated above and applies to 
                                all users of our platform.
                            </p>
                        </section>
                    </CardContent>
                </Card>

                {/* Footer Navigation */}
                <div className="flex justify-center gap-4 mt-8 text-sm">
                    <Link href="/" className="text-blue-600 hover:underline">
                        Home
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link href="/contact" className="text-blue-600 hover:underline">
                        Contact Us
                    </Link>
                    <span className="text-gray-400">|</span>
                    <Link href="/pricing" className="text-blue-600 hover:underline">
                        Pricing
                    </Link>
                </div>
            </div>
        </div>
    );
}
