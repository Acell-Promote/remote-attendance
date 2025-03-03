import Image from "next/image";
import Button from "./components/Button";
import Card from "./components/Card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex w-full max-w-4xl flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-center">
          Welcome to <span className="text-blue-600">Remote Attendance</span>
        </h1>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
          <Card title="Getting Started">
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Edit{" "}
              <code className="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800">
                app/page.tsx
              </code>{" "}
              and save to see your changes.
            </p>
            <Button>Get Started</Button>
          </Card>

          <Card title="Learn More">
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Check out our documentation to learn more about Next.js and
              Tailwind CSS.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Documentation
              </Button>
              <Button variant="secondary" size="sm">
                Examples
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold">Tailwind CSS Components</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm">
              Primary Small
            </Button>
            <Button variant="primary">Primary Medium</Button>
            <Button variant="primary" size="lg">
              Primary Large
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm">
              Secondary Small
            </Button>
            <Button variant="secondary">Secondary Medium</Button>
            <Button variant="secondary" size="lg">
              Secondary Large
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Outline Small
            </Button>
            <Button variant="outline">Outline Medium</Button>
            <Button variant="outline" size="lg">
              Outline Large
            </Button>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-center text-sm text-gray-500">
        <p>
          Powered by{" "}
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:underline"
          >
            Next.js
          </a>{" "}
          and{" "}
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 hover:underline"
          >
            Tailwind CSS
          </a>
        </p>
      </footer>
    </div>
  );
}
