

const { prisma } = require("../../config/db")
const message = require("../../config/constant/message")

const createSalary = async (req, res) => {
  try {
    const {
      employmentType,
      minSalary,
      maxSalary,
      loanAmount,
      minCibilScore,
      maxCibilScore, // Optional - null for single CIBIL scores
      interestRate,
      emiOptions,
    } = req.body

    // Validate employment type
    if (!["salaried", "self-employed"].includes(employmentType)) {
      return res.status(400).json({
        message: message.invalidEmploymentType,
        data: { employmentType: message.invalidEmploymentType },
      })
    }

    // Validate CIBIL scores
    if (minCibilScore < 300 || minCibilScore > 900) {
      return res.status(400).json({
        message: "Invalid minimum CIBIL score. Must be between 300 and 900",
        data: { minCibilScore: "Invalid minimum CIBIL score" },
      })
    }

    if (maxCibilScore !== null && maxCibilScore !== undefined) {
      if (maxCibilScore < 300 || maxCibilScore > 900) {
        return res.status(400).json({
          message: "Invalid maximum CIBIL score. Must be between 300 and 900",
          data: { maxCibilScore: "Invalid maximum CIBIL score" },
        })
      }

      if (maxCibilScore <= minCibilScore) {
        return res.status(400).json({
          message: "Maximum CIBIL score must be greater than minimum CIBIL score",
          data: { maxCibilScore: "Maximum CIBIL score must be greater than minimum" },
        })
      }
    }

    // Validate other fields
    if (minSalary < 0) {
      return res.status(400).json({
        message: message.invalidMinSalary,
        data: { minSalary: message.invalidMinSalary },
      })
    }

    if (loanAmount < 0) {
      return res.status(400).json({
        message: message.invalidLoanAmount,
        data: { loanAmount: message.invalidLoanAmount },
      })
    }

    if (interestRate < 0 || interestRate > 100) {
      return res.status(400).json({
        message: "Invalid interest rate. Must be between 0 and 100",
        data: { interestRate: "Invalid interest rate" },
      })
    }

    if (maxSalary !== undefined && maxSalary !== null && maxSalary < minSalary) {
      return res.status(400).json({
        message: message.maxSalaryLessThanMin,
        data: { maxSalary: message.maxSalaryLessThanMin },
      })
    }

    // Check for exact duplicate
    const exactDuplicate = await prisma.loanConfig.findFirst({
      where: {
        employmentType,
        minCibilScore,
        maxCibilScore: maxCibilScore || null,
        minSalary,
        maxSalary: maxSalary || null,
        loanAmount,
      },
    })

    if (exactDuplicate) {
      return res.status(400).json({
        message: "Exact configuration already exists",
        data: { duplicate: "Configuration already exists" },
      })
    }

    // Check for overlapping CIBIL ranges
    const overlappingCibil = await prisma.loanConfig.findFirst({
      where: {
        employmentType,
        minSalary,
        maxSalary: maxSalary || null,
        OR: [
          // Case 1: New range overlaps with existing single score
          {
            maxCibilScore: null,
            minCibilScore: {
              gte: minCibilScore,
              lte: maxCibilScore || minCibilScore,
            },
          },
          // Case 2: New single score overlaps with existing range
          maxCibilScore === null || maxCibilScore === undefined
            ? {
                maxCibilScore: { not: null },
                minCibilScore: { lte: minCibilScore },
                maxCibilScore: { gte: minCibilScore },
              }
            : {},
          // Case 3: Range overlaps with range
          maxCibilScore !== null && maxCibilScore !== undefined
            ? {
                maxCibilScore: { not: null },
                OR: [
                  {
                    minCibilScore: { lte: minCibilScore },
                    maxCibilScore: { gte: minCibilScore },
                  },
                  {
                    minCibilScore: { lte: maxCibilScore },
                    maxCibilScore: { gte: maxCibilScore },
                  },
                  {
                    minCibilScore: { gte: minCibilScore },
                    maxCibilScore: { lte: maxCibilScore },
                  },
                ],
              }
            : {},
        ],
      },
    })

    if (overlappingCibil) {
      const existingRange = overlappingCibil.maxCibilScore
        ? `${overlappingCibil.minCibilScore}-${overlappingCibil.maxCibilScore}`
        : `${overlappingCibil.minCibilScore}`

      const newRange = maxCibilScore ? `${minCibilScore}-${maxCibilScore}` : `${minCibilScore}`

      return res.status(400).json({
        message: "CIBIL score range overlaps with existing configuration",
        data: {
          overlap: `New range ${newRange} overlaps with existing range ${existingRange} for the same salary range`,
        },
      })
    }

    const salary = await prisma.loanConfig.create({
      data: {
        employmentType,
        minSalary,
        maxSalary,
        loanAmount,
        minCibilScore,
        maxCibilScore,
        interestRate,
        emiOptions,
      },
    })

    return res.status(201).json({
      message: message.salaryCreated,
      data: {
        ...salary,
        cibilRange: maxCibilScore ? `${minCibilScore}-${maxCibilScore}` : `${minCibilScore}`,
      },
    })
  } catch (error) {
    console.error("CreateSalary error:", error)
    return res.status(500).json({
      message: message.unableToCreateSalary,
      data: { non_field_message: error.message },
    })
  }
}

const getAllSalaries = async (req, res) => {
  try {
    const salaries = await prisma.loanConfig.findMany({
      orderBy: [{ employmentType: "asc" }, { minCibilScore: "desc" }, { minSalary: "asc" }],
    })

    // Add formatted CIBIL range to response
    const formattedSalaries = salaries.map((salary) => ({
      ...salary,
      cibilRange: salary.maxCibilScore ? `${salary.minCibilScore}-${salary.maxCibilScore}` : `${salary.minCibilScore}`,
    }))

    return res.status(200).json({
      message: message.dataFound,
      data: formattedSalaries,
    })
  } catch (error) {
    console.error("GetAllSalaries error:", error)
    return res.status(500).json({
      message: message.unableToGetResponse,
      data: { non_field_message: error.message },
    })
  }
}

const getSingleSalary = async (req, res) => {
  try {
    const { id } = req.params
    const salary = await prisma.loanConfig.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!salary) {
      return res.status(404).json({
        message: message.salaryNotFound,
        data: { non_field_message: message.salaryNotFound },
      })
    }

    return res.status(200).json({
      message: message.dataFound,
      data: {
        ...salary,
        cibilRange: salary.maxCibilScore
          ? `${salary.minCibilScore}-${salary.maxCibilScore}`
          : `${salary.minCibilScore}`,
      },
    })
  } catch (error) {
    console.error("GetSingleSalary error:", error)
    return res.status(500).json({
      message: message.unableToGetResponse,
      data: { non_field_message: error.message },
    })
  }
}

const updateSalary = async (req, res) => {
  try {
    const { id } = req.params
    const { employmentType, minSalary, maxSalary, loanAmount, minCibilScore, maxCibilScore, interestRate, emiOptions } =
      req.body

    // Check if salary exists
    const existingSalary = await prisma.loanConfig.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!existingSalary) {
      return res.status(404).json({
        message: message.salaryNotFound,
        data: { non_field_message: message.salaryNotFound },
      })
    }

    // Validate employment type if provided
    if (employmentType !== undefined && !["salaried", "self-employed"].includes(employmentType)) {
      return res.status(400).json({
        message: message.invalidEmploymentType,
        data: { employmentType: message.invalidEmploymentType },
      })
    }

    // Determine the new values (use existing if not provided)
    const newEmploymentType = employmentType !== undefined ? employmentType : existingSalary.employmentType
    const newMinSalary = minSalary !== undefined ? minSalary : existingSalary.minSalary
    const newMaxSalary = maxSalary !== undefined ? maxSalary : existingSalary.maxSalary
    const newLoanAmount = loanAmount !== undefined ? loanAmount : existingSalary.loanAmount
    const newMinCibilScore = minCibilScore !== undefined ? minCibilScore : existingSalary.minCibilScore
    const newMaxCibilScore = maxCibilScore !== undefined ? maxCibilScore : existingSalary.maxCibilScore
    const newInterestRate = interestRate !== undefined ? interestRate : existingSalary.interestRate
    const newEmiOptions = emiOptions !== undefined ? emiOptions : existingSalary.emiOptions

    // Validate CIBIL scores
    if (newMinCibilScore < 300 || newMinCibilScore > 900) {
      return res.status(400).json({
        message: "Invalid minimum CIBIL score. Must be between 300 and 900",
        data: { minCibilScore: "Invalid minimum CIBIL score" },
      })
    }

    if (newMaxCibilScore !== null && newMaxCibilScore !== undefined) {
      if (newMaxCibilScore < 300 || newMaxCibilScore > 900) {
        return res.status(400).json({
          message: "Invalid maximum CIBIL score. Must be between 300 and 900",
          data: { maxCibilScore: "Invalid maximum CIBIL score" },
        })
      }

      if (newMaxCibilScore <= newMinCibilScore) {
        return res.status(400).json({
          message: "Maximum CIBIL score must be greater than minimum CIBIL score",
          data: { maxCibilScore: "Maximum CIBIL score must be greater than minimum" },
        })
      }
    }

    // Validate other fields
    if (newMinSalary < 0) {
      return res.status(400).json({
        message: message.invalidMinSalary,
        data: { minSalary: message.invalidMinSalary },
      })
    }

    if (newLoanAmount < 0) {
      return res.status(400).json({
        message: message.invalidLoanAmount,
        data: { loanAmount: message.invalidLoanAmount },
      })
    }

    if (newInterestRate < 0 || newInterestRate > 100) {
      return res.status(400).json({
        message: "Invalid interest rate. Must be between 0 and 100",
        data: { interestRate: "Invalid interest rate" },
      })
    }

    if (newMaxSalary !== null && newMaxSalary < newMinSalary) {
      return res.status(400).json({
        message: message.maxSalaryLessThanMin,
        data: { maxSalary: message.maxSalaryLessThanMin },
      })
    }

    // Check for exact duplicate (excluding current record)
    const exactDuplicate = await prisma.loanConfig.findFirst({
      where: {
        id: { not: Number.parseInt(id) },
        employmentType: newEmploymentType,
        minCibilScore: newMinCibilScore,
        maxCibilScore: newMaxCibilScore || null,
        minSalary: newMinSalary,
        maxSalary: newMaxSalary || null,
        loanAmount: newLoanAmount,
      },
    })

    if (exactDuplicate) {
      return res.status(400).json({
        message: "Exact configuration already exists",
        data: { duplicate: "Configuration already exists" },
      })
    }

    const updatedSalary = await prisma.loanConfig.update({
      where: { id: Number.parseInt(id) },
      data: {
        employmentType: newEmploymentType,
        minSalary: newMinSalary,
        maxSalary: newMaxSalary,
        loanAmount: newLoanAmount,
        minCibilScore: newMinCibilScore,
        maxCibilScore: newMaxCibilScore,
        interestRate: newInterestRate,
        emiOptions: newEmiOptions,
        updatedAt: new Date(),
      },
    })

    return res.status(200).json({
      message: message.salaryUpdated,
      data: {
        ...updatedSalary,
        cibilRange: updatedSalary.maxCibilScore
          ? `${updatedSalary.minCibilScore}-${updatedSalary.maxCibilScore}`
          : `${updatedSalary.minCibilScore}`,
      },
    })
  } catch (error) {
    console.error("UpdateSalary error:", error)
    return res.status(500).json({
      message: message.unableToUpdateSalary,
      data: { non_field_message: error.message },
    })
  }
}

const deleteSalary = async (req, res) => {
  try {
    const { id } = req.params

    // Check if salary exists
    const existingSalary = await prisma.loanConfig.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!existingSalary) {
      return res.status(404).json({
        message: message.salaryNotFound,
        data: { non_field_message: message.salaryNotFound },
      })
    }

    await prisma.loanConfig.delete({
      where: { id: Number.parseInt(id) },
    })

    return res.status(200).json({
      message: message.salaryDeleted,
      data: { non_field_message: message.salaryDeleted },
    })
  } catch (error) {
    console.error("DeleteSalary error:", error)
    return res.status(500).json({
      message: message.unableToDeleteSalary,
      data: { non_field_message: error.message },
    })
  }
}

const getSalaryByEmploymentType = async (req, res) => {
  try {
    const { employmentType } = req.params

    // Validate employment type
    if (!["salaried", "self-employed"].includes(employmentType)) {
      return res.status(400).json({
        message: message.invalidEmploymentType,
        data: { employmentType: message.invalidEmploymentType },
      })
    }

    const salaries = await prisma.loanConfig.findMany({
      where: { employmentType },
      orderBy: [{ minCibilScore: "desc" }, { minSalary: "asc" }],
    })

    if (salaries.length === 0) {
      return res.status(404).json({
        message: message.salaryNotFound,
        data: { non_field_message: `No salary found for ${employmentType} employment type` },
      })
    }

    const formattedSalaries = salaries.map((salary) => ({
      ...salary,
      cibilRange: salary.maxCibilScore ? `${salary.minCibilScore}-${salary.maxCibilScore}` : `${salary.minCibilScore}`,
    }))

    return res.status(200).json({
      message: message.dataFound,
      data: formattedSalaries,
    })
  } catch (error) {
    console.error("GetSalaryByEmploymentType error:", error)
    return res.status(500).json({
      message: message.unableToGetResponse,
      data: { non_field_message: error.message },
    })
  }
}

const getSalaryRanges = async (req, res) => {
  try {
    const { employmentType, minCibilScore } = req.query
    const whereClause = {}

    if (employmentType && ["salaried", "self-employed"].includes(employmentType)) {
      whereClause.employmentType = employmentType
    }

    if (minCibilScore) {
      whereClause.minCibilScore = Number.parseInt(minCibilScore)
    }

    const salaries = await prisma.loanConfig.findMany({
      where: whereClause,
      orderBy: [{ employmentType: "asc" }, { minCibilScore: "desc" }, { minSalary: "asc" }],
      select: {
        id: true,
        employmentType: true,
        minSalary: true,
        maxSalary: true,
        loanAmount: true,
        minCibilScore: true,
        maxCibilScore: true,
        interestRate: true,
        emiOptions: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Group by employment type and CIBIL score for better organization
    const groupedSalaries = salaries.reduce((acc, salary) => {
      const cibilRange = salary.maxCibilScore
        ? `${salary.minCibilScore}-${salary.maxCibilScore}`
        : `${salary.minCibilScore}`
      const key = `${salary.employmentType}_${cibilRange}`

      if (!acc[key]) {
        acc[key] = {
          employmentType: salary.employmentType,
          cibilRange: cibilRange,
          configurations: [],
        }
      }
      acc[key].configurations.push({
        ...salary,
        salaryRange: `${salary.minSalary} - ${salary.maxSalary || "unlimited"}`,
        cibilRange: cibilRange,
      })
      return acc
    }, {})

    return res.status(200).json({
      message: message.dataFound,
      data: {
        total: salaries.length,
        salaryRanges: Object.values(groupedSalaries),
      },
    })
  } catch (error) {
    console.error("GetSalaryRanges error:", error)
    return res.status(500).json({
      message: message.unableToGetResponse,
      data: { non_field_message: error.message },
    })
  }
}

module.exports = {
  createSalary,
  getAllSalaries,
  getSingleSalary,
  updateSalary,
  deleteSalary,
  getSalaryByEmploymentType,
  getSalaryRanges,
}



const Joi = require('joi');

const createSalarySchema = Joi.object({
  employmentType: Joi.string().valid('salaried', 'self-employed').required().messages({
    'any.only': 'Employment type must be either "salaried" or "self-employed"',
    'any.required': 'Employment type is required',
  }),
  minSalary: Joi.number().min(0).required().messages({
    'number.min': 'Minimum salary must be non-negative',
    'any.required': 'Minimum salary is required',
  }),
  maxSalary: Joi.alternatives().try(
    Joi.number().min(Joi.ref('minSalary')).messages({
      'number.min': 'Max salary must be greater than or equal to min salary',
    }),
    Joi.valid(null)
  ).optional().allow(null),
  loanAmount: Joi.number().min(0).required().messages({
    'number.min': 'Loan amount must be non-negative',
    'any.required': 'Loan amount is required',
  }),
  mincibilscore: Joi.number().min(300).max(900).required().messages({
    'number.min': 'Minimum CIBIL score must be at least 300',
    'number.max': 'Minimum CIBIL score must be at most 900',
    'any.required': 'Minimum CIBIL score is required',
  }),
  maxcibilscore: Joi.number().min(Joi.ref('mincibilscore')).max(900).required().messages({
    'number.min': 'Maximum CIBIL score must be greater than or equal to minimum CIBIL score',
    'number.max': 'Maximum CIBIL score must be at most 900',
    'any.required': 'Maximum CIBIL score is required',
  }),
});

const updateSalarySchema = Joi.object({
  employmentType: Joi.string().valid('salaried', 'self-employed').optional().messages({
    'any.only': 'Employment type must be either "salaried" or "self-employed"',
  }),
  minSalary: Joi.number().min(0).optional().messages({
    'number.min': 'Minimum salary must be non-negative',
  }),
  maxSalary: Joi.alternatives().try(
    Joi.number().optional().messages({
      'number.base': 'Max salary must be a number if provided',
    }),
    Joi.valid(null)
  ).optional().allow(null),
  loanAmount: Joi.number().min(0).optional().messages({
    'number.min': 'Loan amount must be non-negative',
  }),
  mincibilscore: Joi.number().min(300).max(900).optional().messages({
    'number.min': 'Minimum CIBIL score must be at least 300',
    'number.max': 'Minimum CIBIL score must be at most 900',
  }),
  maxcibilscore: Joi.number().min(Joi.ref('mincibilscore', { adjust: (value) => value || 300 })).max(900).optional().messages({
    'number.min': 'Maximum CIBIL score must be greater than or equal to minimum CIBIL score',
    'number.max': 'Maximum CIBIL score must be at most 900',
  }),
}).or('employmentType', 'minSalary', 'maxSalary', 'loanAmount', 'mincibilscore', 'maxcibilscore').messages({
  'object.missing': 'At least one field (employmentType, minSalary, maxSalary, loanAmount, mincibilscore, or maxcibilscore) must be provided for edit',
});

const deleteSalarySchema = Joi.object({}).unknown(true); // Allow empty body for DELETE

module.exports = { createSalarySchema, updateSalarySchema, deleteSalarySchema };



model LoanConfig {
  id             Int      @id @default(autoincrement())
  employmentType String
  minSalary      Float
  maxSalary      Float?
  loanAmount     Int
  minCibilScore  Int
  maxCibilScore  Int?
  interestRate   Float
  emiOptions     String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([employmentType, minCibilScore, maxCibilScore])
} 