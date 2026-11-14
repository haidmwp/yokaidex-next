import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import ContactForm from "./ContactForm";
import { pageTitle } from "@/lib/constants";

export const metadata: Metadata = { title: pageTitle("Contact Us") };

export default function ContactPage() {
  return (
    <div id="contact" className="content-wrapper">
      <PageHeader title="Contact Us" color="#FFC648" />
      <div className="contact-content">
        <div className="container">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
