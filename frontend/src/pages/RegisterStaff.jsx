import { useState } from 'react';
import api from '../api/axios';

import { useAuth } from '../context/AuthContext';

const RegisterStaff = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [msg, setMsg] = useState('');
    const { user } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register-staff', formData);
            setMsg('Staff account created successfully!');
            setFormData({ username: '', password: '' });
        } catch (error) {
            const errorMsg = error.response?.data?.msg || `Error: ${error.message}`;
            setMsg(errorMsg);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <h2 className="text-xl font-bold mb-4">Register New Staff</h2>
            {msg && <div className={`p-2 mb-4 rounded ${msg.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Username</label>
                    <input type="text" className="w-full border p-2 rounded" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Password</label>
                    <input type="password" className="w-full border p-2 rounded" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">Create Account</button>
            </form>
        </div>
    );
};

export default RegisterStaff;
