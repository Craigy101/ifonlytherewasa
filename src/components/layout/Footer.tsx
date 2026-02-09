import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-surface-border py-8 mt-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-content-muted">
          &copy; 2024 If Only There Was A
        </p>
        <div className="flex gap-6 text-sm text-content-muted">
          <Link href="#" className="hover:text-content transition-colors">
            About
          </Link>
          <Link href="#" className="hover:text-content transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-content transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
