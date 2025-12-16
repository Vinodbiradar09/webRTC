import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
       <Link href={"/sender"} className="p-3">Sender</Link>
      <Link href={"/receiver"}>receiver</Link>
    </div>
  );
}
