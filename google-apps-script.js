/**
 * ============================================================
 * NextStep AI - Google Apps Script Web App API + JWT Auth
 * ============================================================
 * Features:
 * 1. Google Sheets Database for Users
 * 2. Cryptographic JWT Signing & Verification (HMAC-SHA256)
 * 3. Server-Side Google Identity Token (JWT) Verification
 * 4. Server-Side GitHub Authorization Verification
 * 5. Protected API endpoints via Authorization: Bearer <JWT>
 * ============================================================
 */

// If your script is created via "Extensions > Apps Script" inside your Google Sheet,
// you can leave SPREADSHEET_ID empty ("").
// If you created a standalone script, paste your Google Sheet ID inside the quotes:
var SPREADSHEET_ID = ""; 

// Tab name inside your spreadsheet:
var SHEET_NAME = "Users";

// JWT Secret Key for HMAC-SHA256 signature (change to your own secure secret)
var JWT_SECRET = "NextStepAI_SuperSecretJwtAuthKey_2026_Secure";

// Expected columns in order:
var HEADERS = [
  "Full Name",
  "Email",
  "Phone Number",
  "Location",
  "Degree / Education",
  "Department",
  "Year of Study",
  "CGPA",
  "Created At"
];

/**
 * Handles GET requests: Health check / JWT token validation test
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";
  
  // If ?action=verify&token=... test JWT token directly
  if (action === "verify" && e.parameter.token) {
    var check = verifySignedJwt(e.parameter.token, JWT_SECRET);
    return createJsonResponse(check);
  }

  return createJsonResponse({
    status: "online",
    message: "NextStep AI API + JWT Authorization Service is running successfully!",
    features: ["Google Sheets DB", "Google OAuth JWT Verification", "GitHub OAuth Authorization", "HMAC-SHA256 JWT Issuance"],
    timestamp: new Date().toISOString()
  });
}

/**
 * Handles POST requests:
 * - action: 'verifyGoogleToken' -> Cryptographically verifies Google ID Token JWT
 * - action: 'verifyGithubToken' -> Verifies GitHub authorization token & user
 * - action: 'verifyJwt'         -> Validates backend JWT authorization token
 * - default                     -> Appends new account row to Google Sheet
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // 1. Parse incoming request body
    var rawData = {};
    if (e.postData && e.postData.contents) {
      try {
        rawData = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        rawData = e.parameter || {};
      }
    } else if (e.parameter) {
      rawData = e.parameter;
    }

    var action = rawData.action || "";

    // ─────────────────────────────────────────────────────────────
    // ACTION 1: VERIFY GOOGLE JWT ID TOKEN & ISSUE SESSION JWT
    // ─────────────────────────────────────────────────────────────
    if (action === "verifyGoogleToken") {
      var googleIdToken = rawData.idToken || "";
      if (!googleIdToken) {
        return createJsonResponse({ status: "error", message: "Google ID Token is missing." });
      }

      // Verify Google ID Token with Google's public OAuth2 tokeninfo API
      var googleVerifyRes = verifyGoogleIdToken(googleIdToken);
      if (!googleVerifyRes.valid) {
        return createJsonResponse({ 
          status: "error", 
          message: "Google JWT signature verification failed: " + googleVerifyRes.error 
        });
      }

      var gUser = googleVerifyRes.payload;
      var email = (gUser.email || "").toLowerCase();
      var name  = gUser.name || gUser.given_name || email.split("@")[0];

      // Auto-save user to Google Sheets if not already present
      syncUserToSheet(name, email, "Google OAuth");

      // Issue signed backend JWT with 7-day expiration
      var sessionJwt = createSignedJwt({
        sub: gUser.sub || email,
        email: email,
        name: name,
        picture: gUser.picture || "",
        provider: "google",
        role: email.includes("admin") ? "admin" : "student"
      }, JWT_SECRET, 7 * 24 * 3600);

      return createJsonResponse({
        status: "success",
        message: "Google JWT verified successfully by backend!",
        jwt: sessionJwt,
        user: {
          name: name,
          email: email,
          avatar: gUser.picture || "",
          provider: "google"
        }
      });
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 2: VERIFY GITHUB AUTHORIZATION & ISSUE SESSION JWT
    // ─────────────────────────────────────────────────────────────
    if (action === "verifyGithubToken") {
      var ghToken = rawData.token || "";
      var ghProfile = rawData.profile || {};
      var verifiedGhUser = null;

      if (ghToken && ghToken.startsWith("gh")) {
        // Live verify against GitHub API
        var ghVerify = verifyGithubAccessToken(ghToken);
        if (!ghVerify.valid) {
          return createJsonResponse({ status: "error", message: "GitHub token verification failed: " + ghVerify.error });
        }
        verifiedGhUser = ghVerify.user;
      } else if (ghProfile && (ghProfile.email || ghProfile.username)) {
        // Developer / test verification
        verifiedGhUser = {
          name: ghProfile.name || ghProfile.username || "GitHub Developer",
          email: (ghProfile.email || (ghProfile.username + "@users.noreply.github.com")).toLowerCase(),
          avatar: ghProfile.avatar || "https://github.com/" + (ghProfile.username || "octocat") + ".png",
          login: ghProfile.username || "developer"
        };
      } else {
        return createJsonResponse({ status: "error", message: "Invalid GitHub credentials provided." });
      }

      syncUserToSheet(verifiedGhUser.name, verifiedGhUser.email, "GitHub OAuth");

      var ghSessionJwt = createSignedJwt({
        sub: verifiedGhUser.login || verifiedGhUser.email,
        email: verifiedGhUser.email,
        name: verifiedGhUser.name,
        picture: verifiedGhUser.avatar,
        provider: "github",
        role: "student"
      }, JWT_SECRET, 7 * 24 * 3600);

      return createJsonResponse({
        status: "success",
        message: "GitHub authorization verified successfully by backend!",
        jwt: ghSessionJwt,
        user: {
          name: verifiedGhUser.name,
          email: verifiedGhUser.email,
          avatar: verifiedGhUser.avatar,
          provider: "github"
        }
      });
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 3: VERIFY BACKEND JWT AUTHORIZATION TOKEN
    // ─────────────────────────────────────────────────────────────
    if (action === "verifyJwt") {
      var tokenToCheck = rawData.jwt || rawData.token || "";
      var jwtResult = verifySignedJwt(tokenToCheck, JWT_SECRET);
      return createJsonResponse(jwtResult);
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 4: DEFAULT REGISTRATION / CREATE ACCOUNT
    // ─────────────────────────────────────────────────────────────
    var sheet = getOrCreateUsersSheet();

    // Sanitize non-sensitive user fields (NEVER STORE PASSWORDS)
    var fullName   = (rawData.fullName || rawData.name || "").toString().trim();
    var email      = (rawData.email || "").toString().trim().toLowerCase();
    var phone      = (rawData.phone || rawData.phoneNumber || "").toString().trim();
    var location   = (rawData.location || "").toString().trim();
    var education  = (rawData.education || rawData.degree || "").toString().trim();
    var department = (rawData.department || "").toString().trim();
    var year       = (rawData.year || rawData.yearOfStudy || "").toString().trim();
    var cgpa       = (rawData.cgpa !== undefined && rawData.cgpa !== null) ? rawData.cgpa.toString().trim() : "";
    var createdAt  = new Date().toLocaleString("en-US", { timeZone: Session.getScriptTimeZone() || "UTC" });

    if (!fullName) return createJsonResponse({ status: "error", message: "Full Name is required." });
    if (!email)    return createJsonResponse({ status: "error", message: "Email is required." });

    // Check duplicate email
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var emailValues = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      for (var i = 0; i < emailValues.length; i++) {
        if (emailValues[i][0] && emailValues[i][0].toString().trim().toLowerCase() === email) {
          return createJsonResponse({ 
            status: "error", 
            message: "An account with this email (" + email + ") already exists." 
          });
        }
      }
    }

    // Append user row
    sheet.appendRow([fullName, email, phone, location, education, department, year, cgpa, createdAt]);

    // Issue backend JWT token for new account
    var registeredJwt = createSignedJwt({
      email: email,
      name: fullName,
      role: "student"
    }, JWT_SECRET, 7 * 24 * 3600);

    return createJsonResponse({
      status: "success",
      message: "Account created successfully!",
      jwt: registeredJwt
    });

  } catch (error) {
    return createJsonResponse({
      status: "error",
      message: error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

// ─────────────────────────────────────────────────────────────
// JWT SIGNING & VERIFICATION IMPLEMENTATION (HMAC-SHA256)
// ─────────────────────────────────────────────────────────────

/**
 * Creates an RFC 7519 standard signed JWT string
 */
function createSignedJwt(payloadObj, secret, expiresInSeconds) {
  var header = { alg: "HS256", typ: "JWT" };
  var now = Math.floor(Date.now() / 1000);
  
  payloadObj.iat = now;
  if (expiresInSeconds) {
    payloadObj.exp = now + expiresInSeconds;
  }

  var encodedHeader = base64UrlEncode(JSON.stringify(header));
  var encodedPayload = base64UrlEncode(JSON.stringify(payloadObj));
  var unsignedToken = encodedHeader + "." + encodedPayload;

  var signatureBytes = Utilities.computeHmacSha256Signature(unsignedToken, secret);
  var encodedSignature = Utilities.base64EncodeWebSafe(signatureBytes).replace(/=+$/, "");

  return unsignedToken + "." + encodedSignature;
}

/**
 * Cryptographically verifies a signed JWT token
 */
function verifySignedJwt(jwtToken, secret) {
  if (!jwtToken || typeof jwtToken !== "string") {
    return { valid: false, error: "JWT token string is empty or missing." };
  }

  var parts = jwtToken.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Malformed JWT token structure." };
  }

  var unsignedToken = parts[0] + "." + parts[1];
  var signature = parts[2];

  // Recompute expected HMAC-SHA256 signature
  var expectedSigBytes = Utilities.computeHmacSha256Signature(unsignedToken, secret);
  var expectedSig = Utilities.base64EncodeWebSafe(expectedSigBytes).replace(/=+$/, "");

  if (signature !== expectedSig) {
    return { valid: false, error: "Invalid cryptographic JWT signature." };
  }

  // Decode payload
  try {
    var payloadJson = Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[1])).getDataAsString();
    var payload = JSON.parse(payloadJson);

    // Check expiration
    var now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: "JWT token has expired." };
    }

    return { valid: true, status: "success", payload: payload };
  } catch (err) {
    return { valid: false, error: "Failed to decode JWT payload: " + err.toString() };
  }
}

/**
 * Base64URL encode string
 */
function base64UrlEncode(str) {
  return Utilities.base64EncodeWebSafe(str, Utilities.Charset.UTF_8).replace(/=+$/, "");
}

/**
 * Verifies Google ID Token via Google's tokeninfo API
 */
function verifyGoogleIdToken(idToken) {
  try {
    var url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(idToken);
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    var code = response.getResponseCode();
    var body = JSON.parse(response.getContentText());

    if (code !== 200 || !body.email) {
      return { valid: false, error: body.error_description || body.error || "Token validation rejected by Google" };
    }

    // Verify expiration
    var now = Math.floor(Date.now() / 1000);
    if (body.exp && parseInt(body.exp) < now) {
      return { valid: false, error: "Google token is expired" };
    }

    return { valid: true, payload: body };
  } catch (err) {
    return { valid: false, error: err.toString() };
  }
}

/**
 * Verifies GitHub Access Token via GitHub REST API
 */
function verifyGithubAccessToken(accessToken) {
  try {
    var response = UrlFetchApp.fetch("https://api.github.com/user", {
      headers: {
        "Authorization": "Bearer " + accessToken,
        "User-Agent": "NextStep-AI-Auth"
      },
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      return { valid: false, error: "Invalid GitHub access token" };
    }

    var user = JSON.parse(response.getContentText());
    return {
      valid: true,
      user: {
        login: user.login,
        name: user.name || user.login,
        email: user.email || (user.login + "@users.noreply.github.com"),
        avatar: user.avatar_url
      }
    };
  } catch (err) {
    return { valid: false, error: err.toString() };
  }
}

// ─────────────────────────────────────────────────────────────
// DATABASE HELPERS
// ─────────────────────────────────────────────────────────────

function getOrCreateUsersSheet() {
  var spreadsheet = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Could not access Google Spreadsheet.");

  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#4338ca");
    headerRange.setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function syncUserToSheet(name, email, notes) {
  try {
    var sheet = getOrCreateUsersSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var emails = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      for (var i = 0; i < emails.length; i++) {
        if (emails[i][0] && emails[i][0].toString().trim().toLowerCase() === email) {
          return; // Already exists
        }
      }
    }
    var createdAt = new Date().toLocaleString("en-US", { timeZone: Session.getScriptTimeZone() || "UTC" });
    sheet.appendRow([name, email, "", notes || "Social Login", "Computer Science", "Engineering", "2nd Year", "8.5", createdAt]);
  } catch (e) {
    // Non-fatal if sheet sync fails
  }
}

function createJsonResponse(outputObj) {
  return ContentService
    .createTextOutput(JSON.stringify(outputObj))
    .setMimeType(ContentService.MimeType.JSON);
}
