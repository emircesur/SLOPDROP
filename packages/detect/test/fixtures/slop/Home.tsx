import { Card } from "./ui";

export function Home() {
  return (
    <div className="bg-gradient-to-r from-violet-600 to-fuchsia-500 p-6">
      <h1>Welcome back!</h1>
      <p className="uppercase tracking-wider text-xs">Overview</p>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
        <span>✨</span>
      </div>
      <Card>
        <Card>
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <div onClick={() => go()}>Open</div>
        </Card>
      </Card>
      <img src="/hero.png" />
      <button className="transition-all hover:scale-105">Submit</button>
      <p>Trusted by 10,000+ teams</p>
      <p>Something went wrong</p>
    </div>
  );
}
