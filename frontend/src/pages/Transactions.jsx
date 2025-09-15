import React, { useEffect, useState } from 'react'
import api from '../services/api.js'
import { useNavigate } from 'react-router-dom'

export default function Transactions(){
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ type:'expense', amount:'', category:'Food', date:new Date().toISOString().slice(0,10), description:'' })
  const [filters, setFilters] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userInfo, setUserInfo] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const token = localStorage.getItem('jwt')
    console.log("Token value in transactions:", token)
    if(!token){
      navigate('/login')
      return
    }
    
    // Get user info from localStorage
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        setUserInfo(JSON.parse(storedUserInfo))
      } catch (e) {
        console.error('Error parsing stored user info:', e)
      }
    }
  }, [navigate])

  async function load(){
    try {
      setLoading(true)
      const { data } = await api.get('/transactions', { params: filters })
      setItems(data.items || data || [])
    } catch (error) {
      console.error('Error loading transactions:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(()=>{ load() }, [JSON.stringify(filters)])

  async function add(e){
    e.preventDefault()
    if (!form.amount || !form.description) return
    
    setSubmitting(true)
    try {
      const payload = { ...form, amount: Number(form.amount), date: new Date(form.date).toISOString() }
      await api.post('/transactions', payload)
      setForm({ ...form, amount:'', description:'' })
      load()
    } catch (error) {
      console.error('Error adding transaction:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getTotalIncome = () => {
    return items.filter(item => item.type === 'income').reduce((sum, item) => sum + item.amount, 0)
  }

  const getTotalExpense = () => {
    return items.filter(item => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0)
  }

  const getNetAmount = () => {
    return getTotalIncome() - getTotalExpense()
  }

  if (loading) {
    return (
      <div className="transactions-container">
        <div className="transactions-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading your transactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="transactions-container">
      <div className="transactions-content">
        {/* Header Section */}
        <div className="transactions-header">
          <div className="header-info">
            <h1>Transaction Management</h1>
            <p>Track your income and expenses with detailed insights</p>
          </div>
          <div className="summary-cards">
            <div className="summary-card income">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="card-content">
                <h3>Total Income</h3>
                <p className="amount">{formatCurrency(getTotalIncome())}</p>
              </div>
            </div>
            <div className="summary-card expense">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C9.79 6 8 7.79 8 10S9.79 14 12 14 16 12.21 16 10 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10S10.9 8 12 8 14 8.9 14 10 13.1 12 12 12Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="card-content">
                <h3>Total Expenses</h3>
                <p className="amount">{formatCurrency(getTotalExpense())}</p>
              </div>
            </div>
            <div className="summary-card net">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19ZM7 10H9V16H7V10ZM11 6H13V16H11V6ZM15 8H17V16H15V8Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="card-content">
                <h3>Net Amount</h3>
                <p className={`amount ${getNetAmount() >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(getNetAmount())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Transaction Form */}
        <div className="add-transaction-section">
          <div className="section-header">
            <h2>Add New Transaction</h2>
            <p>Record your income or expense</p>
          </div>
          <form onSubmit={add} className="transaction-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Transaction Type</label>
                <select 
                  id="type"
                  value={form.type} 
                  onChange={e=>setForm({...form, type:e.target.value})}
                  className="form-select"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="amount">Amount</label>
                <input 
                  id="amount"
                  type="number" 
                  placeholder="Enter amount" 
                  value={form.amount} 
                  onChange={e=>setForm({...form, amount:e.target.value})}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input 
                  id="category"
                  placeholder="Enter category" 
                  value={form.category} 
                  onChange={e=>setForm({...form, category:e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input 
                  id="date"
                  type="date" 
                  value={form.date} 
                  onChange={e=>setForm({...form, date:e.target.value})}
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <input 
                id="description"
                placeholder="Enter description" 
                value={form.description} 
                onChange={e=>setForm({...form, description:e.target.value})}
                className="form-input"
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <>
                  <span className="btn-icon">➕</span>
                  <span>Add Transaction</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Transactions List */}
        <div className="transactions-list-section">
          <div className="section-header">
            <h2>Transaction History</h2>
            <p>View and filter your transactions</p>
          </div>
          
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="categoryFilter">Filter by Category</label>
              <input 
                id="categoryFilter"
                placeholder="Search category..." 
                onChange={e=>setFilters(f=>({...f, category:e.target.value||undefined}))}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="typeFilter">Filter by Type</label>
              <select 
                id="typeFilter"
                onChange={e=>setFilters(f=>({...f, type:e.target.value||undefined}))}
                className="filter-select"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="transactions-table-container">
            {items.length > 0 ? (
              <div className="transactions-table">
                <div className="table-header">
                  <div className="header-cell">Date</div>
                  <div className="header-cell">Type</div>
                  <div className="header-cell">Category</div>
                  <div className="header-cell">Description</div>
                  <div className="header-cell amount">Amount</div>
                </div>
                <div className="table-body">
                  {items.map(transaction => (
                    <div key={transaction.id} className="table-row">
                      <div className="table-cell date">
                        {new Date(transaction.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="table-cell type">
                        <span className={`type-badge ${transaction.type}`}>
                          {transaction.type === 'income' ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12 6C9.79 6 8 7.79 8 10S9.79 14 12 14 16 12.21 16 10 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10S10.9 8 12 8 14 8.9 14 10 13.1 12 12 12Z" fill="currentColor"/>
                            </svg>
                          )}
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </div>
                      <div className="table-cell category">
                        <span className="category-tag">{transaction.category}</span>
                      </div>
                      <div className="table-cell description">
                        {transaction.description || '-'}
                      </div>
                      <div className={`table-cell amount ${transaction.type}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-transactions">
                <div className="no-transactions-icon">📝</div>
                <h3>No Transactions Found</h3>
                <p>Start by adding your first transaction above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
