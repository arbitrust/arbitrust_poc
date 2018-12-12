const IPFSgateway = "https://cloudflare-ipfs.com/ipfs/";
const zBlocks = 6;
const APItoken = "55eb89b9a0c74443b49edc9a519bceeb";

function hex2string(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0;
        (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}


function ascii2hex(str) {
    var arr1 = [];
    for (var n = 0, l = str.length; n < l; n++) {
        var hex = Number(str.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join('');
}

function signaturePolicyVerify(ipfsJson) {
    var signaturePolicyArray = [];
    ipfsJson.forEach((ipfs) => {
        try {
            if (ipfs.type === "signaturePolicy") {
                signaturePolicyArray.push(ipfs);
            }
        } catch (e) {

        }
    })

    if (signaturePolicyArray.length === 1) {
        return { signaturePolicyVerified: true, newSignaturePolicyReq: false, error: false, signatureData: signaturePolicyArray };
    } else if (signaturePolicyArray.length === 0) {
        return { signaturePolicyVerified: false, newSignaturePolicyReq: true, error: false, signatureData: null };
    } else {
        return { signaturePolicyVerified: false, newSignaturePolicyReq: false, error: true, signatureData: null }
    }
}



function actionVerify(ipfsJson, address) {
    var actionsArray = [];
    ipfsJson.forEach((ipfs) => {
        try {
            if (ipfs.type === "arbitrationAction" && (address === ipfs.defendant || address === ipfs.plaintiff)) {
                actionsArray.push(ipfs);
            }
        } catch (e) {

        }
    })
    return actionsArray;
}


function extractOPreturns(responseAddress) {
    var opreturnArray = [];
    responseAddress.txs.forEach(function(tx) {
        const block_height = tx.block_height;
        const block_hash = tx.block_hash;
        tx.outputs.forEach(function(output) {
            const script = parseOPreturn(output.script);
            if (script) {
                opreturnArray.push({ block_height: block_height, block_hash: block_hash, script: parseOPreturn(output.script) })
            }
        });
    });
    return opreturnArray;
}


function parseOPreturn(output) {
    const re = /6a2e([0-9a-fA-F]+)/i;
    const opreturnArray = output.match(re);
    if (opreturnArray) {
        if (opreturnArray[1]) {
            const opreturnValue = hex2string(opreturnArray[1]);
            return opreturnValue;
        }
    };
}


// functionB(this.state.actionsData, poolOfArbiters)
function arbitratorSelection(actionsData, poolOfArbiters) {
    actionsData.forEach(function(action) {
            var i = 0;
            action.nonce.forEach(function(nonce) {
                var filteredpoolOfArbiters = poolOfArbiters;
                var sumOfArbitrators = Number(filteredpoolOfArbiters.length);
                let selectedArbiterNo = Number(nonce.nonce) % sumOfArbitrators;
                var selectedArbiter = filteredpoolOfArbiters[selectedArbiterNo];
                filteredpoolOfArbiters.splice(selectedArbiterNo,1);
                nonce.selectedArbiter = { round: i, arbitratorsSum:sumOfArbitrators, selectedArbiterNo: selectedArbiterNo, selectedArbiter: selectedArbiter};
                i = i + 1; 
                })
            })

    return actionsData;


    }

    async function fetchAddress(address) {
        //     38rDGve6jGFToFAM3t6kpb3Mx9HmEwsJnC
        //    const responseAddress = await fetch("https://api.blockcypher.com/v1/btc/main/addrs/" + address + "/full?after=540000")
        //   const response = await fetch("https://api.blockcypher.com/v1/btc/main/addrs/38rDGve6jGFToFAM3t6kpb3Mx9HmEwsJnC/full?after=540000")
        const response = await fetch("https://api.blockcypher.com/v1/ltc/main/addrs/" + address + "/full?after=1500000&token="+APItoken)
            .then(res => res.json())
            .then(
                (result) => {
                    return result;
                },
                (error) => {
                    console.log(error);
                }
            )
        return response;
    }


    async function fetchIPFS(ipfsHash) {
        const response = await fetch(IPFSgateway + ipfsHash)
            .then(res => res.json())
            .then(
                (result) => {
                    return result;
                },
                (error) => {
                    console.log(error);
                }
            )
        return response;
    }

    function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchIPFSAction(ipfsHash) {
        const response = await fetch(IPFSgateway + ipfsHash.script)
            .then(res => res.json())
            .then(
                (result) => {
                    return result;
                },
                (error) => {
                    console.log(error);
                }
            )

        let block_height = Number(ipfsHash.block_height)
        let nonceArray = [];
        var i;
        for (i = 0; i < 3; i++) {
            await timeout(1000);
            let block_heightLoop = block_height + i + zBlocks;
            const nonce = await fetch("https://api.blockcypher.com/v1/ltc/main/blocks/" + block_heightLoop + "?txstart=1&limit=1&token="+APItoken)
                .then(res => res.json())
                .then(
                    (result) => {
                        return result.nonce;
                    },
                    (error) => {
                        console.log(error);
                    }
                )
            nonceArray.push({ nonce: nonce, block_height: block_heightLoop })
        }

        response.nonce = nonceArray;
        response.block_height = ipfsHash.block_height;
        return response;
    }


export { fetchAddress, extractOPreturns, fetchIPFS, signaturePolicyVerify, ascii2hex, actionVerify, fetchIPFSAction, arbitratorSelection };