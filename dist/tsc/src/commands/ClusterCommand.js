"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterCommand = void 0;
const Command_1 = require("./Command");
const ClusterScanner_1 = require("../lib/ClusterScanner/ClusterScanner");
class ClusterCommand extends Command_1.Command {
    constructor() {
        super('cluster', 'Handles cluster operations');
    }
    setArguments(parser) {
        parser.add_argument('-nw', '--network', {
            help: 'The network',
            choices: ['mainnet', 'holesky'],
            required: true,
            dest: 'network',
        });
        parser.add_argument('-n', '--node-url', {
            help: `ETH1 (execution client) node endpoint url`,
            required: true,
            dest: 'nodeUrl'
        });
        parser.add_argument('-oa', '--owner-address', {
            help: "The cluster owner address (in the SSV contract)",
            required: true,
            dest: 'ownerAddress'
        });
        parser.add_argument('-oids', '--operator-ids', {
            help: `Comma-separated list of operators IDs regarding the cluster that you want to query`,
            required: true,
            dest: 'operatorIds'
        });
    }
    async run(args) {
        try {
            const operatorIds = args.operatorIds.split(',')
                .map((value) => {
                if (Number.isNaN(+value))
                    throw new Error('Operator Id should be the number');
                return +value;
            })
                .sort((a, b) => a - b);
            const clusterScanner = new ClusterScanner_1.ClusterScanner(args);
            const result = await clusterScanner.run(operatorIds, true);
            console.table(result.payload);
            console.log('Cluster snapshot:');
            console.table(result.cluster);
            console.log(JSON.stringify({
                'block': result.payload.Block,
                'cluster snapshot': result.cluster,
                'cluster': Object.values(result.cluster)
            }, (_, v) => typeof v === 'bigint' ? v.toString() : v, '  '));
        }
        catch (e) {
            console.error('\x1b[31m', e.message);
        }
    }
}
exports.ClusterCommand = ClusterCommand;
//# sourceMappingURL=ClusterCommand.js.map