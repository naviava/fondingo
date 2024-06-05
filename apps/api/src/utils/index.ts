import { Resend } from "@fondingo/utils/resend";

const domain = process.env.NEXT_PUBLIC_SITE_URL;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail({
  email,
  token,
  pathname,
}: {
  email: string;
  token: string;
  pathname: string;
}) {
  const confirmLink = `${domain}${pathname}?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: "fsplit-verify@fondingo.com",
    to: email,
    subject: "Confirm your email address to use FSplit",
    html: `<p><a href="${confirmLink}">Click here</a> to confirm your email address.<br />If you have initiated this manually, any previous links received will not be functional. This is the link to rule them all.</p>`,
  });
  if (error) {
    console.error("Failed to send verification email", error);
    return false;
  }
  return true;
}
