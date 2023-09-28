import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductImage } from './';
import { User } from 'src/auth/entities/user.entity';

@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    title: string;

    @Column('float', {
        default: 0
    })
    price?: number;

    @Column({
        type: 'text',
        nullable: true,
    })
    decription?: string;

    @Column({
        type: 'text',
        unique: true
    })
    slug?: string;

    @Column('int', {
        default: 0
    })
    stock?: number;

    @Column('text', {
        array: true
    })
    sizes: string[];

    @Column('text')
    gender: string;

    @Column('text', {
        array: true,
        default: []
    })
    tags?: string[]


    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true }
    )
    user: User

    @OneToMany(
        () => ProductImage,
        ( productImage ) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];


    @BeforeInsert()
    @BeforeUpdate()
    validateSlugData() {
        this.slug = this.title.toLowerCase().replaceAll(' ', '-').replaceAll("'", ' ');
    }
}


