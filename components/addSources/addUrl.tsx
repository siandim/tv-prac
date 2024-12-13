import { useState, FormEvent } from 'react';

export interface tvProps{
  tvId: number;
  tvName: string;
  onNewEntry: () => void;
}

const AddUrl = ({ tvId, tvName, onNewEntry }: tvProps) => { // Receive tvName from props
  const [name, setName] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [panel, setPanel] = useState<number>(1);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    const response = await fetch(`/api/source/getMaxInsideIndex?tvId=${tvId}&panel=${panel}`);
    const maxInsideIndexData = await response.json();
    let currentInsideIndex = (maxInsideIndexData.maxInsideIndex || 0) + 1;


    const responses = await fetch('/api/source/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, source, panel, tvId, insideIndex:currentInsideIndex, }), 
    });
    currentInsideIndex++;
    
    if (response.ok) {
      setName('');
      setSource('');
      setPanel(1);
      setMessage('Slide submitted successfully!');
      onNewEntry();
    } else {
      const errorData = await response.json();
      setMessage(`Error: ${errorData.message || errorData[0]?.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Add New Slide for TV {tvName}</h1> {/* Display tvName instead of name */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label  htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="source">
            Source
          </label>
          <input
            id="source"
            type="url"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="panel">
            Panel
          </label>
          <select
            id="panel"
            value={panel}
            onChange={(e) => setPanel(Number(e.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            {[1, 2, 3, 4].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
        {message && <p className="mt-4 text-red-500">{message}</p>}
      </form>
    </div>
  );
};

export default AddUrl;

