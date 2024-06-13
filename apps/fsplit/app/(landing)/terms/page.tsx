import { Metadata } from "next";

import { PageWrapper, SectionWrapper } from "~/components/legal/wrappers";
import { SectionTitle } from "~/components/legal/titles";
import { Paragraph } from "~/components/legal/paragraph";
import { SubHeading } from "~/components/legal/titles";
import { ListWrapper } from "~/components/legal/list";
import { MainTitle } from "~/components/legal/titles";
import { ListItem } from "~/components/legal/list";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for FSplit",
};

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
        <SectionWrapper>
          {/* Eligibility */}
          <div>
            <SubHeading>Eligibility</SubHeading>
            <ListWrapper>
              <ListItem>
                You must be at least 18 years old to use our services.
              </ListItem>
              <ListItem>
                You must provide accurate and complete information when creating
                an account.
              </ListItem>
            </ListWrapper>
          </div>

          {/* Account Security */}
          <div>
            <SubHeading>Account Security</SubHeading>
            <ListWrapper>
              <ListItem>
                You are responsible for maintaining the confidentiality of your
                account credentials.
              </ListItem>
              <ListItem>
                You must notify us immediately of any unauthorized use of your
                account.
              </ListItem>
            </ListWrapper>
          </div>

          {/* Prohibited Activities */}
          <div>
            <SubHeading>Prohibited Activities</SubHeading>
            <ListWrapper>
              <ListItem>
                You may not use our services for any illegal or unauthorized
                purpose.
              </ListItem>
              <ListItem>
                You may not interfere with or disrupt the App or Site or attempt
                to access our systems or data unlawfully.
              </ListItem>
            </ListWrapper>
          </div>
        </SectionWrapper>
      </section>

      {/* User Content */}
      <section>
        <SectionTitle>User Content</SectionTitle>
        <SectionWrapper>
          {/* Responsibility for Content */}
          <div>
            <SubHeading>Responsibility for Content</SubHeading>
            <ListWrapper>
              <ListItem>
                You are responsible for any content you post or share through
                our services.
              </ListItem>
              <ListItem>
                You grant us a non-exclusive, royalty-free, worldwide license to
                use, reproduce, and display your content for the purpose of
                operating and providing our services.
              </ListItem>
            </ListWrapper>
          </div>

          {/* Content Restrictions */}
          <div>
            <SubHeading>Content Restrictions</SubHeading>
            <ListWrapper>
              <ListItem>
                You may not post content that is illegal, harmful, or infringes
                on the rights of others.
              </ListItem>
              <ListItem>
                We reserve the right to remove any content that violates these
                Terms.
              </ListItem>
            </ListWrapper>
          </div>
        </SectionWrapper>
      </section>

      {/* Payment and Fees */}
      <section>
        <SectionTitle>Payment and Fees</SectionTitle>
        <SectionWrapper>
          {/* Billing */}
          <div>
            <SubHeading>Billing</SubHeading>
            <ListWrapper>
              <ListItem>
                Certain features of our services may require payment. You agree
                to pay all applicable fees.
              </ListItem>
              <ListItem>
                We may change our fees at any time. Any fee changes will be
                communicated to you in advance.
              </ListItem>
            </ListWrapper>
          </div>

          {/* Refunds */}
          <div>
            <SubHeading>Refunds</SubHeading>
            <ListItem>
              All purchases are final and non-refundable unless otherwise
              stated.
            </ListItem>
          </div>
        </SectionWrapper>
      </section>

      {/* Termination */}
      <section>
        <SectionTitle>Termination</SectionTitle>
        <SectionWrapper>
          {/* By You */}
          <div>
            <SubHeading>By You</SubHeading>
            <ListItem>
              You may terminate your account at any time by contacting us at{" "}
              <a
                href="mailto:team.fondingo@gmail.com"
                className="text-cta hover:underline"
              >
                team.fondingo@gmail.com
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
            <ListWrapper>
              <ListItem>
                Upon termination, your right to use our services will cease
                immediately.
              </ListItem>
              <ListItem>
                All provisions of these Terms that should survive termination
                will remain in effect.
              </ListItem>
            </ListWrapper>
          </div>

          {/* Limitation of Liability */}
          <div>
            <SubHeading>Limitation of Liability</SubHeading>
            <ListWrapper>
              <ListItem>
                Our services are provided "as is" without warranties of any
                kind.
              </ListItem>
              <ListItem>
                We are not liable for any indirect, incidental, or consequential
                damages arising from your use of our services.
              </ListItem>
            </ListWrapper>
          </div>
        </SectionWrapper>
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
            href="mailto:team.fondingo@gmail.com"
            className="text-cta hover:underline"
          >
            team.fondingo@gmail.com
          </a>
          .
        </Paragraph>
      </section>
    </PageWrapper>
  );
}
