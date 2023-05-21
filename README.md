# Cluster Scanner

![GitHub](https://img.shields.io/github/license/bloxapp/cluster-scanner)
![GitHub package.json version](https://img.shields.io/github/package-json/v/bloxapp/cluster-scanner)

![GitHub commit activity](https://img.shields.io/github/commit-activity/y/bloxapp/cluster-scanner)
![GitHub contributors](https://img.shields.io/github/contributors/bloxapp/cluster-scanner)
![GitHub last commit](https://img.shields.io/github/last-commit/bloxapp/cluster-scanner)

![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/bloxapp/cluster-scanner)
![GitHub package.json dynamic](https://img.shields.io/github/package-json/author/bloxapp/cluster-scanner)

![Discord](https://img.shields.io/discord/723834989506068561?style=for-the-badge&label=Ask%20for%20support&logo=discord&logoColor=white)

Important dependencies:

* ![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/bloxapp/cluster-scanner/web3?style=social)

---

Repo contains cluster scanner library and CLI.
It is used to retrieve the latest cluster snapshot from the blockchain.

## Running from the CLI

### Installation

This installation requires NodeJS on your machine.
You can download it [here](https://nodejs.org/en/download/).

Once you have installed NodeJS, follow these instructions to prepare the project:

```bash
git clone https://github.com/bloxapp/cluster-scanner.git
cd cluster-scanner
npm i yarn -g
yarn
yarn cli --help
```

### Running as a CLI from the repository


#### Help

Help on available actions:

```bash
yarn cli --help
```

#### Example

**Input parameters:**

- node-url (n) = The ETH1 node url
- ssv-contract-address (ca) = SSV Network contract address
- owner-address (oa) = Cluster owner address
- operator-ids (oids) = Comma separated operator ids list

Example of running in the CLI:
```bash
yarn cli -n .... -ca .... -oa ..... -oids 1,2,3,4
```

**Output:**  Latest cluster data (serialized).

## Integration in your projects

### Node Project

To run an example of a NodeJS project containing all the code snippets to build the share and transaction payload, simply follow these instructions!

```bash
cd examples
yarn install
```

To run a JavaScript example:

```bash
yarn start:js
```

To run a Typescript example:

```bash
yarn start
```

## Development

### Run the CLI as a TypeScript executable:

```bash
yarn dev:cli ...
```

### Run the CLI as a JavaScript compiled executable:

```bash
yarn cli ...
```

### Lint

```bash
yarn lint
```

### Building

Build TypeScript into JavaScript

```bash
yarn build
```

Build for NodeJs using `esbuild`

```bash
yarn esbuild
```

Build everything

```bash
yarn build-all
```

## TODO


## Authors

* [Wadym Ciumac](https://github.com/vadiminc)

## License

MIT License
