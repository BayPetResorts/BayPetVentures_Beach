require('dotenv').config();
const express = require('express');
const path = require('path');
const { google } = require('googleapis');
const { formatInTimeZone } = require('date-fns-tz');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve register page (before static middleware to ensure it's matched)
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// NOTE: Legacy pages no longer offered — keep routes to avoid breaking old links.
app.get('/luxury-boarding', (req, res) => {
  res.redirect(301, '/');
});

app.get('/doggie-daycare', (req, res) => {
  res.redirect(301, '/');
});

// Serve meet the owners page
app.get('/meet-the-owners', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'meet-the-owners.html'));
});

// Serve services page
app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'services.html'));
});

// Serve FAQ page
app.get('/faq', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'faq.html'));
});

// Serve contact page
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/why-we-are-better', (req, res) => {
  res.redirect(301, '/');
});

app.use(express.static(path.join(__dirname, 'public')));

// Google Sheets setup with OAuth 2.0
let sheets;
let oauth2Client;

// Public base URL (used for OAuth redirect URI defaults, etc.)
// Examples:
// - https://www.baypetventures.com
// - http://localhost:3000
const PUBLIC_BASE_URL =
  (process.env.PUBLIC_BASE_URL || '').trim() ||
  (process.env.NODE_ENV === 'production'
    ? 'https://www.baypetventures.com'
    : `http://localhost:${PORT}`);

const DEFAULT_OAUTH_REDIRECT_URI = `${PUBLIC_BASE_URL.replace(/\/+$/, '')}/oauth2callback`;

// Check if using OAuth 2.0 (preferred) or Service Account
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
  try {
    // OAuth 2.0 setup
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      (process.env.GOOGLE_REDIRECT_URI || '').trim() || DEFAULT_OAUTH_REDIRECT_URI
    );

    // Set the refresh token
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    // Create sheets client
    sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    console.log('✅ Google Sheets integration enabled (OAuth 2.0)');
  } catch (error) {
    console.warn('⚠️  OAuth 2.0 credentials not properly configured:', error.message);
  }
} else if (process.env.GOOGLE_SHEETS_CREDENTIALS && process.env.GOOGLE_SHEET_ID) {
  try {
    // Fallback to Service Account (if available)
    const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets integration enabled (Service Account)');
  } catch (error) {
    console.warn('⚠️  Google Sheets credentials not properly configured:', error.message);
  }
}

// API route for Meta Pixel event logging (development only)
app.post('/api/meta-event', (req, res) => {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production') {
    const { event, eventName, eventData, pageUrl } = req.body;
    
    // Format the log message
    const time = new Date().toLocaleTimeString();
    console.log(`\n📊 [Meta Event] ${time}`);
    console.log(`   Event: ${eventName || event}`);
    if (eventData && Object.keys(eventData).length > 0) {
      console.log(`   Data:`, JSON.stringify(eventData, null, 2).split('\n').map(line => `   ${line}`).join('\n'));
    }
    if (pageUrl) {
      console.log(`   Page: ${pageUrl}`);
    }
    console.log('');
  }
  
  res.json({ success: true });
});

// API route for contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { phone, firstName, lastName, email, dogName, breed, notes } = req.body;

    // Validate required fields
    if (!phone || !firstName || !lastName || !email || !dogName || !breed) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Vaccination files are optional - not storing files for now

    // If Google Sheets is configured, save to sheet
    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (sheets && sheetId) {
      console.log(`📊 Attempting to save to Google Sheets (Sheet ID: ${sheetId.substring(0, 10)}...)`);
      
      // Get the actual sheet name from the spreadsheet (more robust than hardcoding "Sheet1")
      let sheetName = 'Sheet1'; // Default fallback
      try {
        const spreadsheet = await sheets.spreadsheets.get({
          spreadsheetId: sheetId
        });
        if (spreadsheet.data.sheets && spreadsheet.data.sheets.length > 0) {
          sheetName = spreadsheet.data.sheets[0].properties.title;
          console.log(`📋 Using sheet name: "${sheetName}"`);
        }
      } catch (sheetNameError) {
        console.warn(`⚠️  Could not get sheet name, using default "Sheet1":`, sheetNameError.message);
      }

      // Refresh OAuth token if using OAuth 2.0
      if (oauth2Client) {
        try {
          const { credentials } = await oauth2Client.refreshAccessToken();
          oauth2Client.setCredentials(credentials);
        } catch (refreshError) {
          console.error('⚠️  Failed to refresh OAuth token:', refreshError.message);
          // Continue anyway - might still work with existing token
        }
      }

      // Check if headers exist, if not, add them
      const headerRange = `${sheetName}!A1:H1`;
      try {
        const headerResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: headerRange
        });

        if (!headerResponse.data.values || headerResponse.data.values.length === 0) {
          // Add headers
          await sheets.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: headerRange,
            valueInputOption: 'RAW',
            resource: {
              values: [['Timestamp', 'First Name', 'Last Name', 'Email', 'Phone', 'Dog Name', 'Breed', 'Notes']]
            }
          });
          
          // Format headers as bold
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheetId,
            resource: {
              requests: [{
                repeatCell: {
                  range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: 8
                  },
                  cell: {
                    userEnteredFormat: {
                      textFormat: {
                        bold: true
                      }
                    }
                  },
                  fields: 'userEnteredFormat.textFormat.bold'
                }
              }]
            }
          });
        }
      } catch (headerError) {
        console.warn('Could not check/add headers:', headerError.message);
      }

      // Generate PST timestamp
      const pstTimestamp = formatInTimeZone(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd HH:mm:ss zzz');

      // Append the new row - use A1 format which is more reliable for append
      // The append method will automatically append to the end of the sheet
      await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [[
            pstTimestamp,
            firstName,
            lastName,
            email,
            phone,
            dogName,
            breed,
            notes || ''
          ]]
        }
      });

      console.log(`✅ Contact form submission saved to Google Sheets: ${email}`);
    } else {
      // Log to console if Google Sheets is not configured
      const pstTimestamp = formatInTimeZone(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd HH:mm:ss zzz');
      console.log('📝 Contact Form Submission (not saved to Sheets):', {
        firstName,
        lastName,
        email,
        phone,
        dogName,
        breed,
        notes: notes || '(none)',
        timestamp: pstTimestamp
      });
    }

    res.json({ 
      success: true, 
      message: 'Thank you for your submission! We\'ll be in touch soon.' 
    });

  } catch (error) {
    console.error('❌ Error processing contact form:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status,
      statusText: error.statusText,
      errors: error.errors
    });
    
    // If it's a Google Sheets error, still return success to user
    // but log the error for debugging
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('⚠️  Could not connect to Google Sheets API. Check your credentials.');
    } else if (error.status === 403) {
      console.error('⚠️  Permission denied. Check that:');
      console.error('   1. Google Sheets API is enabled in your project');
      console.error('   2. The OAuth redirect URI matches: ' + (((process.env.GOOGLE_REDIRECT_URI || '').trim()) || DEFAULT_OAUTH_REDIRECT_URI));
      console.error('   3. Your refresh token is valid');
    }

    res.status(500).json({ 
      error: 'An error occurred while processing your submission. Please try again later.' 
    });
  }
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  const serverUrl = process.env.NODE_ENV === 'production' 
    ? 'https://baypetventures.com' 
    : `http://localhost:${PORT}`;
  console.log(`🚀 Bay Pet Ventures server running on ${serverUrl}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (!sheets) {
    console.log('ℹ️  Google Sheets not configured. Form submissions will be logged to console only.');
    console.log('   See SETUP.md for instructions on setting up Google Sheets integration.');
  }
});

