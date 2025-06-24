import { TravelDocumentsType } from 'src/travel_documents_type/entities/travel_documents_type.entity';
import { Users } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, Generated, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('travel_documents')
export class TravelDocument {
    @PrimaryColumn({type:'uuid'})
      @Generated('uuid')
  id: string;

  @Column()
  document_name?: string;

  @Column()
  user_id?: string;

  @Column()
  travel_document_type_id?: string;

  @Column()
  document_number?: string;

  @Column()
  issue_place?: string;

  @Column({ type: 'date', nullable: true })
  issue_date?: Date;

  @Column({ type: 'date', nullable: true })
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

    @ManyToOne(() => TravelDocumentsType, (travelDocumentsType) => travelDocumentsType.travel_documents)
    @JoinColumn({ name: 'travel_document_type_id' })
    travel_documents_type: TravelDocumentsType

    @ManyToOne(() => Users, (user) => user.travel_documents)
    @JoinColumn({ name: 'user_id' })
    user: Users
    
}
