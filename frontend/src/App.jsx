import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Phone, CreditCard, Share2, Award,
  Users, CheckCircle, Copy, AlertCircle, ChevronRight,
  Sparkles, Gift, TrendingUp, Trophy, ShieldCheck,
  MessageCircle, Send
} from 'lucide-react'
import axios from 'axios'

const API_BASE = "http://localhost:8000"

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.4 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const App = () => {
  const [view, setView] = useState('landing') // landing, join, success
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
    <div className="min-h-screen relative p-4 sm:p-10 md:p-24 overflow-y-auto">
      {/* Dynamic Background */}
      <div className="mesh-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <div className="w-full max-w-6xl mx-auto space-y-32 py-20 px-6 md:px-16 lg:px-24">
            <LandingView key="landing" onStart={() => setView('join')} onCheckStatus={() => setView('check-status')} />
            <CommentSection
              comments={comments}
              onSubmit={handleCommentSubmit}
              loading={commentLoading}
            />
          </div>
        )}

        {view === 'join' && (
          <div className="flex items-center justify-center min-h-[80vh] px-6 md:px-16 lg:px-24">
            <JoinFormView
              key="join"
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
          <div className="flex items-center justify-center min-h-[80vh] px-6 md:px-16 lg:px-24">
            <CheckStatusView
              key="check-status"
              onSuccess={(data) => {
                setUserData(data)
                setView('success')
              }}
              onBack={() => setView('landing')}
            />
          </div>
        )}

        {view === 'success' && (
          <div className="flex items-center justify-center min-h-[80vh] px-6 md:px-16 lg:px-24 w-full">
            <SuccessView key="success" user={userData} />
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
    className="text-center max-w-4xl mx-auto px-4"
  >
    <motion.div variants={itemVariants} className="flex justify-center mb-6">
      <span className="badge flex items-center gap-2">
        Over N10,000,000 gifted annually
      </span>
    </motion.div>

    <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl md:text-8xl font-extrabold mb-6 sm:mb-8 leading-[1.1] tracking-tight">
      Your Gateway to <br />
      <span className="shimmer-text">Gifting Harmony</span>
    </motion.h1>

    <motion.p variants={itemVariants} className="text-lg sm:text-xl text-dim mb-10 max-w-2xl mx-auto leading-relaxed">
      Welcome to GiftHub. Join the exclusive waitlist for N50,000 gifting opportunities. Transparency, community, and support in one place.
    </motion.p>

    <motion.div variants={itemVariants} className="max-w-4xl mx-auto mb-16 p-6 sm:p-8 rounded-[32px] bg-amber-500/5 border border-amber-500/20 text-amber-400/90 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-left shadow-xl">
      <AlertCircle className="shrink-0 text-amber-500" size={36} />
      <div className="text-base sm:text-lg leading-relaxed flex-grow">
        <strong className="block mb-2 text-amber-500 font-extrabold tracking-tight">Monthly Gift Cycle Rule:</strong>
        Only the <strong>Top 10 ranked users</strong> are gifted at the conclusion of each month. Following the payout, the entire waitlist database is renewed for a fresh start!
      </div>
    </motion.div>

    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 mb-24 w-full">
      <button onClick={onStart} className="btn-primary w-full sm:w-auto px-10 py-5 text-xl font-bold group">
        Join the Waitlist
        <ChevronRight size={28} className="group-hover:translate-x-1 transition-transform" />
      </button>
      <button onClick={onCheckStatus} className="btn-show-more w-full sm:w-auto px-10 py-5 text-xl font-normal group bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
        Check Profile / Status
      </button>
    </motion.div>

    <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-14 text-left pt-16 mt-10 border-t border-white/5 w-full">
      <motion.div variants={itemVariants} className="glass-card flex flex-col h-full w-full p-8 sm:p-10 sm:min-h-[500px] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <ShieldCheck size={48} className="text-accent-primary mb-8 shrink-0" />
        <h3 className="text-2xl font-bold mb-4 tracking-tight">100% Transparent</h3>
        <p className="text-dim text-base leading-relaxed flex-grow">Our advanced algorithm ensures the waitlist is strictly first-come, first-served. You will always know your accurate position.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card flex flex-col h-full w-full p-8 sm:p-10 sm:min-h-[500px] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-accent-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Users size={48} className="text-accent-secondary mb-8 shrink-0" />
        <h3 className="text-2xl font-bold mb-4 tracking-tight">Community Driven</h3>
        <p className="text-dim text-base leading-relaxed flex-grow">Gifthub is built by the community, for the community. Expand the network securely and accelerate everyone's progress.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card flex flex-col h-full w-full p-8 sm:p-10 sm:min-h-[500px] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CheckCircle size={48} className="text-indigo-400 mb-8 shrink-0" />
        <h3 className="text-2xl font-bold mb-4 tracking-tight">Verified Distributions</h3>
        <p className="text-dim text-base leading-relaxed flex-grow">Financial gifts are routed directly and securely to your verified bank account with zero hidden fees or delays.</p>
      </motion.div>
    </motion.div>
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

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="glass-card w-full max-w-xl p-8 sm:p-14 relative form-container"
    >
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-accent-primary/20 rounded-full blur-2xl -z-10" />

      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="btn-back" title="Go back">
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <span className="badge">Priority Application</span>
      </div>

      <motion.div variants={itemVariants}>
        <h2 className="text-4xl font-bold mb-4 tracking-tight">Apply for Gifting</h2>
        <p className="text-dim mb-16 text-lg">Ensure your bank details are 100% correct so we can seamlessly transfer your gift when you reach the Top 10.</p>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="label-text">Full Name</label>
            <div className="relative">
              <input
                required
                className="input-field"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="label-text">Mobile Number</label>
            <div className="relative">
              <input
                required
                className="input-field"
                placeholder="080 123 4567"
                value={form.mobile}
                onChange={e => setForm({ ...form, mobile: e.target.value })}
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label className="label-text">Email Address</label>
          <input
            type="email"
            required
            className="input-field"
            placeholder="john@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="label-text">Account Number</label>
            <input
              required
              className="input-field"
              placeholder="10-digit NUBAN"
              maxLength={10}
              value={form.account_number}
              onChange={e => setForm({ ...form, account_number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="label-text">Bank Name</label>
            <select
              required
              className="input-field"
              value={form.bank_name}
              onChange={e => setForm({ ...form, bank_name: e.target.value })}
            >
              <option value="" disabled>Select Bank</option>
              {banks.map(bank => (
                <option key={bank.id} value={bank.name} className="bg-[#0f172a]">
                  {bank.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label className="label-text">Referral Code (Optional)</label>
          <input
            className="input-field"
            placeholder="e.g. 1a2b3c4d"
            value={form.referred_by_code}
            onChange={e => setForm({ ...form, referred_by_code: e.target.value })}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-end pt-6">
          <button
            disabled={loading}
            type="submit"
            className="btn-primary px-10 py-5 text-xl min-w-[200px]"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Apply Now <ChevronRight size={20} /></>
            )}
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
      className="glass-card w-full max-w-md p-8 sm:p-14 relative"
    >
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-accent-secondary/20 rounded-full blur-2xl -z-10" />

      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="btn-back" title="Go back">
          <ChevronRight size={20} className="rotate-180" />
        </button>
      </div>

      <h2 className="text-4xl font-bold mb-4 tracking-tight">Check Profile</h2>
      <p className="text-dim mb-16 text-lg">Enter your registered phone number to instantly view your current tier, waitlist rank, and referral stats.</p>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleCheck} className="space-y-6">
        <div className="relative">
          <input
            required
            type="tel"
            className="input-field mb-0"
            placeholder="08012345678"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          type="submit"
          className="btn-primary w-full py-5 text-lg"
        >
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
      className="glass-card w-full max-w-3xl p-10 sm:p-20 text-center relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
        animate={{ opacity: 0.1, scale: 1, rotate: -12 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute top-0 right-0 p-8 text-accent-primary translate-x-1/4 -translate-y-1/4 pointer-events-none"
      >
        <Gift size={320} />
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: 12 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="w-24 h-24 bg-indigo-500/20 shadow-[0_0_40px_rgba(99,102,241,0.4)] text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-10"
      >
        <Gift size={48} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-5xl sm:text-7xl font-extrabold mb-6 tracking-tight shimmer-text">You're Approved!</h2>
        <p className="text-xl text-dim mb-14 max-w-lg mx-auto">Welcome back, <span className="text-white font-bold">{user.name}</span>. This is your personal dashboard.</p>

        {user.waitlist_position <= 10 ? (
          <div className="inline-block px-6 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 font-bold mb-10 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            🎉 Eligible for next payout!
          </div>
        ) : (
          <div className="inline-block px-6 py-2 bg-white/5 border border-white/10 rounded-full text-dim text-sm mb-10">
            Note: Only the top 10 ranked users are gifted each month.
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 sm:gap-8 mb-14 cursor-default">
        {/* Priority Status Column */}
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative p-6 sm:p-10 bg-gradient-to-b from-accent-primary/20 to-black/60 border border-accent-primary/40 rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-[0_0_30px_rgba(129,140,248,0.15)] transition-all flex flex-col justify-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-primary/40 via-transparent to-transparent opacity-50" />
          <TrendingUp size={32} className="mx-auto mb-4 text-accent-primary relative z-10 drop-shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
          <p className="text-xs sm:text-sm text-accent-primary/80 mb-2 uppercase tracking-[0.2em] font-bold relative z-10">Priority</p>
          <p className="text-5xl sm:text-7xl font-black text-white relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">#{user.waitlist_position}</p>
        </motion.div>

        {/* Referral Points Column */}
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          className="relative p-6 sm:p-10 bg-gradient-to-b from-amber-500/20 to-black/60 border border-amber-500/40 rounded-[32px] sm:rounded-[40px] overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all flex flex-col justify-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/40 via-transparent to-transparent opacity-50" />
          <Trophy size={32} className="mx-auto mb-4 text-amber-400 relative z-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          <p className="text-xs sm:text-sm text-amber-500/80 mb-2 uppercase tracking-[0.2em] font-bold relative z-10">Points</p>
          <p className="text-5xl sm:text-7xl font-black text-white relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{user.referral_count}</p>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 border border-accent-primary/30 p-8 sm:p-12 rounded-[40px] text-left relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between mb-8 relative z-10">
          <div>
            <h3 className="text-3xl font-bold mb-2">Boost Your Rank 🚀</h3>
            <p className="text-dim max-w-sm text-lg">Every friend who joins using your link boosts you 1 spot closer to the Top 10!</p>
          </div>
          <Share2 size={64} className="text-accent-primary/20 hidden sm:block group-hover:rotate-12 transition-transform" />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-4 relative z-10 mb-6">
          <div className="flex-1 bg-black/60 border border-accent-primary/20 px-5 rounded-2xl font-mono text-sm overflow-hidden whitespace-nowrap text-ellipsis flex items-center text-accent-primary font-bold tracking-wider shadow-inner">
            {referralLink}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
            className="px-8 py-5 !m-0 bg-white text-black hover:bg-gray-100 rounded-2xl transition-all flex items-center justify-center gap-3 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {copied ? (
              <>Copied <CheckCircle size={20} className="text-green-600" /></>
            ) : (
              <>Copy Link <Copy size={20} /></>
            )}
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-4 relative z-10">
          <a
            href={`https://wa.me/?text=Join%20the%20Gifthub%20waitlist%20to%20get%20N50,000%20using%20my%20link!%20${encodeURIComponent(referralLink)}`}
            target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-2xl transition-colors font-bold"
          >
            <MessageCircle size={20} /> WhatsApp
          </a>
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Join%20the%20Gifthub%20waitlist%20to%20get%20N50,000!`}
            target="_blank" rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl transition-colors font-bold"
          >
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
      className="max-w-3xl mx-auto w-full px-4"
    >
      <div className="flex items-center gap-4 mb-12">
        <div className="h-px bg-glass-border flex-1" />
        <h2 className="text-3xl font-bold tracking-tight">Community Feedback</h2>
        <div className="h-px bg-glass-border flex-1" />
      </div>

      <div className="space-y-6 mb-16">
        {comments.slice(0, showAll ? comments.length : 4).map((comment, i) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="comment-bubble"
          >
            <div className="comment-name">{comment.name}</div>
            <div className="comment-text">{comment.content}</div>
            <div className="comment-time">
              {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </motion.div>
        ))}

        {comments.length > 4 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn-show-more"
            >
              {showAll ? 'Show Less' : `Show More (${comments.length - 4} more)`}
              <ChevronRight size={18} className={showAll ? '-rotate-90' : 'rotate-90'} />
            </button>
          </div>
        )}

        {comments.length === 0 && (
          <div className="text-center py-10 text-dim">
            No comments yet. Be the first to say something!
          </div>
        )}
      </div>

      <div className="glass-card p-8 sm:p-10 md:px-20 lg:px-32 xl:px-40">
        <h3 className="text-xl font-bold mb-6 text-center">Join the conversation</h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto w-full">
          <input
            required
            className="input-field"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <textarea
            required
            className="input-field min-h-[120px] resize-none"
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              disabled={loading}
              type="submit"
              className="btn-primary min-w-[160px]"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

const Footer = () => (
  <footer className="footer">
    <span className="footer-brand">Gifthub</span>
    <p className="footer-text">
      © {new Date().getFullYear()} Gifthub. All rights reserved. <br className="sm:hidden" />
      Empowering the community, one gift at a time.
    </p>
  </footer>
)

export default App
