import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Calendar, DollarSign, Activity, CheckCircle, Clock, XCircle, ChevronRight, Search } from 'lucide-react';
import './WalletTable.css';
import adminWalletService from '../../../services/adminWalletService';

const WalletTable = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [transactions, setTransactions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletData, setWalletData] = useState({
    mainBalance: 673412.66,
    walletBalance: 0,
    cardHolder: 'Samantha Anderson',
    cardNumber: '**** **** **** 1234',
    validThru: '08/21',
    balanceChange: '+0.8%'
  });

  // Fetch admin wallet balance
  useEffect(() => {
    const fetchAdminBalance = async () => {
      try {
        const response = await adminWalletService.getAdminBalance();
        console.log('📊 Full Admin balance response:', response);
        console.log('📊 Response type:', typeof response);
        console.log('📊 Response.data:', response?.data);
        console.log('📊 Response.data.balance:', response?.data?.balance);
        
        // Check different possible structures
        let balance = null;
        
        if (response?.data?.balance !== undefined) {
          balance = response.data.balance;
        } else if (response?.balance !== undefined) {
          balance = response.balance;
        }
        
        console.log('💰 Extracted balance:', balance);
        
        if (balance !== null) {
          setWalletData(prevData => ({
            ...prevData,
            walletBalance: balance
          }));
          console.log('✅ Admin balance updated to:', balance);
        } else {
          console.error('⚠️ Could not extract balance from response');
        }
      } catch (error) {
        console.error('❌ Failed to fetch admin balance:', error);
      }
    };

    fetchAdminBalance();
  }, []);

  // Fetch transactions when page changes OR search query changes
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`🔄 Fetching transactions - page: ${currentPage}, size: ${itemsPerPage}, search: "${searchQuery}"`);
        
        let response;
        
        // Use search API if search query exists, otherwise use regular API
        if (searchQuery && searchQuery.trim() !== '') {
          response = await adminWalletService.searchAdminTransactions(searchQuery.trim(), {
            page: currentPage - 1,
            size: itemsPerPage
          });
        } else {
          response = await adminWalletService.getAdminTransactions({
            page: currentPage - 1,
            size: itemsPerPage
          });
        }
        
        console.log('📦 Full Transactions response:', response);
        console.log('📦 Response keys:', Object.keys(response));
        console.log('📦 Response.content:', response?.content);
        console.log('📦 Response.data:', response?.data);
        
        // Try multiple possible structures
        let content, pageInfo;
        
        if (response?.data?.content) {
          // Structure: { data: { content: [...], page: {...} } }
          content = response.data.content;
          pageInfo = response.data.page;
        } else if (response?.content) {
          // Structure: { content: [...], page: {...} }
          content = response.content;
          pageInfo = response.page;
        } else {
          console.warn('⚠️ Could not parse response structure');
          setTransactions([]);
          setTotalPages(1);
          setTotalElements(0);
          setLoading(false);
          return;
        }
        
        setTransactions(content || []);
        setTotalPages(pageInfo?.totalPages || 1);
        setTotalElements(pageInfo?.totalElements || 0);
        
        console.log(`✅ Loaded ${content?.length || 0} transactions`);
        console.log(`📊 Total pages: ${pageInfo?.totalPages}, Total elements: ${pageInfo?.totalElements}`);
        
      } catch (err) {
        console.error('❌ Failed to fetch transactions:', err);
        console.error('❌ Error details:', err.response);
        setError('Failed to load transactions. Please try again.');
        setTransactions([]);
        setTotalPages(1);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, itemsPerPage, searchQuery]); // Added searchQuery to dependencies

  // Fetch recent invoices
  useEffect(() => {
    const fetchRecentInvoices = async () => {
      try {
        console.log('🔄 Fetching recent invoices...');
        
        const response = await adminWalletService.getRecentInvoices(4);
        
        console.log('📋 Recent invoices response:', response);
        
        if (response?.data) {
          setRecentInvoices(response.data);
          console.log(`✅ Loaded ${response.data.length} recent invoices`);
        } else if (Array.isArray(response)) {
          setRecentInvoices(response);
          console.log(`✅ Loaded ${response.length} recent invoices`);
        } else {
          console.warn('⚠️ No invoices in response');
          setRecentInvoices([]);
        }
      } catch (err) {
        console.error('❌ Failed to fetch recent invoices:', err);
        setRecentInvoices([]);
      }
    };

    fetchRecentInvoices();
  }, []);

  // Mock recent invoices
  const [recentInvoices, setRecentInvoices] = useState([
    { id: 1, name: 'Stevan Store', time: '1h ago', amount: 562 },
    { id: 2, name: 'David Ignis', time: '2h ago', amount: 672 },
    { id: 3, name: 'Olivia Johan', time: '3h ago', amount: 769 },
    { id: 4, name: 'Melanie Wong', time: '5h ago', amount: 45 }
  ]);

  // Calculate earning categories
  const earningCategories = {
    income: 30,
    expense: 46,
    unknown: 24
  };

  // Mock chart data for balance trend
  const balanceTrend = [
    { day: 'Sun', income: 4000, expense: 2400 },
    { day: 'Mon', income: 3000, expense: 1398 },
    { day: 'Tue', income: 5000, expense: 3800 },
    { day: 'Wed', income: 2780, expense: 3908 },
    { day: 'Thu', income: 4890, expense: 2800 },
    { day: 'Fri', income: 3390, expense: 3800 },
    { day: 'Sat', income: 4490, expense: 4300 }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return formatDate(dateString);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getTypeIcon = (type) => {
    const typeMap = {
      'DEPOSIT': <ArrowUpCircle size={16} className="icon-deposit" />,
      'WITHDRAWAL': <ArrowDownCircle size={16} className="icon-withdrawal" />,
      'ORDER_PAYMENT': <DollarSign size={16} className="icon-payment" />,
      'REFUND': <TrendingUp size={16} className="icon-refund" />,
      'PAYMENT_TO_SELLER': <ArrowDownCircle size={16} className="icon-payment-seller" />,
      'PLATFORM_FEE': <Activity size={16} className="icon-platform-fee" />
    };
    return typeMap[type] || <Activity size={16} />;
  };

  const getTransactionSign = (type) => {
    // Positive: money in, Negative: money out
    const positiveTypes = ['DEPOSIT', 'REFUND'];
    return positiveTypes.includes(type) ? '+' : '-';
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      'DEPOSIT': 'Deposit',
      'WITHDRAWAL': 'Withdrawal',
      'ORDER_PAYMENT': 'Order Payment',
      'REFUND': 'Refund',
      'PAYMENT_TO_SELLER': 'Payment to Seller',
      'PLATFORM_FEE': 'Platform Fee'
    };
    return labels[type] || type;
  };

  const getAmountColorClass = (type) => {
    // Red: Withdrawal, Payment to Seller
    if (type === 'WITHDRAWAL' || type === 'PAYMENT_TO_SELLER') {
      return 'amount-red';
    }
    // Blue: Platform Fee
    if (type === 'PLATFORM_FEE') {
      return 'amount-blue';
    }
    // Black (normal): Deposit, Order Payment, Refund
    return 'amount-normal';
  };

  const handleTopUp = () => {
    console.log('Top Up clicked');
    // TODO: Open modal or navigate to top up page
  };

  const handleWithdraw = () => {
    console.log('Withdraw clicked');
    // TODO: Open modal or navigate to withdraw page
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Reset to first page when searching
    setCurrentPage(1);
  };

  const filterTransactions = () => {
    // TODO: Filter by active tab (monthly/weekly/today)
    return transactions;
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`wallet-page-number ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="wallet-container">
      {/* Top Section */}
      <div className="wallet-top-section">
        {/* Left - Transaction History */}
        <div className="payment-history-card">
          <div className="payment-history-header">
            <div>
              <h3 className="section-title">Transaction History</h3>
              <p className="section-subtitle">View all your wallet transactions</p>
            </div>
            <div className="wallet-search-container">
              <div className="wallet-search-box">
                <Search size={20} className="wallet-search-icon" />
                <input
                  type="text"
                  placeholder="Search by ID, description, order ID, date..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="wallet-search-input"
                />
              </div>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="transaction-table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Order ID</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{ fontSize: '16px', color: '#64748b' }}>Loading transactions...</div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{ fontSize: '16px', color: '#ef4444' }}>{error}</div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                      <div style={{ fontSize: '16px', color: '#64748b' }}>No transactions found</div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="td-id">#{transaction.id}</td>
                      <td className="td-type">
                        <div className="type-cell">
                          {getTypeIcon(transaction.type)}
                          <span>{getTransactionTypeLabel(transaction.type)}</span>
                        </div>
                      </td>
                      <td className="td-description">{transaction.description}</td>
                      <td className="td-amount">
                        <span className={`amount-value ${getAmountColorClass(transaction.type)}`}>
                          {formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="td-order">
                        {transaction.orderId ? (
                          <span className="order-link">#{transaction.orderId}</span>
                        ) : (
                          <span className="no-order">-</span>
                        )}
                      </td>
                      <td className="td-date">{formatDate(transaction.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="wallet-pagination-container">
            <button 
              className="wallet-page-btn wallet-prev" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <div className="wallet-page-numbers">
              {renderPageNumbers()}
            </div>
            
            <button 
              className="wallet-page-btn wallet-next" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Right - Wallet Balance & Invoices */} 
        <div className="wallet-right-section">
          <div className="wallet-balance-card">
            <div className="wallet-card-icon">
              <div className="card-logo"></div>
            </div>
            <h2 className="wallet-amount">{formatCurrency(walletData.walletBalance)}</h2>
            <h2 className="wallet-label">Wallet Balance</h2>
            {/* <p className="wallet-change">
              <TrendingUp size={16} />
              {walletData.balanceChange} than last week
            </p> */}
            
            {/* Action Buttons */}
            <div className="wallet-actions">
              <button className="wallet-btn wallet-btn-topup" onClick={handleTopUp}>
                <div className="btn-icon">
                  <ArrowUpCircle size={20} />
                </div>
                <span>Top Up</span>
              </button>
              <button className="wallet-btn wallet-btn-withdraw" onClick={handleWithdraw}>
                <div className="btn-icon">
                  <ArrowDownCircle size={20} />
                </div>
                <span>Withdraw</span>
              </button>
            </div>
          </div>

          {/* Invoices Below Wallet Balance */}
          <div className="invoices-card">
            <div className="invoices-header">
              <h3 className="section-title">Recent Invoices</h3>
              <p className="section-subtitle">Latest transaction records</p>
            </div>

            <div className="invoices-list">
              {recentInvoices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  No recent invoices
                </div>
              ) : (
                recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="invoice-item">
                    {invoice.avatar ? (
                      <img 
                        src={invoice.avatar} 
                        alt={invoice.name} 
                        className="invoice-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(invoice.name)}&background=10b981&color=fff`;
                        }}
                      />
                    ) : (
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(invoice.name)}&background=10b981&color=fff`}
                        alt={invoice.name} 
                        className="invoice-avatar" 
                      />
                    )}
                    <div className="invoice-info">
                      <h4 className="invoice-name">{invoice.name}</h4>
                      <p className="invoice-time">{formatTimeAgo(invoice.createdAt)}</p>
                    </div>
                    <div className="invoice-amount">{formatCurrency(invoice.amount)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletTable;
