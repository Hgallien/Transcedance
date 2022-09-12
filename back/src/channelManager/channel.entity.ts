import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from 'typeorm';
import { Id } from 'backFrontCommon';
import { ChannelCategory } from 'backFrontCommon';

export class BannedUser {
  constructor(public unbanDate: Date, public userId: Id) {}
}
export class MutedUser {
  constructor(public unmuteDate: Date, public userId: Id) {}
}

@Entity('Channel')
export class Channel {
  constructor(
    name: string,
    creator: Id,
    category: ChannelCategory,
    password?: string,
  ) {
    this.name = name;
    this.creator = creator;
    this.category = category;
    this.admin = [];
    this.admin.push(creator);
    this.member = [];
    this.member.push(creator);
    this.muted = [];
    this.banned = [];
    if (password != undefined) this.passHash = password;
    else this.passHash = null;
  }

  @PrimaryColumn('varchar', { nullable: false })
  name: string;

  @Column('int', { nullable: false })
  creator: Id;

  @Column('varchar', { nullable: true })
  passHash: string | null;

  @Column('int', { array: true, nullable: true })
  admin: Id[];

  @Column('int', { array: true, nullable: true })
  member: Id[];

  @Column('jsonb')
  muted: MutedUser[];

  @Column('jsonb')
  banned: BannedUser[];

  @Column({ type: 'enum', enum: ChannelCategory, nullable: false })
  category: ChannelCategory;
}
