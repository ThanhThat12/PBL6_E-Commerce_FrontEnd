import React from "react";

import colorPattern from "../../../../styles/colorPattern";



const mockOrders = {
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

export default function OrderDetails({ orderId = "#4152", onBack }) {
  const order = mockOrders[orderId] || mockOrders["#4152"];

  return (
    <div style={{ 
      background: colorPattern.backgroundGray, 
      minHeight: "100vh", 
      padding: "32px 24px"
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div>
            <h1 style={{ 
              fontSize: "2rem", 
              fontWeight: "700", 
              color: colorPattern.text,
              margin: "0 0 8px 0"
            }}>
              Order Details
            </h1>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px",
              color: colorPattern.textLight,
              fontSize: "0.95rem"
            }}>
              <span style={{ 
                background: colorPattern.primary,
                color: colorPattern.textWhite,
                padding: "4px 12px",
                borderRadius: "6px",
                fontWeight: "600"
              }}>
                {order.id}
              </span>
              <span>•</span>
              <span>{order.date}</span>
              <span>•</span>
              <span>{order.products} Products</span>
            </div>
          </div>
          <button
            onClick={onBack}
            style={{
              background: colorPattern.secondary,
              color: colorPattern.textWhite,
              border: "none",
              borderRadius: "10px",
              padding: "12px 28px",
              fontWeight: "600",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: `0 4px 12px ${colorPattern.secondary}30`
            }}
            onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
          >
            ← Back to List
          </button>
        </div>

        {/* Order Status */}
        <div style={{ 
          background: colorPattern.background,
          borderRadius: "16px",
          padding: "40px 32px",
          marginBottom: "24px",
          boxShadow: `0 2px 8px ${colorPattern.shadow}`,
          border: `1px solid ${colorPattern.border}`
        }}>
          <h3 style={{ 
            fontSize: "1.1rem", 
            fontWeight: "600", 
            color: colorPattern.text,
            marginBottom: "32px",
            textAlign: "center"
          }}>
            Order Status
          </h3>
          <div style={{ position: "relative" }}>
            {/* Progress Line */}
            <div style={{ 
              position: "absolute",
              top: "32px",
              left: "0",
              right: "0",
              height: "3px",
              display: "flex",
              alignItems: "center",
              paddingLeft: `calc(50% / ${order.statusList.length})`,
              paddingRight: `calc(50% / ${order.statusList.length})`
            }}>
              <div style={{ 
                width: "100%",
                height: "3px",
                background: colorPattern.borderLight,
                borderRadius: "2px"
              }}>
                <div style={{ 
                  height: "100%",
                  width: `${((order.statusStep - 1) / (order.statusList.length - 1)) * 100}%`,
                  background: `linear-gradient(90deg, ${colorPattern.primary}, ${colorPattern.primaryLight})`,
                  borderRadius: "2px",
                  transition: "width 0.7s ease-out",
                  boxShadow: `0 0 12px ${colorPattern.primary}40`
                }} />
              </div>
            </div>

            {/* Status Steps */}
            <div style={{ 
              position: "relative",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start"
            }}>
              {order.statusList.map((label, idx) => {
                const isActive = idx + 1 <= order.statusStep;
                const isCompleted = idx + 1 < order.statusStep;
                const isCurrent = idx + 1 === order.statusStep;
                
                return (
                  <div key={label} style={{ 
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: 0
                  }}>
                    {/* Circle */}
                    <div style={{ 
                      position: "relative",
                      marginBottom: "16px",
                      transform: isCurrent ? "scale(1.1)" : "scale(1)",
                      transition: "transform 0.3s"
                    }}>
                      {isCurrent && (
                        <div style={{
                          position: "absolute",
                          inset: "-6px",
                          borderRadius: "50%",
                          background: `radial-gradient(circle, ${colorPattern.primaryLight}30, transparent 70%)`,
                          animation: "pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                        }} />
                      )}
                      
                      <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: isCompleted 
                          ? `linear-gradient(135deg, ${colorPattern.accent}, ${colorPattern.accentDark})`
                          : isActive 
                            ? `linear-gradient(135deg, ${colorPattern.primary}, ${colorPattern.primaryLight})`
                            : colorPattern.background,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: isActive ? "1.75rem" : "1.5rem",
                        color: isActive ? colorPattern.textWhite : colorPattern.textMuted,
                        boxShadow: isActive 
                          ? `0 4px 16px ${isCompleted ? colorPattern.accent : colorPattern.primary}40, 0 0 0 3px ${isCompleted ? colorPattern.accent : colorPattern.primary}15`
                          : `0 2px 4px ${colorPattern.shadow}, inset 0 0 0 2px ${colorPattern.border}`,
                        border: isActive ? "none" : `2px dashed ${colorPattern.border}`,
                        transition: "all 0.4s",
                        position: "relative",
                        zIndex: 1
                      }}>
                        {isCompleted ? (
                          <svg 
                            width="32" 
                            height="32" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke={colorPattern.textWhite}
                            strokeWidth="3" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                    </div>

                    {/* Label */}
                    <div style={{ 
                      color: isActive ? colorPattern.primary : colorPattern.textMuted,
                      fontWeight: isActive ? "600" : "500",
                      fontSize: isActive ? "0.95rem" : "0.9rem",
                      textAlign: "center",
                      maxWidth: "120px",
                      lineHeight: "1.4",
                      transition: "all 0.3s"
                    }}>
                      {label}
                    </div>

                    {/* Badge */}
                    {isActive && (
                      <div style={{
                        marginTop: "8px",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        background: isCompleted ? `${colorPattern.accent}15` : `${colorPattern.secondary}15`,
                        color: isCompleted ? colorPattern.accent : colorPattern.secondary,
                        border: `1px solid ${isCompleted ? colorPattern.accent : colorPattern.secondary}30`
                      }}>
                        {isCompleted ? "✓ Done" : isCurrent ? "● Active" : ""}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ 
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginBottom: "24px"
        }}>
          {/* Billing Address */}
          <div style={{
            background: colorPattern.background,
            borderRadius: "16px",
            padding: "28px",
            boxShadow: `0 2px 8px ${colorPattern.shadow}`,
            border: `1px solid ${colorPattern.border}`,
            transition: "transform 0.2s, box-shadow 0.2s"
          }}>
            <div style={{ 
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${colorPattern.primary}15, ${colorPattern.primaryLight}15)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem"
              }}>
                📄
              </div>
              <h3 style={{ 
                fontSize: "1.1rem",
                fontWeight: "700",
                color: colorPattern.text,
                margin: 0
              }}>
                Billing Address
              </h3>
            </div>
            
            <div style={{ 
              fontSize: "1.05rem",
              fontWeight: "600",
              color: colorPattern.primary,
              marginBottom: "8px"
            }}>
              {order.billing.name}
            </div>
            <div style={{ 
              color: colorPattern.textLight,
              lineHeight: "1.6",
              marginBottom: "16px"
            }}>
              {order.billing.address}
            </div>
            
            <div style={{ borderTop: `1px solid ${colorPattern.borderLight}`, paddingTop: "16px" }}>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ 
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: colorPattern.textMuted,
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Email
                </div>
                <div style={{ color: colorPattern.textLight }}>
                  {order.billing.email}
                </div>
              </div>
              <div>
                <div style={{ 
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: colorPattern.textMuted,
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Phone
                </div>
                <div style={{ color: colorPattern.textLight }}>
                  {order.billing.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div style={{
            background: colorPattern.background,
            borderRadius: "16px",
            padding: "28px",
            boxShadow: `0 2px 8px ${colorPattern.shadow}`,
            border: `1px solid ${colorPattern.border}`,
            transition: "transform 0.2s, box-shadow 0.2s"
          }}>
            <div style={{ 
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${colorPattern.accent}15, ${colorPattern.accentLight}15)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem"
              }}>
                📦
              </div>
              <h3 style={{ 
                fontSize: "1.1rem",
                fontWeight: "700",
                color: colorPattern.text,
                margin: 0
              }}>
                Shipping Address
              </h3>
            </div>
            
            <div style={{ 
              fontSize: "1.05rem",
              fontWeight: "600",
              color: colorPattern.primary,
              marginBottom: "8px"
            }}>
              {order.shipping.name}
            </div>
            <div style={{ 
              color: colorPattern.textLight,
              lineHeight: "1.6",
              marginBottom: "16px"
            }}>
              {order.shipping.address}
            </div>
            
            <div style={{ borderTop: `1px solid ${colorPattern.borderLight}`, paddingTop: "16px" }}>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ 
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: colorPattern.textMuted,
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Email
                </div>
                <div style={{ color: colorPattern.textLight }}>
                  {order.shipping.email}
                </div>
              </div>
              <div>
                <div style={{ 
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: colorPattern.textMuted,
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Phone
                </div>
                <div style={{ color: colorPattern.textLight }}>
                  {order.shipping.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div style={{
            background: `linear-gradient(135deg, ${colorPattern.primary}05, ${colorPattern.primaryLight}05)`,
            borderRadius: "16px",
            padding: "28px",
            boxShadow: `0 2px 8px ${colorPattern.shadow}`,
            border: `2px solid ${colorPattern.primary}20`
          }}>
            <div style={{ 
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: `linear-gradient(135deg, ${colorPattern.secondary}, ${colorPattern.secondaryLight})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
                boxShadow: `0 4px 12px ${colorPattern.secondary}30`
              }}>
                💰
              </div>
              <h3 style={{ 
                fontSize: "1.1rem",
                fontWeight: "700",
                color: colorPattern.text,
                margin: 0
              }}>
                Order Summary
              </h3>
            </div>
            
            <div style={{ marginBottom: "12px" }}>
              <div style={{ 
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                color: colorPattern.textLight
              }}>
                <span style={{ fontWeight: "500" }}>Order ID:</span>
                <span style={{ 
                  fontWeight: "700",
                  color: colorPattern.primary
                }}>
                  {order.id}
                </span>
              </div>
              <div style={{ 
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
                paddingBottom: "16px",
                borderBottom: `1px solid ${colorPattern.borderLight}`,
                color: colorPattern.textLight
              }}>
                <span style={{ fontWeight: "500" }}>Payment:</span>
                <span style={{ fontWeight: "600" }}>{order.payment}</span>
              </div>
            </div>

            <div style={{ 
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              color: colorPattern.textLight
            }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: "600" }}>${order.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ 
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "8px",
              color: colorPattern.discount
            }}>
              <span>Discount:</span>
              <span style={{ fontWeight: "600" }}>-{order.discount * 100}%</span>
            </div>
            <div style={{ 
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
              paddingBottom: "16px",
              borderBottom: `2px solid ${colorPattern.borderLight}`,
              color: colorPattern.success
            }}>
              <span>Shipping:</span>
              <span style={{ fontWeight: "600" }}>Free</span>
            </div>
            
            <div style={{ 
              display: "flex",
              justifyContent: "space-between",
              fontSize: "1.4rem",
              fontWeight: "700",
              color: colorPattern.secondary
            }}>
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div style={{
          background: colorPattern.background,
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: `0 2px 8px ${colorPattern.shadow}`,
          border: `1px solid ${colorPattern.border}`
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${colorPattern.primary}, ${colorPattern.primaryLight})`,
            padding: "20px 28px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{ fontSize: "1.5rem" }}>🛒</div>
            <h3 style={{ 
              fontSize: "1.2rem",
              fontWeight: "700",
              color: colorPattern.textWhite,
              margin: 0
            }}>
              Order Items
            </h3>
          </div>
          
          <div style={{ overflowX: "auto" }}>
            <table style={{ 
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr style={{ 
                  background: colorPattern.backgroundGray,
                  borderBottom: `2px solid ${colorPattern.border}`
                }}>
                  <th style={{ 
                    padding: "16px 28px",
                    textAlign: "left",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    color: colorPattern.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Product
                  </th>
                  <th style={{ 
                    padding: "16px 28px",
                    textAlign: "right",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    color: colorPattern.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Price
                  </th>
                  <th style={{ 
                    padding: "16px 28px",
                    textAlign: "center",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    color: colorPattern.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Quantity
                  </th>
                  <th style={{ 
                    padding: "16px 28px",
                    textAlign: "right",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    color: colorPattern.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} style={{ 
                    borderBottom: `1px solid ${colorPattern.borderLight}`,
                    transition: "background 0.2s"
                  }}>
                    <td style={{ 
                      padding: "20px 28px",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px"
                    }}>
                      <div style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "12px",
                        background: colorPattern.backgroundGray,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        border: `1px solid ${colorPattern.border}`
                      }}>
                        <img 
                          src={item.img} 
                          alt={item.name}
                          style={{ 
                            width: "36px",
                            height: "36px",
                            objectFit: "contain"
                          }}
                        />
                      </div>
                      <span style={{ 
                        fontWeight: "600",
                        color: colorPattern.text,
                        fontSize: "1rem"
                      }}>
                        {item.name}
                      </span>
                    </td>
                    <td style={{ 
                      padding: "20px 28px",
                      textAlign: "right",
                      color: colorPattern.price,
                      fontWeight: "600",
                      fontSize: "1rem"
                    }}>
                      ${item.price.toFixed(2)}
                    </td>
                    <td style={{ 
                      padding: "20px 28px",
                      textAlign: "center"
                    }}>
                      <span style={{
                        display: "inline-block",
                        padding: "6px 16px",
                        borderRadius: "8px",
                        background: colorPattern.backgroundGray,
                        border: `1px solid ${colorPattern.border}`,
                        fontWeight: "600",
                        color: colorPattern.text
                      }}>
                        ×{item.qty}
                      </span>
                    </td>
                    <td style={{ 
                      padding: "20px 28px",
                      textAlign: "right",
                      fontWeight: "700",
                      color: colorPattern.discount,
                      fontSize: "1.05rem"
                    }}>
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(0.95);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
}