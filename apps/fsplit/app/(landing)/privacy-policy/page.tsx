import { SectionTitle } from "~/components/legal/section-title";
import { SubHeading } from "~/components/legal/sub-heading";
import { MainTitle } from "~/components/legal/main-title";
import { Paragraph } from "~/components/legal/paragraph";
import { ListItem } from "~/components/legal/list-item";
import { PageWrapper } from "~/components/legal/page-wrapper";

export default function PrivacyPolicyPage() {
  return (
    <PageWrapper>
      {/* Main page title */}
      <section>
        <MainTitle>Privacy Policy</MainTitle>
        <p className="mt-1 text-neutral-600 lg:mt-2 lg:text-lg">
          Effective Date: June 9, 2024
        </p>
      </section>

      {/* Introduction */}
      <section>
        <SectionTitle>Introduction</SectionTitle>
        <Paragraph>
          FSplit ("we," "our," or "us") is committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use our mobile application (the
          "App") and our website (the "Site"). By using the App and the Site,
          you agree to the terms of this Privacy Policy.
        </Paragraph>
      </section>

      {/* Information we collect */}
      <section>
        <SectionTitle>Information We Collect</SectionTitle>
        <div className="space-y-6">
          <div>
            <SubHeading>Personal Data</SubHeading>
            <ListItem>
              <b>Contact Information:</b> Such as your name, email address, and
              phone number.
            </ListItem>
          </div>
          <div>
            <SubHeading>Usage Data</SubHeading>
            <div className="space-y-2">
              <ListItem>
                <b>Log Information:</b> Such as IP address, browser type, and
                usage data.
              </ListItem>
              <ListItem>
                <b>Device Information:</b> Such as device type, operating
                system, and unique device identifiers.
              </ListItem>
            </div>
          </div>
          <div>
            <SubHeading>Location Data</SubHeading>
            <ListItem>
              We may collect and process information about your location if you
              allow us to do so.
            </ListItem>
          </div>
          <div>
            <SubHeading>How We Use Your Information</SubHeading>
            <div className="space-y-2">
              <ListItem>
                <b>To Provide Services:</b> To manage your expenses, split
                bills, and facilitate reimbursements.
              </ListItem>
              <ListItem>
                <b>To Improve Our Services:</b> To understand how our users
                interact with the App and Site.
              </ListItem>
              <ListItem>
                <b>To Communicate with You:</b> To send you updates, security
                alerts, and support messages.
              </ListItem>
              <ListItem>
                <b>For Legal and Security Purposes:</b> To comply with legal
                obligations and protect against fraud.
              </ListItem>
            </div>
          </div>
          <div>
            <SubHeading>Sharing Your Information</SubHeading>
            <div className="space-y-2">
              <ListItem>
                <b>With Service Providers:</b> We may share your information
                with third-party service providers to perform functions on our
                behalf.
              </ListItem>
              <ListItem>
                <b>For Legal Reasons:</b> We may disclose your information if
                required by law or in response to legal processes.
              </ListItem>
              <ListItem>
                <b>Business Transfers:</b> In the event of a merger,
                acquisition, or sale of assets, your information may be
                transferred.
              </ListItem>
            </div>
          </div>
        </div>
      </section>

      {/* Security of Your Information */}
      <section>
        <SectionTitle>Security of Your Information</SectionTitle>
        <Paragraph>
          We use administrative, technical, and physical security measures to
          protect your personal information. However, no security system is
          impenetrable, and we cannot guarantee the security of your data.
        </Paragraph>
      </section>

      {/* Your Privacy Rights */}
      <section>
        <SectionTitle>Your Privacy Rights</SectionTitle>
        <div className="space-y-4">
          <Paragraph>
            Depending on your location, you may have the right to:
          </Paragraph>
          <div className="space-y-1">
            <ListItem>Access the personal data we hold about you.</ListItem>
            <ListItem>
              Request the correction of incorrect or incomplete data.
            </ListItem>
            <ListItem>Request deletion of your personal data.</ListItem>
            <ListItem>Opt-out of certain data processing activities.</ListItem>
          </div>
          <Paragraph>
            To exercise your rights, please contact us at{" "}
            <a
              href="mailto:fondingo@gmail.com"
              className="text-cta hover:underline"
            >
              fondingo@gmail.com
            </a>
            .
          </Paragraph>
        </div>
      </section>

      {/* Changes to This Privacy Policy */}
      <section>
        <SectionTitle>Changes to This Privacy Policy</SectionTitle>
        <Paragraph>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on our Site and
          updating the "Effective Date" at the top of this page.
        </Paragraph>
      </section>

      {/* Contact Us */}
      <section>
        <SectionTitle>Contact Us</SectionTitle>
        <Paragraph>
          If you have any questions or concerns about this Privacy Policy,
          please contact us at{" "}
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
