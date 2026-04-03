import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, CreditCard, Share2, Award,
  Users, CheckCircle, Copy, AlertCircle, ChevronRight,
  Sparkles, Gift, TrendingUp, Trophy, ShieldCheck,
  MessageCircle, Send, Search, ChevronDown
} from 'lucide-react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_BACKEND_URL

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 }
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const App = () => {
  const [view, setView] = useState('landing') // landing, join, check-status, success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState(null)
  const [referredBy, setReferredBy] = useState('')
  const [banks, setBanks] = useState([])
  const [comments, setComments] = useState([])
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get('https://api.paystack.co/bank')
        const sortedBanks = res.data.data.sort((a, b) => a.name.localeCompare(b.name))
        setBanks(sortedBanks)
      } catch (err) {
        console.error('Failed to fetch banks', err)
      }
    }
    fetchBanks()

    const fetchComments = async () => {
      try {
        const res = await axios.get(`${API_BASE}/comments`)
        setComments(res.data)
      } catch (err) {
        console.error('Failed to fetch comments', err)
      }
    }
    fetchComments()

    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) setReferredBy(ref)
  }, [])

  const handleJoin = async (formData) => {
    setLoading(true)
    setError('')
    try {
      const response = await axios.post(`${API_BASE}/register`, {
        ...formData
      })
      setUserData(response.data)
      setView('success')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (name, content) => {
    setCommentLoading(true)
    try {
      const res = await axios.post(`${API_BASE}/comments`, { name, content })
      setComments([res.data, ...comments])
      return true
    } catch (err) {
      console.error('Failed to post comment', err)
      return false
    } finally {
      setCommentLoading(false)
    }
  }

  return (
    <div className="page-container">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <div key="landing">
            <div className="animated-bg" />
            <LandingView onStart={() => setView('join')} onCheckStatus={() => setView('check-status')} />
            <CommentSection comments={comments} onSubmit={handleCommentSubmit} loading={commentLoading} />
          </div>
        )}

        {view === 'join' && (
          <div className="view-section" key="join">
            <JoinFormView
              onSubmit={handleJoin}
              loading={loading}
              error={error}
              banks={banks}
              initialReferral={referredBy}
              onBack={() => setView('landing')}
            />
          </div>
        )}

        {view === 'check-status' && (
          <div className="view-section" key="check-status">
            <CheckStatusView
              onSuccess={(data) => {
                setUserData(data)
                setView('success')
              }}
              onBack={() => setView('landing')}
            />
          </div>
        )}

        {view === 'success' && (
          <div className="view-section" key="success">
            <SuccessView user={userData} />
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

const LandingView = ({ onStart, onCheckStatus }) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    exit="exit"
  >
    <div className="hero-wrapper">
      <motion.div variants={itemVariants}>
        <div className="hero-badge">
          Over N10,000,000 gifted annually
        </div>
      </motion.div>

      <motion.h1 variants={itemVariants} className="hero-title shimmer-text">
        Your Gateway to <br />
        <span>Gifting Harmony</span>
      </motion.h1>

      <motion.p variants={itemVariants} className="hero-subtitle">
        Welcome to GiftHub. Join the exclusive waitlist for N50,000 gifting opportunities. Transparency, community, and support in one place.
      </motion.p>

      <motion.div variants={itemVariants} className="hero-alert">
        <AlertCircle size={36} className="hero-alert-icon" />
        <div className="hero-alert-text">
          <strong>Monthly Gift Cycle Rule:</strong> Only the <strong>Top 10 ranked users</strong> are gifted at the conclusion of each month. Following the payout, the entire waitlist database is renewed for a fresh start!
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="hero-actions">
        <button onClick={onStart} className="btn-primary">
          Join the Waitlist
          <ChevronRight size={24} />
        </button>
        <button onClick={onCheckStatus} className="btn-secondary">
          Check Profile / Status
        </button>
      </motion.div>

      <motion.div variants={containerVariants} className="features-grid">
        <motion.div variants={itemVariants} className="feature-card">
          <ShieldCheck size={48} className="feature-icon floating" />
          <h3 className="feature-title">100% Transparent</h3>
          <p className="feature-text">Our advanced algorithm ensures the waitlist is strictly first-come, first-served. You will always know your accurate position.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="feature-card">
          <Users size={48} className="feature-icon floating" style={{ color: 'var(--accent-secondary)', animationDelay: '1s' }} />
          <h3 className="feature-title">Community Driven</h3>
          <p className="feature-text">Gifthub is built by the community, for the community. Expand the network securely and accelerate everyone's progress.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="feature-card">
          <CheckCircle size={48} className="feature-icon floating" style={{ color: 'var(--success)', animationDelay: '2s' }} />
          <h3 className="feature-title">Verified Distributions</h3>
          <p className="feature-text">Financial gifts are routed directly and securely to your verified bank account with zero hidden fees or delays.</p>
        </motion.div>
      </motion.div>
    </div>
  </motion.div>
)

const JoinFormView = ({ onSubmit, loading, error, banks, initialReferral, onBack }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    account_number: '',
    bank_name: '',
    referred_by_code: initialReferral || ''
  })

  const [showBankDropdown, setShowBankDropdown] = useState(false)
  const [bankSearch, setBankSearch] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(bankSearch.toLowerCase())
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="form-card"
    >
      <div className="form-header">
        <button onClick={onBack} className="btn-back" title="Go back">
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <strong style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>Priority Application</strong>
      </div>

      <motion.div variants={itemVariants}>
        <h2 className="form-title">Apply for Gifting</h2>
        <p className="form-subtitle">Ensure your bank details are 100% correct so we can seamlessly transfer your gift when you reach the Top 10.</p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="form-error"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit}>
        <motion.div variants={itemVariants} className="form-row">
          <div className="form-group">
            <label className="label-text">Full Name</label>
            <input required className="input-field" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label-text">Mobile Number</label>
            <input required className="input-field" placeholder="080 123 4567" maxLength={11} value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="form-group">
          <label className="label-text">Email Address</label>
          <input type="email" required className="input-field" placeholder="john@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </motion.div>

        <motion.div variants={itemVariants} className="form-row">
          <div className="form-group">
            <label className="label-text">Account Number</label>
            <input required className="input-field" placeholder="10-digit NUBAN" maxLength={10} value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="label-text">Bank Name</label>
            <div className="custom-select-container">
              <button
                type="button"
                className="custom-select-button"
                onClick={() => setShowBankDropdown(!showBankDropdown)}
              >
                <span style={{ color: form.bank_name ? 'var(--text-main)' : 'var(--text-dim)' }}>
                  {form.bank_name || 'Select Bank'}
                </span>
                <ChevronDown size={16} style={{ color: 'var(--text-dim)' }} />
              </button>

              {showBankDropdown && (
                <div className="custom-select-dropdown">
                  <div className="custom-select-search">
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Search size={14} style={{ color: 'var(--text-dim)', position: 'absolute', left: '8px' }} />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search banks..."
                        value={bankSearch}
                        onChange={(e) => setBankSearch(e.target.value)}
                        style={{ paddingLeft: '32px' }}
                      />
                    </div>
                  </div>
                  <div className="custom-select-list">
                    {filteredBanks.length === 0 ? (
                      <div style={{ padding: '12px 16px', color: 'var(--text-dim)', fontSize: '0.875rem' }}>No banks found</div>
                    ) : (
                      filteredBanks.map(bank => (
                        <div
                          key={bank.id}
                          className={`custom-select-item ${form.bank_name === bank.name ? 'selected' : ''}`}
                          onClick={() => {
                            setForm({ ...form, bank_name: bank.name })
                            setShowBankDropdown(false)
                            setBankSearch('')
                          }}
                        >
                          {bank.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Hidden native select for native form required validation if we wanted, but logic handles it on onSubmit normally */}
            <select required value={form.bank_name} onChange={() => { }} style={{ opacity: 0, position: 'absolute', height: 0, width: 0, pointerEvents: 'none' }}>
              <option value="" disabled></option>
              {banks.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="form-group">
          <label className="label-text">Referral Code (Optional)</label>
          <input className="input-field" placeholder="e.g. 1a2b3c4d" value={form.referred_by_code} onChange={e => setForm({ ...form, referred_by_code: e.target.value })} />
        </motion.div>

        <motion.div variants={itemVariants} style={{ marginTop: '32px', textAlign: 'right' }}>
          <button disabled={loading} type="submit" className="btn-primary">
            {loading ? 'Applying...' : 'Apply Now'}
          </button>
        </motion.div>
      </form>
    </motion.div>
  )
}

const CheckStatusView = ({ onSuccess, onBack }) => {
  const [mobile, setMobile] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheck = async (e) => {
    e.preventDefault()
    if (!mobile) return
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`${API_BASE}/status/mobile/${mobile}`)
      onSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || "No profile found with this number.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="form-card"
    >
      <div className="form-header">
        <button onClick={onBack} className="btn-back" title="Go back">
          <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      <h2 className="form-title">Check Profile</h2>
      <p className="form-subtitle">Enter your registered phone number to instantly view your current tier, waitlist rank, and referral stats.</p>

      {error && (
        <div className="form-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleCheck}>
        <div className="form-group">
          <input required type="tel" className="input-field" maxLength={11} placeholder="08012345678" value={mobile} onChange={e => setMobile(e.target.value)} />
        </div>
        <button disabled={loading} type="submit" className="btn-primary" style={{ width: '100%' }}>
          {loading ? 'Verifying...' : 'Access Profile'}
        </button>
      </form>
    </motion.div>
  )
}

const SuccessView = ({ user }) => {
  const referralLink = `${window.location.origin}?ref=${user.referral_code}`
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="success-card"
    >
      <div className="animated-bg" />
      <div className="success-icon floating">
        <Gift size={48} />
      </div>

      <motion.div variants={itemVariants}>
        <h2 className="success-title shimmer-text">You're Approved!</h2>
        <p className="success-subtitle">Welcome back, <strong style={{ color: 'var(--text-main)' }}>{user.name}</strong>. This is your personal dashboard.</p>

        {user.waitlist_position <= 10 ? (
          <div className="success-alert is-eligible">🎉 Eligible for next payout!</div>
        ) : (
          <div className="success-alert is-waiting">Note: Only the top 10 ranked users are gifted each month.</div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="stats-grid">
        <div className="stat-box">
          <TrendingUp size={32} className="stat-icon" style={{ color: 'var(--primary)' }} />
          <span className="stat-label">Priority Position</span>
          <span className="stat-value">#{user.waitlist_position}</span>
        </div>

        <div className="stat-box">
          <Trophy size={32} className="stat-icon" style={{ color: 'var(--warning)' }} />
          <span className="stat-label">Referral Points</span>
          <span className="stat-value">{user.referral_count}</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="referral-section">
        <div className="referral-header">
          <div>
            <h3 className="referral-title">Boost Your Rank</h3>
            <p className="referral-desc">Every friend who joins using your link boosts you 1 spot closer to the Top 10!</p>
          </div>
        </div>

        <div className="referral-box">
          <div className="referral-link">
            {referralLink}
          </div>
          <button onClick={copyToClipboard} className="btn-copy">
            {copied ? <>Copied <CheckCircle size={20} style={{ color: 'var(--bg-color)' }} /></> : <>Copy Link <Copy size={20} /></>}
          </button>
        </div>

        <div className="social-actions">
          <a href={`https://wa.me/?text=Join%20the%20Gifthub%20waitlist%20to%20get%20N50,000%20using%20my%20link!%20${encodeURIComponent(referralLink)}`}
            target="_blank" rel="noreferrer" className="btn-social btn-whatsapp">
            <MessageCircle size={20} /> WhatsApp
          </a>
          <a href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Join%20the%20Gifthub%20waitlist%20to%20get%20N50,000!`}
            target="_blank" rel="noreferrer" className="btn-social btn-telegram">
            <Send size={20} /> Telegram
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}

const CommentSection = ({ comments, onSubmit, loading }) => {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [showAll, setShowAll] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !content) return
    const success = await onSubmit(name, content)
    if (success) {
      setContent('')
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="comments-section"
    >
      <div className="comments-header">
        <div className="header-line" />
        <h2 className="comments-title">Community Feedback</h2>
        <div className="header-line" />
      </div>

      <div className="comments-list">
        {Array.isArray(comments) && comments.slice(0, showAll ? comments.length : 4).map((comment, i) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="comment-card"
          >
            <div className="comment-author">{comment.name}</div>
            <div className="comment-body">{comment.content}</div>
            <div className="comment-date">
              {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </motion.div>
        ))}

        {Array.isArray(comments) && comments.length > 4 && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button onClick={() => setShowAll(!showAll)} className="btn-secondary">
              {showAll ? 'Show Less' : `Show More (${comments.length - 4} more)`}
            </button>
          </div>
        )}

        {(!Array.isArray(comments) || comments.length === 0) && (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '32px' }}>
            No comments yet. Be the first to say something!
          </div>
        )}
      </div>

      <div className="comment-form">
        <h3 className="comment-form-title">Join the conversation</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input required className="input-field" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <textarea required className="input-field" placeholder="What's on your mind?" value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <button disabled={loading} type="submit" className="btn-primary">
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

const Footer = () => (
  <footer className="site-footer">
    <span className="footer-brand">Gifthub Platform</span>
    <p className="footer-text">
      © {new Date().getFullYear()} Gifthub System. All rights reserved. <br />
      Empowering the community, one gift at a time.
    </p>
  </footer>
)

export default App
