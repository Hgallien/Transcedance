import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  OneToMany,
  ManyToMany,
  PrimaryColumn,
  JoinTable,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Match } from '../../matchHistory/match.entity';
import { Id } from 'backFrontCommon';

@Entity('User')
export class User {
  constructor(id: Id, name: string) {
    this.id = id;
    this.name = name;
    this.friendlist = [];
  }
  @PrimaryColumn('int')
  id: Id;
  @Column({ type: 'varchar' })
  name: string;

  @Column('int', { array: true })
  friendlist: Id[] = [];

  @Column('int', { array: true })
  blocked: Id[] = [];

  @Column('int', { array: true })
  blockedFrom: Id[] = [];

  @Column('varchar', { array: true })
  channel: string[] = [];

  @Column({ type: 'int' })
  win: number = 0;

  @Column({ type: 'int' })
  loose: number = 0;

  @Column({ type: 'int' })
  score: number = 0;
  @Column({ type: 'varchar', nullable: true })
  avatar: string | null = null;
  @ManyToMany(() => Match, (match) => match.player)
  match!: Match[];
  /**
   * 2-Factor Auth TOTP secret in hex
   */
  @Column('varchar', { nullable: true })
  totpSecret: string | null = null;
}
