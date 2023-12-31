import { Product } from 'src/products/entities';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text')
    password: string;

    @Column('text')
    name: string;

    @Column('text')
    lastName: string;

    @Column('boolean', {
        default: true
    })
    isActive: string;

    @Column('text', {
        array: true,
        default: [ 'user' ]
    })
    roles: Array<String>


    @OneToMany(
        () => Product,
        ( product ) => product.user,
    )
    product: Product


    @BeforeInsert()
    @BeforeUpdate()
    checkFieldsBeforeToInsertAndUpdate() {
        this.email = this.email.toLowerCase().trim();
    }

}
