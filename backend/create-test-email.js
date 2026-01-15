const nodemailer = require("nodemailer");

async function createTestAccount() {
  try {
    // Create a test account on Ethereal
    const testAccount = await nodemailer.createTestAccount();

    console.log("\n=== ETHEREAL EMAIL TEST ACCOUNT ===");
    console.log("Copy these settings to your .env file:\n");
    console.log(`SMTP_HOST=${testAccount.smtp.host}`);
    console.log(`SMTP_PORT=${testAccount.smtp.port}`);
    console.log(`SMTP_USER=${testAccount.user}`);
    console.log(`SMTP_PASS=${testAccount.pass}`);
    console.log(`SMTP_FROM="Restaurant CMS" <${testAccount.user}>`);
    console.log(`ADMIN_PANEL_URL=http://localhost:3001`);
    console.log("\n=== IMPORTANT ===");
    console.log("Emails won't be delivered to real inboxes.");
    console.log("Check sent emails at: https://ethereal.email/messages");
    console.log(`Login with: ${testAccount.user} / ${testAccount.pass}`);
    console.log("================\n");
  } catch (error) {
    console.error("Error creating test account:", error);
  }
}

createTestAccount();

