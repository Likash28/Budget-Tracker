// Input validation utilities for amount fields

/**
 * Validates and formats amount input to allow only numbers and decimal point
 * @param {string} value - The input value
 * @returns {string} - Cleaned value with only numbers and decimal point
 */
export const validateAmountInput = (value) => {
  // Remove any non-numeric characters except decimal point
  let cleaned = value.replace(/[^0-9.]/g, '')
  
  // Ensure only one decimal point
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('')
  }
  
  // Limit to 2 decimal places
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2)
  }
  
  // Prevent multiple leading zeros
  if (cleaned.startsWith('00') && !cleaned.startsWith('0.')) {
    cleaned = cleaned.substring(1)
  }
  
  return cleaned
}

/**
 * Handles amount input change with validation
 * @param {Event} e - The input change event
 * @param {Function} setValue - State setter function
 * @param {string} fieldName - Name of the field being updated
 * @param {Object} currentForm - Current form state object
 */
export const handleAmountChange = (e, setValue, fieldName = 'amount', currentForm = null) => {
  const rawValue = e.target.value
  const validatedValue = validateAmountInput(rawValue)
  
  // Update the input element's data attributes for visual feedback
  const input = e.target
  if (validatedValue && validatedValue !== '') {
    input.setAttribute('data-valid', isValidAmount(validatedValue).toString())
    input.setAttribute('data-invalid', (!isValidAmount(validatedValue)).toString())
  } else {
    input.removeAttribute('data-valid')
    input.removeAttribute('data-invalid')
  }
  
  if (currentForm) {
    setValue({ ...currentForm, [fieldName]: validatedValue })
  } else {
    setValue(validatedValue)
  }
}

/**
 * Handles paste events to prevent invalid characters
 * @param {Event} e - The paste event
 */
export const handleAmountPaste = (e) => {
  e.preventDefault()
  const paste = (e.clipboardData || window.clipboardData).getData('text')
  const validatedPaste = validateAmountInput(paste)
  
  // Insert the validated text at the cursor position
  const input = e.target
  const start = input.selectionStart
  const end = input.selectionEnd
  const currentValue = input.value
  const newValue = currentValue.substring(0, start) + validatedPaste + currentValue.substring(end)
  const validatedNewValue = validateAmountInput(newValue)
  
  input.value = validatedNewValue
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

/**
 * Validates if the amount is a valid positive number
 * @param {string} value - The amount value
 * @returns {boolean} - True if valid positive number
 */
export const isValidAmount = (value) => {
  const num = parseFloat(value)
  return !isNaN(num) && num > 0 && num < 999999999.99
}

/**
 * Formats amount for display
 * @param {string|number} value - The amount value
 * @returns {string} - Formatted amount string
 */
export const formatAmountForDisplay = (value) => {
  if (!value || value === '') return ''
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  return num.toFixed(2)
}
