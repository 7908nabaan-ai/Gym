import React, { useState } from 'react';
import { Loader, RotateCw } from 'lucide-react';

interface Joke {
  setup?: string;
  delivery?: string;
  joke?: string;
  category: string;
  type: string;
}

export default function JokeGenerator() {
  const [joke, setJoke] = useState<Joke | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('general');

  const categories = ['general', 'programming', 'knock-knock', 'spooky', 'christmas'];

  const fetchJoke = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://v2.jokeapi.dev/joke/${category}?type=single,twopart`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch joke');
      }

      const data: Joke = await response.json();
      setJoke(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setJoke(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">😂 Joke Generator</h1>
          <p className="text-gray-600">Get a random laugh every time!</p>
        </div>

        {/* Category Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 bg-white text-gray-800 disabled:opacity-50"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Joke Display */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6 min-h-32 flex flex-col justify-center">
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader className="animate-spin text-purple-500" size={40} />
            </div>
          ) : error ? (
            <p className="text-red-600 font-semibold text-center">{error}</p>
          ) : joke ? (
            <div>
              {joke.type === 'single' ? (
                <p className="text-gray-800 text-lg font-medium text-center">{joke.joke}</p>
              ) : (
                <div>
                  <p className="text-gray-800 text-lg font-medium mb-3">{joke.setup}</p>
                  <p className="text-purple-600 text-lg font-bold text-center">{joke.delivery}</p>
                </div>
              )}
              <p className="text-gray-500 text-xs mt-4 text-center">
                Category: <span className="font-semibold text-gray-700">{joke.category}</span>
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-center italic">Click the button to get a joke!</p>
          )}
        </div>

        {/* Fetch Button */}
        <button
          onClick={fetchJoke}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <RotateCw size={20} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading...' : 'Get Random Joke'}
        </button>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          Powered by <a href="https://jokeapi.dev" className="text-purple-600 hover:underline">
            JokeAPI
          </a>
        </p>
      </div>
    </div>
  );
}
