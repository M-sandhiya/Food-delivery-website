import React, { useEffect, useState } from 'react';
import '../../styles/payout.css';

const mockPayoutData = {
  totalEarnings: 45000,
  thisMonth: 12000,
  pendingAmount: 3000,
  completedOrders: 120,
  lastPaidDate: '2025-06-15',
};

const Payout = () => {
  const [payout, setPayout] = useState({});

  useEffect(() => {
    // Simulate API response
    setPayout(mockPayoutData);
  }, []);

  const handleDownloadWord = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Payout Summary</title></head><body>
        <h2>Payout Summary</h2>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;">
          <tr><th>Summary Field</th><th>Value</th></tr>
          <tr><td>Total Earnings</td><td>₹ ${payout.totalEarnings}</td></tr>
          <tr><td>This Month</td><td>₹ ${payout.thisMonth}</td></tr>
          <tr><td>Pending Amount</td><td>₹ ${payout.pendingAmount}</td></tr>
          <tr><td>Completed Orders</td><td>${payout.completedOrders}</td></tr>
          <tr><td>Last Paid Date</td><td>${payout.lastPaidDate}</td></tr>
        </table>
      </body></html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'payout_summary.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="payout-container">
      <h2>💰 Payout Summary</h2>

      <div className="payout-cards">
        <div className="card">
          <h4>Total Earnings</h4>
          <p>₹ {payout.totalEarnings}</p>
        </div>
        <div className="card">
          <h4>This Month</h4>
          <p>₹ {payout.thisMonth}</p>
        </div>
        <div className="card">
          <h4>Pending Amount</h4>
          <p>₹ {payout.pendingAmount}</p>
        </div>
        <div className="card">
          <h4>Completed Orders</h4>
          <p>{payout.completedOrders}</p>
        </div>
        <div className="card">
          <h4>Last Paid Date</h4>
          <p>{payout.lastPaidDate}</p>
        </div>
      </div>

      <button className="download-btn" onClick={handleDownloadWord}>
        📄 Download Summary
      </button>
    </div>
  );
};

export default Payout;
