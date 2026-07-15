const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("NexusFlowRecordsModule", (m) => {
  const nexusFlowRecords = m.contract("NexusFlowRecords");

  return { nexusFlowRecords };
});