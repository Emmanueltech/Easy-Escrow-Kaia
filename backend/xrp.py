from os import urandom
from datetime import datetime, timedelta

from xrpl.clients import JsonRpcClient
from xrpl.models.transactions import EscrowCreate, EscrowFinish
from xrpl.transaction import (
    submit_and_wait,
    # safe_sign_and_autofill_transaction,
    # send_reliable_submission,
)
from xrpl.utils import datetime_to_ripple_time, xrp_to_drops
from xrpl.wallet import generate_faucet_wallet, Wallet
from cryptoconditions import PreimageSha256

# Create Escrow

client = JsonRpcClient("https://s.altnet.rippletest.net:51234")  # Connect to client

amount_to_escrow = 10.000

receiver_addr = (
    "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"  # Example: send back to Testnet Faucet
)

# Escrow will be available to claim after 3 days
claim_date = datetime_to_ripple_time(datetime.now() + timedelta(days=3))

# Escrow will expire after 5 days
expiry_date = datetime_to_ripple_time(datetime.now() + timedelta(days=5))

# Optional field
# You can optionally use a Crypto Condition to allow for dynamic release of funds. For example:
condition = "A02580205A0E9E4018BE1A6E0F51D39B483122EFDF1DDEF3A4BE83BE71522F9E8CDAB179810120"  # do not use in production

# # sender wallet object
# sender_wallet = Wallet(
#     "sEdVnSyZyFH5qRrYPo5RT2cVaUt1tr2", "36464908"
# )  # generate_faucet_wallet(client=client)


def usdToXrp():
    return 0.449

def usdToXrp():
    return 0.449;

def createCondition():
    secret = urandom(32)

    # Generate cryptic image from secret
    fufill = PreimageSha256(preimage=secret)

    # Parse image and return the condition and fulfillment
    condition = str.upper(fufill.condition_binary.hex())  # conditon
    fulfillment = str.upper(fufill.serialize_binary().hex())

    return condition, fulfillment


def createEscrow(seed, sequence, rec_addr, amount, expiration):

    # sender_wallet = Wallet(seed, sequence)
    condition, fulfillment = createCondition()

    print("\nCondition:", condition)
    print("\n Fulfillment: ", fulfillment)


    # Build escrow create transaction
    # create_txn = EscrowCreate(
    #     account=sender_wallet.classic_address,
    #     amount=xrp_to_drops(amount),
    #     destination=rec_addr,
    #     finish_after=datetime_to_ripple_time(
    #         datetime.now() + timedelta(seconds=15)
    #     ),  # Temporary to reduce load on nlp enpoint
    #     cancel_after=datetime_to_ripple_time(expiration),
    #     condition=condition,
    # )

    # Sign and send transaction
    # stxn = safe_sign_and_autofill_transaction(create_txn, sender_wallet, client)
    # stxn_response = send_reliable_submission(stxn, client)

    # stxn_response = submit_and_wait(create_txn, client, sender_wallet)

    # if stxn_response is None:
    #     raise Exception("Escrow creation failed")

    # return {
    #     "creator": sender_wallet.classic_address,
    #     "reciever": rec_addr,
    #     "sequence": sequence,
    #     "condition": condition,
    #     "fulfillment": fulfillment,
    # }
    return {
        "creator": "axf54a8453as54d",
        "reciever": "axf54a8453as54d",
        "sequence": 3210123,
        "condition": "A025802088801FDFC1F22280E63E1571BDA525135C2DA4CD05C54519BDC6E568DEFA9704810120",
        "fulfillment": "A022802090781A8501872055A41288C915469D289F19AFAAB4F2DB77437EB0BB7B37460C",
    }


def finishEscrowDict(dict):
    return finishEscrow(
        dict["creator"], int(dict["sequence"]), dict["condition"], dict["fulfillment"]
    )


def finishEscrow(creator, sequence, condition, fulfillment):

    print("\n Creator: ", creator)
    print("\n Sequence: ", sequence)
    print("\n Condition: ", condition)
    print("\n Fulfillment: ", fulfillment)
    # temp_wallet = generate_faucet_wallet(client=client)

    # Build escrow finish transaction
    # finish_txn = EscrowFinish(
    #     account=temp_wallet.classic_address,
    #     owner=creator,
    #     offer_sequence=sequence,
    #     condition=condition,
    #     fulfillment=fulfillment,
    # )

    # Sign transaction with wallet
    # stxn = safe_sign_and_autofill_transaction(finish_txn, temp_wallet, client)

    # Send transaction and wait for response
    # stxn_response = send_reliable_submission(stxn, client)

    # stxn_response = submit_and_wait(finish_txn, client, temp_wallet)


    # Parse response and return result
    # return stxn_response.result


def validateEscrow(escrow_result):
    if escrow_result["meta"]["TransactionResult"] == "tesSUCCESS":
        return True
    else:
        return False
