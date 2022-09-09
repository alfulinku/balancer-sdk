import { PoolShare } from '@/types';
import { PoolShareAttribute, PoolShareAttributes } from './types';
import { Findable } from '../types';
import {
    createSubgraphClient,
    SubgraphClient
} from '@/modules/subgraph/subgraph';
import {
    SubgraphPoolShareFragment,
    PoolShare_OrderBy,
    OrderDirection
} from '@/modules/subgraph/generated/balancer-subgraph-types';

export class PoolSharesRepository implements Findable<PoolShare, PoolShareAttribute> {
    
    private client: SubgraphClient;
  
    constructor(url: string) {
        this.client = createSubgraphClient(url);
    }
    
    async find(id: string): Promise<PoolShare | undefined> {
        const { poolShare } = await this.client.PoolShare({ id: id });
        return poolShare ? this.mapType(poolShare) : undefined;
    }
    
    async findBy(attribute: PoolShareAttribute, 
        value: string): Promise<PoolShare | undefined> {
        if (attribute != PoolShareAttributes.Id) return undefined;
        const { poolShare } = await this.client.PoolShare( { [attribute]: value });
        return poolShare ? this.mapType(poolShare) : undefined;
    }
    
    async findAllBy(attribute: PoolShareAttribute, 
            value: string,
            first: number, 
            skip: number):  Promise<PoolShare[]> {
        const { poolShares } = await this.client.PoolShares({ 
            where: { [attribute]: value }, 
            first: first,
            skip: skip,
            orderBy: PoolShare_OrderBy.Balance, 
            orderDirection: OrderDirection.Desc
        });
        return poolShares.map(this.mapType);
    }
    
    async findByUser(userAddress: string, 
            first: number = 200, 
            skip: number = 0):  Promise<PoolShare[]> {
        return this.findAllBy(PoolShareAttributes.UserAddress, userAddress, first, skip);
    }
    
    async findByPool(poolId: string, 
            first: number = 1000, 
            skip: number = 0):  Promise<PoolShare[]> {
        return this.findAllBy(PoolShareAttributes.PoolId, poolId, first, skip);
    }
    
    private mapType(subgraphPoolShare: SubgraphPoolShareFragment): PoolShare {
        return {
            id: subgraphPoolShare.id,
            userAddress: subgraphPoolShare.userAddress.id,
            poolId: subgraphPoolShare.poolId.id,
            balance: subgraphPoolShare.balance
        };
    }
}