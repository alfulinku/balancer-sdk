import { LinearPoolLiquidity } from './concerns/linear/liquidity.concern';
import { LinearPoolSpotPrice } from './concerns/linear/spotPrice.concern';
import { PoolType } from './pool-type.interface';
import {
    JoinConcern,
    LiquidityConcern,
    SpotPriceConcern,
} from './concerns/types';
import { LinearPoolJoin } from './concerns/linear/join.concern';

export class Linear implements PoolType {
    public liquidityCalculator: LiquidityConcern;
    public spotPriceCalculator: SpotPriceConcern;
    public joinCalculator: JoinConcern;

    constructor(
        private liquidityCalculatorConcern = LinearPoolLiquidity,
        private spotPriceCalculatorConcern = LinearPoolSpotPrice,
        private joinCalculatorConcern = LinearPoolJoin
    ) {
        this.liquidityCalculator = new this.liquidityCalculatorConcern();
        this.spotPriceCalculator = new this.spotPriceCalculatorConcern();
        this.joinCalculator = new this.joinCalculatorConcern();
    }
}