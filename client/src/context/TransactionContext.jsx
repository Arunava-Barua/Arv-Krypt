import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants.js";

// Creating an context in React
export const TransactionContext = React.createContext();

// Extracting ethereum Object from window due to MetaMask
const { ethereum } = window;


// Function to get the contract
const getEthereumContract = () => {

  // Talk to the smart contact in Ethereum blockchain
  const provider = new ethers.providers.Web3Provider(ethereum);

  // Implement the signing in metamask
  const signer = provider.getSigner();

  // Three ingredients to fetch an contact
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  // logging the contract
  console.log(transactionContract);

  return transactionContract;
};

export const TransactionProvider = ({ children }) => {

  // State management in our react app
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setFormData] = useState({addressto: '', amount: '', keyword: '', message: ''});
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setFormData((prevState) => ({...prevState, [name]: e.target.value})); 
  }

  const getAllTransactions = async () => {
    try {
      
      // Checking if metamask is installed by confirming ethereum object
      if (!ethereum) return alert("Please install Metamask");

      // Getting the contract
      const transactionContract = getEthereumContract();

      // Getting all the transactions from the contract
      const availableTransactions = await transactionContract.getAllTransactions();

      // Re-structuring the transaction object
      const  structuredTransactions = availableTransactions.map((transaction) => ({
        addressTo: transaction.receiver,
        addressFrom: transaction.sender,
        timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
        message: transaction.message,
        keyword: transaction.keyword,
        amount: parseInt(transaction.amount._hex) / (10**18)
      }));

      // Logging all the re-structured transactions
      console.log(structuredTransactions);

      // setting the state with all the re-structured transactions
      setTransactions(structuredTransactions);

      } catch (error) {
      console.log(error);
    }
  }

  // Function to check if wallet is connected (async cz no idea about time)
  const checkIfWalletIsConnected = async () => {
    try {

      // Checking if metamask is installed by confirming ethereum object
      if (!ethereum) return alert("Please install Metamask");

      // Storing all accounts connected from ethereum object
      const accounts = await ethereum.request({ method: "eth_accounts" });

      // If no account is connected, connect current account
      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        // Calling function
        getAllTransactions();

      } else {
        console.log("No accounts found");
      }

    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object found!");
    }
  };

  const checkIfTransactionsExist = async () => {
    try {

      const transactionContract = getEthereumContract();


      const transactionCount = await transactionContract.getTransactionCount();

      // Storing in local storage
      window.localStorage.setItem("transactionCount", transactionCount);

    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object found!");
    }
  }

  // Connecting app to metamask wallet
  const connectWallet = async () => {
    try {

      if (!ethereum) return alert("Please install Metamask");

      // Code to connect metamask
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object found!");
    }
  };

  // Sending transactions through ethereum blockchain
  const sendTransaction = async () => {
    try {
        if (!ethereum) return alert("Please install Metamask");

        // get data from formData
        const {addressTo, amount, keyword, message} = formData;

        const transactionContract = getEthereumContract();

        const parseAmount = ethers.utils.parseEther(amount);

        // Sending ethereum
        await ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from: currentAccount,
                to: addressTo,
                gas: '0x5208',  // Hexa decimal number - 0.000021 eth, 21000 gwei
                value: parseAmount._hex,
            }]
        });

        const transactionHash = await transactionContract.addToBlockchain(addressTo, parseAmount, message, keyword);


        // Logic to display the loading state in application
        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);

        await transactionHash.wait();

        setIsLoading(false);
        console.log(`Success - ${transactionHash.hash}`);

        
        const transactionCount = await transactionContract.getTransactionCount();

        setTransactionCount(transactionCount.toNumber());

        window.location.reload(true);

    } catch (error) {
      console.log(error);

      throw new Error("No ethereum object found!");
    }
  };


  // Checking wallet connection and transaction exist on start of application
  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, []);

  return (
    <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, setFormData, handleChange, sendTransaction , transactions, isLoading}}>
      {children}
    </TransactionContext.Provider>
  );
};
