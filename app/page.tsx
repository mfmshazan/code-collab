import EditorComponent from "@/components/EditorComponent";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center p-8 md:p-24">
      
      <div className="max-w-5xl w-full flex flex-col gap-6">
        
        {/* Title Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            CodeCollab
          </h1>
          <p className="text-gray-400">
            Real-time collaborative code editor.
          </p>
        </div>

        {/* The Editor */}
        <EditorComponent />
        
      </div>
    </main>
  );
}