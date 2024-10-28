import { ApiProperty } from '@nestjs/swagger';
import { EstadoPago } from 'src/enums/estadoPago.enum';
import { MetodoPago } from 'src/enums/metodoPago.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'Pagos',
})
export class Pago {
  @ApiProperty({
    description: 'Identificador único del Pago',
    type: 'string',
    format: 'uuid',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Monto del Pago',
    type: 'float',
    minimum: 1000,
  })
  @Column({
    type: 'float',
    nullable: false,
  })
  monto: number;

  @Column({
    default: MetodoPago.MERCADOPAGO,
  })
  metodoPago: MetodoPago;

  @Column()
  fecha: Date;

  @Column({
    default: EstadoPago.PENDIENTE,
  })
  estado: EstadoPago;

  @ApiProperty({
    description: 'ID del usuario que realizó el pago',
    type: 'string',
    format: 'uuid',
  })
  @Column({
    type: 'uuid', 
    nullable: false,
  })
  usuarioId: string;

  @ApiProperty({
    description: 'ID de la preferencia de Mercado Pago',
    type: 'string',
  })
  @Column({
    type: 'varchar',
    nullable: false,
  })
  preferenceId: string;
}