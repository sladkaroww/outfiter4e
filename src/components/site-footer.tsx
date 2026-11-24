import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4">
        <Link href="/">
          <a className="text-sm">© 2023 StyleHub. All rights reserved.</a>
        </Link>
      </div>
    </footer>
  );
}