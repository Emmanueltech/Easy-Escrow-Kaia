from web3 import Web3
import json
from dotenv import load_dotenv
import os
from eth_account import Account
from mnemonic import Mnemonic
from bip32 import BIP32
import requests
from eth_keys import keys  
from eth_utils import to_checksum_address  
from datetime import datetime  



load_dotenv()

# Connect to an Ethereum node (replace with your own node URL)
w3 = Web3(Web3.HTTPProvider('https://rpc.ankr.com/klaytn_testnet'))

# Load the Abi from the easyEscromAbi.json
def load_abi(filename):  
    with open(filename, 'r') as file:  
        abi = json.load(file)  
    return abi  

abi_file_path = os.path.join(os.path.dirname(__file__), 'easyEscrowAbi.json')  

def mnemonic_to_private_key(mnemonic, account_path="m/44'/60'/0'/0/0"):
    mnemo = Mnemonic("english")
    if not mnemo.check(mnemonic):
        raise ValueError("Invalid mnemonic phrase")
    seed = mnemo.to_seed(mnemonic)
    bip32 = BIP32.from_seed(seed)
    private_key = bip32.get_privkey_from_path("m/44'/60'/0'/0/0").hex()
    print("Private Key is: ", private_key)
    return private_key

contract_address = '0x76444803e62b256f543a340c50eee2b2969fc0e2'
checksum_address = w3.to_checksum_address(contract_address)
contract_abi = load_abi(abi_file_path)

# Create contract instance
contract = w3.eth.contract(address=checksum_address, abi=contract_abi)

# Example function to create a job
def create_escrow_kaia(uuid, sender, validator, amount, recipient, finishAfter, condition):
    print("\nFinish After:", finishAfter)
    nonce = w3.eth.get_transaction_count(sender)
    txn = contract.functions.createEscrow(int(uuid), sender, validator, int(amount), recipient, int(finishAfter), w3.keccak(text=condition)).build_transaction({
        'from' : sender,
        'value' : int(amount),
        'nonce' : nonce,
    })

    signed_txn = w3.eth.account.sign_transaction(txn, private_key = os.getenv("SENDER_PRIVATE_KEY"))
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_receipt



def finish_escrow_kaia(uuid, recipientAddress, recipientPrivateKey):
    nonce = w3.eth.get_transaction_count(recipientAddress)
    txn = contract.functions.finishEscrow(int(uuid)).build_transaction({
        'from' : recipientAddress,
        'nonce' : nonce,
    })

    signed_txn = w3.eth.account.sign_transaction(txn, private_key = recipientPrivateKey)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_receipt

def release_fund_kaia(uuid, senderAddress, senderPrivateKey):
    nonce = w3.eth.get_transaction_count(senderAddress)
    txn = contract.functions.releaseFund(int(uuid)).build_transaction({
        'from' : senderAddress,
        'nonce' : nonce,
    })

    signed_txn = w3.eth.account.sign_transaction(txn, private_key = senderPrivateKey)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_receipt


def validate_escrow_kaia(uuid, validatorAddress, validatorPrivateKey, fundRelease):
    nonce = w3.eth.get_transaction_count(validatorAddress)
    txn = contract.functions.validateEscrow(int(uuid), fundRelease).build_transaction({
        'from' : validatorAddress,
        'nonce' : nonce,
    })

    signed_txn = w3.eth.account.sign_transaction(txn, private_key = validatorPrivateKey)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_receipt

def get_escrow_kaia(uuid):
    print(type(uuid))
    print(uuid)
    print("\n")
    print("Contract Address:", contract.address)
    escrow_details = contract.functions.getEscrow(uuid).call()
    print("escrow_details:>>>>>", escrow_details)
    return {
        "sender": escrow_details[0],
        "recipient": escrow_details[1],
        "amount": escrow_details[2],
        "finishAfter": escrow_details[3],
        "condition": escrow_details[4].decode('latin-1'),
        "finished": escrow_details[5],
        "closed": escrow_details[6]
    }

def get_accept_status_kaia(uuid):
    accept_status = contract.functions.getAcceptStatus(int(uuid)).call()
    return {
        "AcceptedCounter": accept_status[0],
        "RecipientAccepted": accept_status[1],
        "SenderAccepted": accept_status[2],
    }
