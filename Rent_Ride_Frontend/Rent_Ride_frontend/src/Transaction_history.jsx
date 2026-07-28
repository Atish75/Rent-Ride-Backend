import React, { useState, useEffect } from 'react';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/transactions/");
      const data = await res.json();
      setTransactions(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h2>💳 Transaction History & Records</h2>
      
      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p>Koi transactions record nahi mile.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2", textAlign: "left" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Txn ID</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Car ID / Name</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Amount</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Payment ID</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Status</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>#{txn.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{txn.car_name || `Car #${txn.car}`}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>₹{txn.amount}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{txn.payment_id || "N/A"}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd", fontWeight: "bold", color: txn.status === "SUCCESS" ? "green" : "orange" }}>
                  {txn.status}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {new Date(txn.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}