const { describe, it } = require("node:test");
const assert = require("node:assert");
const { checkMySQLConfig } = require("../src/check-mysql-config");

describe("MySQL custom configuration", () => {
  it("should have STRICT_TRANS_TABLES in sql_mode", async () => {
    const result = await checkMySQLConfig();
    assert.ok(
      result.hasStrictMode,
      `Expected sql_mode to include STRICT_TRANS_TABLES, got: ${result.sqlMode}`
    );
  });

  it("should have max_allowed_packet >= 512MB", async () => {
    const result = await checkMySQLConfig();
    assert.ok(
      result.hasLargePacket,
      `Expected max_allowed_packet >= 536870912, got: ${result.maxAllowedPacket}`
    );
  });
});
