const { prisma } = require("../../config/db")
const message = require("../../config/constant/message")
const { Cashfree } = require("cashfree-pg")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")

// Initialize Cashfree instance using environment variables
const cashfree = new Cashfree({
  XClientId: process.env.CASHFREE_APP_ID,
  XClientSecret: process.env.CASHFREE_SECRET_KEY,
  XEnvironment: process.env.CASHFREE_ENV === 'PRODUCTION' ? 'PRODUCTION' : 'SANDBOX'
});

// Log configuration for debugging
console.log('Cashfree Configuration:', {
  appId: process.env.CASHFREE_APP_ID,
  environment: process.env.CASHFREE_ENV,
  mode: process.env.CASHFREE_MODE
});


const initiatePayment = async (req, res) => {
  try {
    const { currency = "INR", receipt, notes = {}, type, amount, applicationId } = req.body; // ✅ Direct loanApplicationId

    console.log('Loan Application ID:', applicationId);

    // Only userId is needed from auth middleware
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID not found from token" });
    }
    console.log('Initiating payment for userId:', userId);

    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return res.status(500).json({
        message: "Cashfree configuration not found",
        data: { non_field_message: "Payment gateway not configured" },
      });
    }

    // Validate payment type
    if (!type || !["LOAN_FEE", "MEMBERSHIP", "DOCUMENT_FEE"].includes(type)) {
      return res.status(400).json({
        message: "Invalid payment type. Must be LOAN_FEE, DOCUMENT_FEE, or MEMBERSHIP",
        data: { type: "Invalid payment type" },
      });
    }

    // ✅ Validate loanApplicationId for loan-related payments
    if ((type === "LOAN_FEE" || type === "DOCUMENT_FEE") && !applicationId) {
      return res.status(400).json({
        message: "Loan application ID is required for loan and document fee payments",
        data: { loanApplicationId: "Required for loan-related payments" },
      });
    }

    // ✅ Validate that loan application exists if provided
    if (applicationId) {
      const loanApplication = await prisma.loanApplication.findUnique({
        where: { id: applicationId }
      });
      
      if (!loanApplication) {
        return res.status(404).json({
          message: "Loan application not found",
          data: { applicationId: "Invalid loan application ID" },
        });
      }
    }

    // Get payment configuration for the type
    let paymentConfig;
    if (type === "MEMBERSHIP") {
      const planType = notes.membershipType || "monthly";
      paymentConfig = await prisma.paymentConfig.findFirst({
        where: {
          type: "MEMBERSHIP",
          isActive: true,
          metadata: {
            path: ["planType"],
            equals: planType,
          },
        },
      });
    } else {
      paymentConfig = await prisma.paymentConfig.findFirst({
        where: {
          type: type,
          isActive: true,
        },
      });
    }

    if (!paymentConfig) {
      return res.status(400).json({
        message: "Payment configuration not found for this type",
        data: { type: "No active configuration found" },
      });
    }

    // Use amount from request body if provided, otherwise use config amount
    const finalAmount = amount || paymentConfig.amount;

    // For membership payments, check if user already has active membership
    if (type === "MEMBERSHIP") {
      const existingMembership = await prisma.membership.findFirst({
        where: {
          userId: userId,
          status: "ACTIVE",
        },
      });
      
      if (existingMembership) {
        return res.status(400).json({
          message: "User already has an active membership",
          data: { membership: "Active membership already exists" },
        });
      }
    }

    // Get user details for Cashfree session
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, mobile: true }
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        data: { non_field_message: "User not found" },
      });
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${userId}`;

    // Create Cashfree payment session for MODAL checkout (no return URLs needed)
    const sessionRequest = {
      order_id: orderId,
      order_amount: finalAmount,
      order_currency: currency,
      customer_details: {
        customer_id: `customer_${userId}`,
        customer_name: user.name,
        customer_email: user.email,
        customer_phone: user.mobile.startsWith('+91') ? user.mobile : `+91${user.mobile}`
      },
      order_note: `Payment for ${type} - Application ID: ${applicationId || 'N/A'}`,
      order_tags: {
        userId: userId.toString(),
        type: type,
        configId: paymentConfig.id.toString(),
        ...(applicationId && { applicationId: applicationId.toString() })
      }
    };

    try {
      const response = await cashfree.PGCreateOrder(sessionRequest);
      
      console.log('Cashfree session created:', response.data);

      // Save payment record in database
      const payment = await prisma.payment.create({
        data: {
          userId: userId,
          loanApplicationId: applicationId || null,
          cashfreeOrderId: orderId,
          paymentSessionId: response.data.payment_session_id,
          amount: finalAmount,
          currency,
          status: "CREATED",
          type: type,
          receipt: receipt || `receipt_${Date.now()}`,
          notes: {
            userId,
            type,
            configId: paymentConfig.id,
            ...(applicationId && { applicationId }),
            ...notes,
          },
        },
      });

      return res.status(201).json({
        message: "Payment initiated successfully",
        data: {
          orderId: orderId,
          payment_session_id: response.data.payment_session_id,
          amount: finalAmount,
          currency: currency,
          receipt: payment.receipt,
          paymentId: payment.id,
          type: payment.type,
          configAmount: finalAmount,
          // For modal checkout, only payment_session_id is needed
          order_status: response.data.order_status
        },
      });
    } catch (cashfreeError) {
      console.error("Cashfree API error:", cashfreeError);
      return res.status(500).json({
        message: "Unable to create payment session",
        data: { non_field_message: cashfreeError.message || "Cashfree API error" },
      });
    }
  } catch (error) {
    console.error("InitiatePayment error:", error);
    return res.status(500).json({
      message: "Unable to initiate payment",
      data: { non_field_message: error.message },
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { cashfreeOrderId, cf_payment_id, order_id, payment_status } = req.body;

    console.log('Verifying payment for order:', cashfreeOrderId || order_id, 'and payment:', cf_payment_id);

    const userId = req.user?.id;
    
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return res.status(500).json({
        message: "Cashfree configuration not found",
        data: { non_field_message: "Payment gateway not configured" },
      });
    }

    const orderIdToFind = cashfreeOrderId || order_id;

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: { 
        cashfreeOrderId: orderIdToFind,
        userId: userId
      },
      include: { 
        user: true,
        loanApplication: true
      },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
        data: { non_field_message: "Payment record not found" },
      });
    }

    // Verify payment with Cashfree API
    try {
      const response = await cashfree.PGOrderFetchPayments(orderIdToFind);
      const paymentDetails = response.data[0]; // Get first payment

      if (!paymentDetails) {
        return res.status(400).json({
          message: "Payment verification failed",
          data: { payment: "No payment details found from Cashfree" },
        });
      }

      console.log('Cashfree payment details:', paymentDetails);

      // Check payment status
      const isPaymentSuccessful = paymentDetails.payment_status === 'SUCCESS' || payment_status === 'SUCCESS';

      if (!isPaymentSuccessful) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "FAILED",
            cfPaymentId: paymentDetails.cf_payment_id || cf_payment_id,
            failureReason: paymentDetails.payment_message || "Payment failed",
          },
        });

        return res.status(400).json({
          message: "Payment verification failed",
          data: { payment: paymentDetails.payment_message || "Payment was not successful" },
        });
      }

    // Start transaction for payment verification
    const result = await prisma.$transaction(async (tx) => {
        // Update payment status to success
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            cfPaymentId: paymentDetails.cf_payment_id || cf_payment_id,
            cfOrderId: paymentDetails.order_id || orderIdToFind,
            paidAt: new Date(),
          },
        });

      // If this is a membership payment, create/update membership
      if (payment.type === "MEMBERSHIP") {
        const startDate = new Date();
        const endDate = new Date();
        const planType = payment.notes?.membershipType || "monthly";
        
        if (planType === "yearly") {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        const existingMembership = await tx.membership.findUnique({
          where: { userId: payment.userId },
        });

        if (existingMembership) {
          await tx.membership.update({
            where: { userId: payment.userId },
            data: {
              startDate,
              endDate,
              isActive: true,
              status: "ACTIVE",
            },
          });
        } else {
          await tx.membership.create({
            data: {
              userId: payment.userId,
              startDate,
              endDate,
              isActive: true,
              status: "ACTIVE",
            },
          });
        }
      }

      // ✅ If this is a loan fee payment, update loan application using loanApplicationId
      if ((payment.type === "LOAN_FEE" || payment.type === "DOCUMENT_FEE") && payment.loanApplicationId) {
        await tx.loanApplication.update({
          where: { id: payment.loanApplicationId },
          data: {
            paymentStatus: "paid"
          }
        });
        
        console.log(`Updated loan application ${payment.loanApplicationId} payment status to paid`);
      }

        return updatedPayment;
      });

      return res.status(200).json({
        message: "Payment verified successfully",
        data: {
          paymentId: result.id,
          status: result.status,
          amount: result.amount,
          type: result.type,
          paidAt: result.paidAt,
          loanApplicationId: result.loanApplicationId,
        },
      });

    } catch (cashfreeError) {
      console.error("Cashfree verification error:", cashfreeError);
      return res.status(500).json({
        message: "Unable to verify payment with Cashfree",
        data: { non_field_message: cashfreeError.message || "Cashfree API error" },
      });
    }
  } catch (error) {
    console.error("VerifyPayment error:", error);
    return res.status(500).json({
      message: "Unable to verify payment",
      data: { non_field_message: error.message },
    });
  }
};

// Webhook handler for Cashfree payment notifications
const handleWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;
    
    console.log('Cashfree webhook received:', { type, data });

    // Verify webhook signature (implement based on Cashfree documentation)
    // For now, we'll process the webhook without signature verification
    
    if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const { order } = data;
      
      const payment = await prisma.payment.findFirst({
        where: { cashfreeOrderId: order.order_id }
      });

      if (payment && payment.status !== 'SUCCESS') {
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "SUCCESS",
              cfPaymentId: data.payment?.cf_payment_id,
              paidAt: new Date(),
            },
          });

          // Update related entities based on payment type
          if (payment.type === "MEMBERSHIP") {
            const startDate = new Date();
            const endDate = new Date();
            const planType = payment.notes?.membershipType || "monthly";
            
            if (planType === "yearly") {
              endDate.setFullYear(endDate.getFullYear() + 1);
            } else {
              endDate.setMonth(endDate.getMonth() + 1);
            }

            const existingMembership = await tx.membership.findUnique({
              where: { userId: payment.userId },
            });

            if (existingMembership) {
              await tx.membership.update({
                where: { userId: payment.userId },
                data: {
                  startDate,
                  endDate,
                  isActive: true,
                  status: "ACTIVE",
                },
              });
            } else {
              await tx.membership.create({
                data: {
                  userId: payment.userId,
                  startDate,
                  endDate,
                  isActive: true,
                  status: "ACTIVE",
                },
              });
            }
          }

          if ((payment.type === "LOAN_FEE" || payment.type === "DOCUMENT_FEE") && payment.loanApplicationId) {
            await tx.loanApplication.update({
              where: { id: payment.loanApplicationId },
              data: {
                paymentStatus: "paid"
              }
            });
          }
        });

        console.log(`Payment ${payment.id} updated to SUCCESS via webhook`);
      }
    }

    // Always respond with 200 to acknowledge webhook receipt
    return res.status(200).json({ message: "Webhook processed successfully" });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};

// Return URL handler for frontend redirection
const handleReturnUrl = async (req, res) => {
  try {
    const { order_id, order_status, payment_session_id } = req.query;

    console.log('Return URL accessed:', { order_id, order_status, payment_session_id });

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: { 
        OR: [
          { cashfreeOrderId: order_id },
          { paymentSessionId: payment_session_id }
        ]
      },
      include: { user: true }
    });

    if (!payment) {
      return res.redirect(`${process.env.FRONTEND_URL}/?step=welcome&status=error&message=Payment not found`);
    }

    // Generate session token for frontend routing
    const sessionToken = jwt.sign(
      { 
        paymentId: payment.id, 
        orderId: order_id,
        userId: payment.userId,
        status: order_status 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    // Redirect to frontend with session information
    const redirectUrl = `${process.env.FRONTEND_URL}/?step=welcome&session=${sessionToken}&payment_status=${order_status}`;
    
    console.log('Redirecting to:', redirectUrl);
    
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error("Return URL handling error:", error);
    return res.redirect(`${process.env.FRONTEND_URL}/?step=welcome&status=error&message=Payment processing error`);
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params

    const payment = await prisma.payment.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
      },
    })

    if (!payment) {
      return res.status(404).json({
        message: message.paymentNotFound,
        data: { non_field_message: message.paymentNotFound },
      })
    }

    return res.status(200).json({
      message: message.dataFound,
      data: payment,
    })
  } catch (error) {
    console.error("GetPaymentStatus error:", error)
    return res.status(500).json({
      message: message.unableToGetResponse,
      data: { non_field_message: error.message },
    })
  }
}

const getAllPayments = async (req, res) => {
  try {
    const { status, mobileNumber, type, page = 1, limit = 10 } = req.query

    const whereClause = {}
    if (status) whereClause.status = status
    if (mobileNumber) whereClause.mobileNumber = mobileNumber
    if (type) whereClause.type = type

    const skip = (page - 1) * limit
    const take = Number.parseInt(limit)

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              mobile: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.payment.count({ where: whereClause }),
    ])

    return res.status(200).json({
      message: message.dataFound,
      data: {
        payments,
        pagination: {
          total,
          page: Number.parseInt(page),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    })
  } catch (error) {
    console.error("GetAllPayments error:", error)
    return res.status(500).json({
      message: message.unableToGetResponse,
      data: { non_field_message: error.message },
    })
  }
}

const getUserPayments = async (req, res) => {
  try {
    const userId = req.userId
    const { status, type, page = 1, limit = 10 } = req.query

    const whereClause = { userId }
    if (status) whereClause.status = status
    if (type) whereClause.type = type

    const skip = (page - 1) * limit
    const take = Number.parseInt(limit)

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.payment.count({ where: whereClause }),
    ])

    return res.status(200).json({
      message: message.dataFound,
      data: {
        payments,
        pagination: {
          total,
          page: Number.parseInt(page),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    })
  } catch (error) {
    console.error("GetUserPayments error:", error)
    return res.status(500).json({
      message: message.unableToGetResponse,
      data: { non_field_message: error.message },
    })
  }
}

const refundPayment = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, reason = "requested_by_customer" } = req.body

    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return res.status(500).json({
        message: "Cashfree configuration not found",
        data: { non_field_message: "Payment gateway not configured" },
      })
    }

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { id: id },
    })

    if (!payment) {
      return res.status(404).json({
        message: message.paymentNotFound,
        data: { non_field_message: message.paymentNotFound },
      })
    }

    if (payment.status !== "SUCCESS") {
      return res.status(400).json({
        message: message.paymentNotEligibleForRefund,
        data: { status: message.paymentNotEligibleForRefund },
      })
    }

    try {
      // Create refund with Cashfree
      const refundAmount = amount || payment.amount
      const refundRequest = {
        refund_amount: refundAmount,
        refund_id: `refund_${Date.now()}_${payment.id}`,
        refund_note: reason
      };

      const refundResponse = await cashfree.PGOrderCreateRefund(payment.cashfreeOrderId, refundRequest);

      // Start transaction for refund and membership update
      const result = await prisma.$transaction(async (tx) => {
        // Update payment record
        const updatedPayment = await tx.payment.update({
          where: { id: id },
          data: {
            status: "REFUNDED",
            refundId: refundResponse.data.refund_id,
            refundAmount: refundAmount,
            refundReason: reason,
            refundedAt: new Date(),
          },
        })

      // If this was a membership payment, deactivate membership
      if (payment.type === "MEMBERSHIP") {
        await tx.membership.updateMany({
          where: { userId: payment.userId },
          data: {
            isActive: false,
            status: "CANCELLED",
          },
        })
      }

        // If this was a loan fee payment, update loan application payment status back to pending
        if ((payment.type === "LOAN_FEE" || payment.type === "DOCUMENT_FEE") && payment.loanApplicationId) {
          await tx.loanApplication.update({
            where: { id: payment.loanApplicationId },
            data: {
              paymentStatus: "pending"
            }
          });
          
          console.log(`Updated loan application ${payment.loanApplicationId} payment status back to pending due to refund`);
        }

        return updatedPayment
      })

      return res.status(200).json({
        message: message.paymentRefunded,
        data: result,
      })

    } catch (cashfreeError) {
      console.error("Cashfree refund error:", cashfreeError);
      return res.status(500).json({
        message: "Unable to process refund with Cashfree",
        data: { non_field_message: cashfreeError.message || "Cashfree refund API error" },
      });
    }
  } catch (error) {
    console.error("RefundPayment error:", error)
    return res.status(500).json({
      message: message.unableToRefundPayment,
      data: { non_field_message: error.message },
    })
  }
  }

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        },
      },
    })

    if (!payment) {
      return res.status(404).json({
        message: message.paymentNotFound,
        data: { non_field_message: message.paymentNotFound },
      })
    }

    // Only allow deletion of failed or created payments
    // Don't allow deletion of successful payments (they should be refunded instead)
    if (payment.status === "SUCCESS") {
      return res.status(400).json({
        message: "Cannot delete successful payment. Please use refund instead.",
        data: { status: "Successful payments cannot be deleted" },
      })
    }

    // Delete the payment record
    await prisma.payment.delete({
      where: { id: id },
    })

    return res.status(200).json({
      message: "Payment deleted successfully",
      data: {
        deletedPaymentId: id,
        paymentStatus: payment.status,
        amount: payment.amount,
      },
    })
  } catch (error) {
    console.error("DeletePayment error:", error)
    return res.status(500).json({
      message: message.unableToGetResponse,
      data: { non_field_message: error.message },
    })
  }
}

module.exports = {
  // Payment Processing
  initiatePayment,
  verifyPayment,
  handleWebhook,
  handleReturnUrl,
  getPaymentStatus,
  getAllPayments,
  getUserPayments,
  refundPayment,
  deletePayment,
}


// const express = require("express")
// const router = express.Router()
// const {
//   // Middleware
// ,
//   // Payment Processing
//   initiatePayment,
//   verifyPayment,
//   getPaymentStatus,
//   getAllPayments,
//   getUserPayments,
//   refundPayment,
//   // Admin Settings
//   createPaymentSettings,
//   getAllPaymentSettings,
//   getSinglePaymentSettings,
//   updatePaymentSettings,
//   deletePaymentSettings,
//   togglePaymentSettings,
// } = require("../../controllers/admin/paymentController")


// // ==================== PAYMENT PROCESSING ROUTES ====================
// // POST /api/payments/initiate - Initiate payment (requires token)
// router.post("/initiate", initiatePayment)

// // POST /api/payments/verify - Verify payment (requires token)
// router.post("/verify", verifyPayment)

// // GET /api/payments/my-payments - Get user's payments (requires token)
// router.get("/my-payments", getUserPayments)

// router.get("/:id/status", getPaymentStatus)

// router.get("/",  getAllPayments)

// router.post("/:id/refund",  refundPayment)

// // ==================== ADMIN SETTINGS ROUTES ====================
// router.post("/settings",  createPaymentSettings)

// router.get("/settings",  getAllPaymentSettings)

// router.get("/settings/:id",  getSinglePaymentSettings)

// router.put("/settings/:id",  updatePaymentSettings)

// router.delete("/settings/:id",  deletePaymentSettings)

// router.patch("/settings/:id/toggle",  togglePaymentSettings)

// module.exports = router


const express = require("express")
const router = express.Router()
const {
  // Payment Processing
  initiatePayment,
  verifyPayment,
  handleWebhook,
  handleReturnUrl,
  getPaymentStatus,
  getAllPayments,
  getUserPayments,
  refundPayment,
  deletePayment,
} = require("../../controllers/admin/payment.Controller")
const { auth } = require("../../middleware/auth")
const { defaultTokenVerify, userVerifyToken } = require("../../middleware/verify")
const { requireRole } = require("../../middleware/rbac.middleware")

// ==================== PAYMENT PROCESSING ROUTES ====================

// POST /api/payments/webhook - Cashfree webhook handler (no auth required)
router.post("/webhook", handleWebhook)

// GET /api/payments/return - Cashfree return URL handler (no auth required)
router.get("/return", handleReturnUrl)

// GET /api/payments/:id - Get payment status (requires token)
router.get("/:id", userVerifyToken ,  getPaymentStatus)

// GET /api/payments/user/history - Get user's payment history (requires token)
router.get("/user/history", userVerifyToken , getUserPayments)

// POST /api/payments/:id/refund - Refund payment (admin only)
router.post("/:id/refund", userVerifyToken, requireRole(['ADMIN']), refundPayment)

// DELETE /api/payments/:id - Delete payment (admin only) - Only for failed/created payments
router.delete("/:id", userVerifyToken, requireRole(['ADMIN']), deletePayment)

// ==================== ADMIN PAYMENT ROUTES ====================

// GET /api/payments - Get all payments (admin only)
router.get("/", userVerifyToken, requireRole(['ADMIN', 'MANAGER']), getAllPayments)




module.exports = router
  