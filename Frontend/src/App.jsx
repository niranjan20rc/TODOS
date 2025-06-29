import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

export default function App() {
  const API_BASE = import.meta.env.VITE_API_URL;

  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Fetch all todos
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/todos`);
        setTodos(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchTodos();
  }, [API_BASE]);

  // Add a new todo
  const addTodo = async e => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await axios.post(`${API_BASE}/api/todos`, { text });
      setTodos(prev => [...prev, res.data]);
      setText('');
    } catch (err) {
      console.error('Add error:', err);
    }
  };

  // Save edits
  const saveEdit = async e => {
    e.preventDefault();
    try {
      const todo = todos.find(t => t._id === editingId);
      const res = await axios.put(`${API_BASE}/api/todos/${editingId}`, {
        text: editText,
        completed: todo.completed,
      });
      setTodos(prev => prev.map(t => (t._id === editingId ? res.data : t)));
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  // Toggle completed
  const toggleTodo = async id => {
    try {
      const todo = todos.find(t => t._id === id);
      const res = await axios.put(`${API_BASE}/api/todos/${id}`, {
        completed: !todo.completed,
      });
      setTodos(prev => prev.map(t => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  // Delete todo
  const deleteTodo = async id => {
    try {
      await axios.delete(`${API_BASE}/api/todos/${id}`);
      setTodos(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="container">
      <h1>Todo List (CRUD)</h1>

      <form onSubmit={editingId ? saveEdit : addTodo}>
        <input
          type="text"
          value={editingId ? editText : text}
          onChange={e =>
            editingId ? setEditText(e.target.value) : setText(e.target.value)
          }
          placeholder={editingId ? 'Edit todo text' : 'Add new todo'}
        />
        <button type="submit">{editingId ? 'Save' : 'Add'}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setEditText('');
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <ul>
        {todos.map(t => (
          <li key={t._id} className={t.completed ? 'completed' : ''}>
            <span onClick={() => toggleTodo(t._id)}>
              {t.text}
            </span>
            <button
              onClick={() => {
                setEditingId(t._id);
                setEditText(t.text);
              }}
            >
              ✎
            </button>
            <button onClick={() => deleteTodo(t._id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
