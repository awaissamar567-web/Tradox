import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="page-transition max-w-4xl mx-auto px-4 py-8 select-text text-textPrimary leading-relaxed">
      <header className="border-b border-customBorder pb-4 mb-6">
        <h1 className="font-syne text-[24px] font-bold text-accent uppercase tracking-wider">
          PRIVACY POLICY
        </h1>
        <p className="font-dmsans text-[13px] text-textSecondary font-light">
          Last updated: May 25, 2026
        </p>
      </header>

      <section className="flex flex-col gap-6 font-dmsans text-[14px] font-light">
        <div>
          <h2 className="font-syne text-[14px] uppercase text-textPrimary font-bold tracking-wider mb-2">
            1. INTRODUCTION
          </h2>
          <p className="text-textSecondary">
            Welcome to Tradox Journal ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice or our practices with regard to your personal information, please contact us.
          </p>
        </div>

        <div>
          <h2 className="font-syne text-[14px] uppercase text-textPrimary font-bold tracking-wider mb-2">
            2. INFORMATION WE COLLECT
          </h2>
          <p className="text-textSecondary mb-2">
            We collect personal information that you voluntarily provide to us when you register on the App, express an interest in obtaining information about us or our products, or when you contact us.
          </p>
          <ul className="list-disc list-inside text-textSecondary flex flex-col gap-1.5 ml-2">
            <li><strong>Personal Data:</strong> Display name, email address, country, timezone, trading settings.</li>
            <li><strong>Trading Data:</strong> Logged assets, entry/exit prices, position sizes, strategies, notes, mindset logs.</li>
            <li><strong>Credentials:</strong> Account credentials via secure Google OAuth or Email/Security Key.</li>
          </ul>
        </div>

        <div>
          <h2 className="font-syne text-[14px] uppercase text-textPrimary font-bold tracking-wider mb-2">
            3. HOW WE USE YOUR INFORMATION
          </h2>
          <p className="text-textSecondary">
            We use personal information collected via our App for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </p>
        </div>

        <div>
          <h2 className="font-syne text-[14px] uppercase text-textPrimary font-bold tracking-wider mb-2">
            4. DATA STORAGE AND PROTECTION
          </h2>
          <p className="text-textSecondary">
            Your data is stored securely either using Google Firestore DB or in your browser's local sandbox storage (for offline demo accounts). We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process.
          </p>
        </div>

        <div>
          <h2 className="font-syne text-[14px] uppercase text-textPrimary font-bold tracking-wider mb-2">
            5. WHOP PAYMENTS AND GATEWAY
          </h2>
          <p className="text-textSecondary">
            We integrate with Whop for billing and premium memberships. Whop handles all payment card processing. We do not store or collect your payment card details. That information is provided directly to our third-party payment processors whose use of your personal information is governed by their Privacy Policy.
          </p>
        </div>

        <div>
          <h2 className="font-syne text-[14px] uppercase text-textPrimary font-bold tracking-wider mb-2">
            6. YOUR PRIVACY RIGHTS
          </h2>
          <p className="text-textSecondary">
            You may review, change, or terminate your account at any time. You have the right to request access to and rectification or erasure of your personal data stored within Tradox Journal.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
