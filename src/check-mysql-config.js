const mysql = require("mysql2/promise");

async function checkMySQLConfig() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    user: "root",
    password: process.env.MYSQL_ROOT_PASSWORD || "test",
  });

  try {
    const [sqlModeRows] = await connection.query("SELECT @@sql_mode AS sql_mode");
    const [packetRows] = await connection.query(
      "SELECT @@max_allowed_packet AS max_allowed_packet"
    );

    const sqlMode = sqlModeRows[0].sql_mode;
    const maxAllowedPacket = packetRows[0].max_allowed_packet;

    console.log(`sql_mode: ${sqlMode}`);
    console.log(`max_allowed_packet: ${maxAllowedPacket} bytes (${(maxAllowedPacket / 1024 / 1024).toFixed(0)} MB)`);

    const hasStrictMode = sqlMode.includes("STRICT_TRANS_TABLES");
    const hasLargePacket = maxAllowedPacket >= 512 * 1024 * 1024;

    console.log("");
    console.log(`✓ STRICT_TRANS_TABLES enabled: ${hasStrictMode}`);
    console.log(`✓ max_allowed_packet >= 512MB: ${hasLargePacket}`);

    if (!hasStrictMode || !hasLargePacket) {
      process.exitCode = 1;
      console.error("\n✗ MySQL is NOT configured with the expected custom flags.");
    } else {
      console.log("\n✓ MySQL is configured correctly with custom flags!");
    }

    return { sqlMode, maxAllowedPacket, hasStrictMode, hasLargePacket };
  } finally {
    await connection.end();
  }
}

// Run directly if this is the main module
if (require.main === module) {
  checkMySQLConfig().catch((err) => {
    console.error("Failed to connect to MySQL:", err.message);
    process.exitCode = 1;
  });
}

module.exports = { checkMySQLConfig };
