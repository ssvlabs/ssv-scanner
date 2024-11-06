#!/usr/bin/env node
"use strict";var W=Object.create;var V=Object.defineProperty;var J=Object.getOwnPropertyDescriptor;var K=Object.getOwnPropertyNames;var Y=Object.getPrototypeOf,L=Object.prototype.hasOwnProperty;var U=(n,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of K(e))!L.call(n,t)&&t!==r&&V(n,t,{get:()=>e[t],enumerable:!(o=J(e,t))||o.enumerable});return n};var b=(n,e,r)=>(r=n!=null?W(Y(n)):{},U(e||!n||!n.__esModule?V(r,"default",{value:n,enumerable:!0}):r,n));var q=b(require("figlet"));var B={name:"ssv-scanner",version:"1.0.4",description:"Tool for retrieving events data (cluster snapshots and owner nonce) from the SSV network contract.",author:"SSV.Network",repository:"https://github.com/bloxapp/ssv-scanner",license:"MIT",keywords:["ssv","ssv.network","cluster","nonce","scanner"],main:"./dist/tsc/src/main.js",types:"./dist/tsc/src/main.d.ts",bin:{"ssv-keys":"./dist/tsc/src/cli.js"},engines:{node:">=18"},scripts:{"dev:cli":"ts-node src/cli.ts",cli:"node ./dist/tsc/src/cli.js",lint:"eslint src/ --ext .js,.jsx,.ts,.tsx",clean:"rm -rf dist build package","ts-node":"ts-node","copy-json":"cpy './src/shared/abi/*.json' './dist/tsc/src/shared/abi/'",build:"tsc -p tsconfig.json","build-all":"yarn clean && yarn build && yarn copy-json && yarn esbuild",esbuild:"node ./esbuild.js","pre-commit":"yarn test && yarn lint && yarn build-all"},devDependencies:{"@types/argparse":"^2.0.10","@types/cli-progress":"^3.11.0","@types/node":"^15.14.9","cpy-cli":"^5.0.0",esbuild:"^0.14.38","esbuild-node-externals":"^1.4.1",eslint:"^7.32.0","ts-node":"^10.9.1",typescript:"^4.6.4"},dependencies:{"@types/figlet":"^1.5.4",argparse:"^2.0.1","cli-progress":"^3.11.2",ethers:"^6.13.2",figlet:"^1.5.2"},licenses:[{MIT:"SEE LICENSE IN LICENCE FILE"}]};var x=b(require("process")),M=require("argparse");var D=require("argparse"),w=class{constructor(e,r){this.name=e;this.description=r;this.env="";this.parser=new D.ArgumentParser({description:this.description}),this.setArguments(this.parser)}parse(e){e.splice(0,1);let r=e.map(t=>(t.endsWith("_stage")&&(this.env="stage",t=t.replace("_stage","")),t)),o=this.parser.parse_args(r);return this.env&&(o.network+=`_${this.env}`),o}};var I=require("ethers"),_=b(require("cli-progress"));var R={MAINNET:"prod:v4.mainnet",HOLESKY:"prod:v4.holesky",HOLESKY_STAGE:"stage:v4.holesky"},y=n=>{let[e,r]=R[n.toUpperCase()].split(":"),o;try{o=require(`../shared/abi/${e}.${r}.abi.json`)}catch(s){throw console.error(`Failed to load JSON data from ${e}.${r}.abi.json`,s),s}let t;try{t=require(`../shared/abi/${e}.${r}.abi.json`)}catch(s){throw console.error(`Failed to load JSON data from ${e}.${r}.abi.json`,s),s}if(!o.contractAddress||!o.abi||!o.genesisBlock)throw new Error(`Missing core data in JSON for ${e}.${r}`);if(!t.contractAddress||!t.abi)throw new Error(`Missing views data in JSON for ${e}.${r}`);return{contractAddress:t.contractAddress,abi:t.abi,genesisBlock:t.genesisBlock}};var $=require("ethers"),f=class{constructor(e){this.DAY=5400;this.WEEK=this.DAY*7;this.MONTH=this.DAY*30;if(!e.nodeUrl)throw Error("ETH1 node is required");if(!e.network)throw Error("Network is required");if(!e.ownerAddress)throw Error("Cluster owner address is required");if(e.ownerAddress.length!==42)throw Error("Invalid owner address length.");if(!e.ownerAddress.startsWith("0x"))throw Error("Invalid owner address.");this.params=e,this.params.ownerAddress=$.ethers.getAddress(this.params.ownerAddress)}};var k=class extends f{async run(e){e&&(console.log(`
Scanning blockchain...`),this.progressBar=new _.default.SingleBar({},_.default.Presets.shades_classic));try{let r=await this._getValidatorAddedEventCount(e);return e&&this.progressBar.stop(),r}catch(r){throw e&&this.progressBar.stop(),new Error(r)}}async _getValidatorAddedEventCount(e){let{contractAddress:r,abi:o,genesisBlock:t}=y(this.params.network),s=new I.ethers.JsonRpcProvider(this.params.nodeUrl),a=new I.ethers.Contract(r,o,s),l;try{l=await s.getBlockNumber()}catch{throw new Error("Could not access the provided node endpoint.")}try{await a.owner()}catch{throw new Error("Could not find any cluster snapshot from the provided contract address.")}let u=0,i=this.MONTH;e&&this.progressBar.start(Number(l),0);let c=a.filters.ValidatorAdded(this.params.ownerAddress);for(let m=t;m<=l;m+=i)try{let g=Math.min(m+i-1,l);u+=(await a.queryFilter(c,m,g)).length,e&&this.progressBar.update(g)}catch(g){if(i===this.MONTH)i=this.WEEK;else if(i===this.WEEK)i=this.DAY;else throw new Error(g)}return e&&this.progressBar.update(l,l),u}};var v=class extends w{constructor(){super("nonce","Handles nonce operations")}setArguments(e){e.add_argument("-nw","--network",{help:"The network",choices:["mainnet","holesky"],required:!0,dest:"network"}),e.add_argument("-n","--node-url",{help:"ETH1 (execution client) node endpoint url",required:!0,dest:"nodeUrl"}),e.add_argument("-oa","--owner-address",{help:"The cluster owner address (in the SSV contract)",required:!0,dest:"ownerAddress"})}async run(e){try{let o=await new k(e).run(!0);console.log("Next Nonce:",o)}catch(r){console.error("\x1B[31m",r.message)}}};var S=require("ethers"),C=b(require("cli-progress"));var A=class extends f{async run(e,r){if(!(Array.isArray(e)&&this._isValidOperatorIds(e.length)))throw Error("Comma-separated list of operator IDs. The amount must be 3f+1 compatible.");e=[...e].sort((s,a)=>s-a),r&&(console.log(`
Scanning blockchain...`),this.progressBar=new C.default.SingleBar({},C.default.Presets.shades_classic));let t=await this._getClusterSnapshot(e,r);return r&&this.progressBar.stop(),t}async _getClusterSnapshot(e,r){let{contractAddress:o,abi:t,genesisBlock:s}=y(this.params.network),a,l=new S.ethers.JsonRpcProvider(this.params.nodeUrl);try{a=await l.getBlockNumber()}catch(p){throw new Error("Could not access the provided node endpoint: "+p)}let u=new S.ethers.Contract(o,t,l);try{await u.owner()}catch(p){throw new Error("Could not find any cluster snapshot from the provided contract address: "+p)}let i=this.MONTH,c,m=0,g=["ClusterDeposited","ClusterWithdrawn","ClusterReactivated","ValidatorRemoved","ValidatorAdded","ClusterLiquidated","ClusterWithdrawn"];r&&this.progressBar.start(a,s);let O=JSON.stringify(e),j=s;for(let p=a;p>s&&!c;p-=i){let H=Math.max(p-i+1,s);try{let T={address:o,fromBlock:H,toBlock:p,topics:[null,S.ethers.zeroPadValue(this.params.ownerAddress,32)]},N=(await l.getLogs(T)).map(d=>({event:u.interface.parseLog(d),blockNumber:d.blockNumber,transactionIndex:d.transactionIndex,logIndex:d.index}));N=N.filter(d=>d.event&&g.includes(d.event.name)).filter(d=>JSON.stringify(d.event?.args.operatorIds.map(h=>Number(h)))===O).sort((d,h)=>h.blockNumber===d.blockNumber?h.transactionIndex===d.transactionIndex?h.logIndex-d.logIndex:h.transactionIndex-d.transactionIndex:h.blockNumber-d.blockNumber),c=N[0].event?.args.cluster}catch{i===this.MONTH?(i=this.WEEK,p+=this.WEEK):i===this.WEEK&&(i=this.DAY,p+=this.DAY)}j+=i,r&&this.progressBar.update(j,a)}return r&&this.progressBar.update(a,a),c=c||["0","0","0",!0,"0"],{payload:{Owner:this.params.ownerAddress,Operators:e.join(","),Block:m||a,Data:c.join(",")},cluster:{validatorCount:Number(c[0]),networkFeeIndex:c[1].toString(),index:c[2].toString(),active:c[3],balance:c[4].toString()}}}_isValidOperatorIds(e){return!(e<4||e>13||e%3!=1)}};var E=class extends w{constructor(){super("cluster","Handles cluster operations")}setArguments(e){e.add_argument("-nw","--network",{help:"The network",choices:["mainnet","holesky"],required:!0,dest:"network"}),e.add_argument("-n","--node-url",{help:"ETH1 (execution client) node endpoint url",required:!0,dest:"nodeUrl"}),e.add_argument("-oa","--owner-address",{help:"The cluster owner address (in the SSV contract)",required:!0,dest:"ownerAddress"}),e.add_argument("-oids","--operator-ids",{help:"Comma-separated list of operators IDs regarding the cluster that you want to query",required:!0,dest:"operatorIds"})}async run(e){try{let r=e.operatorIds.split(",").map(s=>{if(Number.isNaN(+s))throw new Error("Operator Id should be the number");return+s}).sort((s,a)=>s-a),t=await new A(e).run(r,!0);console.table(t.payload),console.log("Cluster snapshot:"),console.table(t.cluster),console.log(JSON.stringify({block:t.payload.Block,"cluster snapshot":t.cluster,cluster:Object.values(t.cluster)},(s,a)=>typeof a=="bigint"?a.toString():a,"  "))}catch(r){console.error("\x1B[31m",r.message)}}};var z=async n=>new Promise(e=>{(0,q.default)(n,(r,o)=>{if(r)return e("");e(o)})});async function P(){let n=`SSV Scanner v${B.version}`,e=await z(n);if(e){console.log(" -----------------------------------------------------------------------------------"),console.log(`${e||n}`),console.log(" -----------------------------------------------------------------------------------");for(let c of String(B.description).match(/.{1,75}/g)||[])console.log(` ${c}`);console.log(` -----------------------------------------------------------------------------------
`)}let r=new M.ArgumentParser,o=r.add_subparsers({title:"commands",dest:"command"}),t=new E,s=new v,a=o.add_parser(t.name,{add_help:!0}),l=o.add_parser(s.name,{add_help:!0}),u="",i=x.argv.slice(2);switch(i[1]&&i[1].includes("--help")?(t.setArguments(a),s.setArguments(l),r.parse_args()):(u=r.parse_known_args()[0].command,t.setArguments(a),s.setArguments(l)),u){case t.name:await t.run(t.parse(i));break;case s.name:await s.run(s.parse(i));break;default:console.error("Command not found"),x.exit(1)}}P();
