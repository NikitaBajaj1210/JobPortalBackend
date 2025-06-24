// export class TrainingType {}
// TrainingTypeEntity
import { TrainingCertificate } from 'src/user-profile/entities/training-certificate.entity';
import { Entity, PrimaryColumn, Column, PrimaryGeneratedColumn, Generated, OneToMany } from 'typeorm';

@Entity({name:'training_type'})
export class TrainingType {
  @PrimaryColumn({type:'uuid'})
  @Generated('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;

  @Column({ type: 'char', length: 36, nullable: true })
  created_by: string;

  @Column({ type: 'char', length: 36, nullable: true })
  updated_by: string;

  @Column({ type: 'tinyint', default: 0 })
  is_deleted: boolean;

        @OneToMany(() => TrainingCertificate, (training_certificate) => training_certificate.training_type)
        training_certificate: TrainingCertificate[]
}
