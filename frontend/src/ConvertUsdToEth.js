import axios from 'axios';

export const convertUsdToEth = async (amount) => {
    try {
        const response = await axios.get('https://172-104-140-210.ip.linodeusercontent.com/fetch_kaia_price');
        if(response.status === 200) {
            console.log("response:", response)
            const kaia_price = await response.data["price"];
            console.log(kaia_price);
            const kaiaAmount = amount / kaia_price;
            return kaiaAmount;
        } else {
            console.log("Data Fetching is failed")
        }

    } catch (error) {
        console.error("Error fetching ETH price:", error);
    }
}