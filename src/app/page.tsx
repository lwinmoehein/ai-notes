import { NotesList } from "@/components/NotesList";
import { Note } from "@/components/NoteCard";

export default async function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  let notes: Note[] = [];

  try {
    const res = await fetch(`${apiUrl}/note`, {
      cache: "no-store",
    });
    
    if (res.ok) {
      const data = await res.json();
      notes = data.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch notes:", error);
  }

  return <NotesList notes={notes} />;
}
