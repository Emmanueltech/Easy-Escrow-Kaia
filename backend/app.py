import json
import sys
import uuid
from dateutil import parser
from xrp import finishEscrowDict
from xrp import usdToXrp
from xrp import createEscrow, finishEscrow
from kaia import create_escrow_kaia, finish_escrow_kaia, validate_escrow_kaia, release_fund_kaia, get_escrow_kaia, get_accept_status_kaia
from flask import Flask, request, jsonify
import openai
import fitz
from dotenv import load_dotenv
import os
import requests
from eth_account import Account
from mnemonic import Mnemonic
from bip32 import BIP32
from eth_keys import keys  
from eth_utils import to_checksum_address  
from datetime import datetime, timedelta, timezone



load_dotenv()

from flask_cors import CORS

### Keyed by the id of the xrp escrow, references the mappings from the pdf
# Contains "alias": {components: {}, txn_data: {}, fulfilled: false, finished: false}
MAPPINGS = {}

# print(search.execute())
app = Flask(__name__)
app.config["SERVER_NAME"] = "195.201.56.175:8118"
CORS(app, origins=["http://195.201.56.175:8118:3000", "http://195.201.56.175:8118:3000/*", "*"])

openai.api_key = os.getenv("OPENAI_API_KEY")
def getComponents(text):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "You are escrowGPT. Users give you the text from their escrow agreements"
                + "and you identify the following: The name of the sender, the name of the reciever, the name of the third party verifier, a sentence summarizing the condition to be met,"
                + "the usd amount in escrow as a float with two decimals, and the expiration date of the contract as an ISO datetime."
                + 'Your answers match this format exactly: {"sender": "...", "reciever": "...", "thirdParty":"...", "amount": "...", "condition": "...", "expiration": "..."}',
            },
            {
                "role": "user",
                "content": text,
            },
        ],
    )
    print("\n\n\n\n\n\n\n\n This is Response Message")
    print(response)
    return response["choices"][0]["message"]["content"]


def extract_text_from_pdf(pdf):
    # Open the PDF
    pdf_document = fitz.open("pdf", pdf.read())
    text = ""

    # Iterate through the pages and extract text
    for page_num in range(pdf_document.page_count):
        page = pdf_document.load_page(page_num)
        text += page.get_text("text")

    return text


def get_eth_price():  
    url = "https://api.coingecko.com/api/v3/simple/price"  
    params = {  
        'ids': 'ethereum',  
        'vs_currencies': 'usd'  
    }  
    
    response = requests.get(url, params=params)  
    
    if response.status_code == 200:  
        data = response.json()  
        return data['ethereum']['usd']  
    else:  
        print("Error fetching data:", response.status_code)  
        return None
    
def get_kaia_price():
    url = "https://api.crypto.com/v2/public/get-ticker"  
    params = {  
        "instrument_name": "KLAY_USD"
        # "instrument_name": "ETH_USD"
    }

    response = requests.get(url, params=params)
    return response.json()["result"]["data"][0]["a"]
    

    
def convert_usd_to_eth(usd_amount):  
    eth_price = get_eth_price()  
    if eth_price:  
        eth_amount = usd_amount / eth_price  
        return eth_amount  
    else:  
        return None 
    
def mnemonic_to_private_key(mnemonic, account_path="m/44'/60'/0'/0/0"):
    mnemo = Mnemonic("english")
    if not mnemo.check(mnemonic):
        raise ValueError("Invalid mnemonic phrase")
    seed = mnemo.to_seed(mnemonic)
    bip32 = BIP32.from_seed(seed)
    private_key = bip32.get_privkey_from_path("m/44'/60'/0'/0/0").hex()
    print("Private Key is: ", private_key)
    return private_key

def private_to_address(private_key):
    private_key =  keys.PrivateKey(bytes.fromhex(private_key))
    public_key = private_key.public_key
    address = public_key.to_checksum_address()  
    return address

@app.route("/test", methods=["GET"])
def test():
    print("Hello World")
    return "Hello World"

@app.route("/derive", methods=["GET", "POST"])
def hello_world():
    print(request.files)
    file = request.files.get("files")
    print(file)
    extracted_text = extract_text_from_pdf(file)
    print(extracted_text)
    components = getComponents(extracted_text)
    components = json.loads(components)
    print(components)
    return jsonify({"components": components})

@app.route("/escrow_kaia", methods=["POST"])
def escrow_kaia():

    data = request.get_json()
    components = data.get("components")
    
    uid = int(str(uuid.uuid4()).replace('-', '')[:12], 16)
    metadata = {
        "finished" : False,
        "fulfilled": True,
        "components": components,
    }

    MAPPINGS[uid] = metadata
    return jsonify({"metadata": metadata, "id": uid})

@app.route("/finish_kaia/<uid>", methods=["GET"])
def finish_escrow(uid):

    print("uid: ", int(uid))
    print(MAPPINGS.get(int(uid)))
    if (
        int(uid) in MAPPINGS
        and MAPPINGS.get(int(uid)).get("fulfilled")
    ):
        mapping = MAPPINGS.get(int(uid))
        mapping["finished"] = True
        MAPPINGS[int(uid)] = mapping
        return jsonify({"success": True})
    return jsonify({"success": False})

@app.route("/validate_kaia/<uid>", methods=["GET"])   
def validate_escrow(uid):
    if int(uid) in MAPPINGS:
        txn = MAPPINGS.get(int(uid))
        txn["fulfilled"] = True
        return jsonify({"success": True})

    return jsonify({"success": False})

@app.route("/reference/<uid>", methods=["GET"])
def reference(uid):
    return jsonify({"reference": MAPPINGS.get(int(uid))})

@app.route("/validate/<txnId>", methods=["GET"])
def validate(txnId):

    if int(txnId) in MAPPINGS:
        txn = MAPPINGS.get(int(txnId))
        txn["fulfilled"] = True
        return jsonify({"success": True})

    return jsonify({"success": False})

@app.route("/fetch_kaia_price", methods=["GET"])
def fetch_kaia_price():
    return jsonify({"price": get_kaia_price()})


@app.route("/get_escrow_kaia/<uid>", methods=["GET"])
def get_escrow(uid):
    txn_data = get_escrow_kaia(int(uid))
    print(txn_data)
    print("UDI:::", uid)

    return jsonify({"txn_data": txn_data, "reference": MAPPINGS.get(int(uid)), "id": uid})


@app.route("/get_accept_status_kaia/<uid>", methods=["GET"])
def get_eaccept_status(uid):
    txn_data = get_accept_status_kaia(int(uid))
    return jsonify({"metadata": txn_data, "id": uid})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port="8118")