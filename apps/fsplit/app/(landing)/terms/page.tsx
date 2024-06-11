import { SectionTitle } from "~/components/legal/section-title";
import { SubHeading } from "~/components/legal/sub-heading";
import { MainTitle } from "~/components/legal/main-title";
import { Paragraph } from "~/components/legal/paragraph";
import { ListItem } from "~/components/legal/list-item";
import { PageWrapper } from "~/components/legal/page-wrapper";

export default function TermsPage() {
  return (
    <PageWrapper>
      {/* Main page title */}
      <section>
        <MainTitle>Terms of Service</MainTitle>
        <p className="mt-1 text-neutral-600 lg:mt-2 lg:text-lg">
          Effective Date: June 9, 2024
        </p>
      </section>

      {/* Introduction */}
      <section>
        <SectionTitle>Introduction</SectionTitle>
        <Paragraph>
          Welcome to FSplit! These Terms of Service ("Terms") govern your use of
          our mobile application (the "App") and our website (the "Site"). By
          accessing or using the App and Site, you agree to be bound by these
          Terms. If you do not agree to these Terms, please do not use our
          services.
        </Paragraph>
      </section>

      {/* Use of Our Services */}
      <section>
        <SectionTitle>Use of Our Services</SectionTitle>
        <div className="space-y-6">
          {/* Eligibility */}
          <div>
            <SubHeading>Eligibility</SubHeading>
            <div className="space-y-2">
              <ListItem>
                You must be at least 18 years old to use our services.
              </ListItem>
              <ListItem>
                You must provide accurate and complete information when creating
                an account.
              </ListItem>
            </div>
          </div>

          {/* Account Security */}
          <div>
            <SubHeading>Account Security</SubHeading>
            <div className="space-y-2">
              <ListItem>
                You are responsible for maintaining the confidentiality of your
                account credentials.
              </ListItem>
              <ListItem>
                You must notify us immediately of any unauthorized use of your
                account.
              </ListItem>
            </div>
          </div>

          {/* Prohibited Activities */}
          <div>
            <SubHeading>Prohibited Activities</SubHeading>
            <div className="space-y-2">
              <ListItem>
                You may not use our services for any illegal or unauthorized
                purpose.
              </ListItem>
              <ListItem>
                You may not interfere with or disrupt the App or Site or attempt
                to access our systems or data unlawfully.
              </ListItem>
            </div>
          </div>
        </div>
      </section>

      {/* User Content */}
      <section>
        <SectionTitle>User Content</SectionTitle>
        <div className="space-y-6">
          {/* Responsibility for Content */}
          <div>
            <SubHeading>Responsibility for Content</SubHeading>
            <div className="space-y-2">
              <ListItem>
                You are responsible for any content you post or share through
                our services.
              </ListItem>
              <ListItem>
                You grant us a non-exclusive, royalty-free, worldwide license to
                use, reproduce, and display your content for the purpose of
                operating and providing our services.
              </ListItem>
            </div>
          </div>

          {/* Content Restrictions */}
          <div>
            <SubHeading>Content Restrictions</SubHeading>
            <div className="space-y-2">
              <ListItem>
                You may not post content that is illegal, harmful, or infringes
                on the rights of others.
              </ListItem>
              <ListItem>
                We reserve the right to remove any content that violates these
                Terms.
              </ListItem>
            </div>
          </div>
        </div>
      </section>

      {/* Payment and Fees */}
      <section>
        <SectionTitle>Payment and Fees</SectionTitle>
        <div className="space-y-6">
          {/* Billing */}
          <div>
            <SubHeading>Billing</SubHeading>
            <div className="space-y-2">
              <ListItem>
                Certain features of our services may require payment. You agree
                to pay all applicable fees.
              </ListItem>
              <ListItem>
                We may change our fees at any time. Any fee changes will be
                communicated to you in advance.
              </ListItem>
            </div>
          </div>

          {/* Refunds */}
          <div>
            <SubHeading>Refunds</SubHeading>
            <ListItem>
              All purchases are final and non-refundable unless otherwise
              stated.
            </ListItem>
          </div>
        </div>
      </section>

      {/* Termination */}
      <section>
        <SectionTitle>Termination</SectionTitle>
        <div className="space-y-6">
          {/* By You */}
          <div>
            <SubHeading>By You</SubHeading>
            <ListItem>
              You may terminate your account at any time by contacting us at{" "}
              <a
                href="mailto:fondingo@gmail.com"
                className="text-cta hover:underline"
              >
                fondingo@gmail.com
              </a>
              .
            </ListItem>
          </div>

          {/* By Us */}
          <div>
            <SubHeading>By Us</SubHeading>
            <ListItem>
              We may terminate or suspend your account if you violate these
              Terms or for any other reason at our discretion.
            </ListItem>
          </div>

          {/* Effect of Termination */}
          <div>
            <SubHeading>Effect of Termination</SubHeading>
            <div className="space-y-2">
              <ListItem>
                Upon termination, your right to use our services will cease
                immediately.
              </ListItem>
              <ListItem>
                All provisions of these Terms that should survive termination
                will remain in effect.
              </ListItem>
            </div>
          </div>

          {/* Limitation of Liability */}
          <div>
            <SubHeading>Limitation of Liability</SubHeading>
            <div className="space-y-2">
              <ListItem>
                Our services are provided "as is" without warranties of any
                kind.
              </ListItem>
              <ListItem>
                We are not liable for any indirect, incidental, or consequential
                damages arising from your use of our services.
              </ListItem>
            </div>
          </div>
        </div>
      </section>

      {/* Governing Law */}
      <section>
        <SectionTitle>Governing Law</SectionTitle>
        <Paragraph>
          These Terms are governed by the laws of the state in which FSplit
          operates, without regard to its conflict of laws principles.
        </Paragraph>
      </section>

      {/* Changes to These Terms */}
      <section>
        <SectionTitle>Changes to These Terms</SectionTitle>
        <Paragraph>
          We may update these Terms from time to time. We will notify you of any
          changes by posting the new Terms on our Site and updating the
          "Effective Date" at the top of this page.
        </Paragraph>
      </section>

      {/* Contact Us */}
      <section>
        <SectionTitle>Contact Us</SectionTitle>
        <Paragraph>
          If you have any questions or concerns about these Terms, please
          contact us at{" "}
          <a
            href="mailto:fondingo@gmail.com"
            className="text-cta hover:underline"
          >
            fondingo@gmail.com
          </a>
          .
        </Paragraph>
      </section>
    </PageWrapper>
  );
}
