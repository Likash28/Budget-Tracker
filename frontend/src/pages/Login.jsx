import React, { useState } from 'react'
import api, { setToken } from '../services/api.js'

export default function Login({ onLogin }){
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess('')
  }

  const validateForm = () => {
    if (!isLogin) {
      if (!formData.name.trim()) {
        setError('Name is required')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        return false
      }
    }
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    if (!formData.password.trim()) {
      setError('Password is required')
      return false
    }
    return true
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { 
        email: formData.email, 
        password: formData.password 
      })
      setToken(data.token)
      // Store user info in localStorage for immediate access
      localStorage.setItem('userInfo', JSON.stringify(data.user))
      onLogin(data.token, data.user)
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      setSuccess('Registration successful! Please login with your credentials.')
      setIsLogin(true)
      setFormData({ ...formData, password: '', confirmPassword: '' })
    } catch (e) {
      setError(e.response?.data?.detail || e.message)
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Sign in to your account' : 'Join us to start tracking your finances'}</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab-button ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true)
              setError('')
              setSuccess('')
            }}
          >
            Login
          </button>
          <button 
            className={`tab-button ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false)
              setError('')
              setSuccess('')
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-button"
            disabled={loading}
          >
            {loading ? (
              <div className="loading-spinner-small"></div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              className="link-button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setSuccess('')
              }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
