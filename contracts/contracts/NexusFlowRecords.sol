// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NexusFlowRecords {
    mapping(string => string) public meetingHashes;

    function storeHash(string memory meetingId, string memory hash) public {
        meetingHashes[meetingId] = hash;
    }
}