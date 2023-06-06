#!/usr/bin/env node
"use strict";(()=>{var P=Object.create;var O=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var D=Object.getOwnPropertyNames;var L=Object.getPrototypeOf,U=Object.prototype.hasOwnProperty;var b=(r=>typeof require!="undefined"?require:typeof Proxy!="undefined"?new Proxy(r,{get:(t,e)=>(typeof require!="undefined"?require:t)[e]}):r)(function(r){if(typeof require!="undefined")return require.apply(this,arguments);throw new Error('Dynamic require of "'+r+'" is not supported')});var q=(r,t,e,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of D(t))!U.call(r,a)&&a!==e&&O(r,a,{get:()=>t[a],enumerable:!(n=_(t,a))||n.enumerable});return r};var w=(r,t,e)=>(e=r!=null?P(L(r)):{},q(t||!r||!r.__esModule?O(e,"default",{value:r,enumerable:!0}):e,r));var u=(r,t,e)=>new Promise((n,a)=>{var s=o=>{try{d(e.next(o))}catch(m){a(m)}},i=o=>{try{d(e.throw(o))}catch(m){a(m)}},d=o=>o.done?n(o.value):Promise.resolve(o.value).then(s,i);d((e=e.apply(r,t)).next())});var M=w(b("figlet"));var k={name:"ssv-scanner",version:"0.0.2",description:"Library to retrieve cluster snapshots and owner nonce from the ssv.network contract.",author:"SSV.Network",repository:"https://github.com/bloxapp/ssv-scanner",license:"MIT",keywords:["ssv","ssv.network","cluster","nonce","scanner"],main:"./dist/tsc/src/main.js",types:"./dist/tsc/src/main.d.ts",bin:{"ssv-keys":"./dist/tsc/src/cli.js"},engines:{node:">=12"},scripts:{"dev:cli":"ts-node src/cli.ts",cli:"node ./dist/tsc/src/cli.js",lint:"eslint src/ --ext .js,.jsx,.ts,.tsx",clean:"rm -rf dist build package","ts-node":"ts-node",build:"tsc -p tsconfig.json","build-all":"yarn clean && yarn build && yarn esbuild",esbuild:"node ./esbuild.js","pre-commit":"yarn test && yarn lint && yarn build-all"},devDependencies:{"@types/argparse":"^2.0.10","@types/cli-progress":"^3.11.0","@types/node":"^15.14.9",esbuild:"^0.14.38","esbuild-node-externals":"^1.4.1",eslint:"^7.32.0","ts-node":"^10.9.1",typescript:"^4.6.4"},dependencies:{"@types/figlet":"^1.5.4",argparse:"^2.0.1","cli-progress":"^3.11.2",figlet:"^1.5.2",web3:"^1.10.0"},licenses:[{MIT:"SEE LICENSE IN LICENCE FILE"}]};var F=b("argparse");var N=b("argparse"),T=class{constructor(t,e){this.name=t;this.description=e;this.parser=new N.ArgumentParser({description:this.description}),this.setArguments(this.parser)}parse(t){return this.parser.parse_args(t)}};var C=w(b("cli-progress"));var B=w(b("web3"));var E=[{inputs:[],name:"ApprovalNotWithinTimeframe",type:"error"},{inputs:[],name:"CallerNotOwner",type:"error"},{inputs:[],name:"CallerNotWhitelisted",type:"error"},{inputs:[],name:"ClusterAlreadyEnabled",type:"error"},{inputs:[],name:"ClusterDoesNotExists",type:"error"},{inputs:[],name:"ClusterIsLiquidated",type:"error"},{inputs:[],name:"ClusterNotLiquidatable",type:"error"},{inputs:[],name:"ExceedValidatorLimit",type:"error"},{inputs:[],name:"FeeExceedsIncreaseLimit",type:"error"},{inputs:[],name:"FeeIncreaseNotAllowed",type:"error"},{inputs:[],name:"FeeTooLow",type:"error"},{inputs:[],name:"IncorrectClusterState",type:"error"},{inputs:[],name:"IncorrectValidatorState",type:"error"},{inputs:[],name:"InsufficientBalance",type:"error"},{inputs:[],name:"InvalidOperatorIdsLength",type:"error"},{inputs:[],name:"InvalidPublicKeyLength",type:"error"},{inputs:[],name:"NewBlockPeriodIsBelowMinimum",type:"error"},{inputs:[],name:"NoFeeDeclared",type:"error"},{inputs:[],name:"NotAuthorized",type:"error"},{inputs:[],name:"OperatorAlreadyExists",type:"error"},{inputs:[],name:"OperatorDoesNotExist",type:"error"},{inputs:[],name:"OperatorsListNotUnique",type:"error"},{inputs:[],name:"SameFeeChangeNotAllowed",type:"error"},{inputs:[],name:"TargetModuleDoesNotExist",type:"error"},{inputs:[],name:"TokenTransferFailed",type:"error"},{inputs:[],name:"UnsortedOperatorsList",type:"error"},{inputs:[],name:"ValidatorAlreadyExists",type:"error"},{inputs:[],name:"ValidatorDoesNotExist",type:"error"},{anonymous:!1,inputs:[{indexed:!1,internalType:"address",name:"previousAdmin",type:"address"},{indexed:!1,internalType:"address",name:"newAdmin",type:"address"}],name:"AdminChanged",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"beacon",type:"address"}],name:"BeaconUpgraded",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!1,internalType:"uint64[]",name:"operatorIds",type:"uint64[]"},{indexed:!1,internalType:"uint256",name:"value",type:"uint256"},{components:[{internalType:"uint32",name:"validatorCount",type:"uint32"},{internalType:"uint64",name:"networkFeeIndex",type:"uint64"},{internalType:"uint64",name:"index",type:"uint64"},{internalType:"bool",name:"active",type:"bool"},{internalType:"uint256",name:"balance",type:"uint256"}],indexed:!1,internalType:"struct ISSVNetworkCore.Cluster",name:"cluster",type:"tuple"}],name:"ClusterDeposited",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!1,internalType:"uint64[]",name:"operatorIds",type:"uint64[]"},{components:[{internalType:"uint32",name:"validatorCount",type:"uint32"},{internalType:"uint64",name:"networkFeeIndex",type:"uint64"},{internalType:"uint64",name:"index",type:"uint64"},{internalType:"bool",name:"active",type:"bool"},{internalType:"uint256",name:"balance",type:"uint256"}],indexed:!1,internalType:"struct ISSVNetworkCore.Cluster",name:"cluster",type:"tuple"}],name:"ClusterLiquidated",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!1,internalType:"uint64[]",name:"operatorIds",type:"uint64[]"},{components:[{internalType:"uint32",name:"validatorCount",type:"uint32"},{internalType:"uint64",name:"networkFeeIndex",type:"uint64"},{internalType:"uint64",name:"index",type:"uint64"},{internalType:"bool",name:"active",type:"bool"},{internalType:"uint256",name:"balance",type:"uint256"}],indexed:!1,internalType:"struct ISSVNetworkCore.Cluster",name:"cluster",type:"tuple"}],name:"ClusterReactivated",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!1,internalType:"uint64[]",name:"operatorIds",type:"uint64[]"},{indexed:!1,internalType:"uint256",name:"value",type:"uint256"},{components:[{internalType:"uint32",name:"validatorCount",type:"uint32"},{internalType:"uint64",name:"networkFeeIndex",type:"uint64"},{internalType:"uint64",name:"index",type:"uint64"},{internalType:"bool",name:"active",type:"bool"},{internalType:"uint256",name:"balance",type:"uint256"}],indexed:!1,internalType:"struct ISSVNetworkCore.Cluster",name:"cluster",type:"tuple"}],name:"ClusterWithdrawn",type:"event"},{anonymous:!1,inputs:[{indexed:!1,internalType:"uint64",name:"value",type:"uint64"}],name:"DeclareOperatorFeePeriodUpdated",type:"event"},{anonymous:!1,inputs:[{indexed:!1,internalType:"uint64",name:"value",type:"uint64"}],name:"ExecuteOperatorFeePeriodUpdated",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!1,internalType:"address",name:"recipientAddress",type:"address"}],name:"FeeRecipientAddressUpdated",type:"event"},{anonymous:!1,inputs:[{indexed:!1,internalType:"uint8",name:"version",type:"uint8"}],name:"Initialized",type:"event"},{anonymous:!1,inputs:[{indexed:!1,internalType:"uint64",name:"value",type:"uint64"}],name:"LiquidationThresholdPeriodUpdated",type:"event"},{anonymous:!1,inputs:[{indexed:!1,internalType:"uint256",name:"value",type:"uint256"}],name:"MinimumLiquidationCollateralUpdated",type:"event"},{anonymous:!1,inputs:[{indexed:!1,internalType:"uint256",name:"value",type:"uint256"},{indexed:!1,internalType:"address",name:"recipient",type:"address"}],name:"NetworkEarningsWithdrawn",type:"event"},{anonymous:!1,inputs:[{indexed:!1,internalType:"uint256",name:"oldFee",type:"uint256"},{indexed:!1,internalType:"uint256",name:"newFee",type:"uint256"}],name:"NetworkFeeUpdated",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"uint64",name:"operatorId",type:"uint64"},{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!1,internalType:"bytes",name:"publicKey",type:"bytes"},{indexed:!1,internalType:"uint256",name:"fee",type:"uint256"}],name:"OperatorAdded",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!0,internalType:"uint64",name:"operatorId",type:"uint64"}],name:"OperatorFeeCancellationDeclared",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!0,internalType:"uint64",name:"operatorId",type:"uint64"},{indexed:!1,internalType:"uint256",name:"blockNumber",type:"uint256"},{indexed:!1,internalType:"uint256",name:"fee",type:"uint256"}],name:"OperatorFeeDeclared",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!0,internalType:"uint64",name:"operatorId",type:"uint64"},{indexed:!1,internalType:"uint256",name:"blockNumber",type:"uint256"},{indexed:!1,internalType:"uint256",name:"fee",type:"uint256"}],name:"OperatorFeeExecuted",type:"event"},{anonymous:!1,inputs:[{indexed:!1,internalType:"uint64",name:"value",type:"uint64"}],name:"OperatorFeeIncreaseLimitUpdated",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"uint64",name:"operatorId",type:"uint64"}],name:"OperatorRemoved",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"uint64",name:"operatorId",type:"uint64"},{indexed:!1,internalType:"address",name:"whitelisted",type:"address"}],name:"OperatorWhitelistUpdated",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!0,internalType:"uint64",name:"operatorId",type:"uint64"},{indexed:!1,internalType:"uint256",name:"value",type:"uint256"}],name:"OperatorWithdrawn",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"previousOwner",type:"address"},{indexed:!0,internalType:"address",name:"newOwner",type:"address"}],name:"OwnershipTransferStarted",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"previousOwner",type:"address"},{indexed:!0,internalType:"address",name:"newOwner",type:"address"}],name:"OwnershipTransferred",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"implementation",type:"address"}],name:"Upgraded",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!1,internalType:"uint64[]",name:"operatorIds",type:"uint64[]"},{indexed:!1,internalType:"bytes",name:"publicKey",type:"bytes"},{indexed:!1,internalType:"bytes",name:"shares",type:"bytes"},{components:[{internalType:"uint32",name:"validatorCount",type:"uint32"},{internalType:"uint64",name:"networkFeeIndex",type:"uint64"},{internalType:"uint64",name:"index",type:"uint64"},{internalType:"bool",name:"active",type:"bool"},{internalType:"uint256",name:"balance",type:"uint256"}],indexed:!1,internalType:"struct ISSVNetworkCore.Cluster",name:"cluster",type:"tuple"}],name:"ValidatorAdded",type:"event"},{anonymous:!1,inputs:[{indexed:!0,internalType:"address",name:"owner",type:"address"},{indexed:!1,internalType:"uint64[]",name:"operatorIds",type:"uint64[]"},{indexed:!1,internalType:"bytes",name:"publicKey",type:"bytes"},{components:[{internalType:"uint32",name:"validatorCount",type:"uint32"},{internalType:"uint64",name:"networkFeeIndex",type:"uint64"},{internalType:"uint64",name:"index",type:"uint64"},{internalType:"bool",name:"active",type:"bool"},{internalType:"uint256",name:"balance",type:"uint256"}],indexed:!1,internalType:"struct ISSVNetworkCore.Cluster",name:"cluster",type:"tuple"}],name:"ValidatorRemoved",type:"event"},{stateMutability:"nonpayable",type:"fallback"},{inputs:[],name:"acceptOwnership",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint64",name:"operatorId",type:"uint64"}],name:"cancelDeclaredOperatorFee",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint64",name:"operatorId",type:"uint64"},{internalType:"uint256",name:"fee",type:"uint256"}],name:"declareOperatorFee",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"owner",type:"address"},{internalType:"uint64[]",name:"operatorIds",type:"uint64[]"},{internalType:"uint256",name:"amount",type:"uint256"},{components:[{internalType:"uint32",name:"validatorCount",type:"uint32"},{internalType:"uint64",name:"networkFeeIndex",type:"uint64"},{internalType:"uint64",name:"index",type:"uint64"},{internalType:"bool",name:"active",type:"bool"},{internalType:"uint256",name:"balance",type:"uint256"}],internalType:"struct ISSVNetworkCore.Cluster",name:"cluster",type:"tuple"}],name:"deposit",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint64",name:"operatorId",type:"uint64"}],name:"executeOperatorFee",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"userAddress",type:"address"}],name:"getRegisterAuth",outputs:[{components:[{internalType:"bool",name:"registerOperator",type:"bool"},{internalType:"bool",name:"registerValidator",type:"bool"}],internalType:"struct Authorization",name:"",type:"tuple"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"contract IERC20",name:"token_",type:"address"},{internalType:"contract IFnSSVOperators",name:"ssvOperators_",type:"address"},{internalType:"contract IFnSSVClusters",name:"ssvClusters_",type:"address"},{internalType:"contract IFnSSVDAO",name:"ssvDAO_",type:"address"},{internalType:"contract IFnSSVViews",name:"ssvViews_",type:"address"},{internalType:"uint64",name:"minimumBlocksBeforeLiquidation_",type:"uint64"},{internalType:"uint256",name:"minimumLiquidationCollateral_",type:"uint256"},{internalType:"uint32",name:"validatorsPerOperatorLimit_",type:"uint32"},{internalType:"uint64",name:"declareOperatorFeePeriod_",type:"uint64"},{internalType:"uint64",name:"executeOperatorFeePeriod_",type:"uint64"},{internalType:"uint64",name:"operatorMaxFeeIncrease_",type:"uint64"}],name:"initialize",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"owner",type:"address"},{internalType:"uint64[]",name:"operatorIds",type:"uint64[]"},{components:[{internalType:"uint32",name:"validatorCount",type:"uint32"},{internalType:"uint64",name:"networkFeeIndex",type:"uint64"},{internalType:"uint64",name:"index",type:"uint64"},{internalType:"bool",name:"active",type:"bool"},{internalType:"uint256",name:"balance",type:"uint256"}],internalType:"struct ISSVNetworkCore.Cluster",name:"cluster",type:"tuple"}],name:"liquidate",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"owner",outputs:[{internalType:"address",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"pendingOwner",outputs:[{internalType:"address",name:"",type:"address"}],stateMutability:"view",type:"function"},{inputs:[],name:"proxiableUUID",outputs:[{internalType:"bytes32",name:"",type:"bytes32"}],stateMutability:"view",type:"function"},{inputs:[{internalType:"uint64[]",name:"operatorIds",type:"uint64[]"},{internalType:"uint256",name:"amount",type:"uint256"},{components:[{internalType:"uint32",name:"validatorCount",type:"uint32"},{internalType:"uint64",name:"networkFeeIndex",type:"uint64"},{internalType:"uint64",name:"index",type:"uint64"},{internalType:"bool",name:"active",type:"bool"},{internalType:"uint256",name:"balance",type:"uint256"}],internalType:"struct ISSVNetworkCore.Cluster",name:"cluster",type:"tuple"}],name:"reactivate",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint64",name:"operatorId",type:"uint64"},{internalType:"uint256",name:"fee",type:"uint256"}],name:"reduceOperatorFee",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes",name:"publicKey",type:"bytes"},{internalType:"uint256",name:"fee",type:"uint256"}],name:"registerOperator",outputs:[{internalType:"uint64",name:"id",type:"uint64"}],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes",name:"publicKey",type:"bytes"},{internalType:"uint64[]",name:"operatorIds",type:"uint64[]"},{internalType:"bytes",name:"sharesData",type:"bytes"},{internalType:"uint256",name:"amount",type:"uint256"},{components:[{internalType:"uint32",name:"validatorCount",type:"uint32"},{internalType:"uint64",name:"networkFeeIndex",type:"uint64"},{internalType:"uint64",name:"index",type:"uint64"},{internalType:"bool",name:"active",type:"bool"},{internalType:"uint256",name:"balance",type:"uint256"}],internalType:"struct ISSVNetworkCore.Cluster",name:"cluster",type:"tuple"}],name:"registerValidator",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint64",name:"operatorId",type:"uint64"}],name:"removeOperator",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"bytes",name:"publicKey",type:"bytes"},{internalType:"uint64[]",name:"operatorIds",type:"uint64[]"},{components:[{internalType:"uint32",name:"validatorCount",type:"uint32"},{internalType:"uint64",name:"networkFeeIndex",type:"uint64"},{internalType:"uint64",name:"index",type:"uint64"},{internalType:"bool",name:"active",type:"bool"},{internalType:"uint256",name:"balance",type:"uint256"}],internalType:"struct ISSVNetworkCore.Cluster",name:"cluster",type:"tuple"}],name:"removeValidator",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[],name:"renounceOwnership",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"recipientAddress",type:"address"}],name:"setFeeRecipientAddress",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint64",name:"operatorId",type:"uint64"},{internalType:"address",name:"whitelisted",type:"address"}],name:"setOperatorWhitelist",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"userAddress",type:"address"},{components:[{internalType:"bool",name:"registerOperator",type:"bool"},{internalType:"bool",name:"registerValidator",type:"bool"}],internalType:"struct Authorization",name:"auth",type:"tuple"}],name:"setRegisterAuth",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"newOwner",type:"address"}],name:"transferOwnership",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint64",name:"timeInSeconds",type:"uint64"}],name:"updateDeclareOperatorFeePeriod",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint64",name:"timeInSeconds",type:"uint64"}],name:"updateExecuteOperatorFeePeriod",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint64",name:"blocks",type:"uint64"}],name:"updateLiquidationThresholdPeriod",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint256",name:"amount",type:"uint256"}],name:"updateMinimumLiquidationCollateral",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint256",name:"fee",type:"uint256"}],name:"updateNetworkFee",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint64",name:"percentage",type:"uint64"}],name:"updateOperatorFeeIncreaseLimit",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"enum SSVModules",name:"moduleId",type:"uint8"},{internalType:"address",name:"moduleAddress",type:"address"}],name:"upgradeModule",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"newImplementation",type:"address"}],name:"upgradeTo",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"address",name:"newImplementation",type:"address"},{internalType:"bytes",name:"data",type:"bytes"}],name:"upgradeToAndCall",outputs:[],stateMutability:"payable",type:"function"},{inputs:[{internalType:"uint64[]",name:"operatorIds",type:"uint64[]"},{internalType:"uint256",name:"amount",type:"uint256"},{components:[{internalType:"uint32",name:"validatorCount",type:"uint32"},{internalType:"uint64",name:"networkFeeIndex",type:"uint64"},{internalType:"uint64",name:"index",type:"uint64"},{internalType:"bool",name:"active",type:"bool"},{internalType:"uint256",name:"balance",type:"uint256"}],internalType:"struct ISSVNetworkCore.Cluster",name:"cluster",type:"tuple"}],name:"withdraw",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint256",name:"amount",type:"uint256"}],name:"withdrawNetworkEarnings",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint64",name:"operatorId",type:"uint64"},{internalType:"uint256",name:"amount",type:"uint256"}],name:"withdrawOperatorEarnings",outputs:[],stateMutability:"nonpayable",type:"function"},{inputs:[{internalType:"uint64",name:"operatorId",type:"uint64"}],name:"withdrawOperatorEarnings",outputs:[],stateMutability:"nonpayable",type:"function"}];var h=class{static web3(t=""){return new B.default(t)}static get abi(){return E}static contract(t,e){return new(h.web3(t)).eth.Contract(h.abi,e)}static getGenesisBlock(t,e){return u(this,null,function*(){let[n]=yield h.contract(t,e).getPastEvents("Initialized",{fromBlock:0});return(n==null?void 0:n.blockNumber)||0})}},p=h;p.BLOCK_RANGE_500K=5e5;var f=class{constructor(t){this.DAY=5400;this.WEEK=this.DAY*7;this.MONTH=this.DAY*30;if(!t.contractAddress)throw Error("Contract address is required");if(!t.nodeUrl)throw Error("ETH1 node is required");if(!t.ownerAddress)throw Error("Cluster owner address is required");if(t.contractAddress.length!==42)throw Error("Invalid contract address length.");if(!t.contractAddress.startsWith("0x"))throw Error("Invalid contract address.");if(t.ownerAddress.length!==42)throw Error("Invalid owner address length.");if(!t.ownerAddress.startsWith("0x"))throw Error("Invalid owner address.");this.params=t,this.params.contractAddress=p.web3().utils.toChecksumAddress(this.params.contractAddress),this.params.ownerAddress=p.web3().utils.toChecksumAddress(this.params.ownerAddress)}};var g=class extends f{constructor(){super(...arguments);this.eventsList=["ValidatorAdded"]}run(e){return u(this,null,function*(){e&&(console.log(`
Scanning blockchain...`),this.progressBar=new C.default.SingleBar({},C.default.Presets.shades_classic));try{let n=yield this._getLatestNonce(e);return e&&this.progressBar.stop(),n}catch(n){throw e&&this.progressBar.stop(),new Error(n)}})}_getLatestNonce(e){return u(this,null,function*(){let n;try{n=yield p.web3(this.params.nodeUrl).eth.getBlockNumber()}catch(m){throw new Error("Could not access the provided node endpoint.")}try{yield p.contract(this.params.nodeUrl,this.params.contractAddress).methods.owner().call()}catch(m){throw new Error("Could not find any cluster snapshot from the provided contract address.")}let a=this.MONTH,s=0,i=yield p.getGenesisBlock(this.params.nodeUrl,this.params.contractAddress),d=p.web3().eth.abi.encodeParameter("address",this.params.ownerAddress),o={fromBlock:i,toBlock:n,topics:[null,d]};e&&this.progressBar.start(n,0);do{let m;try{m=(yield p.contract(this.params.nodeUrl,this.params.contractAddress).getPastEvents("AllEvents",o)).filter(l=>this.eventsList.includes(l.event)),s+=m.length,o.fromBlock=o.toBlock+1}catch(l){if(a===this.MONTH)a=this.WEEK;else if(a===this.WEEK)a=this.DAY;else throw new Error(l)}o.toBlock=Math.min(o.fromBlock+a,n),e&&this.progressBar.update(o.toBlock)}while(o.toBlock-o.fromBlock>0);return e&&this.progressBar.update(n,n),s})}};var v=class extends T{constructor(){super("nonce","Handles nonce operations")}setArguments(t){t.add_argument("-n","--node-url",{help:"The ETH1 node url.",required:!0,dest:"nodeUrl"}),t.add_argument("-ca","--ssv-contract-address",{help:"The SSV Contract address, used to find the latest cluster data snapshot. Refer to https://docs.ssv.network/developers/smart-contracts",required:!0,dest:"contractAddress"}),t.add_argument("-oa","--owner-address",{help:"The owner address regarding the cluster that you want to query",required:!0,dest:"ownerAddress"})}run(t){return u(this,null,function*(){try{let n=yield new g(t).run(!0);console.log("Owner nonce:",n)}catch(e){console.error("\x1B[31m",e.message)}})}};var A=w(b("cli-progress"));var x=class extends f{constructor(){super(...arguments);this.eventsList=["ClusterDeposited","ClusterWithdrawn","ValidatorRemoved","ValidatorAdded","ClusterLiquidated","ClusterReactivated"]}run(e,n){return u(this,null,function*(){if(!(Array.isArray(e)&&this._isValidOperatorIds(e.length)))throw Error("Comma-separated list of operator IDs. The amount must be 3f+1 compatible.");e=[...e].sort((i,d)=>i-d),n&&(console.log(`
Scanning blockchain...`),this.progressBar=new A.default.SingleBar({},A.default.Presets.shades_classic));let s=yield this._getClusterSnapshot(e,n);return n&&this.progressBar.stop(),s})}_getClusterSnapshot(e,n){return u(this,null,function*(){let a;try{a=yield p.web3(this.params.nodeUrl).eth.getBlockNumber()}catch(c){throw new Error("Could not access the provided node endpoint.")}try{yield p.contract(this.params.nodeUrl,this.params.contractAddress).methods.owner().call()}catch(c){throw console.log("eee",c),new Error("Could not find any cluster snapshot from the provided contract address.")}let s=this.MONTH,i,d=0,o=yield p.getGenesisBlock(this.params.nodeUrl,this.params.contractAddress),m=p.web3().eth.abi.encodeParameter("address",this.params.ownerAddress),l={fromBlock:Math.max(a-s,o),toBlock:a,topics:[null,m]};for(n&&this.progressBar.start(a,0);!i&&l.fromBlock>=o;){let c;try{c=yield p.contract(this.params.nodeUrl,this.params.contractAddress).getPastEvents("allEvents",l),c.filter(y=>this.eventsList.includes(y.event)).filter(y=>JSON.stringify(y.returnValues.operatorIds.map(V=>+V))===JSON.stringify(e)).forEach(y=>{y.blockNumber>d&&(d=y.blockNumber,i=y.returnValues.cluster)}),l.toBlock=l.fromBlock}catch(y){console.error(y),s===this.MONTH?s=this.WEEK:s===this.WEEK&&(s=this.DAY)}l.fromBlock=l.toBlock-s,n&&this.progressBar.update(a-(l.toBlock-s))}return n&&this.progressBar.update(a,a),i=i||["0","0","0",!0,"0"],{payload:{Owner:this.params.ownerAddress,Operators:e.sort((c,y)=>c-y).join(","),Block:d||a,Data:i.join(",")},cluster:{validatorCount:i[0],networkFeeIndex:i[1],index:i[2],active:i[3],balance:i[4]}}})}_isValidOperatorIds(e){return!(e<4||e>13||e%3!=1)}};var I=class extends T{constructor(){super("cluster","Handles cluster operations")}setArguments(t){t.add_argument("-n","--node-url",{help:"The ETH1 node url.",required:!0,dest:"nodeUrl"}),t.add_argument("-ca","--ssv-contract-address",{help:"The SSV Contract address, used to find the latest cluster data snapshot. Refer to https://docs.ssv.network/developers/smart-contracts",required:!0,dest:"contractAddress"}),t.add_argument("-oa","--owner-address",{help:"The owner address regarding the cluster that you want to query",required:!0,dest:"ownerAddress"}),t.add_argument("-oids","--operator-ids",{help:"Comma-separated list of operators IDs regarding the cluster that you want to query",required:!0,dest:"operatorIds"})}run(t){return u(this,null,function*(){try{let e=t.operatorIds.split(",").map(s=>{if(Number.isNaN(+s))throw new Error("Operator Id should be the number");return+s}).sort((s,i)=>s-i),a=yield new x(t).run(e,!0);console.table(a.payload),console.log("Cluster snapshot:"),console.table(a.cluster),console.log(JSON.stringify({block:a.payload.Block,"cluster snapshot":a.cluster,cluster:Object.values(a.cluster)},null,"  "))}catch(e){console.error("\x1B[31m",e.message)}})}};var R=r=>u(void 0,null,function*(){return new Promise(t=>{(0,M.default)(r,(e,n)=>{if(e)return t("");t(n)})})});function S(){return u(this,null,function*(){let r=new F.ArgumentParser,t=r.add_subparsers({title:"commands",dest:"command"}),e=new I,n=new v;e.setArguments(t.add_parser(e.name,{add_help:!0})),n.setArguments(t.add_parser(n.name,{add_help:!0}));let a=`SSV Scanner v${k.version}`,s=yield R(a);if(s){console.log(" -----------------------------------------------------------------------------------"),console.log(`${s||a}`),console.log(" -----------------------------------------------------------------------------------");for(let d of String(k.description).match(/.{1,75}/g)||[])console.log(` ${d}`);console.log(` -----------------------------------------------------------------------------------
`)}let i=r.parse_args();switch(i.command){case e.name:yield e.run(i);break;case n.name:yield n.run(i);break;default:console.error("Command not found"),process.exit(1)}})}S();})();
