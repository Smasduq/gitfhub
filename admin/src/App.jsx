import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronRight,
  Users,
  CreditCard,
  MessageSquare,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Search
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, scale: 0.95 }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const AdminApp = () => {
  const [view, setView] = useState('login')
  const [passphrase, setPassphrase] = useState('')
  const [users, setUsers] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('overview') // overview, waitlist, moderation

  const handleLogin = async (pass) => {
    setLoading(true)
    try {
      const uRes = await axios.get(`${API_BASE}/admin/users?passphrase=${pass}`)
      setUsers(uRes.data)
      const cRes = await axios.get(`${API_BASE}/admin/comments?passphrase=${pass}`)
      setComments(cRes.data)
      setPassphrase(pass)
      setView('dashboard')
    } catch (err) {
      alert('Invalid Passphrase')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const uRes = await axios.get(`${API_BASE}/admin/users?passphrase=${passphrase}`)
      setUsers(uRes.data)
      const cRes = await axios.get(`${API_BASE}/admin/comments?passphrase=${passphrase}`)
      setComments(cRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGift = async (id) => {
    try {
      await axios.put(`${API_BASE}/admin/users/${id}/gift?passphrase=${passphrase}`)
      handleRefresh()
    } catch (err) {
      alert('Action failed')
    }
  }

  const handleDeleteComment = async (id) => {
    try {
      await axios.delete(`${API_BASE}/admin/comments/${id}?passphrase=${passphrase}`)
      handleRefresh()
    } catch (err) {
      alert('Action failed')
    }
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen relative p-4 sm:p-10 md:p-24 overflow-y-auto">
      <div className="mesh-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <AnimatePresence mode="wait">
        {view === 'login' && (
          <div className="flex items-center justify-center min-h-[80vh]">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="glass-card p-12 w-full max-w-md text-center relative">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-accent-primary/20 rounded-full blur-2xl -z-10" />
              <ShieldCheck size={48} className="mx-auto mb-6 text-accent-primary" />
              <h2 className="text-4xl font-black mb-2">Admin Panel</h2>
              <p className="text-dim mb-8">Authorised personals only</p>

              <input
                type="password"
                placeholder="Enter Passphrase"
                className="input-field text-center mb-6"
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin(passphrase)}
              />
              <button
                onClick={() => handleLogin(passphrase)}
                className="btn-primary w-full py-5 text-xl"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Access Terminal'}
              </button>
            </motion.div>
          </div>
        )}

        {view === 'dashboard' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-7xl mx-auto py-10">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
              <div>
                <h1 className="text-5xl font-black mb-3 text-white">Dashboard</h1>
                <div className="flex items-center gap-4 text-dim text-lg">
                  <div className="flex items-center gap-2">
                    <Users size={18} /> {users.length} Applicants
                  </div>
                  <div className="w-1 h-1 bg-white/20 rounded-full" />
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} /> {comments.length} Comments
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <button onClick={handleRefresh} className="btn-show-more flex-1 md:flex-none justify-center">
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
                <button onClick={() => setView('login')} className="btn-show-more flex-1 md:flex-none justify-center bg-red-500/5 hover:bg-red-500/10 border-red-500/20 text-red-400">
                  <LogOut size={20} /> Logout
                </button>
              </div>
            </header>

            <div className="flex gap-2 mb-12 bg-white/5 p-1.5 rounded-2xl w-fit">
              {[
                { id: 'overview', label: 'Overview', icon: CreditCard },
                { id: 'waitlist', label: 'Waitlist', icon: Users },
                { id: 'moderation', label: 'Moderation', icon: MessageSquare },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                      ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                      : 'text-dim hover:text-white hover:bg-white/5'
                    }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-20 min-h-[50vh]">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div variants={itemVariants} className="space-y-12">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      { label: 'Total Volume', value: `N${(users.length * 50000).toLocaleString()}`, icon: CreditCard },
                      { label: 'Gifted', value: users.filter(u => u.is_gifted).length, icon: ShieldCheck },
                      { label: 'Pending', value: users.filter(u => !u.is_gifted).length, icon: RefreshCw },
                    ].map((stat, i) => (
                      <div key={i} className="glass-card p-10 group hover:border-accent-primary transition-all">
                        <stat.icon className="text-accent-primary mb-6" size={32} />
                        <div className="text-4xl font-black">{stat.value}</div>
                        <div className="text-lg text-dim mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="glass-card p-10">
                    <h3 className="text-2xl font-bold mb-6">Recent Activity</h3>
                    <p className="text-dim">Monitor the latest applications and gifting updates here.</p>
                    <div className="mt-8 space-y-4">
                      {users.slice(0, 5).map(u => (
                        <div key={u.id} className="flex justify-between items-center py-4 border-b border-white/5">
                          <span>{u.name} joined</span>
                          <span className="text-dim text-sm">{new Date(u.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Waitlist Tab */}
              {activeTab === 'waitlist' && (
                <motion.div variants={itemVariants} className="space-y-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <h3 className="text-3xl font-black">Waitlist Management</h3>
                    <div className="relative w-full max-w-xs">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" size={16} />
                      <input
                        type="text"
                        placeholder="Search name or email..."
                        className="input-field pl-12 text-sm !mb-0"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Identity</th>
                          <th>Bank Details</th>
                          <th>Position</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div className="font-bold text-lg">{u.name}</div>
                              <div className="text-xs text-dim">{u.email}</div>
                            </td>
                            <td>
                              <div className="text-accent-primary font-bold">{u.bank_name}</div>
                              <code className="text-sm">{u.account_number}</code>
                            </td>
                            <td className="font-mono text-xl">#{u.waitlist_position}</td>
                            <td>
                              <span className={`status-badge ${u.is_gifted ? 'status-gifted' : 'status-pending'}`}>
                                {u.is_gifted ? 'GIFTED' : 'WAITING'}
                              </span>
                            </td>
                            <td>
                              {!u.is_gifted && (
                                <button
                                  onClick={() => handleGift(u.id)}
                                  className="btn-show-more !py-2 !px-4 text-xs bg-green-500/10 border-green-500/20 text-green-400"
                                >
                                  Mark Gifted
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* Moderation Tab */}
              {activeTab === 'moderation' && (
                <motion.div variants={itemVariants} className="space-y-8">
                  <h3 className="text-3xl font-black">Community Moderation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {comments.map(c => (
                      <div key={c.id} className="comment-bubble relative group py-8">
                        <div className="comment-name text-accent-primary">{c.name}</div>
                        <div className="comment-text text-lg">{c.content}</div>
                        <div className="text-xs text-dim mt-4 flex items-center justify-between">
                          {new Date(c.created_at).toLocaleDateString()}
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1 rounded-lg hover:bg-red-500/20 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="footer opacity-50">
        <span className="footer-brand">Gifthub Terminal</span>
        <p className="footer-text">
          Gifthub Admin Dashboard v1.0.0
        </p>
      </footer>
    </div>
  )
}

export default AdminApp
