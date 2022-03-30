import { Expose } from 'class-transformer';
import { ProductEntity } from './product-entity.class';

export class AutonomyState extends ProductEntity {
  @Expose()
  readonly id: string;
  @Expose({ name: 'is_puppet' })
  readonly isPuppet: boolean;
}
