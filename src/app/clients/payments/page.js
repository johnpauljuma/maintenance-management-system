"use client";
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { Card, Typography, Row, Col, Form, Input, Button, message, Space, Alert, InputNumber } from "antd";
import { CreditCardOutlined, DollarOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const paymentMethods = [
  { id: "visa", name: "Visa", img: "/visa2.png", color: "#1a1f71" },
  { id: "mastercard", name: "MasterCard", img: "/masterCard.png", color: "#eb001b" },
  { id: "paypal", name: "PayPal", img: "/paypal.png", color: "#003087" },
  { id: "mpesa", name: "M-Pesa", img: "/mpesa.png", color: "#00a650" },
];

export default function PaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <div style={{ 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: "20px"
      }}>
        <CheckoutForm />
      </div>
    </Elements>
  );
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(null);
  const [form] = Form.useForm();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  // Auto-advance between card fields
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(value.replace(/(\d{4})/g, "$1 ").trim());
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setExpiry(value.replace(/(\d{2})(\d{0,2})/, "$1/$2"));
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvc(value);
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleSubmit = async () => {
    if (!amount || amount <= 0) {
      message.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      if (selectedMethod === "visa" || selectedMethod === "mastercard") {
        // Create Stripe card element from our inputs
        const cardElement = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
            },
          },
          value: {
            number: cardNumber.replace(/\s/g, ''),
            exp: expiry.replace(/\D/g, ''),
            cvc: cvc,
          }
        });

        // Mount the card element (hidden)
        cardElement.mount('#hidden-card-element');
        
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: { name: form.getFieldValue("cardholderName") },
        });

        if (error) throw error;

        const response = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            amount: Math.round(amount * 100), 
            paymentMethodId: paymentMethod.id 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Payment failed");
        }

        const data = await response.json();

        if (data.status === 'requires_action') {
          const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);
          if (confirmError) throw confirmError;
        }

        message.success("Payment successful!");
      } else if (selectedMethod === "mpesa") {
        const phoneNumber = form.getFieldValue("phoneNumber");
        if (!phoneNumber) {
          throw new Error("Please enter your M-Pesa phone number");
        }
        
        message.info("Sending M-Pesa payment request...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        message.success("M-Pesa payment request sent to your phone!");
      } else {
        message.info(`Redirecting to ${selectedMethod} to complete payment.`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      message.error(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaPayment = async () => {
    if (!amount || amount <= 0) {
      message.error("Please enter a valid amount");
      return;
    }
  
    const phoneNumber = form.getFieldValue("phoneNumber");
    if (!phoneNumber) {
      message.error("Please enter your phone number");
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          amount: Math.round(amount * 100), // Convert to cents
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }
  
      if (data.success) {
        message.success("Payment request sent! Check your phone to complete the transaction");
      } else {
        throw new Error(data.error || "Payment request failed");
      }
    } catch (error) {
      console.error("M-Pesa Error:", error);
      message.error(error.message || "Failed to initiate M-Pesa payment");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: "1000px", margin: "auto" }}
    >
      <Card
        bordered={false}
        style={{
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}
      >
        {/* Hidden Stripe element */}
        <div id="hidden-card-element" style={{ display: 'none' }}></div>

        {process.env.NODE_ENV === 'development' && (
          <Alert
            message="TEST MODE - Using test cards in backend"
            type="warning"
            showIcon
            style={{ margin: 0, borderRadius: 0 }}
          />
        )}

        <Row gutter={0}>
          <Col xs={24} md={12} style={{ padding: "32px", background: "#f9fafc" }}>
            <Title level={3} style={{ color: "#4a5568", marginBottom: "24px" }}>
              <span style={{ color: "#A61B22" }}>How</span> would you like to pay?
            </Title>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "16px" }}>
              {paymentMethods.map((method) => (
                <motion.div
                  key={method.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    hoverable
                    onClick={() => handleMethodSelect(method.id)}
                    style={{
                      borderRadius: "12px",
                      border: selectedMethod === method.id ? `2px solid ${method.color}` : "1px solid #e2e8f0",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      backgroundColor: selectedMethod === method.id ? `${method.color}10` : "white",
                    }}
                    bodyStyle={{ padding: "16px 8px" }}
                  >
                    <img 
                      src={method.img} 
                      alt={method.name} 
                      style={{ 
                        width: "60px", 
                        height: "40px", 
                        objectFit: "contain",
                        filter: selectedMethod === method.id ? "none" : "grayscale(20%)",
                        opacity: selectedMethod === method.id ? 1 : 0.8
                      }} 
                    />
                    <Text 
                      style={{ 
                        display: "block", 
                        marginTop: "8px",
                        color: selectedMethod === method.id ? method.color : "#4a5568",
                        fontWeight: selectedMethod === method.id ? "600" : "normal"
                      }}
                    >
                      {method.name}
                    </Text>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Col>

          <Col xs={24} md={12} style={{ padding: "32px" }}>
            {selectedMethod ? (
              <div>
                <Title level={4} style={{ color: "#4a5568", marginBottom: "24px" }}>
                  <span style={{ color: "#a61b22" }}>Your</span> Payment Details
                </Title>
                
                <Form form={form} layout="vertical">
                  <Form.Item
                    label="Amount"
                    rules={[{ required: true, message: "Please enter amount" }]}
                  >
                    <Input
                      prefix={<DollarOutlined style={{ color: "#a0aec0" }} />}
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="50.00"
                      style={{ height: "48px", borderRadius: "8px" }}
                    />
                  </Form.Item>

                  {(selectedMethod === "visa" || selectedMethod === "mastercard") && (
                    <>
                      <Form.Item 
                        label="Cardholder Name" 
                        name="cardholderName" 
                        rules={[{ required: true, message: "Please enter name" }]}
                      >
                        <Input 
                          placeholder="John Doe" 
                          style={{ height: "48px", borderRadius: "8px" }}
                        />
                      </Form.Item>
                      
                      <Form.Item label="Card Number" required>
                        <Input
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4242 4242 4242 4242"
                          style={{ height: "48px", borderRadius: "8px" }}
                          maxLength={19}
                        />
                      </Form.Item>

                      <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item label="Expiry Date" style={{ flex: 1 }} required>
                          <Input
                            value={expiry}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                            style={{ height: "48px", borderRadius: "8px" }}
                            maxLength={5}
                          />
                        </Form.Item>
                        <Form.Item label="CVC" style={{ flex: 1 }} required>
                          <Input
                            value={cvc}
                            onChange={handleCvcChange}
                            placeholder="123"
                            style={{ height: "48px", borderRadius: "8px" }}
                            maxLength={3}
                          />
                        </Form.Item>
                      </div>

                      {process.env.NODE_ENV === 'development' && (
                        <Alert
                          message="Test Card Instructions"
                          description={
                            <Space direction="vertical">
                              <Text>Use <strong>4242 4242 4242 4242</strong> for Visa</Text>
                              <Text>Use <strong>5555 5555 5555 4444</strong> for Mastercard</Text>
                              <Text>Any future expiry date and 3-digit CVC</Text>
                            </Space>
                          }
                          type="info"
                          showIcon
                          style={{ marginBottom: 16 }}
                        />
                      )}
                    </>
                  )}

                  {selectedMethod === "mpesa" && (
                    <Form.Item 
                      label="Phone Number" 
                      name="phoneNumber" 
                      rules={[{ required: true, message: "Please enter M-Pesa phone number" }]}
                    >
                      <Input 
                        placeholder="07XX XXX XXX" 
                        style={{ height: "48px", borderRadius: "8px" }}
                      />
                    </Form.Item>
                  )}

                  {selectedMethod === "paypal" && (
                    <Alert
                      message="You will be redirected to PayPal to complete payment"
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  )}

                  <Button 
                    type="primary" 
                    block 
                    onClick={selectedMethod === "mpesa" ? handleMpesaPayment : handleSubmit}
                    loading={loading}
                    disabled={!amount || (selectedMethod === "visa" && (!cardNumber || !expiry || !cvc))}
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      background: "#A61B22",
                      border: "none",
                      fontSize: "16px",
                      fontWeight: "500"
                    }}
                  >
                    {loading 
                      ? "Processing..." 
                      : `Pay ${amount || "0.00"} ${selectedMethod === "mpesa" ? "KES" : "USD"}`
                    }

                  </Button>
                </Form>
              </div>
            ) : (
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                justifyContent: "center",
                height: "100%",
                textAlign: "center"
              }}>
                <Text type="secondary" style={{ fontSize: "16px" }}>
                  Please select a payment method from the options
                </Text>
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
}


/*<Button 
                    type="primary" 
                    block 
                    onClick={selectedMethod === "mpesa" ? handleMpesaPayment : handleSubmit}
                    loading={loading}
                    disabled={!amount}
                    style={{
                      height: "48px",
                      borderRadius: "8px",
                      background: "#A61B22",
                      border: "none",
                      fontSize: "16px", 
                      fontWeight: "500"
                    }}
                  >
                    {loading ? "Processing..." : `Pay ${amount} KES`}
                  </Button>*/