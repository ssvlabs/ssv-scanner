#!/usr/bin/env node
"use strict";var H=Object.create;var j=Object.defineProperty;var J=Object.getOwnPropertyDescriptor;var W=Object.getOwnPropertyNames;var K=Object.getPrototypeOf,U=Object.prototype.hasOwnProperty;var Y=(n,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of W(e))!U.call(n,t)&&t!==r&&j(n,t,{get:()=>e[t],enumerable:!(o=J(e,t))||o.enumerable});return n};var f=(n,e,r)=>(r=n!=null?H(K(n)):{},Y(e||!n||!n.__esModule?j(r,"default",{value:n,enumerable:!0}):r,n));var D=f(require("figlet"));var x={name:"ssv-scanner",version:"1.0.4",description:"Tool for retrieving events data (cluster snapshots and owner nonce) from the SSV network contract.",author:"SSV.Network",repository:"https://github.com/bloxapp/ssv-scanner",license:"MIT",keywords:["ssv","ssv.network","cluster","nonce","scanner"],main:"./dist/tsc/src/main.js",types:"./dist/tsc/src/main.d.ts",bin:{"ssv-keys":"./dist/tsc/src/cli.js"},engines:{node:">=18"},scripts:{"dev:cli":"ts-node src/cli.ts",cli:"node ./dist/tsc/src/cli.js",lint:"eslint src/ --ext .js,.jsx,.ts,.tsx",clean:"rm -rf dist build package","ts-node":"ts-node","copy-json":"cpy './src/shared/abi/*.json' './dist/tsc/src/shared/abi/'",build:"tsc -p tsconfig.json","build-all":"yarn clean && yarn build && yarn copy-json && yarn esbuild",esbuild:"node ./esbuild.js","pre-commit":"yarn test && yarn lint && yarn build-all"},devDependencies:{"@types/argparse":"^2.0.10","@types/cli-progress":"^3.11.0","@types/node":"^15.14.9","cpy-cli":"^5.0.0",esbuild:"^0.14.38","esbuild-node-externals":"^1.4.1",eslint:"^7.32.0","ts-node":"^10.9.1",typescript:"^4.6.4"},dependencies:{"@types/figlet":"^1.5.4",argparse:"^2.0.1","cli-progress":"^3.11.2",ethers:"^6.13.2",figlet:"^1.5.2"},licenses:[{MIT:"SEE LICENSE IN LICENCE FILE"}]};var E=f(require("process")),$=require("argparse");var T=require("argparse"),g=class{constructor(e,r){this.name=e;this.description=r;this.env="";this.parser=new T.ArgumentParser({description:this.description}),this.setArguments(this.parser)}parse(e){e.splice(0,1);let r=e.map(t=>(t.endsWith("_stage")&&(this.env="stage",t=t.replace("_stage","")),t)),o=this.parser.parse_args(r);return this.env&&(o.network+=`_${this.env}`),o}};var B=require("ethers"),_=f(require("cli-progress"));var R={MAINNET:"prod:v4.mainnet",HOLESKY:"prod:v4.holesky",HOLESKY_STAGE:"stage:v4.holesky"},y=n=>{let[e,r]=R[n.toUpperCase()].split(":"),o;try{o=require(`../shared/abi/${e}.${r}.abi.json`)}catch(s){throw console.error(`Failed to load JSON data from ${e}.${r}.abi.json`,s),s}let t;try{t=require(`../shared/abi/${e}.${r}.abi.json`)}catch(s){throw console.error(`Failed to load JSON data from ${e}.${r}.abi.json`,s),s}if(!o.contractAddress||!o.abi||!o.genesisBlock)throw new Error(`Missing core data in JSON for ${e}.${r}`);if(!t.contractAddress||!t.abi)throw new Error(`Missing views data in JSON for ${e}.${r}`);return{contractAddress:t.contractAddress,abi:t.abi,genesisBlock:t.genesisBlock}};var V=require("ethers"),w=class{constructor(e){this.DAY=5400;this.WEEK=this.DAY*7;this.MONTH=this.DAY*30;if(!e.nodeUrl)throw Error("ETH1 node is required");if(!e.network)throw Error("Network is required");if(!e.ownerAddress)throw Error("Cluster owner address is required");if(e.ownerAddress.length!==42)throw Error("Invalid owner address length.");if(!e.ownerAddress.startsWith("0x"))throw Error("Invalid owner address.");this.params=e,this.params.ownerAddress=V.ethers.getAddress(this.params.ownerAddress)}};var k=class extends w{async run(e){e&&(console.log(`
Scanning blockchain...`),this.progressBar=new _.default.SingleBar({},_.default.Presets.shades_classic));try{let r=await this._getValidatorAddedEventCount(e);return e&&this.progressBar.stop(),r}catch(r){throw e&&this.progressBar.stop(),new Error(r)}}async _getValidatorAddedEventCount(e){let{contractAddress:r,abi:o,genesisBlock:t}=y(this.params.network),s=new B.ethers.JsonRpcProvider(this.params.nodeUrl),a=new B.ethers.Contract(r,o,s),l;try{l=await s.getBlockNumber()}catch{throw new Error("Could not access the provided node endpoint.")}try{await a.owner()}catch{throw new Error("Could not find any cluster snapshot from the provided contract address.")}let m=0,i=this.MONTH;e&&this.progressBar.start(Number(l),0);let d=a.filters.ValidatorAdded(this.params.ownerAddress);for(let u=t;u<=l;u+=i)try{let h=Math.min(u+i-1,l);m+=(await a.queryFilter(d,u,h)).length,e&&this.progressBar.update(h)}catch(h){if(i===this.MONTH)i=this.WEEK;else if(i===this.WEEK)i=this.DAY;else throw new Error(h)}return e&&this.progressBar.update(l,l),m}};var S=class extends g{constructor(){super("nonce","Handles nonce operations")}setArguments(e){e.add_argument("-nw","--network",{help:"The network",choices:["mainnet","holesky"],required:!0,dest:"network"}),e.add_argument("-n","--node-url",{help:"ETH1 (execution client) node endpoint url",required:!0,dest:"nodeUrl"}),e.add_argument("-oa","--owner-address",{help:"The cluster owner address (in the SSV contract)",required:!0,dest:"ownerAddress"})}async run(e){try{let o=await new k(e).run(!0);console.log("Next Nonce:",o)}catch(r){console.error("\x1B[31m",r.message)}}};var C=require("ethers"),I=f(require("cli-progress"));var v=class extends w{async run(e,r){if(!(Array.isArray(e)&&this._isValidOperatorIds(e.length)))throw Error("Comma-separated list of operator IDs. The amount must be 3f+1 compatible.");e=[...e].sort((s,a)=>s-a),r&&(console.log(`
Scanning blockchain...`),this.progressBar=new I.default.SingleBar({},I.default.Presets.shades_classic));let t=await this._getClusterSnapshot(e,r);return r&&this.progressBar.stop(),t}async _getClusterSnapshot(e,r){let{contractAddress:o,abi:t,genesisBlock:s}=y(this.params.network),a,l=new C.ethers.JsonRpcProvider(this.params.nodeUrl);try{a=await l.getBlockNumber()}catch(p){throw new Error("Could not access the provided node endpoint: "+p)}let m=new C.ethers.Contract(o,t,l);try{await m.owner()}catch(p){throw new Error("Could not find any cluster snapshot from the provided contract address: "+p)}let i=this.MONTH,d,u=0,h=0,O=["ClusterDeposited","ClusterWithdrawn","ValidatorRemoved","ValidatorAdded","ClusterLiquidated","ClusterWithdrawn"];r&&this.progressBar.start(a,0);let q=JSON.stringify(e);for(let p=a;p>s&&!d;p-=i){let M=Math.max(p-i+1,s);try{let N={address:o,fromBlock:M,toBlock:p};(await l.getLogs(N)).map(c=>({event:m.interface.parseLog(c),blockNumber:c.blockNumber,transactionIndex:c.transactionIndex})).filter(c=>c.event&&O.includes(c.event.name)).filter(c=>JSON.stringify(c.event?.args.operatorIds.map(b=>Number(b))!==q)).sort((c,b)=>c.blockNumber-b.blockNumber).forEach(c=>{if(c.blockNumber>=u){let b=u;if(u=c.blockNumber,b===c.blockNumber&&c.transactionIndex<h)return;h=c.transactionIndex,d=c.event.args.cluster}})}catch(N){console.error(N),i===this.MONTH?i=this.WEEK:i===this.WEEK&&(i=this.DAY)}r&&this.progressBar.update(p)}return r&&this.progressBar.update(a,a),d=d||["0","0","0",!0,"0"],{payload:{Owner:this.params.ownerAddress,Operators:e.join(","),Block:u||a,Data:d.join(",")},cluster:{validatorCount:d[0],networkFeeIndex:d[1].toString(),index:d[2].toString(),active:d[3],balance:d[4].toString()}}}_isValidOperatorIds(e){return!(e<4||e>13||e%3!=1)}};var A=class extends g{constructor(){super("cluster","Handles cluster operations")}setArguments(e){e.add_argument("-nw","--network",{help:"The network",choices:["mainnet","holesky"],required:!0,dest:"network"}),e.add_argument("-n","--node-url",{help:"ETH1 (execution client) node endpoint url",required:!0,dest:"nodeUrl"}),e.add_argument("-oa","--owner-address",{help:"The cluster owner address (in the SSV contract)",required:!0,dest:"ownerAddress"}),e.add_argument("-oids","--operator-ids",{help:"Comma-separated list of operators IDs regarding the cluster that you want to query",required:!0,dest:"operatorIds"})}async run(e){try{let r=e.operatorIds.split(",").map(s=>{if(Number.isNaN(+s))throw new Error("Operator Id should be the number");return+s}).sort((s,a)=>s-a),t=await new v(e).run(r,!0);console.table(t.payload),console.log("Cluster snapshot:"),console.table(t.cluster),console.log(JSON.stringify({block:t.payload.Block,"cluster snapshot":t.cluster,cluster:Object.values(t.cluster)},(s,a)=>typeof a=="bigint"?a.toString():a,"  "))}catch(r){console.error("\x1B[31m",r.message)}}};var L=async n=>new Promise(e=>{(0,D.default)(n,(r,o)=>{if(r)return e("");e(o)})});async function P(){let n=`SSV Scanner v${x.version}`,e=await L(n);if(e){console.log(" -----------------------------------------------------------------------------------"),console.log(`${e||n}`),console.log(" -----------------------------------------------------------------------------------");for(let d of String(x.description).match(/.{1,75}/g)||[])console.log(` ${d}`);console.log(` -----------------------------------------------------------------------------------
`)}let r=new $.ArgumentParser,o=r.add_subparsers({title:"commands",dest:"command"}),t=new A,s=new S,a=o.add_parser(t.name,{add_help:!0}),l=o.add_parser(s.name,{add_help:!0}),m="",i=E.argv.slice(2);switch(i[1]&&i[1].includes("--help")?(t.setArguments(a),s.setArguments(l),r.parse_args()):(m=r.parse_known_args()[0].command,t.setArguments(a),s.setArguments(l)),m){case t.name:await t.run(t.parse(i));break;case s.name:await s.run(s.parse(i));break;default:console.error("Command not found"),E.exit(1)}}P();
