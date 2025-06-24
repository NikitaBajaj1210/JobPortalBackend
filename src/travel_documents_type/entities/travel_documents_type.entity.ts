import { TravelDocument } from "src/user-profile/entities/travel-documents.entity";
import { Column, Entity, Generated, OneToMany, PrimaryColumn } from "typeorm";

@Entity({name:'travel_documents_type'})
export class TravelDocumentsType {
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

      @OneToMany(() => TravelDocument, (travelDocument) => travelDocument.travel_documents_type)
      travel_documents: TravelDocument[]
}
