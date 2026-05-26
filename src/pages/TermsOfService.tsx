import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <div className="page-transition max-w-4xl mx-auto px-4 py-8 select-text text-textPrimary leading-relaxed">
      <header className="border-b border-customBorder pb-4 mb-6">
        <h1 className="font-syne text-[24px] font-bold text-accent uppercase tracking-wider">
          TERMS OF SERVICE
        </h1>
        <p className="font-dmsans text-[13px] text-textSecondary font-light">
          Last updated: May 25, 2026
        </p>
      </header>

      <section className="flex flex-col gap-6 font-dmsans text-[14px] font-light">
        <div>
          <h2 className="font-syne text-[14px] uppercase text-textPrimary font-bold tracking-wider mb-2">
            1. AGREEMENT TO TERMS
          </h2>
          <p className="text-textSecondary">
            These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Tradox Journal ("we", "us", or "our"), concerning your access to and use of the Tradox Journal trading journal application.
          </p>
        </div>

        <div>
          <h2 className="font-syne text-[14px] uppercase text-textPrimary font-bold tracking-wider mb-2">
            2. INTELLECTUAL PROPERTY RIGHTS
          </h2>
          <p className="text-textSecondary">
            Unless otherwise indicated, the App is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the App (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
          </p>
        </div>

        <div>
          <h2 className="font-syne text-[14px] uppercase text-textPrimary font-bold tracking-wider mb-2">
            3. USER REPRESENTATIONS
          </h2>
          <p className="text-textSecondary">
            By using the App, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary; (3) you have the legal capacity and you agree to comply with these Terms of Service.
          </p>
        </div>

        <div>
          <h2 className="font-syne text-[14px] uppercase text-textPrimary font-bold tracking-wider mb-2">
            4. USER PLAN & GATING PARAMETERS
          </h2>
          <p className="text-textSecondary mb-2">
            Tradox Journal offers Free and Pro subscriptions:
          </p>
          <ul className="list-disc list-inside text-textSecondary flex flex-col gap-1.5 ml-2 mb-2">
            <li><strong>Free Subscription:</strong> Restricted to 10 logged executions in total, 1 custom setup strategy, 7-day trade history visibility, and blurred monthly metrics.</li>
            <li><strong>Pro Subscription:</strong> Access to unlimited executions, unlimited strategies, lifetime history, monthly hub charts, and advanced data exports (CSV & PDF).</li>
          </ul>
          <p className="text-textSecondary">
            Subscriptions are processed through the Whop platform. Billing details and checkout links are handled securely. Attempting to bypass these gating parameters constitutes a breach of these terms.
          </p>
        </div>

        <div>
          <h2 className="font-syne text-[14px] uppercase text-textPrimary font-bold tracking-wider mb-2">
            5. NO FINANCIAL ADVICE
          </h2>
          <p className="text-textSecondary">
            Tradox Journal is purely a journaling and performance metrics recording tool. We do not provide financial, investment, legal, or tax advice. All trading decisions are made solely by you. Past performance does not guarantee future results.
          </p>
        </div>

        <div>
          <h2 className="font-syne text-[14px] uppercase text-textPrimary font-bold tracking-wider mb-2">
            6. DISCLAIMER OF WARRANTIES
          </h2>
          <p className="text-textSecondary">
            THE APP IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE APP AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST PERCENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED.
          </p>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
