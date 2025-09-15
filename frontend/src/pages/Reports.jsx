import React, { useEffect, useState } from 'react'
import api from '../services/api.js'
import { Pie, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
ChartJS.register(ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend)
import { useNavigate } from 'react-router-dom'
import '../styles.css'

export default function Reports(){
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7))
  const [summary, setSummary] = useState({ categories: [], income: 0, expense: 0, savings: 0 })
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const token = localStorage.getItem('jwt')
    console.log("Token value in reports:", token)
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

  useEffect(() => {
    let isMounted = true
    
    const loadReportsData = async () => {
      setLoading(true)
      setError(null)
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('Reports loading timeout - setting fallback data')
          setSummary({ categories: [], income: 0, expense: 0, savings: 0 })
          setTrend([])
          setError('Loading timeout - please try again')
          setLoading(false)
        }
      }, 10000) // 10 second timeout
      
      try {
        // Fetch current month summary
        const summaryResponse = await api.get('/reports/summary', { params: { month } })
        if (isMounted) {
          setSummary(summaryResponse.data)
        }
        
        // Fetch trend data for last 6 months (simplified to avoid too many API calls)
        const now = new Date(month + '-01T00:00:00Z')
        const months = [...Array(6)].map((_, i) => {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          return date.toISOString().slice(0, 7)
        })
        
        // Only fetch trend data if we have a valid month
        if (months.length > 0) {
          const trendPromises = months.map(monthStr => 
            api.get('/reports/summary', { params: { month: monthStr } })
              .then(response => response.data)
              .catch(error => {
                console.warn(`Failed to fetch data for ${monthStr}:`, error)
                return { income: 0, expense: 0, savings: 0, categories: [] }
              })
          )
          
          const trendData = await Promise.all(trendPromises)
          if (isMounted) {
            setTrend(trendData.reverse())
          }
        }
        
        clearTimeout(timeoutId)
        
      } catch (error) {
        console.error('Error loading reports:', error)
        if (isMounted) {
          // Set fallback data
          setSummary({ categories: [], income: 0, expense: 0, savings: 0 })
          setTrend([])
          setError('Failed to load reports data. Please try again.')
        }
        clearTimeout(timeoutId)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadReportsData()
    
    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [month])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getSavingsRate = () => {
    if (summary.income === 0) return 0
    return ((summary.savings / summary.income) * 100).toFixed(1)
  }

  const getExpenseRate = () => {
    if (summary.income === 0) return 0
    return ((summary.expense / summary.income) * 100).toFixed(1)
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'Food': '🍽️',
      'Transport': '🚗',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Health': '🏥',
      'Education': '📚',
      'Travel': '✈️',
      'Utilities': '⚡',
      'Other': '📦'
    }
    return icons[category] || '📦'
  }

  const pieData = {
    labels: summary.categories?.map(c => c._id) || [],
    datasets: [{ 
      data: summary.categories?.map(c => c.total) || [],
      backgroundColor: [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', 
        '#00f2fe', '#43e97b', '#38f9d7', '#ffecd2', '#fcb69f'
      ],
      borderWidth: 3,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      hoverBorderWidth: 4,
      hoverBorderColor: 'rgba(255, 255, 255, 0.3)'
    }]
  }

  const lineData = {
    labels: trend.map((_,i)=> {
      const date = new Date(month+'-01T00:00:00Z')
      date.setMonth(date.getMonth() - (5-i))
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    }),
    datasets: [
      { 
        label: 'Income', 
        data: trend.map(t => t.income || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      { 
        label: 'Expense', 
        data: trend.map(t => t.expense || 0),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      { 
        label: 'Savings', 
        data: trend.map(t => t.savings || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 2,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#E5E7EB',
          font: { size: 14, weight: '600' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 35, 0.95)',
        titleColor: '#E5E7EB',
        bodyColor: '#E5E7EB',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 13 },
        padding: 12
      }
    },
    scales: {
      x: {
        ticks: { 
          color: '#9CA3AF',
          font: { size: 12, weight: '500' }
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        }
      },
      y: {
        ticks: { 
          color: '#9CA3AF',
          font: { size: 12, weight: '500' },
          callback: function(value) {
            return formatCurrency(value)
          }
        },
        grid: { 
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#E5E7EB',
          font: { size: 14, weight: '600' },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 35, 0.95)',
        titleColor: '#E5E7EB',
        bodyColor: '#E5E7EB',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: { size: 14, weight: '600' },
        bodyFont: { size: 13 },
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${formatCurrency(value)} (${percentage}%)`
          }
        }
      }
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    }
  }

  if (loading) {
    return (
      <div className="reports-container">
        <div className="reports-loading">
          <div className="loading-spinner-large"></div>
          <p>Loading your financial reports...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="reports-container">
        <div className="reports-content">
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h2>Error Loading Reports</h2>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-btn"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reports-container">
      <div className="reports-content">
        {/* Header Section */}
        <div className="reports-header">
          <div className="header-info">
            <h1>Financial Reports</h1>
            <p>Comprehensive insights into your financial health and spending patterns</p>
          </div>
          <div className="month-selector">
            <label htmlFor="monthFilter">Select Month:</label>
            <input 
              id="monthFilter"
              type="month" 
              value={month} 
              onChange={e=>setMonth(e.target.value)}
              className="month-input"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card income">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Total Income</h3>
              <p className="amount">{formatCurrency(summary.income || 0)}</p>
              <div className="card-metric">
                <span className="metric-label">Income Rate</span>
                <span className="metric-value">100%</span>
              </div>
            </div>
          </div>
          <div className="summary-card expense">
            <div className="card-icon">💸</div>
            <div className="card-content">
              <h3>Total Expenses</h3>
              <p className="amount">{formatCurrency(summary.expense || 0)}</p>
              <div className="card-metric">
                <span className="metric-label">Expense Rate</span>
                <span className="metric-value">{getExpenseRate()}%</span>
              </div>
            </div>
          </div>
          <div className="summary-card savings">
            <div className="card-icon">💎</div>
            <div className="card-content">
              <h3>Net Savings</h3>
              <p className={`amount ${summary.savings >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(summary.savings || 0)}
              </p>
              <div className="card-metric">
                <span className="metric-label">Savings Rate</span>
                <span className={`metric-value ${summary.savings >= 0 ? 'positive' : 'negative'}`}>
                  {getSavingsRate()}%
                </span>
              </div>
            </div>
          </div>
          <div className="summary-card insights">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <h3>Financial Health</h3>
              <p className="amount">
                {summary.savings >= 0 ? 'Healthy' : 'Needs Attention'}
              </p>
              <div className="card-metric">
                <span className="metric-label">Status</span>
                <span className={`metric-value ${summary.savings >= 0 ? 'positive' : 'negative'}`}>
                  {summary.savings >= 0 ? 'Good' : 'Poor'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card pie-chart-card">
            <div className="chart-header">
              <h3>Expense Categories</h3>
              <p>Breakdown by category for {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="chart-container pie-chart">
              <div className="chart-wrapper">
                {summary.categories && summary.categories.length > 0 ? (
                  <Pie data={pieData} options={pieOptions} />
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">📊</div>
                    <h4>No Data Available</h4>
                    <p>No expense categories found for this month</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="chart-card line-chart-card">
            <div className="chart-header">
              <h3>6-Month Financial Trend</h3>
              <p>Income, expenses, and savings over the last 6 months</p>
            </div>
            <div className="chart-container line-chart">
              <div className="chart-wrapper">
                <Line data={lineData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {summary.categories && summary.categories.length > 0 && (
          <div className="category-breakdown">
            <div className="section-header">
              <h2>Category Breakdown</h2>
              <p>Detailed analysis of your spending by category</p>
            </div>
            <div className="category-list">
              {summary.categories.map((category, index) => {
                const percentage = summary.expense > 0 ? ((category.total / summary.expense) * 100).toFixed(1) : 0
                return (
                  <div key={category._id} className="category-item">
                    <div className="category-info">
                      <div className="category-icon">{getCategoryIcon(category._id)}</div>
                      <div className="category-details">
                        <span className="category-name">{category._id}</span>
                        <span className="category-percentage">{percentage}% of total expenses</span>
                      </div>
                    </div>
                    <div className="category-amount">
                      {formatCurrency(category.total || 0)}
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-progress"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: pieData.datasets[0].backgroundColor[index]
                        }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Financial Insights */}
        <div className="insights-section">
          <div className="section-header">
            <h2>Financial Insights</h2>
            <p>Key metrics and recommendations for better financial health</p>
          </div>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h3>Savings Goal</h3>
                <p className="insight-value">{getSavingsRate()}%</p>
                <p className="insight-description">
                  {getSavingsRate() >= 20 ? 'Excellent savings rate!' : 
                   getSavingsRate() >= 10 ? 'Good savings rate, aim for 20%' : 
                   'Consider increasing your savings rate'}
                </p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h3>Expense Control</h3>
                <p className="insight-value">{getExpenseRate()}%</p>
                <p className="insight-description">
                  {getExpenseRate() <= 80 ? 'Good expense control!' : 
                   getExpenseRate() <= 90 ? 'Monitor your expenses closely' : 
                   'Consider reducing your expenses'}
                </p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">💡</div>
              <div className="insight-content">
                <h3>Recommendation</h3>
                <p className="insight-value">
                  {summary.savings >= 0 ? 'Maintain' : 'Improve'}
                </p>
                <p className="insight-description">
                  {summary.savings >= 0 ? 
                    'Keep up the good work with your financial management' : 
                    'Focus on reducing expenses or increasing income to improve your financial health'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
