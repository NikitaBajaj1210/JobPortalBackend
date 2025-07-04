import { TrainingType } from 'src/training-type/entities/training-type.entity';
import { Users } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({name:'training_certificate'})
export class TrainingCertificate {
  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  id: string;
  @Column()
  training_type_id?: string;

  @Column()
  user_id?: string;

  @Column()
  certificate_type?: string;

  @Column()
  document_number?: string;

  @Column()
  issue_place?: string;

  @Column()
  issue_date?: Date;

  @Column()
  exp_date?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column()
  created_by: string;

  @Column({})
  updated_by: string;

      @ManyToOne(() => Users, (user) => user.training_certificate)
      @JoinColumn({ name: 'user_id' })
      user: Users

      @ManyToOne(() => TrainingType, (trainingType) => trainingType.training_certificate)
      @JoinColumn({ name: 'training_type_id' })
      training_type: TrainingType
}
