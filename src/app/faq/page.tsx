import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about outfiter accounts, wardrobes, AI recognition, privacy and deleting your data.",
  alternates: { canonical: "/faq" },
};

const QUESTIONS = [
  {
    question: "What is outfiter?",
    answer:
      "A social wardrobe. You keep a private digital wardrobe, share outfits with the community, and react to what others wear.",
  },
  {
    question: "How do I add a piece?",
    answer:
      "Open the + button in the dock (or the shirt menu on desktop) and choose “Add to wardrobe”. Pick a photo, fill in the details or let AI suggest them, then save.",
  },
  {
    question: "How does AI recognition work?",
    answer:
      "When you choose a photo, the app sends it to Google Gemini, which suggests a name, type, colour and description. You can edit everything before saving. AI is optional and the app works without it.",
  },
  {
    question: "Who can see my wardrobe?",
    answer:
      "Your wardrobe is private to your account. Only outfits you post to the feed are visible to the community.",
  },
  {
    question: "Can I delete a post or a piece?",
    answer:
      "Yes. Open your own post and choose Delete (with confirmation), or delete a piece from the wardrobe. The image is removed from storage too.",
  },
  {
    question: "Do you use cookies?",
    answer:
      "Only essential cookies are required. Optional analytics are loaded after you accept them in the cookie banner. See the privacy policy for details.",
  },
];

export default function FaqPage() {
  return (
    <main id="main-content">
      <SiteHeader />
      <article className="content-shell page-shell legal-page">
        <p className="eyebrow">HELP</p>
        <h1>Frequently asked questions</h1>
        <p className="legal-updated">
          Still stuck? Email <a href="mailto:hello@outfiter.app">hello@outfiter.app</a>.
        </p>

        <div className="faq-list">
          {QUESTIONS.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
