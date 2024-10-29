// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EasyEscrow {
    struct Escrow {
        address sender;
        address recipient;
        address validator;
        uint256 amount;
        uint256 finishAfter;
        bytes32 condition;
        bool finished;
        bool closed;
        bool released;
        bool disputed;
    }

    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => uint256) public acceptCounter; // UID => Accepted numbers
    mapping(uint256 => mapping(address => bool)) public disputeAcceptStatus; // UID => Dispute numbers
    mapping(uint256 => mapping(address => bool)) public acceptStatus; // UID => Accout => Accepted?

    event EscrowCreated(uint256 indexed uuid, address indexed sender, address indexed recipient, uint256 amount);
    event EscrowFinished(uint256 indexed uuid);
    event FundReleased(address recipient, uint256 amount);

    function createEscrow(
        uint256 uuid,
        address sender,
        address validator,
        uint256 amount,
        address recipient,
        uint256 finishAfter,
        bytes32 condition
    ) external payable returns (uint256) {
        Escrow storage newEscrow = escrows[uuid];
        require(escrows[uuid].sender == address(0), "Escrow already exists");
        require(msg.sender == sender, "Invalid sender address");
        require(msg.value == amount, "Amount must be matched with the amount");
        require(recipient != address(0), "Invalid recipient address");
        require(sender.balance >= amount, "Insufficient balance");
        require(finishAfter > block.timestamp, "Invalid time constraints");

        acceptCounter[uuid] = 0;
        newEscrow.sender = msg.sender;
        newEscrow.recipient = recipient;
        newEscrow.validator = validator;
        newEscrow.amount = msg.value;
        newEscrow.finishAfter = finishAfter;
        newEscrow.condition = condition;
        newEscrow.finished = false;
        newEscrow.closed = false;
        newEscrow.released = false;
        newEscrow.disputed = false;

        emit EscrowCreated(uuid, msg.sender, recipient, msg.value);
        return uuid;
    }

    function finishEscrow(uint256 uuid) external {
        Escrow storage escrow = escrows[uuid];
        require(!escrow.finished, "Escrow is already finished");
        require(msg.sender == escrow.recipient, "Only the recipient can finish the escrow");

        escrow.finished = true;
        emit EscrowFinished(uuid);
    }

    function validateEscrow(uint256 uuid, bool fundRelease) external {
        Escrow storage escrow = escrows[uuid];
        require(escrow.validator == msg.sender || escrow.sender == msg.sender || escrow.recipient == msg.sender, "Only the validator can validate the escrow");
        require(escrow.closed == false, "Escrow is already closed");
        require(escrow.disputed == true, "Escrow is not disputed");
        disputeAcceptStatus[uuid][msg.sender] == fundRelease;
        if(disputeAcceptStatus[uuid][escrow.validator] == true && disputeAcceptStatus[uuid][escrow.sender] == true && disputeAcceptStatus[uuid][escrow.recipient] == true) {
            payable(escrow.recipient).transfer(escrow.amount);
            escrow.closed = true;
            escrow.released = true;
        }

        if(disputeAcceptStatus[uuid][escrow.validator] == false && disputeAcceptStatus[uuid][escrow.sender] == false && disputeAcceptStatus[uuid][escrow.recipient] == false) {
            payable(escrow.sender).transfer(escrow.amount);
            escrow.closed = true;
            escrow.released = true;
        } 
    }

    function raiseDispute(uint256 uuid) external {
        Escrow storage escrow = escrows[uuid];
        require(msg.sender == escrow.sender, "Only the sender can raise a dispute");
        escrow.disputed = true;
    }

    function releaseFund(uint256 uuid) external {

        Escrow storage escrow = escrows[uuid];
        require(escrow.finished == true, "Escrow is not finished");
        require(escrow.closed == false, "Escrow is already closed");
        require(msg.sender == escrow.recipient || msg.sender == escrow.sender, "Invalid Signer");
        require(acceptStatus[uuid][msg.sender] == false, "Already accepted");
        acceptStatus[uuid][msg.sender] = true;
        acceptCounter[uuid] += 1;
        if(acceptCounter[uuid] >= 2) {
            payable(escrow.recipient).transfer(escrow.amount);
            escrow.closed = true;
            escrow.released = true;

            emit FundReleased(escrow.recipient, escrow.amount);
        }
    }

    function getEscrow(uint256 uuid) external view returns (
        address sender,
        address recipient,
        uint256 amount,
        uint256 finishAfter,
        bytes32 condition,
        bool finished,
        bool closed,
        bool dusputed
    ) {
        Escrow storage escrow = escrows[uuid];
        return (
            escrow.sender,
            escrow.recipient,
            escrow.amount,
            escrow.finishAfter,
            escrow.condition,
            escrow.finished,
            escrow.closed,
            escrow.disputed
        );
    }

    function getAcceptStatus(uint256 uuid) external view returns (
        uint256 acceptCounters,
        bool recipientAcceptStatus,
        bool senderAcceptStatus
    ) {
        Escrow storage escrow = escrows[uuid];
        return (
            acceptCounter[uuid],
            acceptStatus[uuid][escrow.recipient],
            acceptStatus[uuid][escrow.sender]
        );
    }
}