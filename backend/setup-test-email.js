const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

async function setupTestEmail() {
  try {
    console.log("\n🔄 Generating new Ethereal test account...\n");
    
    // Create a test account on Ethereal
    const testAccount = await nodemailer.createTestAccount();

    console.log("✅ Test account created!");
    console.log(`   Email: ${testAccount.user}`);
    console.log(`   Password: ${testAccount.pass}`);
    console.log(`   SMTP Host: ${testAccount.smtp.host}`);
    console.log(`   SMTP Port: ${testAccount.smtp.port}\n`);

    // Read docker-compose.yml
    const dockerComposePath = path.join(__dirname, "..", "docker-compose.yml");
    let dockerComposeContent = fs.readFileSync(dockerComposePath, "utf8");

    // Update SMTP settings in docker-compose.yml
    dockerComposeContent = dockerComposeContent.replace(
      /- SMTP_HOST=.*/,
      `- SMTP_HOST=${testAccount.smtp.host}`
    );
    dockerComposeContent = dockerComposeContent.replace(
      /- SMTP_PORT=.*/,
      `- SMTP_PORT=${testAccount.smtp.port}`
    );
    dockerComposeContent = dockerComposeContent.replace(
      /- SMTP_USER=.*/,
      `- SMTP_USER=${testAccount.user}`
    );
    dockerComposeContent = dockerComposeContent.replace(
      /- SMTP_PASS=.*/,
      `- SMTP_PASS=${testAccount.pass}`
    );
    dockerComposeContent = dockerComposeContent.replace(
      /- SMTP_FROM=.*/,
      `- SMTP_FROM="Restaurant CMS" <${testAccount.user}>`
    );

    // Write updated docker-compose.yml
    fs.writeFileSync(dockerComposePath, dockerComposeContent, "utf8");

    console.log("✅ docker-compose.yml updated successfully!\n");

    // Update .env file as well
    const envPath = path.join(__dirname, ".env");
    let envContent = fs.readFileSync(envPath, "utf8");

    envContent = envContent.replace(
      /SMTP_HOST=.*/,
      `SMTP_HOST=${testAccount.smtp.host}`
    );
    envContent = envContent.replace(
      /SMTP_PORT=.*/,
      `SMTP_PORT=${testAccount.smtp.port}`
    );
    envContent = envContent.replace(
      /SMTP_USER=.*/,
      `SMTP_USER=${testAccount.user}`
    );
    envContent = envContent.replace(
      /SMTP_PASS=.*/,
      `SMTP_PASS=${testAccount.pass}`
    );
    envContent = envContent.replace(
      /SMTP_FROM=.*/,
      `SMTP_FROM="Restaurant CMS" <${testAccount.user}>`
    );

    fs.writeFileSync(envPath, envContent, "utf8");

    console.log("✅ .env file updated successfully!\n");

    console.log("=" .repeat(60));
    console.log("📧 NEW ETHEREAL EMAIL CREDENTIALS");
    console.log("=" .repeat(60));
    console.log(`Email:    ${testAccount.user}`);
    console.log(`Password: ${testAccount.pass}`);
    console.log(`\nView emails at: https://ethereal.email/messages`);
    console.log("=" .repeat(60));
    console.log("\n⚠️  IMPORTANT: Restart your backend to apply changes:");
    console.log("   docker-compose up -d --build backend");
    console.log("\n   OR if running locally:");
    console.log("   npm start\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setupTestEmail();

