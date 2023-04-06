import Head from "next/head";
import { Inter } from "next/font/google";
import { Contract, ethers } from "ethers";
import React, { useEffect, useState, useRef } from "react";
import { NFT_CONTRACT_ADDRESS, NFT_ABI } from "constants";
import "bootstrap/dist/css/bootstrap.css";
import Metamask from "./components/Metamask";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const web3ModalRef = useRef();

  const [nfts, setNfts] = useState([]);
  const [tokens, setTokens] = useState([]);

  const readNfts = async () => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = new ethers.providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();

      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);
      const maxId = Number(await nftContract.getCurrentId());

      const _nfts = [];
      for (let i = maxId; i > 0; i--) {
        const tokenUri = await nftContract.tokenURI(i);
        _nfts.push({ uri: tokenUri, id: i });
      }

      setNfts(_nfts);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (walletConnected) {
      readNfts();
    }
  }, [walletConnected]);

  useEffect(() => {
    const getAll = async (nfts) => {
      const promises = [];
      nfts.map((nft) => {
        promises.push(fetch(nft.uri).then(res => res.json()).then(resJson => {return {...resJson, "id": nft.id}}));
      });

      const result = await Promise.all(promises);
      console.log(result);
      setTokens(result);
    };
    
    if (nfts.length > 0) {
      
      getAll(nfts);
    }
  }, [nfts]);

  const mint = async () => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new ethers.providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_ABI, signer);

    await nftContract.mint();

    setTimeout(() => readNfts(), 10000);
  };

  return (
    <>
      <Head>
        <title>Nft minter</title>
        <meta
          name="description"
          content="Frontend for Document Sign application"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <div className="container">
          <a className="navbar-brand" href="#">
            WeCore
          </a>
          <div className="collapse navbar-collapse"></div>
          <Metamask
            walletConnected={walletConnected}
            setWalletConnected={setWalletConnected}
            web3ModalRef={web3ModalRef}
          />
        </div>
      </nav>
      <main role="main">
        <div className="jumbotron">
          <div className="container">
            <div className="row">
              <div className="col-md-6 col-lg-4">
                <h2 className="display-4">Mint NFT</h2>
                <p>Project to mint NFTs</p>
                <button className="btn btn-primary" onClick={mint}>
                  Mint new
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row gy-3">
            {tokens.map((item, index) => (
              <div className="col-lg-4 col-md-6" key={"token-" + index}>
                <div className="card">
                  <img
                    src={item.image}
                    className="card-img-top"
                    alt={item.description}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{item.name}</h5>
                    <hr />
                    <p className="card-text">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
