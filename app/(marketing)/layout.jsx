import ContactModalProvider from "../../components/ContactModalProvider";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import WhatsappButton from "../../components/WhatsappButton";

// Everything that should NOT appear on /portal (the CRM) lives here
// instead of the root layout — a route group so it doesn't add a
// `/marketing` segment to the URL, `/` stays `/`.
export default function MarketingLayout({ children }) {
  return (
    <ContactModalProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsappButton />
    </ContactModalProvider>
  );
}
