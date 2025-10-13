
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
          
          // console.log(`Updated loan application ${payment.loanApplicationId} payment status back to pending due to refund`);
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

// ==================== MEMBERSHIP ROUTES ====================

const getUserMembership = async (req, res) => {
  try {
    const userId = req.userId

    const membership = await prisma.membership.findUnique({
      where: { userId: userId },
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

    if (!membership) {
      return res.status(404).json({
        message: "No membership found",
        data: { non_field_message: "No membership found" },
      })
    }

    // Check if membership is expired
    const now = new Date()
    if (membership.endDate < now && membership.status === "ACTIVE") {
      // Update membership status to expired
      const updatedMembership = await prisma.membership.update({
        where: { id: membership.id },
        data: {
          status: "EXPIRED",
          isActive: false,
        },
      })

      return res.status(200).json({
        message: message.dataFound,
        data: updatedMembership,
      })
    }

    return res.status(200).json({
      message: message.dataFound,
      data: membership,
    })
  } catch (error) {
    console.error("GetUserMembership error:", error)
    return res.status(500).json({
      message: message.unableToGetResponse,
      data: { non_field_message: error.message },
    })
  }
}

const getAllMemberships = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const whereClause = {}
    if (status) whereClause.status = status

    const skip = (page - 1) * limit
    const take = Number.parseInt(limit)

    const [memberships, total] = await Promise.all([
      prisma.membership.findMany({
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
      prisma.membership.count({ where: whereClause }),
    ])

    return res.status(200).json({
      message: message.dataFound,
      data: {
        memberships,
        pagination: {
          total,
          page: Number.parseInt(page),
          limit: take,
          totalPages: Math.ceil(total / take),
        },
      },
    })
  } catch (error) {
    console.error("GetAllMemberships error:", error)
    return res.status(500).json({
      message: message.unableToGetResponse,
      data: { non_field_message: error.message },
    })
  }
}

module.exports = {
  // Payment Processing
  
  getAllPayments,
  getUserPayments,
  refundPayment,
  // Membership Management
  getUserMembership,
  getAllMemberships,
}
