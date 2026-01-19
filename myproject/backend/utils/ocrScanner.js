import vision from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';

const client = new vision.ImageAnnotatorClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

// Enhanced receipt parsing with AI
export const parseReceiptText = (rawText) => {
  const lines = rawText.split('\n').filter(line => line.trim());
  
  const result = {
    merchant: null,
    date: null,
    items: [],
    subtotal: null,
    tax: null,
    tip: null,
    total: null,
    currency: '$',
  };

  // Regex patterns for common receipt elements
  const currencyPatterns = {
    USD: /\$|USD/i,
    EUR: /€|EUR/i,
    GBP: /£|GBP/i,
  };

  const amountRegex = /(\d+[.,]\d{2})/g;
  const dateRegex = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/;
  const timeRegex = /(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/;

  // Extract currency
  for (const [curr, pattern] of Object.entries(currencyPatterns)) {
    if (pattern.test(rawText)) {
      result.currency = curr;
      break;
    }
  }

  // Extract date
  const dateMatch = rawText.match(dateRegex);
  if (dateMatch) {
    result.date = new Date(dateMatch[1]);
  }

  // Extract merchant name (usually first few lines)
  const merchantLine = lines[0];
  if (merchantLine && merchantLine.length < 50) {
    result.merchant = merchantLine.trim();
  }

  // Extract items and amounts
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const amounts = line.match(amountRegex);

    // Look for item lines (contain text + price)
    if (amounts && amounts.length > 0 && line.length > 5) {
      const price = parseFloat(amounts[amounts.length - 1].replace(/[,]/g, ''));
      
      // Skip if it's a total line
      if (!/(total|subtotal|tax|tip|amount\s*due)/i.test(line)) {
        const itemName = line.replace(amountRegex, '').trim();
        if (itemName.length > 0 && itemName.length < 100) {
          result.items.push({
            name: itemName,
            price: parseFloat(price.toFixed(2)),
          });
        }
      }
    }

    // Extract totals
    if (/^subtotal/i.test(line.trim()) || /^sub\s*total/i.test(line.trim())) {
      const match = line.match(amountRegex);
      if (match) {
        result.subtotal = parseFloat(match[match.length - 1].replace(/[,]/g, ''));
      }
    }

    if (/^tax|^gst|^vat/i.test(line.trim())) {
      const match = line.match(amountRegex);
      if (match) {
        result.tax = {
          amount: parseFloat(match[match.length - 1].replace(/[,]/g, '')),
          splitMethod: 'proportional',
        };
      }
    }

    if (/^tip|^gratuity/i.test(line.trim())) {
      const match = line.match(amountRegex);
      if (match) {
        result.tip = {
          amount: parseFloat(match[match.length - 1].replace(/[,]/g, '')),
          splitMethod: 'proportional',
        };
      }
    }

    if (/^total|^amount\s*due|^balance/i.test(line.trim())) {
      const match = line.match(amountRegex);
      if (match) {
        result.total = parseFloat(match[match.length - 1].replace(/[,]/g, ''));
      }
    }
  }

  // Calculate confidence score
  let confidenceScore = 50; // Base score
  if (result.merchant) confidenceScore += 10;
  if (result.date) confidenceScore += 10;
  if (result.items.length > 0) confidenceScore += 15;
  if (result.total) confidenceScore += 15;
  if (result.tax) confidenceScore += 10;

  result.ocrConfidence = Math.min(confidenceScore, 100);

  return result;
};

// OCR processing using Google Cloud Vision
export const scanReceiptOCR = async (imagePath) => {
  try {
    const request = {
      image: { content: fs.readFileSync(imagePath) },
    };

    const [result] = await client.textDetection(request);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      return {
        success: false,
        message: 'No text detected in image',
        ocrConfidence: 0,
      };
    }

    // Get full text
    const fullText = detections[0].description;
    
    // Parse the receipt
    const parsedData = parseReceiptText(fullText);
    
    // Image enhancement would happen here in production
    // This is a simplified version

    return {
      success: true,
      data: parsedData,
      rawOCRText: fullText,
      message: 'Receipt scanned successfully',
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      success: false,
      message: 'Failed to process image',
      error: error.message,
    };
  }
};

// Enhanced receipt analysis with confidence scoring
export const analyzeReceiptQuality = (imagePath) => {
  // This would integrate with image quality assessment
  // For now, return a basic quality score
  try {
    const stats = fs.statSync(imagePath);
    const fileSize = stats.size;

    let qualityScore = 70;

    // Evaluate based on file size (too small = poor quality)
    if (fileSize < 50000) qualityScore -= 20;
    else if (fileSize > 5000000) qualityScore -= 10;

    return {
      qualityScore: Math.max(0, Math.min(100, qualityScore)),
      fileSize: fileSize,
      recommendation: qualityScore >= 70 ? 'Ready to scan' : 'Consider retaking photo',
    };
  } catch (error) {
    return {
      qualityScore: 0,
      error: 'Unable to assess image quality',
    };
  }
};
