"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendContact, type ContactState } from "./actions";

export default function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, {});
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state]);

  return (
    <div className="contact-form-wrapper">
      <form className="contact-form" ref={form} action={action}>
        {/* Full name + Email trên cùng một hàng (2 cột), điện thoại xuống 1 cột */}
        <div className="contact-form-row">
          <div>
            <label htmlFor="contact-name">
              Full name <span className="require">*</span>
            </label>
            <input id="contact-name" type="text" name="user_name" placeholder="Enter your full name" required />
          </div>
          <div>
            <label htmlFor="contact-email">
              Email <span className="require">*</span>
            </label>
            <input id="contact-email" type="email" name="user_email" placeholder="Enter your email" required />
          </div>
        </div>
        <label>
          Subject <span className="require">*</span>
        </label>
        <input name="subject" placeholder="Enter your subject" required />
        <label>Message</label>
        <textarea name="message" rows={5} placeholder="Enter your message" />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ display: "none" }} />
        <button type="submit" className="btn-contact-form" disabled={pending}>
          {pending ? "Sending..." : "Send Email 🚀"}
        </button>
      </form>
      {state.ok && <p className="success-form-alert">Thank you for your message. It has been sent.</p>}
      {state.error && <p className="failed-form-alert">{state.error}</p>}
    </div>
  );
}
