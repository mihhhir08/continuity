import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <div><strong>404</strong><h1>This path did not survive change.</h1><p>The requested page is unknown or has moved.</p><Link className="button primary" href="/">Return home</Link></div>
    </main>
  );
}
