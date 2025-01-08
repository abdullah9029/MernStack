import { useState, useEffect } from "react";

function Main() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(
          "http://localhost:2000/api/todoAppdb/GetNotes"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }

        const data = await response.json();
        setNotes(data);
        setLoading(false);
        console.log("Fetched Data: ", data);
      } catch (err) {
        setError(err.message);

        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container">
      <h1>Public Recipes</h1>
      <div className="notes-grid">
        {notes.map((note) => (
          <div key={note.id} className="note-card">
            <h3>{note.description}</h3>
            <p>{note.content}</p>
          </div>
        ))}
      </div>
      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .note-card {
          padding: 15px;
          border-radius: 8px;
          background-color: #f5f5f5;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

export default Main;
