import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4">
        <Link href="/">
          <a className="text-xl font-bold">StyleHub</a>
        </Link>
      </div>
    </header>
  );
}