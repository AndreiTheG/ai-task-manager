// app/dashboard/page.jsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);  

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      fetchTasks();
    }
  }, [status, router]);

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        userId: session.user.email,
        completed: false,
        aiSuggestion: '',
        createdAt: new Date(),
      }),
    });

    if (res.ok) {
      setForm({ title: '', description: '' });
      fetchTasks();
    } else {
      setError('Eroare la adăugarea taskului!');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  };

  const handleComplete = async (task) => {
    await fetch(`/api/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed }),
    });

    // Trimite email doar când task-ul e marcat ca finalizat (nu când e reactivat)
    if (!task.completed) {
      await fetch('/api/sendgrid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          userEmail: session.user.email,
        }),
      });
    }

    fetchTasks();
  };

  const handleAI = async (task) => {
  setAiLoading(task._id);

  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: task.title,
      description: task.description,
    }),
  });

  const data = await res.json();

  if (data.suggestion) {
    await fetch(`/api/tasks/${task._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aiSuggestion: data.suggestion }),
    });
    fetchTasks();
  }

  setAiLoading(false);
};

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Se încarcă...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">AI Task Manager</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Bună, {session?.user?.name}!
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
          >
            Deconectare
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        {/* Formular adaugare task */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Adaugă task nou</h2>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-3">
            <input
              type="text"
              placeholder="Titlu task"
              required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              placeholder="Descriere (opțional)"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Se adaugă...' : 'Adaugă task'}
            </button>
          </form>
        </div>

        {/* Lista taskuri */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Taskurile mele ({tasks.length})</h2>

          {tasks.length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Nu ai niciun task încă. Adaugă primul task! 😊
            </div>
          )}

          {tasks.map((task) => (
            <div
              key={task._id}
              className={`bg-white rounded-lg shadow p-6 ${task.completed ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${task.completed ? 'line-through text-gray-400' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                  )}
                  {task.aiSuggestion && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                      <span className="font-medium">💡 Sugestie AI:</span> {task.aiSuggestion}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleComplete(task)}
                    className={`px-3 py-1 rounded text-sm transition ${
                      task.completed
                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {task.completed ? 'Reactivează' : 'Finalizat'}
                  </button>
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
                  >
                    Șterge
                  </button>
                  <button
                    onClick={() => handleAI(task)}
                    disabled={aiLoading === task._id}
                    className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition disabled:opacity-50"
                  >
                    {aiLoading === task._id ? '⏳ Se generează...' : '💡 Sugestie AI'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}