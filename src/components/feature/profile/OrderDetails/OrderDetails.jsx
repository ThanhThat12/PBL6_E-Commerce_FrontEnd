import React from "react";
import "./OrderDetails.css";


// For now, use mock data. In the future, fetch by orderId.
const mockOrders = {
  "#738": {
    id: "#738",
    date: "8 Sep, 2020",
    products: 5,
    billing: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    shipping: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    payment: "Paypal",
    subtotal: 135,
    discount: 0.1,
    shippingFee: 0,
    total: 121.5,
    statusStep: 2,
    statusList: ["Order received", "Processing", "On the way", "Delivered"],
    items: [
      { name: "Apple", price: 10, qty: 3, subtotal: 30, img: "https://cdn-icons-png.flaticon.com/512/135/135620.png" },
      { name: "Banana", price: 5, qty: 5, subtotal: 25, img: "https://cdn-icons-png.flaticon.com/512/135/135621.png" },
      { name: "Orange", price: 8, qty: 10, subtotal: 80, img: "https://cdn-icons-png.flaticon.com/512/135/135622.png" },
    ]
  },
  "#703": {
    id: "#703",
    date: "24 May, 2020",
    products: 1,
    billing: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    shipping: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    payment: "Credit Card",
    subtotal: 25,
    discount: 0,
    shippingFee: 0,
    total: 25,
    statusStep: 3,
    statusList: ["Order received", "Processing", "On the way", "Delivered"],
    items: [
      { name: "Milk", price: 25, qty: 1, subtotal: 25, img: "https://cdn-icons-png.flaticon.com/512/135/135620.png" },
    ]
  },
  "#130": {
    id: "#130",
    date: "22 Oct, 2020",
    products: 4,
    billing: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    shipping: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    payment: "Paypal",
    subtotal: 250,
    discount: 0.05,
    shippingFee: 0,
    total: 237.5,
    statusStep: 4,
    statusList: ["Order received", "Processing", "On the way", "Delivered"],
    items: [
      { name: "Bread", price: 50, qty: 2, subtotal: 100, img: "https://cdn-icons-png.flaticon.com/512/135/135620.png" },
      { name: "Eggs", price: 30, qty: 5, subtotal: 150, img: "https://cdn-icons-png.flaticon.com/512/135/135621.png" },
    ]
  },
  "#561": {
    id: "#561",
    date: "1 Feb, 2020",
    products: 1,
    billing: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    shipping: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    payment: "Paypal",
    subtotal: 35,
    discount: 0,
    shippingFee: 0,
    total: 35,
    statusStep: 4,
    statusList: ["Order received", "Processing", "On the way", "Delivered"],
    items: [
      { name: "Butter", price: 35, qty: 1, subtotal: 35, img: "https://cdn-icons-png.flaticon.com/512/135/135620.png" },
    ]
  },
  "#536": {
    id: "#536",
    date: "21 Sep, 2020",
    products: 13,
    billing: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    shipping: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    payment: "Paypal",
    subtotal: 578,
    discount: 0.15,
    shippingFee: 0,
    total: 491.3,
    statusStep: 4,
    statusList: ["Order received", "Processing", "On the way", "Delivered"],
    items: [
      { name: "Cheese", price: 40, qty: 10, subtotal: 400, img: "https://cdn-icons-png.flaticon.com/512/135/135620.png" },
      { name: "Yogurt", price: 18, qty: 3, subtotal: 54, img: "https://cdn-icons-png.flaticon.com/512/135/135621.png" },
      { name: "Milk", price: 12, qty: 10, subtotal: 120, img: "https://cdn-icons-png.flaticon.com/512/135/135622.png" },
      { name: "Butter", price: 4.7, qty: 1, subtotal: 4.7, img: "https://cdn-icons-png.flaticon.com/512/135/135622.png" },
    ]
  },
  "#492": {
    id: "#492",
    date: "22 Oct, 2020",
    products: 7,
    billing: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    shipping: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    payment: "Paypal",
    subtotal: 345,
    discount: 0.1,
    shippingFee: 0,
    total: 310.5,
    statusStep: 4,
    statusList: ["Order received", "Processing", "On the way", "Delivered"],
    items: [
      { name: "Eggs", price: 49.3, qty: 7, subtotal: 345, img: "https://cdn-icons-png.flaticon.com/512/135/135620.png" },
    ]
  },
  "#4152": {
    id: "#4152",
    date: "18 Mar, 2021",
    products: 13,
    billing: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    shipping: {
      name: "Dianne Russell",
      address: "4140 Parker Rd. Allentown, New Mexico 31134",
      email: "dianne.ressell@gmail.com",
      phone: "(671) 555-0110",
    },
    payment: "Paypal",
    subtotal: 578,
    discount: 0.2,
    shippingFee: 0,
    total: 462.4,
    statusStep: 2,
    statusList: ["Order received", "Processing", "On the way", "Delivered"],
    items: [
      { name: "Cheese", price: 40, qty: 10, subtotal: 400, img: "https://cdn-icons-png.flaticon.com/512/135/135620.png" },
      { name: "Yogurt", price: 18, qty: 3, subtotal: 54, img: "https://cdn-icons-png.flaticon.com/512/135/135621.png" },
      { name: "Milk", price: 12, qty: 10, subtotal: 120, img: "https://cdn-icons-png.flaticon.com/512/135/135622.png" },
      { name: "Butter", price: 4.7, qty: 1, subtotal: 4.7, img: "https://cdn-icons-png.flaticon.com/512/135/135622.png" },
    ]
  },
};

export default function OrderDetails({ orderId, onBack }) {
  // In the future, fetch order by orderId
  const order = mockOrders[orderId] || mockOrders["#4152"];
  return (
    <div className="order-details-main">
      <div className="order-details-header">
        <span>Order Details &bull; {order.date} &bull; {order.products} Products</span>
        <button className="order-back" onClick={onBack}>Back to List</button>
      </div>
      <div className="order-details-top">
        <div className="order-details-address">
          <div className="address-card">
            <div className="address-title">BILLING ADDRESS</div>
            <div className="address-name">{order.billing.name}</div>
            <div className="address-line">{order.billing.address}</div>
            <div className="address-label">EMAIL</div>
            <div className="address-value">{order.billing.email}</div>
            <div className="address-label">PHONE</div>
            <div className="address-value">{order.billing.phone}</div>
          </div>
          <div className="address-card">
            <div className="address-title">SHIPPING ADDRESS</div>
            <div className="address-name">{order.shipping.name}</div>
            <div className="address-line">{order.shipping.address}</div>
            <div className="address-label">EMAIL</div>
            <div className="address-value">{order.shipping.email}</div>
            <div className="address-label">PHONE</div>
            <div className="address-value">{order.shipping.phone}</div>
          </div>
        </div>
        <div className="order-details-summary">
          <div className="summary-row"><span>ORDER ID:</span> <span>{order.id}</span></div>
          <div className="summary-row"><span>PAYMENT METHOD:</span> <span>{order.payment}</span></div>
          <div className="summary-row"><span>Subtotal:</span> <span>${order.subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Discount:</span> <span>{order.discount * 100}%</span></div>
          <div className="summary-row"><span>Shipping:</span> <span>Free</span></div>
          <div className="summary-row total"><span>Total</span> <span>${order.total.toFixed(2)}</span></div>
        </div>
      </div>
      <div className="order-status-bar">
        <div className="order-status-progress">
          <div className="status-bar-bg"></div>
          <div
            className="status-bar-active"
            style={{
              width: `calc(${((order.statusStep - 1) / (order.statusList.length - 1)) * 100}% )`
            }}
          ></div>
          {order.statusList.map((label, idx) => {
            const isActive = idx + 1 <= order.statusStep;
            return (
              <div key={label} className={`status-step${isActive ? " active" : ""}`}> 
                <div className="status-circle-wrapper">
                  <div className={`status-circle${isActive ? " active" : ""}`}>{
                    isActive
                      ? (idx + 1 < order.statusStep ? <span>&#10003;</span> : <span>{`0${idx + 1}`}</span>)
                      : <span>{`0${idx + 1}`}</span>
                  }</div>
                  <div className="status-label">{label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <table className="order-items-table">
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>PRICE</th>
            <th>QUANTITY</th>
            <th>SUBTOTAL</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={idx}>
              <td className="item-product">
                <img src={item.img} alt={item.name} className="item-img" />
                {item.name}
              </td>
              <td>${item.price.toFixed(2)}</td>
              <td>x{item.qty}</td>
              <td>${item.subtotal.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
