import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-6xl font-bold text-content-muted">404</h1>
      <p className="text-xl text-content-secondary mt-4">Page not found</p>
      <p className="text-sm text-content-muted mt-2 mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/">
        <Button variant="secondary">Back to Home</Button>
      </Link>
    </div>
  );
}
