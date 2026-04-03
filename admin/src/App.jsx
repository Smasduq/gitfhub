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
  Search,
  Activity,
  CheckCircle2
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, staggerChildren: 0.05 }
  },
  exit: { opacity: 0, scale: 0.98 }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

const AdminApp = () => {
  const [view, setView] = useState('login')
  const [passphrase, setPassphrase] = useState('')
  const [users, setUsers] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

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

  const activeVol = users.length * 50000;

  return (
    <>
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <div className="login-container">
            <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="login-card">
              <div className="login-icon">
                <ShieldCheck size={32} />
              </div>
              <h2 className="login-title">Sign in to Console</h2>
              <p className="login-subtitle">Enter your secure passphrase to continue.</p>

              <input
                type="password"
                placeholder="Passphrase"
                className="input-field"
                style={{ textAlign: 'center' }}
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin(passphrase)}
              />
              <button
                onClick={() => handleLogin(passphrase)}
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </motion.div>
          </div>
        )}

        {view === 'dashboard' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="app-container">
            
            <nav className="top-nav">
              <div className="brand-section">
                <div className="brand-icon">
                  <ShieldCheck size={20} />
                </div>
                <span className="brand-text">Gifthub Admin</span>
              </div>
              <div className="nav-actions">
                <button onClick={handleRefresh} className="btn-secondary">
                  <RefreshCw size={14} className={loading ? 'spin-icon text-[#4f46e5]' : ''} /> 
                  <span>Sync Data</span>
                </button>
                <button onClick={() => setView('login')} className="btn-danger">
                  <LogOut size={14} /> 
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>

            <header className="dashboard-header">
              <h1 className="dashboard-title">Dashboard</h1>
              <div className="dashboard-stats">
                <div className="stat-item">
                  <Users size={14} /> {users.length} Applicants
                </div>
                <div>&bull;</div>
                <div className="stat-item">
                  <MessageSquare size={14} /> {comments.length} Comments
                </div>
              </div>
            </header>

            <div className="tabs-container">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'waitlist', label: 'Waitlist' },
                { id: 'moderation', label: 'Moderation' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="tab-indicator"
                    />
                  )}
                </button>
              ))}
            </div>

            <div style={{ minHeight: '50vh' }}>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div variants={itemVariants}>
                  <div className="metrics-grid">
                    {[
                      { label: 'Total Volume', value: `₦${activeVol.toLocaleString()}`, icon: Activity },
                      { label: 'Gifted Applicants', value: users.filter(u => u.is_gifted).length, icon: CheckCircle2 },
                      { label: 'Pending Applicants', value: users.filter(u => !u.is_gifted).length, icon: Users },
                    ].map((stat, i) => (
                      <div key={i} className="metric-card">
                        <div className="metric-header">
                          <span>{stat.label}</span>
                          <stat.icon size={16} />
                        </div>
                        <div className="metric-value">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="section-card">
                    <div className="section-header">
                      Recent Applications
                    </div>
                    <div>
                      {users.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>No applications found.</div>
                      ) : (
                        users.slice(0, 5).map(u => (
                          <div key={u.id} className="list-item">
                            <div>
                              <div className="item-main">{u.name}</div>
                              <div className="item-sub">{u.email}</div>
                            </div>
                            <div className="item-sub" style={{ fontWeight: 500 }}>
                              {new Date(u.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Waitlist Tab */}
              {activeTab === 'waitlist' && (
                <motion.div variants={itemVariants}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Waitlist Management</h3>
                    <div className="search-container">
                      <Search className="search-icon" size={14} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        className="search-input"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="section-card" style={{ overflowX: 'auto' }}>
                    <table className="data-table">
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
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-dim)' }}>No users match your criteria</td>
                          </tr>
                        ) : null}
                        {filteredUsers.map(u => (
                          <tr key={u.id}>
                            <td>
                              <div className="item-main">{u.name}</div>
                              <div className="item-sub">{u.email}</div>
                            </td>
                            <td>
                              <div className="item-main">{u.bank_name}</div>
                              <div className="item-sub" style={{ fontFamily: 'monospace' }}>{u.account_number}</div>
                            </td>
                            <td style={{ fontFamily: 'monospace', fontWeight: 500 }}>#{u.waitlist_position}</td>
                            <td>
                              <span className={`status-badge ${u.is_gifted ? 'status-gifted' : 'status-pending'}`}>
                                {u.is_gifted ? 'Gifted' : 'Pending'}
                              </span>
                            </td>
                            <td>
                              {!u.is_gifted && (
                                <button
                                  onClick={() => handleGift(u.id)}
                                  className="btn-action"
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
                <motion.div variants={itemVariants}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>Comments Feed</h3>
                  <div className="feed-grid">
                    {comments.length === 0 ? (
                      <div className="section-card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                        No comments yet
                      </div>
                    ) : null}
                    {comments.map(c => (
                      <div key={c.id} className="feed-card">
                        <div className="feed-header">
                          <span className="feed-author">{c.name}</span>
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="feed-remove"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="feed-content">{c.content}</p>
                        <div className="feed-footer">
                          {new Date(c.created_at).toLocaleString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <footer className="app-footer">
              <strong>Gifthub Terminal</strong>
              <span>Version 2.0.0 (Native Build)</span>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AdminApp
