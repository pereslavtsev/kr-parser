import { Expose } from 'class-transformer';
import { ProductEntity } from './product-entity.class';

export class Ability extends ProductEntity {
  @Expose()
  readonly id: string;
  @Expose()
  readonly name: string;
  @Expose({ name: 'desc' })
  readonly description: string;
}
